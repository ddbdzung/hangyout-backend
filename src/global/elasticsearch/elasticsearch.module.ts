import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ElasticsearchCustomService } from './elasticsearch.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        node: config.get('searchEngine.elasticsearch.node'),
        auth: {
          username: config.get('searchEngine.elasticsearch.username'),
          password: config.get('searchEngine.elasticsearch.password'),
        },
        maxRetries: 10,
        requestTimeout: 60000,
        pingTimeout: 60000,
        sniffOnStart: true,
      }),
    }),
  ],
  providers: [ElasticsearchCustomService],
  exports: [ElasticsearchCustomService],
})
export class ElasticsearchCustomModule {}
