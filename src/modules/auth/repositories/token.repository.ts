import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { BaseRepository } from '@/common/base.repository';

import { TokenDocument } from '../schemas/token.schema';
import { TOKEN_TYPE } from '../auth.constant';

@Injectable()
export class TokenRepository extends BaseRepository<TokenDocument> {
  constructor(
    @InjectModel('Token') private readonly tokenModel: Model<TokenDocument>,
  ) {
    super(tokenModel);
  }

  async findOneByToken(token: string) {
    return this.tokenModel.findOne({ token });
  }

  async findOneByUserIdAndType(
    userId: mongoose.Types.ObjectId,
    type: TOKEN_TYPE,
    options: { lean?: boolean } = { lean: false },
  ) {
    switch (options.lean) {
      case true:
        return this.tokenModel.findOne({ user: userId, type }).lean();

      default:
        return this.tokenModel.findOne({ user: userId, type });
    }
  }
}
