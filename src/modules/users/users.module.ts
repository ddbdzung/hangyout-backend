import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserFactory } from './schemas/user.schema';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { UserRepository } from './repositories/user.repository';
import { AuthModule } from '@/modules/auth/auth.module';
import { CaslModule } from '@/global/casl/casl.module';
import { I18nCustomModule } from '@/global/i18n/i18n.module';

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
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
