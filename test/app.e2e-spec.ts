import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { I18nService } from 'nestjs-i18n';

describe('AppController / (e2e)', () => {
  let app: INestApplication;
  let i18n;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    i18n = moduleFixture.get<I18nService>(I18nService);
  });
  test('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(i18n.translate('app.PING'));
  });
  test('/ (POST)', () => {
    return request(app.getHttpServer())
      .post('/')
      .expect(200)
      .expect(i18n.translate('app.PING'));
  });
  test('/ (PUT)', () => {
    return request(app.getHttpServer())
      .put('/')
      .expect(200)
      .expect(i18n.translate('app.PING'));
  });
  test('/ (PATCH)', () => {
    return request(app.getHttpServer())
      .patch('/')
      .expect(200)
      .expect(i18n.translate('app.PING'));
  });
  test('/ (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/')
      .expect(200)
      .expect(i18n.translate('app.PING'));
  });
});
