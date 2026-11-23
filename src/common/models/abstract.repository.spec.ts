import { describe, expect, it, vi } from 'vitest';
import { AbstractRepository } from './abstract.repository';

function query<T>(value: T) {
  return { exec: vi.fn().mockResolvedValue(value) };
}

describe('AbstractRepository', () => {
  it('forwards generic find and findOne filters, projections, and options', async () => {
    const rows = [{ name: 'Ada' }];
    const one = { name: 'Ada' };
    const model = {
      find: vi.fn(() => query(rows)),
      findOne: vi.fn(() => query(one)),
    };
    const repository = new AbstractRepository(model as never);

    await expect(repository.find({ filter: { name: 'Ada' }, projection: 'name' })).resolves.toEqual(rows);
    await expect(repository.findOne({ filter: { name: 'Ada' }, projection: 'name' })).resolves.toEqual(one);
    expect(model.find).toHaveBeenCalledWith({ name: 'Ada' }, 'name', undefined);
    expect(model.findOne).toHaveBeenCalledWith({ name: 'Ada' }, 'name', undefined);
  });

  it('supports generic update and delete operations', async () => {
    const model = {
      updateOne: vi.fn(() => query({ matchedCount: 1 })),
      deleteOne: vi.fn(() => query({ acknowledged: true, deletedCount: 1 })),
      deleteMany: vi.fn(() => query({ acknowledged: true, deletedCount: 2 })),
      countDocuments: vi.fn(() => query(2)),
    };
    const repository = new AbstractRepository(model as never);

    await expect(repository.updateOne({ name: 'Ada' }, { $set: { name: 'Ada Lovelace' } })).resolves.toBe(true);
    await expect(repository.deleteOne({ name: 'Ada' })).resolves.toMatchObject({ deletedCount: 1 });
    await expect(repository.deleteMany({})).resolves.toMatchObject({ deletedCount: 2 });
    await expect(repository.count({})).resolves.toBe(2);
  });

  it('supports generic atomic find-and-delete operations', async () => {
    const record = { id: 'token-1' };
    const model = { findOneAndDelete: vi.fn(() => query(record)) };
    const repository = new AbstractRepository(model as never);

    await expect(repository.findOneAndDelete({ id: 'token-1' })).resolves.toEqual(record);
    expect(model.findOneAndDelete).toHaveBeenCalledWith({ id: 'token-1' }, { projection: undefined });
  });
});
