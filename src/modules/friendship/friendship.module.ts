import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CaslModule } from '@/global/casl/casl.module';
import { I18nCustomModule } from '@/global/i18n/i18n.module';

import { Friendship, FriendshipFactory } from './schemas/friendship.schema';
import { FriendshipController } from './controllers/friendship.controller';
import { FriendshipService } from './services/friendship.service';
import { FriendshipRepository } from './repositories/friendship.repository';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Friendship.name,
        useFactory: FriendshipFactory,
      },
    ]),
    CaslModule,
    I18nCustomModule,
  ],
  controllers: [FriendshipController],
  providers: [FriendshipService, FriendshipRepository],
  exports: [FriendshipService, FriendshipRepository],
})
export class FriendshipModule {}
