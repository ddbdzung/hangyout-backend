import { Injectable } from '@nestjs/common';

import { Color, Tag, TagColor } from './logger.constant';

@Injectable()
export class LoggerService {
  static log(tag: Tag, content: string, ...args: any) {
    const nodeEnv = process.env.NODE_ENV;
    if (!nodeEnv) throw new Error('NODE_ENV is undefined');
    if (nodeEnv === 'test') return;

    console.log(
      `[${this._colorizeText(tag, TagColor[tag])}]:${this._colorizeText(
        this._getTimestamp(),
        TagColor.DEBUG,
      )}: ${content}`,
      ...args,
    );
  }

  private static _getTimestamp = () => new Date().toISOString();
  private static _colorizeText = (text: string, color: Color | TagColor) =>
    `${color}${text}${Color.reset}`;
}