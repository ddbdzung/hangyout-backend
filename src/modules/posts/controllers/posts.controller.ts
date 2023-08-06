import { Controller, Get, Param, Post } from '@nestjs/common';

import { PostsService } from '../services/posts.service';

@Controller('posts')
export class PostsController {
  @Get()
  findAll() {
    return 'This action returns all posts';
  }

  @Get(':id')
  findOne(@Param('id') id: number): string {
    return `This action returns a #${id} post`;
  }
}
