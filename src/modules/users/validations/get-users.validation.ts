import * as Joi from 'joi';

// TODO: Remove this getUsersBody
export const getUsersBody = Joi.object({});

export const getUsersQuery = Joi.object({
  page: Joi.number().greater(0).default(1),
  size: Joi.number().greater(0).less(101).default(10),
});
