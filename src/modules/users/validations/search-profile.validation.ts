import * as Joi from 'joi';

export const searchProfileQuery = Joi.object({
  q: Joi.string().required().min(1).max(256),
});
