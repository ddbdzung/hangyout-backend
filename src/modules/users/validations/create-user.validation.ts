import * as Joi from 'joi';

export const createUserSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8).max(24),
  fullname: Joi.string().required().min(1).max(50),
});
