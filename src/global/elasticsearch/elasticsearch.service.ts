import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';

import {
  mappingAutoCompleteSearch,
  settingAutoCompleteSearch,
} from './create-index';
import { MappingBuilder } from './builders/mapping.builder';
import { LoggerService } from '../logger/logger.service';
import { Tag } from '../logger/logger.constant';
import { IndexDocumentBuilderV8 } from './builders/bulk-insert.builder';
import { DeleteResponse } from './types';
import { IQueryResponse } from './interfaces/IQueryResponse';

@Injectable()
export class ElasticsearchCustomService {
  private async _init() {
    const indicesEsServer = (await this.getAllIndices()).map(i => i.index);
    const indicesSystem = this.configService.get<Record<string, string>>(
      'searchEngine.elasticsearch.indices',
    );
    const indicesNotExists = Object.values(indicesSystem).filter(
      i => !indicesEsServer.includes(i),
    );
    for (const index of indicesNotExists) {
      if (index === indicesSystem.userProfile) {
        await this.createIndex(index, {
          settings: settingAutoCompleteSearch(),
          mappings: new MappingBuilder()
            .addProperty('fullname', mappingAutoCompleteSearch())
            .addProperty('email', mappingAutoCompleteSearch())
            .build(),
        });
        LoggerService.log(
          Tag.INFO,
          `${ElasticsearchCustomService.name}`,
          `Created index '${index}'`,
        );
      }
    }
  }

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) {
    this._init();
  }

  async getAllIndices(): Promise<Record<string, any>[]> {
    return this.elasticsearchService.cat.indices({
      format: 'json',
    });
  }

  async getInfo(): Promise<any> {
    return this.elasticsearchService.info();
  }

  async createIndex(index: string, body: Record<string, any>): Promise<any> {
    return this.elasticsearchService.indices.create({
      index,
      body,
    });
  }

  async insertOneDocument(
    index: string,
    document: Record<string, any>,
    id?: string,
  ): Promise<any> {
    const paramsRequest = {
      index,
      document,
    };
    if (id) {
      paramsRequest['id'] = id;
    }
    return this.elasticsearchService.index(paramsRequest);
  }

  async bulkInsertDocuments(
    index: string,
    documents: Record<string, any>[],
  ): Promise<any> {
    const bulkDocuments = documents.flatMap(doc => {
      if (!doc?._id) {
        LoggerService.log(
          Tag.ERROR,
          `${ElasticsearchCustomService.name}`,
          `Document ${JSON.stringify(doc)} does not have _id property`,
        );
        return null;
      }

      return new IndexDocumentBuilderV8()
        .setIndex(index)
        .setBody(doc)
        .withId(doc?._id)
        .build();
    });

    return this.elasticsearchService.bulk({
      refresh: true,
      body: bulkDocuments,
    });
  }

  async deleteOneDocument(index: string, id: string): Promise<DeleteResponse> {
    return this.elasticsearchService.delete({
      index,
      id,
    });
  }

  async updateOneDocument(
    index: string,
    id: string,
    document: Record<string, any>,
  ): Promise<any> {
    const { _id, ...rest } = document;
    if (_id) {
      rest.id = _id;
    }

    return this.elasticsearchService.update({
      id,
      index,
      body: {
        doc: rest,
      },
    });
  }

  async searchMultiFields<T>(query: string, fields: string[]) {
    const tieBreaker = fields.length > 0 ? 1.0 / fields.length : 0;
    return this.elasticsearchService.search({
      index: 'user_profile',
      body: {
        query: {
          multi_match: {
            query,
            fields: fields.map(i => i.concat('.complete')),
            type: 'best_fields',
            tie_breaker: tieBreaker,
          },
        },
      },
    }) as Promise<IQueryResponse<T>>;
  }
}
