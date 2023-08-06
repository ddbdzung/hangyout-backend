import * as Joi from 'joi';

export const localLoginBody = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8).max(24),
});
