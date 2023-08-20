import * as Joi from 'joi';

export const getUsersQuery = Joi.object({
  page: Joi.number().greater(0).default(1),
  size: Joi.number().greater(0).less(101).default(10),
});
