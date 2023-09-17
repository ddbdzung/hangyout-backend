import { Module } from '@nestjs/common';

import { ElasticsearchService } from './elasticsearch.service';

@Module({
  imports: [],
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class ElasticsearchCustomModule {}
