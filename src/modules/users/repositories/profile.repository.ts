import { Model, QueryOptions, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { BaseRepository } from '@/common/base.repository';

import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class ProfileRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async updateUserProfile(
    userId: Types.ObjectId,
    updateDto: Record<string, any>,
    options: QueryOptions,
  ) {
    return this.atomicUpdate({ _id: userId }, updateDto, options);
  }
}
