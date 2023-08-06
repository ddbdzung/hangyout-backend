import { All, Controller } from '@nestjs/common';

import { AppService } from './app.service';
import { Public } from './common/decorators/Public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @All()
  ping(): string {
    return this.appService.ping();
  }
}
