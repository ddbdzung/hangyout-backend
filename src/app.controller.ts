import { ElasticsearchCustomService } from './global/elasticsearch/elasticsearch.service';
import { All, Controller } from '@nestjs/common';

import { AppService } from './app.service';
import { Public } from './common/decorators/Public.decorator';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
// import { Types } from 'mongoose';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly elastic: ElasticsearchCustomService,
  ) {}

  @ApiOperation({
    summary: 'Ping',
    description: 'Ping - return pong message if success',
  })
  @ApiOkResponse({
    description: 'Ping successfully',
  })
  @Public()
  @All()
  ping(): string {
    return this.appService.ping();
  }

  @Public()
  @All('/test')
  async test() {
    // const res = 'test';
    // const res = await this.elastic.insertOneDocument('user_profile', {
    //   fullname: 'anony1',
    //   email: 'anony1@hotmail.com',
    // });
    const res = await this.elastic.bulkInsertDocuments('user_profile', [
      {
        _id: new Types.ObjectId(),
        fullname: 'anony1',
        email: 'anony1@hotmail.com',
      },
      {
        _id: new Types.ObjectId(),
        fullname: 'anonymous',
        email: 'anony123@hotmail.com',
      },
      {
        _id: new Types.ObjectId(),
        fullname: 'anonystick',
        email: 'anonymousYaya@hotmail.com',
      },
      {
        _id: new Types.ObjectId(),
        fullname: 'Nguyen Van A',
        email: 'example@hotmail.com',
      },
      {
        _id: new Types.ObjectId(),
        fullname: 'Nguyen Thi B',
        email: 'example123@hotmail.com',
      },
      {
        _id: new Types.ObjectId(),
        fullname: 'Tran Van C',
        email: 'vanexample@hotmail.com',
      },
      {
        _id: new Types.ObjectId(),
        fullname: 'Nguyen Van A',
        email: 'example1321@hotmail.com',
      },
    ]);

    // const res = await this.elastic.updateOneDocument(
    //   'user_profile',
    //   'xffIp4oBE5c4Ppk97Gwk',
    //   {
    //     id: new Types.ObjectId(),
    //   },
    // );

    // const res = await this.elastic.deleteOneDocument(
    //   'user_profile',
    //   'yffQp4oBE5c4Ppk9_GwL',
    // );
    return res;
  }
}
