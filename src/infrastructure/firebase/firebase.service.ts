import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firestore: admin.firestore.Firestore;
  private adminFirestore: admin.firestore.Firestore;

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    if (admin.apps.length === 0) {
      const serviceAccount = this.loadServiceAccount(
        'FIREBASE_SERVICE_ACCOUNT',
        'firebase-service-account.json',
      );

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.logger.log('Firebase Admin SDK initialized successfully');
    } else {
      this.logger.log('Firebase Admin SDK already initialized');
    }

    this.firestore = admin.firestore();

    this.initializeAdminApp();
  }

  private initializeAdminApp(): void {
    const existingAdminApp = admin.apps.find(
      (app) => app?.name === 'ADMIN_APP',
    );

    if (!existingAdminApp) {
      const adminServiceAccount = this.loadServiceAccount(
        'FIREBASE_ADMIN_SERVICE_ACCOUNT',
        'firebase-as-service-account.json',
      );

      admin.initializeApp(
        {
          credential: admin.credential.cert(adminServiceAccount),
        },
        'ADMIN_APP',
      );

      this.logger.log(
        'Firebase Admin App (ADMIN_APP) initialized successfully',
      );
    } else {
      this.logger.log('Firebase Admin App (ADMIN_APP) already initialized');
    }

    this.adminFirestore = admin.app('ADMIN_APP').firestore();
  }

  /**
   * Carga las credenciales de una cuenta de servicio.
   * En producción usa la variable de entorno (JSON completo de la cuenta).
   * En desarrollo, si la variable no existe, recurre al archivo local.
   */
  private loadServiceAccount(
    envVar: string,
    fallbackFileName: string,
  ): admin.ServiceAccount {
    const raw = process.env[envVar];

    if (raw) {
      try {
        return JSON.parse(raw) as admin.ServiceAccount;
      } catch (error) {
        throw new Error(
          `La variable de entorno ${envVar} no contiene un JSON válido: ${error}`,
        );
      }
    }

    const fallbackPath = path.resolve(process.cwd(), fallbackFileName);
    this.logger.warn(
      `${envVar} no definida; usando archivo local ${fallbackFileName}`,
    );
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(fallbackPath) as admin.ServiceAccount;
  }

  getFirestore(): admin.firestore.Firestore {
    return this.firestore;
  }

  getCollectionRef(
    company: string,
    plant: string,
    collection: string,
  ): admin.firestore.CollectionReference {
    return this.firestore.collection(`${company}/${plant}/${collection}`);
  }

  getAdminFirestore(): admin.firestore.Firestore {
    return this.adminFirestore;
  }

  getQuotesCollectionRef(): admin.firestore.CollectionReference {
    return this.getAdminFirestore().collection('quotes');
  }
}
