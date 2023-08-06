import 'winston-daily-rotate-file';

import { WinstonModule } from 'nest-winston';
import { transports, format } from 'winston';

enum Color {
  cyan = '\x1b[36m',
  red = '\x1b[31m',
  reset = '\x1b[0m',
}
const colorizeText = (text: string, color: Color) =>
  `${color}${text}${Color.reset}`;

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    // file on daily rotation (error only)
    new transports.DailyRotateFile({
      // %DATE will be replaced by the current date
      filename: `logs/%DATE%-error.log`,
      level: 'error',
      format: format.combine(format.timestamp(), format.json()),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false, // don't want to zip our logs
      maxFiles: '30d', // will keep log until they are older than 30 days
      maxSize: '20m', // maximum size of a file before creating a new one
    }),
    // same for all levels
    new transports.DailyRotateFile({
      filename: `logs/%DATE%-combined.log`,
      format: format.combine(format.timestamp(), format.json()),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxFiles: '30d',
      maxSize: '20m',
    }),
    new transports.Console({
      format: format.combine(
        format.cli(),
        format.splat(),
        format.ms(),
        format.colorize({ message: false, level: true }),
        format.timestamp(),
        format.prettyPrint({ depth: 3 }),
        format.align(),
        format.printf(info => {
          const stackTrace = info.stack
            ? colorizeText(info.stack, Color.red)
            : '';
          const ms = colorizeText(info.ms, Color.cyan);
          return `${colorizeText(info.timestamp, Color.cyan)} ${info.level}: ${
            info.message
          } ${ms}${stackTrace}`;
        }),
      ),
    }),
  ],
});
