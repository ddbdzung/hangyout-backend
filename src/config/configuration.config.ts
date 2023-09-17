import * as Joi from 'joi';

export const configuration = () => ({
  app: {
    env: process.env.NODE_ENV,
    port: parseInt(process.env.PORT, 10),
    host: process.env.HOST,
    protocol: process.env.PROTOCOL,
    baseUrl: `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}`,
  },
  database: {
    mongodb: process.env.MONGODB_URI,
  },
  jwt: {
    secretKey: {
      access: process.env.JWT_SECRET_ACCESS_KEY,
      refresh: process.env.JWT_SECRET_REFRESH_KEY,
      verifyEmail: process.env.JWT_SECRET_VERIFY_EMAIL_KEY,
    },
    expiresIn: {
      access: process.env.JWT_SECRET_ACCESS_LIFE,
      refresh: process.env.JWT_SECRET_REFRESH_LIFE,
      verifyEmail: process.env.JWT_SECRET_VERIFY_EMAIL_LIFE,
    },
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
    ttl: parseInt(process.env.REDIS_TTL_DEFAULT, 10),
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL_DEFAULT, 10),
    limit: parseInt(process.env.THROTTLE_LIMIT_DEFAULT, 10),
  },
  mailer: {
    transport: {
      host: process.env.MAIL_HOST || process.env.DEV_MAIL_HOST,
      port:
        parseInt(process.env.MAIL_PORT, 10) ||
        parseInt(process.env.DEV_MAIL_PORT, 10),
      secure: Boolean(process.env.MAIL_SECURE),
      auth: {
        user: process.env.MAIL_USER || process.env.DEV_MAIL_USER,
        pass: process.env.MAIL_PASS || process.env.DEV_MAIL_PASS,
      },
    },
    from: process.env.MAIL_FROM || process.env.DEV_MAIL_FROM,
    brand: process.env.MAIL_BRAND_NAME,
  },
  searchEngine: {
    elasticsearch: {
      node: process.env.ELASTICSEARCH_NODE,
      index: process.env.ELASTICSEARCH_INDEX,
    },
  },
});

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .trim()
    .valid('development', 'production', 'test')
    .required(),
  PORT: Joi.number().default(3000),
  HOST: Joi.string().trim().default('127.0.0.1'),
  PROTOCOL: Joi.string().trim().default('http'),
  BASE_URL: Joi.string().trim().default('http://127.0.0.1:3000'),
  MONGODB_URI: Joi.string().trim().required(),
  JWT_SECRET_ACCESS_KEY: Joi.string().trim().required(),
  JWT_SECRET_ACCESS_LIFE: Joi.string().trim().default('5m'),
  JWT_SECRET_REFRESH_KEY: Joi.string().trim().required(),
  JWT_SECRET_REFRESH_LIFE: Joi.string().trim().default('30d'),
  JWT_SECRET_VERIFY_EMAIL_KEY: Joi.string().trim().required(),
  JWT_SECRET_VERIFY_EMAIL_LIFE: Joi.string().trim().default('30m'),
  REDIS_HOST: Joi.string().trim().default('127.0.0.1'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_TTL_DEFAULT: Joi.number().min(1).default(5), // In seconds
  THROTTLE_TTL_DEFAULT: Joi.number().min(1).default(60), // In seconds
  THROTTLE_LIMIT_DEFAULT: Joi.number().min(1).default(10),
  MAIL_HOST: Joi.alternatives().conditional('NODE_ENV', {
    is: Joi.string().valid('production'),
    then: Joi.string().trim().default('smtp.gmail.com'),
    otherwise: Joi.any(),
  }),
  MAIL_PORT: Joi.alternatives().conditional('NODE_ENV', {
    is: Joi.string().valid('production'),
    then: Joi.number().valid(465).default(465),
    otherwise: Joi.any(),
  }),
  MAIL_SECURE: Joi.boolean().default(true),
  MAIL_USER: Joi.alternatives().conditional('NODE_ENV', {
    is: Joi.string().valid('production'),
    then: Joi.string().trim().required(),
    otherwise: Joi.any(),
  }),
  MAIL_PASS: Joi.alternatives().conditional('NODE_ENV', {
    is: Joi.string().valid('production'),
    then: Joi.string().trim().required(),
    otherwise: Joi.any(),
  }),
  MAIL_FROM: Joi.alternatives().conditional('NODE_ENV', {
    is: Joi.string().valid('production'),
    then: Joi.string().email().required(),
    otherwise: Joi.string().email(),
  }),
  MAIL_BRAND_NAME: Joi.string().trim().default('Test'),

  DEV_MAIL_HOST: Joi.alternatives().conditional('NODE_ENV', {
    is: Joi.string().valid('test', 'development'),
    then: Joi.string().default('smtp.ethereal.email'),
    otherwise: Joi.any(),
  }),
  DEV_MAIL_PORT: Joi.alternatives().conditional('NODE_ENV', {
    is: Joi.string().valid('test', 'development'),
    then: Joi.number().valid(465).default(465),
    otherwise: Joi.any(),
  }),
  DEV_MAIL_USER: Joi.alternatives().conditional('NODE_ENV', {
    is: Joi.string().valid('test', 'development'),
    then: Joi.string().trim().required(),
    otherwise: Joi.any(),
  }),
  DEV_MAIL_PASS: Joi.alternatives().conditional('NODE_ENV', {
    is: Joi.string().valid('test', 'development'),
    then: Joi.string().trim().required(),
    otherwise: Joi.any(),
  }),
  DEV_MAIL_FROM: Joi.alternatives().conditional('NODE_ENV', {
    is: Joi.string().valid('test', 'development'),
    then: Joi.string().email().required(),
    otherwise: Joi.string().email(),
  }),
  ELASTICSEARCH_NODE: Joi.string().trim().required(),
  ELASTICSEARCH_INDEX: Joi.string().trim().required(),
});
