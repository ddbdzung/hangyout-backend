import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { PolicyHandler } from './policy-handler';
import {
  AppAbility,
  CaslAbilityFactory,
  RequestUser,
} from './casl-ability.factory';
import { CHECK_POLICIES_KEY } from './Policy.decorator';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const user = request.user as RequestUser;
    const ability = this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every(handler =>
      this.execPolicyHandler(handler, ability, request),
    );
  }

  private execPolicyHandler(
    handler: PolicyHandler,
    ability: AppAbility,
    request: Request,
  ) {
    if (typeof handler === 'function') {
      return handler(ability, request);
    }
    return handler.handle(ability, request);
  }
}
