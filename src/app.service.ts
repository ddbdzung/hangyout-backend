import { Injectable } from '@nestjs/common';

import { I18nCustomService } from './global/i18n/i18n.service';

@Injectable()
export class AppService {
  constructor(private readonly i18n: I18nCustomService) {}
  ping(): string {
    return this.i18n.translate('app.PING');
  }
}
