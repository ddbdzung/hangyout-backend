import * as Joi from 'joi';

import { objectId } from './custom-user.validation';

export const deactivateUserParams = Joi.object({
  id: Joi.string().required().custom(objectId),
});
