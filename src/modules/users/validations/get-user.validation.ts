import * as Joi from 'joi';

import { objectId } from './custom-user.validation';

export const getUserParams = Joi.object({
  id: Joi.string().required().custom(objectId),
});
