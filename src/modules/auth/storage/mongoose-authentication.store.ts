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
  constructor(
    @InjectModel(Session.name) private readonly sessions: Model<Session>,
    @InjectModel('AuthenticationMagicLink') private readonly magicLinks: Model<MagicLinkEntity>,
    @InjectModel('AuthenticationEmailToken') private readonly emailTokens: Model<EmailTokenEntity>,
    storage: AuthenticationStorage,
  ) {
    storage.registerSource({ sessions: this, magicLinks: this, emailTokens: this });
  }

  async getSession(id: string): Promise<SessionRecord | undefined> {
    const record = await this.sessions.findOne({ id }).lean().exec();
    return record ? this.clean(record) as SessionRecord : undefined;
  }

  async createSession(record: SessionRecord): Promise<void> {
    await this.sessions.create(this.clean(record));
    await this.sessions.deleteMany({ expiresAt: { $lte: record.createdAt } }).exec();
  }

  async touchSession(id: string, lastActiveAt: Date): Promise<void> {
    await this.sessions.updateOne({ id, lastActiveAt: { $lt: lastActiveAt } }, { $set: { lastActiveAt } }).exec();
  }

  async deleteSession(id: string): Promise<boolean> {
    const result = await this.sessions.deleteOne({ id }).exec();
    return result.deletedCount === 1;
  }

  async listUserSessions(userId: string): Promise<SessionRecord[]> {
    const records = await this.sessions.find({ userId }).lean().exec();
    return records.map((record) => this.clean(record) as SessionRecord);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.sessions.deleteMany({ userId }).exec();
  }

  async saveMagicLink(record: MagicLinkRecord): Promise<void> {
    await this.magicLinks.create(this.clean(record));
    await this.magicLinks.deleteMany({ expiresAt: { $lte: record.createdAt } }).exec();
    await this.cap(this.magicLinks, 10_000);
  }

  async consumeMagicLink(id: string): Promise<MagicLinkRecord | undefined> {
    const record = await this.magicLinks.findOneAndDelete({ id }).lean().exec();
    return record ? this.clean(record) as MagicLinkRecord : undefined;
  }

  async saveEmailToken(record: EmailTokenRecord): Promise<void> {
    await this.emailTokens.create(this.clean(record));
    await this.emailTokens.deleteMany({ expiresAt: { $lte: record.createdAt } }).exec();
    await this.cap(this.emailTokens, 10_000);
  }

  async consumeEmailToken(id: string, purpose: EmailTokenPurpose): Promise<EmailTokenRecord | undefined> {
    const record = await this.emailTokens.findOneAndDelete({ id, purpose }).lean().exec();
    return record ? this.clean(record) as EmailTokenRecord : undefined;
  }

  async deleteUserEmailTokens(userId: string, purpose: EmailTokenPurpose): Promise<void> {
    await this.emailTokens.deleteMany({ userId, purpose }).exec();
  }

  private async cap<T>(model: Model<T>, limit: number): Promise<void> {
    const count = await model.countDocuments().exec();
    if (count <= limit) return;
    const overflow = await model.find().sort({ expiresAt: 1 }).limit(count - limit).select({ _id: 1 }).lean().exec();
    await model.deleteMany({ _id: { $in: overflow.map((record) => (record as { _id: unknown })._id) } }).exec();
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
