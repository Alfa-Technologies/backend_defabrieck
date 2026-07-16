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

  /**
   * Firebase Auth de la app default (proyecto `asistentes-df`),
   * fuente de verdad de la identidad para la App AS.
   */
  getAuth(): admin.auth.Auth {
    return admin.auth();
  }

  /**
   * Súper-colección raíz `users` en Firestore de la app default.
   * Cada documento se identifica con el `uid` de Firebase Auth.
   */
  getUsersCollectionRef(): admin.firestore.CollectionReference {
    return this.firestore.collection('users');
  }

  /**
   * Inyecta los roles del usuario como custom claim `roles` en su token de
   * Firebase Auth, para que las Reglas de Firestore autoricen sin consultar
   * Postgres. Se tipa como `string[]` para no acoplar la capa de infraestructura
   * al enum de dominio `ValidRoles`.
   */
  async setUserRolesClaim(uid: string, roles: string[]): Promise<void> {
    await this.getAuth().setCustomUserClaims(uid, { roles });
  }

  /**
   * Actualiza (merge) el documento `users/{uid}` en Firestore, sin pisar los
   * campos no incluidos en `data`. Usado para mantener coherencia con Postgres
   * (displayName, isActive, etc.) al editar un usuario.
   */
  async updateUserDoc(
    uid: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.getUsersCollectionRef().doc(uid).set(data, { merge: true });
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
