import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { BaseRepository } from '@/common/base.repository';

import { PostDocument } from '../schemas/post.schema';

@Injectable()
export class PostRepository extends BaseRepository<PostDocument> {
  constructor(
    @InjectModel('Post') private readonly postModel: Model<PostDocument>,
  ) {
    super(postModel);
  }
}
