import * as Joi from 'joi';

import { objectId } from './custom-user.validation';

// TODO: Rename to getUserParams
export const GetUserSChema = Joi.object({
  id: Joi.string().required().custom(objectId),
});
