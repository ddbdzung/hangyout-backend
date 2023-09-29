import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ApiService } from '@/common/base/classes/Api-service.abstraction';
import { I18nCustomService } from '@/global/i18n/i18n.service';

import { FriendshipRepository } from '../repositories/friendship.repository';

@Injectable()
export class FriendshipService extends ApiService {
  constructor(
    private readonly friendshipRepository: FriendshipRepository,
    private readonly i18n: I18nCustomService,
    private readonly configService: ConfigService,
  ) {
    super();
  }
}
