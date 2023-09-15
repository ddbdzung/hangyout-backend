import * as Joi from 'joi';

import { GENDER } from '../users.constant';
import { validPhoneNumber } from './custom-user.validation';

export const updatePersonalInfo = Joi.object({
  fullname: Joi.string().min(1).max(50),
  email: Joi.string().email().max(50),
  avatar: Joi.string().uri().max(256),
  bio: Joi.string().max(256),
  phoneNumber: Joi.object({
    value: Joi.string().min(1).max(20).custom(validPhoneNumber),
    isHidden: Joi.boolean(),
  }),
  gender: Joi.object({
    value: Joi.string().valid(GENDER.MALE, GENDER.FEMALE, GENDER.OTHER),
    isHidden: Joi.boolean(),
  }),
}).min(1);
