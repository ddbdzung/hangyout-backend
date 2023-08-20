import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService, TranslateOptions } from 'nestjs-i18n';

@Injectable()
export class I18nCustomService {
  constructor(private readonly i18n: I18nService) {}

  translate(key: string, options: TranslateOptions = {}): string {
    return this.i18n.translate(key, {
      ...options,
      lang: I18nContext.current().lang,
    });
  }
}
