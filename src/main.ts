import 'module-alias/register';

import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import * as mongoSanitize from 'express-mongo-sanitize';
import * as compression from 'compression';

import { AppModule } from './app.module';
import { winstonLogger } from './config/logger.config';
import { createDocs } from './config/docs.config';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });
  app.use(helmet());
  app.enableCors();
  app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
  );
  app.use(compression());
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  SwaggerModule.setup('/document-api', app, createDocs(app));
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
