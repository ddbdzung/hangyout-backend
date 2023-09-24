import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from '@/modules/users/users.module';
import { RedisModule } from '@/global/redis/redis.module';
import { I18nCustomModule } from '@/global/i18n/i18n.module';
import { CaslModule } from '@/global/casl/casl.module';
import { ElasticsearchCustomModule } from '@/global/elasticsearch/elasticsearch.module';

import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { TokenRepository } from './repositories/token.repository';
import { Token, TokenFactory } from './schemas/token.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Token.name,
        useFactory: TokenFactory,
      },
    ]),
    RedisModule,
    forwardRef(() => UsersModule),
    I18nCustomModule,
    CaslModule,
    ElasticsearchCustomModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenRepository],
  exports: [AuthService, TokenRepository],
})
export class AuthModule {}
