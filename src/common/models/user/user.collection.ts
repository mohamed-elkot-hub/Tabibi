import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class UserCollection implements OnApplicationBootstrap {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onApplicationBootstrap(): Promise<void> {
    const db = this.connection.db;
    if (!db) throw new Error('MongoDB connection is not initialized.');

    const users = await db.listCollections({ name: 'users' }).toArray();
    if (users.length === 0) await db.createCollection('users');
    await db.collection('users').createIndex({ email: 1 }, { unique: true, name: 'email_unique' });
  }
}
