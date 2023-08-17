import { Request } from 'express';

import { Action, RequestAttachment } from '@/global/casl/casl.constant';
import { IPolicyHandler } from '@/global/casl/policy-handler';
import { AppAbility, RequestUser } from '@/global/casl/casl-ability.factory';

import { HydratedUserDocument } from './schemas/user.schema';
import { AuthService } from '../auth/services/auth.service';
import { CreateUserDto } from './dtos/create-users.dto';

class PolicyHandlerUtil {
  static getUserParam(request: Request) {
    return request[RequestAttachment.PolicyParamUser];
  }

  static mapRequestUserToUserDocument(requestUser: RequestUser) {
    return new HydratedUserDocument({
      _id: requestUser._id,
      fullname: requestUser.fullname,
      email: requestUser.email,
      role: requestUser.role,
    });
  }

  static mapToUserDocument(obj: any) {
    return new HydratedUserDocument({
      _id: obj?._id,
      fullname: obj?.fullname,
      email: obj?.email,
      role: obj?.role,
    });
  }
}

export class ReadUsersPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility, request: Request) {
    const requestUser = AuthService.getAuthenticatedRequestUser(request);
    const user = PolicyHandlerUtil.mapRequestUserToUserDocument(requestUser);
    return ability.can(Action.Read, user);
  }
}

export class ReadUserPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility, request: Request) {
    const userFromParam = PolicyHandlerUtil.getUserParam(request);
    const user = PolicyHandlerUtil.mapToUserDocument(userFromParam);
    return ability.can(Action.Read, user);
  }
}

export class CreateUserPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility, request: Request) {
    const requestBody: CreateUserDto = request.body;
    const newUser = PolicyHandlerUtil.mapToUserDocument(requestBody);
    return ability.can(Action.Create, newUser);
  }
}
