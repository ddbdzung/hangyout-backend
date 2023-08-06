import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { getUserIp } from '@/utils/getUserIP';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger();

  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      const statusCode = res.statusCode;
      let message = `[${req.method}] ${req.url} - ${statusCode}`;
      if (process.env.NODE_ENV === 'production') {
        message = `${message} - ${getUserIp(req)}`;
      }
      if (statusCode >= 400 && statusCode < 500) {
        if (statusCode === 403) {
          const requestData = {
            params: req.params,
            query: req.query,
            body: req.body,
          };
          let requestJsonData = null;
          try {
            requestJsonData = JSON.stringify(requestData);
            message = `${message} - ${requestJsonData}`;
          } catch (err) {
            this.logger.error(err);
          }
        }
        this.logger.warn(message);
      } else if (statusCode >= 500) {
        this.logger.error(message);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}
