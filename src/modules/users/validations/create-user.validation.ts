import * as Joi from 'joi';
import { ROLE } from '../users.constant';

// TODO: Rename to createUserBody
export const createUserSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8).max(24),
  fullname: Joi.string().required().min(1).max(50),
  role: Joi.string()
    .valid(...Object.values(ROLE))
    .default('user'),
});
