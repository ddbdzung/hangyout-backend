import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '@/modules/auth/auth.module';
import { CaslModule } from '@/global/casl/casl.module';
import { I18nCustomModule } from '@/global/i18n/i18n.module';
import { ElasticsearchCustomModule } from '@/global/elasticsearch/elasticsearch.module';

import { User, UserFactory } from './schemas/user.schema';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { UserRepository } from './repositories/user.repository';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';
import { ProfileRepository } from './repositories/profile.repository';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: UserFactory,
      },
    ]),
    forwardRef(() => AuthModule),
    CaslModule,
    I18nCustomModule,
    ElasticsearchCustomModule,
  ],
  controllers: [UsersController, ProfileController],
  providers: [UsersService, UserRepository, ProfileRepository, ProfileService],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
