import { Request } from 'express';
import { Body, Controller, Get, Patch, Post, Query, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { I18nCustomService } from '@/global/i18n/i18n.service';
import {
  BadRequestResponseDto,
  ForbiddenResponseDto,
  UnauthorizedResponseDto,
} from '@/common/dto.common';

import { FriendshipService } from '../services/friendship.service';

@ApiTags('friendship')
@Controller('friends')
export class FriendshipController {
  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly i18n: I18nCustomService,
  ) {}

  @ApiOperation({
    summary: 'Add new friend',
    description: 'Add new friend',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'OK - Search profile successfully',
    // type: SearchProfileResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: BadRequestResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid access token',
    type: UnauthorizedResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
    type: ForbiddenResponseDto,
  })
  @Post('/add')
  async addNewFriend() {
    return { message: 'OK' };
  }
}
