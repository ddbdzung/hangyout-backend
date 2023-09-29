import { Types, isObjectIdOrHexString } from 'mongoose';

export abstract class ApiService {
  protected _transformObjectId(id: any) {
    if (!isObjectIdOrHexString(id)) {
      throw new Error(
        'Must be a valid ObjectId or string of 24 hex characters',
      );
    }

    return new Types.ObjectId(id);
  }
}
