import * as Joi from 'joi';

import { GENDER, ROLE } from '../users.constant';
import { objectId, validPhoneNumber } from './custom-user.validation';

export const updateUserBody = Joi.object({
  fullname: Joi.string().min(1).max(50),
  password: Joi.string().min(1).max(256),
  role: Joi.string().valid(ROLE.ADMIN, ROLE.USER),
  avatar: Joi.string().uri().max(256),
  bio: Joi.string().max(256),
  isVerified: Joi.boolean(),
  phoneNumber: Joi.object({
    value: Joi.string().min(1).max(20).custom(validPhoneNumber),
    isHidden: Joi.boolean(),
  }),
  gender: Joi.object({
    value: Joi.string().valid(GENDER.MALE, GENDER.FEMALE, GENDER.OTHER),
    isHidden: Joi.boolean(),
  }),
});

export const updateUserParams = Joi.object({
  id: Joi.string().required().custom(objectId),
});
