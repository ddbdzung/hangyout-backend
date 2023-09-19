import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { MailerModule } from '@nestjs-modules/mailer';
import {
  ThrottlerModule,
  ThrottlerModuleOptions,
  ThrottlerOptions,
} from '@nestjs/throttler';
import * as path from 'path';
import * as mongoose from 'mongoose';

import { winstonLogger } from '@/config/logger.config';
import { configuration, validationSchema } from '@/config/configuration.config';
import { RequestLoggerMiddleware } from '@/common/middlewares/request-logger.middleware';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { I18nCustomModule } from './global/i18n/i18n.module';
import { RedisModule } from './global/redis/redis.module';
import { AuthGuard } from './common/guards/auth.guard';
import './global/casl/casl-ability.factory';
import { CaslModule } from './global/casl/casl.module';
import { LoggerService } from './global/logger/logger.service';
import { Tag } from './global/logger/logger.constant';
import { ElasticsearchCustomModule } from './global/elasticsearch/elasticsearch.module';

const ENV = process.env.NODE_ENV;
const toMsFromSecond = (second: number): number => second * 1000;
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema,
      isGlobal: true,
      load: [configuration],
      envFilePath: !ENV ? '.env' : `.${ENV}.env`,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        LoggerService.log(Tag.INFO, 'MailerConfig', config.get('mailer'));
        return {
          transport: config.get('mailer.transport'),
          defaults: {
            from: config.get('mailer.from'),
          },
        };
      },
      inject: [ConfigService],
    }),
    /**
     * @see https://github.com/kkoomen/nestjs-throttler-storage-redis
     */
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const throttlers: ThrottlerOptions[] = [
          {
            ttl: config.get('throttle.ttl'),
            limit: config.get('throttle.limit'),
          },
        ];
        const options: ThrottlerModuleOptions = {
          throttlers,
          storage: new ThrottlerStorageRedisService(),
        };

        return options;
      },
    }),
    I18nModule.forRootAsync({
      useFactory: () => ({
        fallbackLanguage: 'en',
        loaderOptions: {
          path: path.join(__dirname, 'i18n'),
          watch: true,
        },
      }),
      resolvers: [new HeaderResolver(['x-custom-lang'])],
    }),
    JwtModule.register({
      global: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        if (!['production', 'test'].includes(config.get('NODE_ENV'))) {
          mongoose.set('debug', true);
        }
        return {
          uri: config.get('database.mongodb'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
          retryAttempts: 0,
          retryDelay: 5000,
          connectionFactory: conn => {
            if (config.get('NODE_ENV') !== 'test') {
              winstonLogger.log(`MongoDB connected! ${conn._connectionString}`);
            }
            return conn;
          },
        };
      },
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (config: ConfigService) => {
        const redisUrl = `redis://${config.get('redis.host')}:${config.get(
          'redis.port',
        )}`;
        return {
          store: await redisStore({
            url: redisUrl,
            ttl: toMsFromSecond(config.get('redis.ttl')),
          }),
        };
      },
    }),
    CaslModule,
    UsersModule,
    AuthModule,
    I18nCustomModule,
    RedisModule,
    ElasticsearchCustomModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {
  constructor() {
    if (ENV !== 'test') {
      console.log('System running on', ENV);
    }
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
