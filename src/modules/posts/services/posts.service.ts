import { Injectable } from '@nestjs/common';

import { Post } from '../schemas/post.schema';

@Injectable()
export class PostsService {
  private readonly posts: Post[] = [];

  create(post: Post) {
    this.posts.push(post);
  }

  findAll(): Post[] {
    return this.posts;
  }
}
