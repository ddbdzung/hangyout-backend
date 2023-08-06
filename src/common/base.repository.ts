import { Document, FilterQuery, Model, QueryOptions, Types } from 'mongoose';

export class BaseRepository<T extends Document> {
  constructor(private readonly model: Model<T>) {}

  async create(doc: any): Promise<T> {
    try {
      const createdEntity = new this.model(doc);

      return await createdEntity.save();
    } catch (error) {
      throw error;
    }
  }

  async findById(id: Types.ObjectId, projection?: string | null): Promise<T> {
    return (await this.model.findById(id).select(projection)) as T;
  }

  async findOneByCondition(
    filter: any,
    projection?: string | null,
    option?: any | null,
    populate?: any | null,
  ) {
    return this.model.findOne(filter, projection, option).populate(populate);
  }

  async findAllByCondition(
    filter: any,
    projection?: string | null,
    option?: QueryOptions | null,
    populate?: any | null,
  ): Promise<T[]> {
    return this.model.find(filter, projection, option).populate(populate);
  }

  async findAll(): Promise<T[]> {
    return this.model.find();
  }

  async findByConditionAndUpdate(
    filter: any,
    update: any,
    options?: QueryOptions | null,
  ): Promise<any> {
    return this.model.findOneAndUpdate(
      filter as FilterQuery<T>,
      update,
      options,
    );
  }

  async deleteOneById(
    id: Types.ObjectId,
    options?: QueryOptions | null,
  ): Promise<any> {
    return this.model.deleteOne({ _id: id } as FilterQuery<T>, options);
  }

  async deleteManyById(
    id: Types.ObjectId[],
    options?: QueryOptions | null,
  ): Promise<any> {
    return this.model.deleteMany(
      { _id: { $in: id } } as FilterQuery<T>,
      options,
    );
  }

  async deleteByCondition(
    filter: any,
    options?: QueryOptions | null,
  ): Promise<any> {
    return this.model.deleteMany(filter as FilterQuery<T>, options);
  }

  async updateOneById(
    id: Types.ObjectId,
    update: any,
    options?: QueryOptions | null,
  ): Promise<any> {
    return this.model.updateOne({ _id: id } as FilterQuery<T>, update, options);
  }

  async updateMany(
    filter: any,
    update: any,
    options?: QueryOptions | null,
  ): Promise<any> {
    return this.model.updateMany(filter as FilterQuery<T>, update, options);
  }

  async aggregate(pipeline: any[]): Promise<any> {
    return this.model.aggregate(pipeline);
  }

  async populate(documents: T[], populate: any): Promise<any> {
    return this.model.populate(documents, populate);
  }
}
