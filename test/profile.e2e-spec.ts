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
import { UpdatePersonalInfoDto } from '@/modules/users/dtos/update-personal-info.dto';

import { MongoDBService } from './services/mongo.service';
import { AppModule } from '../src/app.module';

describe('ProfileController /p (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let mongodb: MongoDBService;
  let authService: AuthService;
  let usersService: UsersService;
  let password;
  let user;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let i18n: I18nService;

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
      isVerified: true,
      isDeactivated: false,
    };

    mongodb = new MongoDBService();
    if (!(await mongodb.isIndexExists('users', 'email_2'))) {
      await mongodb.createIndex(
        'users',
        { email: -1 },
        { unique: true, name: 'email_2' },
      );
    }
    i18n = app.get<I18nService>(I18nService);
    authService = app.get<AuthService>(AuthService);
    usersService = app.get<UsersService>(UsersService);
  });

  // NOTE Check if user is deactivated or not
  // NOTE Check if user is verify to use this API or not

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

  describe('PATCH / [Update personal information]', () => {
    it('should return 401 if user is not authenticated', async () => {
      const body = new UpdatePersonalInfoDto({
        bio: 'new bio',
      });
      const response = await request(app.getHttpServer())
        .patch('/p')
        .send(body);

      expect(response.status).toBe(401);
    });

    it('should return 401 if account is inactive', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.isVerified = false;
      await userInDb.save();
      const { accessToken } = await authService.registerUserSession(userInDb);
      const updateDocument = new UpdatePersonalInfoDto({
        bio: 'new bio',
      });
      const response = await request(app.getHttpServer())
        .patch('/p')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDocument);

      expect(response.status).toBe(401);
    });

    it('should return 401 if user is deactivated', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.isDeactivated = true;
      await userInDb.save();
      const { accessToken } = await authService.registerUserSession(userInDb);
      const updateDocument = new UpdatePersonalInfoDto({
        bio: 'new bio',
      });
      const response = await request(app.getHttpServer())
        .patch('/p')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDocument);

      expect(response.status).toBe(401);
    });

    it('should return 400 if no data to update', async () => {
      const { accessToken } = await authService.registerUserSession(user);
      const updateDocument = new UpdatePersonalInfoDto({});
      const response = await request(app.getHttpServer())
        .patch('/p')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDocument);

      expect(response.status).toBe(400);
    });

    it('should return 400 if email is taken', async () => {
      const { accessToken } = await authService.registerUserSession(user);
      const newUser = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        fullname: faker.person.fullName(),
        role: ROLE.USER,
      };
      const newUserInDb = await usersService.createUser(newUser);
      const updateDocument = new UpdatePersonalInfoDto({
        email: newUserInDb.email,
      });
      const response = await request(app.getHttpServer())
        .patch('/p')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDocument);

      expect(response.status).toBe(400);
    });

    it('should return 200 if update successfully', async () => {
      const { accessToken } = await authService.registerUserSession(user);
      const updateDocument = new UpdatePersonalInfoDto({
        bio: 'new bio',
      });
      const response = await request(app.getHttpServer())
        .patch('/p')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDocument);

      expect(response.status).toBe(200);
    });
  });
});
