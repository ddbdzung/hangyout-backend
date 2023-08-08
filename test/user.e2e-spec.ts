import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { TestingModule, Test } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';

import { AuthService } from '@/modules/auth/services/auth.service';
import { UsersService } from '@/modules/users/services/users.service';
import { ROLE } from '@/modules/users/users.constant';
import { SALT_ROUNDS } from '@/modules/users/users.constant';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';

import { MongoDBService } from './services/mongo.service';
import { AppModule } from '../src/app.module';

describe('UserController /users (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let mongodb: MongoDBService;
  let authService: AuthService;
  let usersService: UsersService;
  let i18n;
  let password;
  let user;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule, UsersModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    password = faker.internet.password();
    const hashedPassword = await bcrypt.hash(password, salt);

    user = {
      email: faker.internet.email(),
      password: hashedPassword,
      fullname: faker.person.fullName(),
      role: ROLE.USER,
      avatar: faker.image.avatar(),
      bio: faker.lorem.paragraph(),
      isVerified: false,
    };

    mongodb = new MongoDBService();
    i18n = app.get<I18nService>(I18nService);
    authService = app.get<AuthService>(AuthService);
    usersService = app.get<UsersService>(UsersService);
    // await mongodb.createIndex('users', { email: 1 }, { unique: true });
  });

  beforeEach(async () => {
    await mongodb.insertMany('users', [user]);
  });

  afterEach(async () => {
    await mongodb.deleteMany('users', {});
  });

  afterAll(async () => {
    await mongodb.dropCollection('users');
    await mongodb.close();
    await app.close();
  });

  describe('GET /', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/')
        .send(user);

      expect(response.status).toBe(401);
    });

    it('should return 403 when user is not authorized with ADMIN role', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .get('/users/')
        .set('Authorization', 'Bearer ' + accessToken);

      expect(response.status).toBe(403);
    });

    it('should return 200 when user is authorized with ADMIN role', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await usersService.updateUser(userInDb._id, userInDb.toObject());
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .get('/users/')
        .set('Authorization', 'Bearer ' + accessToken);

      expect(response.status).toBe(200);
    });
  });
});
