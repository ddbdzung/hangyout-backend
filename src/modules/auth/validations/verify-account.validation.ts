import * as Joi from 'joi';

export const verifyAccountQuery = Joi.object({
  token: Joi.string().trim().required(),
});
