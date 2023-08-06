import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class I18nCustomService {
  constructor(private readonly i18n: I18nService) {}

  translate(key: string): string {
    return this.i18n.translate(key, {
      lang: I18nContext.current().lang,
    });
  }
}
