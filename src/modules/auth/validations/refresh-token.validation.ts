import * as Joi from 'joi';

export const refreshTokenBody = Joi.object({
  refreshToken: Joi.string().required(),
});
