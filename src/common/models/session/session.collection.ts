import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class SessionCollection implements OnApplicationBootstrap {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.ensureCollections();
  }

  async ensureCollections(): Promise<void> {
    const db = this.connection.db;
    if (!db) throw new Error('MongoDB connection is not initialized.');

    const validator = {
      $jsonSchema: {
        bsonType: 'object',
        required: ['id', 'userId', 'createdAt', 'expiresAt', 'lastActiveAt'],
        additionalProperties: false,
        properties: {
          _id: {},
          __v: {},
          id: { bsonType: 'string', minLength: 1 },
          userId: { bsonType: 'string', minLength: 1 },
          createdAt: { bsonType: 'date' },
          expiresAt: { bsonType: 'date' },
          lastActiveAt: { bsonType: 'date' },
          mfa: { enum: ['pending', 'verified'] },
          metadata: { bsonType: 'object' },
        },
      },
    };
    const magicLinkValidator = {
      $jsonSchema: {
        bsonType: 'object',
        required: ['id', 'email', 'createdAt', 'expiresAt'],
        additionalProperties: false,
        properties: {
          _id: {},
          __v: {},
          id: { bsonType: 'string', minLength: 1 },
          email: { bsonType: 'string', minLength: 3, maxLength: 254 },
          createdAt: { bsonType: 'date' },
          expiresAt: { bsonType: 'date' },
          redirectTo: { bsonType: 'string' },
        },
      },
    };
    const emailTokenValidator = {
      $jsonSchema: {
        bsonType: 'object',
        required: [
          'id',
          'purpose',
          'userId',
          'email',
          'createdAt',
          'expiresAt',
        ],
        additionalProperties: false,
        properties: {
          _id: {},
          __v: {},
          id: { bsonType: 'string', minLength: 1 },
          purpose: { enum: ['password-reset', 'email-verification'] },
          userId: { bsonType: 'string', minLength: 1 },
          email: { bsonType: 'string', minLength: 3, maxLength: 254 },
          fingerprint: { bsonType: 'string' },
          createdAt: { bsonType: 'date' },
          expiresAt: { bsonType: 'date' },
        },
      },
    };

    const collections = await db
      .listCollections({ name: 'sessions' })
      .toArray();
    if (collections.length === 0) {
      await db.createCollection('sessions', {
        validator,
        validationLevel: 'strict',
        validationAction: 'error',
      });
    } else {
      await db.command({
        collMod: 'sessions',
        validator,
        validationLevel: 'strict',
        validationAction: 'error',
      });
    }

    await db.collection('sessions').createIndex({ id: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ userId: 1 });
    await db
      .collection('sessions')
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    for (const [name, collectionValidator] of [
      ['authentication_magic_links', magicLinkValidator],
      ['authentication_email_tokens', emailTokenValidator],
    ] as const) {
      const exists = await db.listCollections({ name }).toArray();
      if (exists.length === 0) {
        await db.createCollection(name, {
          validator: collectionValidator,
          validationLevel: 'strict',
          validationAction: 'error',
        });
      } else {
        await db.command({
          collMod: name,
          validator: collectionValidator,
          validationLevel: 'strict',
          validationAction: 'error',
        });
      }
      await db.collection(name).createIndex({ id: 1 }, { unique: true });
      await db
        .collection(name)
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    }
  }
}
