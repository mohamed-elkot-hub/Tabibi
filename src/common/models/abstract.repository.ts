import {
  DeleteResult,
  Model,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';

export class AbstractRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async find({
    filter,
    projection,
    options,
    sort,
    limit,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
    sort?: Record<string, 1 | -1>;
    limit?: number;
  } = {}): Promise<T[]> {
    let query = this.model.find(filter, projection, options);
    if (sort) query = query.sort(sort);
    if (limit !== undefined) query = query.limit(limit);
    return query.exec();
  }

  async findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  } = {}): Promise<T | null> {
    return await this.model.findOne(filter, projection, options).exec();
  }

  async findById(id: string, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T | null> {
    return this.model.findById(id, projection, options).exec();
  }

  async updateOne(filter: QueryFilter<T>, update: UpdateQuery<T>, options?: Parameters<Model<T>['updateOne']>[2]): Promise<boolean> {
    const result = await this.model.updateOne(filter, update, options).exec();
    return result.matchedCount > 0;
  }

  async findOneAndUpdate({
    filter,
    update,
    projection,
    options,
  }: {
    filter: QueryFilter<T>;
    update: UpdateQuery<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, update, { ...options, projection }).exec();
  }

  async findOneAndDelete(filter: QueryFilter<T>, projection?: ProjectionType<T>): Promise<T | null> {
    return this.model.findOneAndDelete(filter, { projection }).exec();
  }

  async deleteOne(filter: QueryFilter<T>): Promise<DeleteResult> {
    return this.model.deleteOne(filter).exec();
  }

  async deleteMany(filter: QueryFilter<T> = {}): Promise<DeleteResult> {
    return this.model.deleteMany(filter).exec();
  }

  async count(filter: QueryFilter<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}
