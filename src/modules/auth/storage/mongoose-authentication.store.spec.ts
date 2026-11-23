import { describe, expect, it, vi } from 'vitest';
import { MongooseAuthenticationStore } from './mongoose-authentication.store';

function query<T>(value: T) {
  return { lean: () => ({ exec: async () => value }), exec: async () => value };
}

describe('MongooseAuthenticationStore', () => {
  it('registers its session, magic-link, and email-token stores', () => {
    const storage = { registerSource: vi.fn() };
    const store = new MongooseAuthenticationStore({} as never, {} as never, {} as never, storage as never);
    expect(storage.registerSource).toHaveBeenCalledWith({ sessions: store, magicLinks: store, emailTokens: store });
  });

  it('round-trips sessions without Mongo metadata and expires stale records', async () => {
    const record = { id: 'session-1', userId: 'user-1', createdAt: new Date(), expiresAt: new Date(Date.now() + 60_000), lastActiveAt: new Date() };
    const sessions = {
      findOne: vi.fn(() => query({ ...record, _id: 'mongo-id', __v: 0 })),
      create: vi.fn().mockResolvedValue(undefined),
      deleteMany: vi.fn(() => query({ deletedCount: 0 })),
      updateOne: vi.fn(() => query({ modifiedCount: 1 })),
      deleteOne: vi.fn(() => query({ deletedCount: 1 })),
      find: vi.fn(() => ({ exec: async () => [{ ...record, _id: 'mongo-id', __v: 0 }] })),
    };
    const store = new MongooseAuthenticationStore(sessions as never, {} as never, {} as never, { registerSource: vi.fn() } as never);

    await expect(store.getSession(record.id)).resolves.toEqual(record);
    await store.createSession(record);
    expect(sessions.create).toHaveBeenCalledWith(record);
    expect(sessions.deleteMany).toHaveBeenCalledWith({ expiresAt: { $lte: record.createdAt } });
    await store.touchSession(record.id, new Date());
    expect(sessions.updateOne).toHaveBeenCalledWith({ id: record.id, lastActiveAt: { $lt: expect.any(Date) } }, { $set: { lastActiveAt: expect.any(Date) } }, undefined);
    await expect(store.deleteSession(record.id)).resolves.toBe(true);
    await expect(store.listUserSessions(record.userId)).resolves.toEqual([record]);
  });

  it('consumes magic links and email tokens atomically by identifier/purpose', async () => {
    const magicLinks = { findOneAndDelete: vi.fn(() => query({ id: 'link-1', _id: 'mongo-id' })) };
    const emailTokens = { findOneAndDelete: vi.fn(() => query({ id: 'token-1', purpose: 'email-verification', _id: 'mongo-id' })) };
    const store = new MongooseAuthenticationStore({} as never, magicLinks as never, emailTokens as never, { registerSource: vi.fn() } as never);

    await expect(store.consumeMagicLink('link-1')).resolves.toEqual({ id: 'link-1' });
    expect(magicLinks.findOneAndDelete).toHaveBeenCalledWith({ id: 'link-1' }, { projection: undefined });
    await expect(store.consumeEmailToken('token-1', 'email-verification')).resolves.toEqual({ id: 'token-1', purpose: 'email-verification' });
    expect(emailTokens.findOneAndDelete).toHaveBeenCalledWith({ id: 'token-1', purpose: 'email-verification' }, { projection: undefined });
  });
});
