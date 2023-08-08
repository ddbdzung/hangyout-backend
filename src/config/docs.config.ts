import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const docsConfig = new DocumentBuilder()
  .setTitle('Hangyout API')
  .setDescription('The Hangyout API description')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

export const createDocs = app => SwaggerModule.createDocument(app, docsConfig);
