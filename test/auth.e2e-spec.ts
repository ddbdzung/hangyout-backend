import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';

import { SALT_ROUNDS } from '@/modules/users/users.constant';
import { TOKEN_TYPE } from '@/modules/auth/auth.constant';
import { LocalLoginDto } from '@/modules/auth/dtos/login.dto';
import { ROLE } from '@/modules/users/users.constant';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import {
  IRefreshTokenPayload,
  IVerifyEmailTokenPayload,
} from '@/modules/auth/auth.interface';

import { LocalRegisterDto } from './../src/modules/auth/dtos/register.dto';
import { AppModule } from './../src/app.module';
import { MongoDBService } from './services/mongo.service';
import { UsersService } from '@/modules/users/services/users.service';
import { AuthService } from '@/modules/auth/services/auth.service';

describe('AuthController /auth (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let mongodb: MongoDBService;
  let user;
  let i18n;
  let password;
  let jwt;
  let usersService: UsersService;
  let authService: AuthService;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule, UsersModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    password = faker.internet.password();
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
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
    await app.init();

    mongodb = new MongoDBService();
    usersService = app.get<UsersService>(UsersService);
    authService = app.get<AuthService>(AuthService);
    i18n = moduleFixture.get<I18nService>(I18nService);
    jwt = moduleFixture.get<JwtService>(JwtService);
    await mongodb.createIndex('users', { email: 1 }, { unique: true });
    await mongodb.createIndex('tokens', { user: 1, type: 1 });
    await mongodb.createIndex('tokens', { token: 1 });
  });

  beforeEach(async () => {
    await mongodb.insertMany('users', [user]);
  });

  afterEach(async () => {
    await mongodb.deleteMany('users', {});
    await mongodb.deleteMany('tokens', {});
  });

  afterAll(async () => {
    await mongodb.dropDatabase();
    await mongodb.close();
    await app.close();
  });

  describe('/register/local (POST)', () => {
    it('should return 400 when no data is sent', async () => {
      const response = await request(app.getHttpServer()).post(
        '/auth/register/local',
      );

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 when email is already taken', async () => {
      const localRegisterDto: LocalRegisterDto = {
        email: user.email,
        fullname: faker.person.fullName(),
        password: faker.internet.password(),
      };
      const viResponse = await request(app.getHttpServer())
        .post('/auth/register/local')
        .set('Accept', 'application/json')
        .set('x-custom-lang', 'vi')
        .send(localRegisterDto);

      expect(viResponse.statusCode).toBe(400);
      expect(viResponse.body.message).toBe(
        i18n.translate('auth.REGISTER_LOCAL.EMAIL_IS_TAKEN', { lang: 'vi' }),
      );

      const enResponse = await request(app.getHttpServer())
        .post('/auth/register/local')
        .set('Accept', 'application/json')
        .set('x-custom-lang', 'en')
        .send(localRegisterDto);

      expect(enResponse.statusCode).toBe(400);
      expect(enResponse.body.message).toBe(
        i18n.translate('auth.REGISTER_LOCAL.EMAIL_IS_TAKEN', { lang: 'en' }),
      );
    });

    it('should return 201 when register successfully', async () => {
      const localRegisterDto: LocalRegisterDto = {
        email: faker.internet.email(),
        fullname: faker.person.fullName(),
        password: faker.internet.password(),
      };
      const response = await request(app.getHttpServer())
        .post('/auth/register/local')
        .set('Accept', 'application/json')
        .send(localRegisterDto);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
    });
  });

  describe('/login/local (POST)', () => {
    it('should return 400 when no data is sent', async () => {
      const response = await request(app.getHttpServer()).post(
        '/auth/login/local',
      );

      expect(response.statusCode).toBe(400);
    });

    it('should return 401 when user email is not found', async () => {
      const localLoginDto: LocalLoginDto = {
        email: faker.internet.email(),
        password,
      };
      const viResponse = await request(app.getHttpServer())
        .post('/auth/login/local')
        .set('Accept', 'application/json')
        .set('x-custom-lang', 'vi')
        .send(localLoginDto);

      expect(viResponse.statusCode).toBe(401);
      expect(viResponse.body.message).toBe(
        i18n.translate('auth.LOGIN_LOCAL.LOGIN_FAILED', { lang: 'vi' }),
      );

      const enResponse = await request(app.getHttpServer())
        .post('/auth/login/local')
        .set('Accept', 'application/json')
        .set('x-custom-lang', 'en')
        .send(localLoginDto);

      expect(enResponse.statusCode).toBe(401);
      expect(enResponse.body.message).toBe(
        i18n.translate('auth.LOGIN_LOCAL.LOGIN_FAILED', { lang: 'en' }),
      );
    });

    it('should return 401 when password is not correct', async () => {
      const localLoginDto: LocalLoginDto = {
        email: user.email,
        password: 'fake password',
      };
      const viResponse = await request(app.getHttpServer())
        .post('/auth/login/local')
        .set('Accept', 'application/json')
        .set('x-custom-lang', 'vi')
        .send(localLoginDto);

      expect(viResponse.statusCode).toBe(401);
      expect(viResponse.body.message).toBe(
        i18n.translate('auth.LOGIN_LOCAL.LOGIN_FAILED', { lang: 'vi' }),
      );

      const enResponse = await request(app.getHttpServer())
        .post('/auth/login/local')
        .set('Accept', 'application/json')
        .set('x-custom-lang', 'en')
        .send(localLoginDto);

      expect(enResponse.statusCode).toBe(401);
      expect(enResponse.body.message).toBe(
        i18n.translate('auth.LOGIN_LOCAL.LOGIN_FAILED', { lang: 'en' }),
      );
    });

    it('should return 200 when login successfully', async () => {
      const localLoginDto: LocalLoginDto = {
        email: user.email,
        password: password,
      };
      const response = await request(app.getHttpServer())
        .post('/auth/login/local')
        .set('Accept', 'application/json')
        .send(localLoginDto);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
    });
  });

  describe('/verify-account (GET)', () => {
    it('should return 400 when no token is sent', async () => {
      const response = await request(app.getHttpServer()).get(
        '/auth/verify-account',
      );

      expect(response.statusCode).toBe(400);
    });
    it('should return 400 when decoded token type is not VERIFY_EMAIL', async () => {
      const payload = {
        email: user.email,
        sub: user._id,
        type: TOKEN_TYPE.RESET_PASSWORD,
      };
      const token = await jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET_VERIFY_EMAIL_KEY,
        expiresIn: process.env.JWT_SECRET_VERIFY_EMAIL_LIFE,
      });
      const response = await request(app.getHttpServer()).get(
        `/auth/verify-account?token=${token}`,
      );

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        i18n.translate('auth.TOKEN.INVALID_TOKEN', { lang: 'en' }),
      );
    });
    it('should return 400 when decoded token sub is not valid ObjectId', async () => {
      const payload = {
        email: user.email,
        sub: 'not a objectid',
        type: TOKEN_TYPE.VERIFY_EMAIL,
      };
      const token = await jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET_VERIFY_EMAIL_KEY,
        expiresIn: process.env.JWT_SECRET_VERIFY_EMAIL_LIFE,
      });
      const response = await request(app.getHttpServer()).get(
        `/auth/verify-account?token=${token}`,
      );

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        i18n.translate('auth.TOKEN.INVALID_TOKEN', { lang: 'en' }),
      );
    });
    it('should return 400 when decoded token sub as userId not exist in DB', async () => {
      const payload = {
        email: user.email,
        sub: new ObjectId().toString(),
        type: TOKEN_TYPE.VERIFY_EMAIL,
      };
      const token = await jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET_VERIFY_EMAIL_KEY,
        expiresIn: process.env.JWT_SECRET_VERIFY_EMAIL_LIFE,
      });
      const response = await request(app.getHttpServer()).get(
        `/auth/verify-account?token=${token}`,
      );

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        i18n.translate('auth.TOKEN.INVALID_TOKEN', { lang: 'en' }),
      );
    });
    it('should return 400 when decoded token value not exist in DB', async () => {
      const payload = {
        email: user.email,
        sub: user._id,
        type: TOKEN_TYPE.VERIFY_EMAIL,
      };
      const token = await jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET_VERIFY_EMAIL_KEY,
        expiresIn: process.env.JWT_SECRET_VERIFY_EMAIL_LIFE,
      });
      const response = await request(app.getHttpServer()).get(
        `/auth/verify-account?token=${token}`,
      );

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        i18n.translate('auth.TOKEN.INVALID_TOKEN', { lang: 'en' }),
      );
    });
    it('should return 200 when successfully verify email user account', async () => {
      const payload = {
        email: user.email,
        sub: user._id,
        type: TOKEN_TYPE.VERIFY_EMAIL,
      };
      const token = await jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET_VERIFY_EMAIL_KEY,
        expiresIn: process.env.JWT_SECRET_VERIFY_EMAIL_LIFE,
      });
      const decodedToken: IVerifyEmailTokenPayload = jwt.decode(token);
      const tokenDoc = {
        token,
        type: TOKEN_TYPE.VERIFY_EMAIL,
        user: user._id,
        expiresAt: Number(decodedToken.exp) * 1000,
      };
      await mongodb.insertMany('tokens', [tokenDoc]);

      const response = await request(app.getHttpServer()).get(
        `/auth/verify-account?token=${token}`,
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('OK');
    });
  });

  describe('/refresh-token (POST)', () => {
    it('should return 400 when decoded token type is not REFRESH_TOKEN', async () => {
      const payload = {
        email: user.email,
        sub: user._id,
        type: TOKEN_TYPE.RESET_PASSWORD,
      };
      const token = await jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET_REFRESH_KEY,
        expiresIn: process.env.JWT_SECRET_REFRESH_LIFE,
      });
      const response = await request(app.getHttpServer())
        .post(`/auth/refresh-token`)
        .send({ refreshToken: token });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        i18n.translate('auth.TOKEN.INVALID_TOKEN', { lang: 'en' }),
      );
    });
    it('should return 400 when decoded token sub is not valid ObjectId', async () => {
      const payload = {
        email: user.email,
        sub: 'not a objectid',
        type: TOKEN_TYPE.VERIFY_EMAIL,
      };
      const token = await jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET_REFRESH_KEY,
        expiresIn: process.env.JWT_SECRET_REFRESH_LIFE,
      });
      const response = await request(app.getHttpServer())
        .post(`/auth/refresh-token`)
        .send({ refreshToken: token });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        i18n.translate('auth.TOKEN.INVALID_TOKEN', { lang: 'en' }),
      );
    });
    it('should return 400 when decoded token sub as userId not exist in DB', async () => {
      const payload = {
        email: user.email,
        sub: new ObjectId().toString(),
        type: TOKEN_TYPE.VERIFY_EMAIL,
      };
      const token = await jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET_REFRESH_KEY,
        expiresIn: process.env.JWT_SECRET_REFRESH_LIFE,
      });
      const response = await request(app.getHttpServer())
        .post(`/auth/refresh-token`)
        .send({ refreshToken: token });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        i18n.translate('auth.TOKEN.INVALID_TOKEN', { lang: 'en' }),
      );
    });
    it('should return 400 when decoded token value not exist in DB', async () => {
      const payload = {
        email: user.email,
        sub: user._id,
        type: TOKEN_TYPE.VERIFY_EMAIL,
      };
      const token = await jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET_REFRESH_KEY,
        expiresIn: process.env.JWT_SECRET_REFRESH_LIFE,
      });
      const response = await request(app.getHttpServer())
        .post(`/auth/refresh-token`)
        .send({ refreshToken: token });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        i18n.translate('auth.TOKEN.INVALID_TOKEN', { lang: 'en' }),
      );
    });
    it('should return 200 when successfully refresh token', async () => {
      const payload = {
        email: user.email,
        sub: user._id,
        type: TOKEN_TYPE.REFRESH,
      };
      const token = await jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET_REFRESH_KEY,
        expiresIn: process.env.JWT_SECRET_REFRESH_LIFE,
      });
      const decodedToken: IRefreshTokenPayload = jwt.decode(token);
      const tokenDoc = {
        token,
        type: TOKEN_TYPE.REFRESH,
        user: user._id,
        expiresAt: Number(decodedToken.exp) * 1000,
      };
      await mongodb.insertMany('tokens', [tokenDoc]);

      const response = await request(app.getHttpServer())
        .post(`/auth/refresh-token`)
        .send({ refreshToken: token });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });
  });

  describe('/me (GET)', () => {
    it('should return 401 when user is not authenticated', async () => {
      const response = await request(app.getHttpServer()).get('/auth/me');

      expect(response.status).toBe(401);
    });
    it('should return 200 when user is authenticated', async () => {
      const userInDb = await usersService.getUserByEmail(user.email);
      const { accessToken } = await authService.registerUserSession(userInDb);
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
    });
  });
});
