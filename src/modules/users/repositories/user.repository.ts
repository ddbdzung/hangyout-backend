import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

import { BaseRepository } from '@/common/base.repository';

import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async countAll(): Promise<number> {
    return this.userModel.countDocuments();
  }

  async findOneByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email });
  }

  async comparePassword(
    user: UserDocument,
    password: string,
  ): Promise<boolean> {
    return bcrypt.compareSync(password, user.password);
  }
}
