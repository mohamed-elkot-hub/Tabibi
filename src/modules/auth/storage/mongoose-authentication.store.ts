import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthenticationStorage } from '@nestjs/authentication';
import type {
  EmailTokenPurpose,
  EmailTokenRecord,
  EmailTokenStore,
  MagicLinkRecord,
  MagicLinkStore,
  SessionRecord,
  SessionStore,
} from '@nestjs/authentication';
import { Model, Schema } from 'mongoose';

import { Session } from '../../../common/models/session/session.schema';
import { AbstractRepository } from '../../../common/models/abstract.repository';

class MagicLinkEntity implements MagicLinkRecord {
  id: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
  redirectTo?: string;
}

class EmailTokenEntity implements EmailTokenRecord {
  id: string;
  purpose: EmailTokenPurpose;
  userId: string;
  email: string;
  fingerprint?: string;
  createdAt: Date;
  expiresAt: Date;
}

@Injectable()
export class MongooseAuthenticationStore implements SessionStore, MagicLinkStore, EmailTokenStore {
  private readonly sessionRecords: AbstractRepository<Session>;
  private readonly magicLinkRecords: AbstractRepository<MagicLinkEntity>;
  private readonly emailTokenRecords: AbstractRepository<EmailTokenEntity>;

  constructor(
    @InjectModel(Session.name) sessions: Model<Session>,
    @InjectModel('AuthenticationMagicLink') magicLinks: Model<MagicLinkEntity>,
    @InjectModel('AuthenticationEmailToken') emailTokens: Model<EmailTokenEntity>,
    storage: AuthenticationStorage,
  ) {
    this.sessionRecords = new AbstractRepository(sessions);
    this.magicLinkRecords = new AbstractRepository(magicLinks);
    this.emailTokenRecords = new AbstractRepository(emailTokens);
    storage.registerSource({ sessions: this, magicLinks: this, emailTokens: this });
  }

  async getSession(id: string): Promise<SessionRecord | undefined> {
    const record = await this.sessionRecords.findOne({ filter: { id } });
    return record ? this.clean(record) as SessionRecord : undefined;
  }

  async createSession(record: SessionRecord): Promise<void> {
    await this.sessionRecords.create(this.clean(record));
    await this.sessionRecords.deleteMany({ expiresAt: { $lte: record.createdAt } });
  }

  async touchSession(id: string, lastActiveAt: Date): Promise<void> {
    await this.sessionRecords.updateOne({ id, lastActiveAt: { $lt: lastActiveAt } }, { $set: { lastActiveAt } });
  }

  async deleteSession(id: string): Promise<boolean> {
    const result = await this.sessionRecords.deleteOne({ id });
    return result.deletedCount === 1;
  }

  async listUserSessions(userId: string): Promise<SessionRecord[]> {
    const records = await this.sessionRecords.find({ filter: { userId } });
    return records.map((record) => this.clean(record) as SessionRecord);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.sessionRecords.deleteMany({ userId });
  }

  async saveMagicLink(record: MagicLinkRecord): Promise<void> {
    await this.magicLinkRecords.create(this.clean(record));
    await this.magicLinkRecords.deleteMany({ expiresAt: { $lte: record.createdAt } });
    await this.cap(this.magicLinkRecords, 10_000);
  }

  async consumeMagicLink(id: string): Promise<MagicLinkRecord | undefined> {
    const record = await this.magicLinkRecords.findOneAndDelete({ id });
    return record ? this.clean(record) as MagicLinkRecord : undefined;
  }

  async saveEmailToken(record: EmailTokenRecord): Promise<void> {
    await this.emailTokenRecords.create(this.clean(record));
    await this.emailTokenRecords.deleteMany({ expiresAt: { $lte: record.createdAt } });
    await this.cap(this.emailTokenRecords, 10_000);
  }

  async consumeEmailToken(id: string, purpose: EmailTokenPurpose): Promise<EmailTokenRecord | undefined> {
    const record = await this.emailTokenRecords.findOneAndDelete({ id, purpose });
    return record ? this.clean(record) as EmailTokenRecord : undefined;
  }

  async deleteUserEmailTokens(userId: string, purpose: EmailTokenPurpose): Promise<void> {
    await this.emailTokenRecords.deleteMany({ userId, purpose });
  }

  private async cap<T>(repository: AbstractRepository<T>, limit: number): Promise<void> {
    const count = await repository.count();
    if (count <= limit) return;
    const overflow = await repository.find({ sort: { expiresAt: 1 }, limit: count - limit, projection: { _id: 1 } });
    await repository.deleteMany({ _id: { $in: overflow.map((record) => (record as { _id: unknown })._id) } } as never);
  }

  private clean<T extends object>(record: T): T {
    const { _id, __v, ...clean } = record as T & { _id?: unknown; __v?: unknown };
    void _id;
    void __v;
    return clean as T;
  }
}

export const authenticationStoreModels = [
  {
    name: 'AuthenticationMagicLink',
    schema: new Schema({
      id: { type: String, required: true, unique: true },
      email: { type: String, required: true },
      createdAt: { type: Date, required: true },
      expiresAt: { type: Date, required: true },
      redirectTo: String,
    }, {
      collection: 'authentication_magic_links',
      versionKey: false,
      strict: true,
      timestamps: false,
      validateBeforeSave: true,
    }),
  },
  {
    name: 'AuthenticationEmailToken',
    schema: new Schema({
      id: { type: String, required: true, unique: true },
      purpose: { type: String, required: true },
      userId: { type: String, required: true, index: true },
      email: { type: String, required: true },
      fingerprint: String,
      createdAt: { type: Date, required: true },
      expiresAt: { type: Date, required: true },
    }, {
      collection: 'authentication_email_tokens',
      versionKey: false,
      strict: true,
      timestamps: false,
      validateBeforeSave: true,
    }),
  },
];
