import { Request } from 'express';

import { Action } from '@/global/casl/casl.constant';
import { IPolicyHandler } from '@/global/casl/policy-handler';
import { AppAbility, RequestUser } from '@/global/casl/casl-ability.factory';

import { HydratedUserDocument } from './schemas/user.schema';
import { AuthService } from '../auth/services/auth.service';

/**
 * @description Policy handler for full access to users
 */
export class ManageUsersPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Manage, HydratedUserDocument);
  }
}
/**
 * @description Policy handler for read a user by request['user']._id
 */
export class ReadUserPolicyHandler implements IPolicyHandler {
  _mapRequestUserToUserDocument(
    requestUser: RequestUser,
  ): HydratedUserDocument {
    return new HydratedUserDocument({
      _id: requestUser._id,
      role: requestUser.role,
      email: requestUser.email,
      fullname: requestUser.fullname,
    });
  }
  handle(ability: AppAbility, request: Request) {
    const requestUser = AuthService.getAuthenticatedRequestUser(request);

    const user = this._mapRequestUserToUserDocument(requestUser);
    return ability.can(Action.Read, user);
  }
}
