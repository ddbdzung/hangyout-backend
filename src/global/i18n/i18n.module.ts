import { Module } from '@nestjs/common';

import { I18nCustomService } from './i18n.service';

@Module({
  imports: [],
  providers: [I18nCustomService],
  exports: [I18nCustomService],
})
export class I18nCustomModule {}
