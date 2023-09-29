import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { BaseRepository } from '@/common/base.repository';

import { FriendshipDocument } from '../schemas/friendship.schema';

@Injectable()
export class FriendshipRepository extends BaseRepository<FriendshipDocument> {
  constructor(
    @InjectModel('Friendship')
    private readonly friendshipModel: Model<FriendshipDocument>,
  ) {
    super(friendshipModel);
  }
}
