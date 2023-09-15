import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

import { BaseRepository } from '@/common/base.repository';

import { UserDocument } from '../schemas/user.schema';

export interface IQueryMongooseOptions {
  select?: string;
  lean?: boolean;
}

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async countAll(filter: FilterQuery<any> = {}): Promise<number> {
    return this.userModel.countDocuments(filter);
  }

  async findOneByEmail(
    email: string,
    queryMongooseOptions: IQueryMongooseOptions = { select: null, lean: false },
  ): Promise<UserDocument> {
    const { select, ...options } = queryMongooseOptions;

    return this.userModel.findOne({ email }, select, { ...options });
  }

  async comparePassword(
    user: UserDocument,
    password: string,
  ): Promise<boolean> {
    return bcrypt.compareSync(password, user.password);
  }
}
