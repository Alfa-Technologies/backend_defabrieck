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
      const serviceAccountPath = path.resolve(
        process.cwd(),
        'firebase-service-account.json',
      );

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
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
      const adminServiceAccountPath = path.resolve(
        process.cwd(),
        'firebase-as-service-account.json',
      );

      admin.initializeApp(
        {
          credential: admin.credential.cert(adminServiceAccountPath),
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
