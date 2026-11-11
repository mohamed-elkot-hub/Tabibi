import { Model, ProjectionType, QueryFilter, QueryOptions } from 'mongoose';

export class AbstractRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }): Promise<T | null> {
    return await this.model.findOne(filter, projection, options);
  }
}
