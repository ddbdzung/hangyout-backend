import { All, Controller } from '@nestjs/common';

import { AppService } from './app.service';
import { Public } from './common/decorators/Public.decorator';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
}
