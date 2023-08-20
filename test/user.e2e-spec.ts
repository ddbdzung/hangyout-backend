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
import { Types } from 'mongoose';
import { UpdateUserDto } from '@/modules/users/dtos/update-user.dto';

describe('UserController /users (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let mongodb: MongoDBService;
  let authService: AuthService;
  let usersService: UsersService;
  let i18n: I18nService;
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
      isVerified: true,
    };

    mongodb = new MongoDBService();
    i18n = app.get<I18nService>(I18nService);
    authService = app.get<AuthService>(AuthService);
    usersService = app.get<UsersService>(UsersService);
    // await mongodb.createIndex('users', { email: 1 }, { unique: true });
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
      await usersService.updateUserById(userInDb._id, userInDb.toObject());
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .get('/users/')
        .set('Authorization', 'Bearer ' + accessToken);

      expect(response.status).toBe(200);
    });
  });

  /**
   * Summary: Implement test for POST /users
   */
  describe('POST /', () => {
    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app.getHttpServer()).post('/users/');

      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not authorized with ADMIN role', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .post('/users/')
        .set('Authorization', 'Bearer ' + accessToken);

      expect(response.status).toBe(403);
    });

    it('should return 400 if email is not provided', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await usersService.updateUserById(userInDb._id, userInDb.toObject());
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .post('/users/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 400 if email is not valid', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await usersService.updateUserById(userInDb._id, userInDb.toObject());
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .post('/users/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
    });

    it('should return 400 if email is already existed', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await usersService.updateUserById(userInDb._id, userInDb.toObject());
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .post('/users/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ email: user.email });

      expect(response.status).toBe(400);
    });

    it('should return 400 if password is not provided', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await usersService.updateUserById(userInDb._id, userInDb.toObject());
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .post('/users/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ email: faker.internet.email() });

      expect(response.status).toBe(400);
    });

    it('should return 400 if password is not valid', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await usersService.updateUserById(userInDb._id, userInDb.toObject());
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .post('/users/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ email: faker.internet.email(), password: '123' });

      expect(response.status).toBe(400);
    });

    it('should return 400 if fullname is not provided', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await usersService.updateUserById(userInDb._id, userInDb.toObject());
      const { accessToken } = await authService.registerUserSession(userInDb);
      const password = faker.internet.password();
      const response = await request(app.getHttpServer())
        .post('/users/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({ email: faker.internet.email(), password });

      expect(response.status).toBe(400);
    });

    it('should return 400 if fullname is not valid', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await usersService.updateUserById(userInDb._id, userInDb.toObject());
      const password = faker.internet.password();
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .post('/users/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({
          email: faker.internet.email(),
          password,
          fullname:
            '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890', // more than 50 characters
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 if role is not valid', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await usersService.updateUserById(userInDb._id, userInDb.toObject());
      const password = faker.internet.password();
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .post('/users/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({
          email: faker.internet.email(),
          password,
          fullname: faker.person.fullName(),
          role: 'invalid-role',
        });

      expect(response.status).toBe(400);
    });

    it(`should return 403 if role is ${ROLE.ADMIN} created by another ${ROLE.ADMIN}`, async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await usersService.updateUserById(userInDb._id, userInDb.toObject());
      const password = faker.internet.password();
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .post('/users/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({
          email: faker.internet.email(),
          password,
          fullname: faker.person.fullName(),
          role: ROLE.ADMIN,
        });

      expect(response.status).toBe(403);
    });

    it(`should return 403 if role is ${ROLE.SUPERADMIN} created by another ${ROLE.SUPERADMIN}`, async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await usersService.updateUserById(userInDb._id, userInDb.toObject());
      const password = faker.internet.password();
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .post('/users/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({
          email: faker.internet.email(),
          password,
          fullname: faker.person.fullName(),
          role: ROLE.ADMIN,
        });

      expect(response.status).toBe(403);
    });

    it(`should return 403 if role is ${ROLE.SUPERADMIN} created by another ${ROLE.ADMIN}`, async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await usersService.updateUserById(userInDb._id, userInDb.toObject());
      const password = faker.internet.password();
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .post('/users/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({
          email: faker.internet.email(),
          password,
          fullname: faker.person.fullName(),
          role: ROLE.ADMIN,
        });

      expect(response.status).toBe(403);
    });

    it('should return 201 if user is created successfully', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await usersService.updateUserById(userInDb._id, userInDb.toObject());
      const password = faker.internet.password();
      const { accessToken } = await authService.registerUserSession(userInDb);
      const fullname = faker.person.fullName();
      const email = faker.internet.email();
      const response = await request(app.getHttpServer())
        .post('/users/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send({
          email,
          password,
          fullname,
          role: ROLE.USER,
        });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /:id', () => {
    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app.getHttpServer()).get(
        `/users/${user._id}`,
      );

      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not authorized with ADMIN role', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      const { accessToken } = await authService.registerUserSession(userInDb);

      const response = await request(app.getHttpServer())
        .get(`/users/${user._id}`)
        .set('Authorization', 'Bearer ' + accessToken);

      expect(response.status).toBe(403);
    });

    it(`should return 403 if ${ROLE.ADMIN} role try to get ${ROLE.SUPERADMIN} user`, async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await userInDb.save();
      const superAdmin = await usersService.createUser({
        email: faker.internet.email(),
        password: faker.internet.password(),
        fullname: faker.person.fullName(),
        role: ROLE.SUPERADMIN,
      });
      const { accessToken } = await authService.registerUserSession(userInDb);

      const response = await request(app.getHttpServer())
        .get(`/users/${superAdmin._id}`)
        .set('Authorization', 'Bearer ' + accessToken);

      expect(response.status).toBe(403);
    });

    it('should return 400 if user id is not valid', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await userInDb.save();
      const { accessToken } = await authService.registerUserSession(userInDb);

      const response = await request(app.getHttpServer())
        .get(`/users/${'123'}`)
        .set('Authorization', 'Bearer ' + accessToken);

      expect(response.status).toBe(400);
    });

    it('should return 404 if user is not found', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await userInDb.save();
      const { accessToken } = await authService.registerUserSession(userInDb);

      const response = await request(app.getHttpServer())
        .get(`/users/${new Types.ObjectId()}`)
        .set('Authorization', 'Bearer ' + accessToken);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 200 if user is found', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await userInDb.save();
      const { accessToken } = await authService.registerUserSession(userInDb);

      const response = await request(app.getHttpServer())
        .get(`/users/${userInDb._id}`)
        .set('Authorization', 'Bearer ' + accessToken);

      expect(response.status).toBe(200);
    });
  });

  describe('PATCH /:id', () => {
    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app.getHttpServer()).patch(
        `/users/${user._id}`,
      );

      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not authorized with ADMIN role', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .patch('/users/123')
        .set('Authorization', 'Bearer ' + accessToken);

      expect(response.status).toBe(403);
    });

    it('should return 400 if user id is not valid', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await userInDb.save();
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .patch('/users/123')
        .set('Authorization', 'Bearer ' + accessToken);

      expect(response.status).toBe(400);
    });

    it(`should return 403 if ${ROLE.ADMIN} try to update ${ROLE.SUPERADMIN}`, async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await userInDb.save();
      const superAdmin = await usersService.createUser({
        email: faker.internet.email(),
        password: faker.internet.password(),
        fullname: faker.person.fullName(),
        role: ROLE.SUPERADMIN,
      });
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .patch(`/users/${superAdmin._id}`)
        .set('Authorization', 'Bearer ' + accessToken);

      expect(response.status).toBe(403);
    });

    it(`should return 403 if ${ROLE.ADMIN} try to update another ${ROLE.ADMIN}`, async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await userInDb.save();
      const anotherAdmin = await usersService.createUser({
        email: faker.internet.email(),
        password: faker.internet.password(),
        fullname: faker.person.fullName(),
        role: ROLE.ADMIN,
      });
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .patch(`/users/${anotherAdmin._id}`)
        .set('Authorization', 'Bearer ' + accessToken);

      expect(response.status).toBe(403);
    });

    it(`should return 403 if ${ROLE.SUPERADMIN} try to update ${ROLE.SUPERADMIN} himself`, async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.SUPERADMIN;
      await userInDb.save();
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .patch(`/users/${userInDb._id}`)
        .set('Authorization', 'Bearer ' + accessToken);

      expect(response.status).toBe(403);
    });

    it('should return 404 if user is not found', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await userInDb.save();
      const { accessToken } = await authService.registerUserSession(userInDb);
      const updateDocument = new UpdateUserDto({
        bio: 'new bio',
      });
      const response = await request(app.getHttpServer())
        .patch(`/users/${new Types.ObjectId()}`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(updateDocument);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        i18n.translate('user.UPDATE_USER.USER_NOT_FOUND'),
      );
    });

    it(`should return 200 if ${ROLE.ADMIN} updated ${ROLE.ADMIN} himself successfully`, async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await userInDb.save();
      const { accessToken } = await authService.registerUserSession(userInDb);
      const updateDocument = new UpdateUserDto({
        bio: 'new bio',
      });
      const response = await request(app.getHttpServer())
        .patch(`/users/${userInDb._id}`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(updateDocument);

      expect(response.status).toBe(200);
    });

    it(`should return 200 if ${ROLE.SUPERADMIN} updated ${ROLE.ADMIN} successfully`, async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.SUPERADMIN;
      await userInDb.save();
      const anotherAdmin = await usersService.createUser({
        email: faker.internet.email(),
        password: faker.internet.password(),
        fullname: faker.person.fullName(),
        role: ROLE.ADMIN,
      });
      const { accessToken } = await authService.registerUserSession(userInDb);
      const updateDocument = new UpdateUserDto({
        bio: 'new bio',
      });
      const response = await request(app.getHttpServer())
        .patch(`/users/${anotherAdmin._id}`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(updateDocument);

      expect(response.status).toBe(200);
    });

    it(`should return 200 if ${ROLE.SUPERADMIN} updated ${ROLE.USER} successfully`, async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.SUPERADMIN;
      await userInDb.save();
      const anotherUser = await usersService.createUser({
        email: faker.internet.email(),
        password: faker.internet.password(),
        fullname: faker.person.fullName(),
        role: ROLE.USER,
      });
      const { accessToken } = await authService.registerUserSession(userInDb);
      const updateDocument = new UpdateUserDto({
        bio: 'new bio',
      });
      const response = await request(app.getHttpServer())
        .patch(`/users/${anotherUser._id}`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(updateDocument);

      expect(response.status).toBe(200);
    });

    it(`should return 200 if ${ROLE.ADMIN} updated ${ROLE.USER} successfully`, async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      userInDb.role = ROLE.ADMIN;
      await userInDb.save();
      const anotherUser = await usersService.createUser({
        email: faker.internet.email(),
        password: faker.internet.password(),
        fullname: faker.person.fullName(),
        role: ROLE.USER,
      });
      const updateDocument = new UpdateUserDto({
        bio: 'new bio',
      });
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .patch(`/users/${anotherUser._id}`)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(updateDocument);

      expect(response.status).toBe(200);
    });
  });
});
