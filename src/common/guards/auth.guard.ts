import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from '@/common/decorators/Public.decorator';
import { UserRepository } from '@/modules/users/repositories/user.repository';
import { LoggerService } from '@/global/logger/logger.service';
import { Tag } from '@/global/logger/logger.constant';

import { IS_NON_VERIFIED_USER_KEY } from '../decorators/Is-verified-user.decorator';
import { IS_INACTIVE_USER_KEY } from '../decorators/Active-user.decorator';

// TODO: Write guards to use decorator checking in controller scopes
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
    private usersRepositoy: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const allowBothVerifiedAndNonVerifiedUser =
      this.reflector.getAllAndOverride<boolean>(IS_NON_VERIFIED_USER_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    const allowBothInactiveAndActiveUser =
      this.reflector.getAllAndOverride<boolean>(IS_INACTIVE_USER_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this._extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt.secretKey.access'),
      });

      const user = await this.usersRepositoy.findOneByCondition(
        { _id: new Types.ObjectId(payload.sub) },
        '_id email fullname role isVerified isDeactivated',
      );

      LoggerService.log(Tag.INFO, 'UserSessionInfo', user);
      // TODO: Change policy to check if user is verified
      // NOTE: Only apply for specific routes - controller scopes
      // NOTE: Write decorator to check if user is verified
      if (!user) {
        throw new UnauthorizedException();
      }
      console.log(
        'allowBothVerifiedAndNonVerifiedUser',
        allowBothVerifiedAndNonVerifiedUser,
      );
      console.log(
        'allowBothInactiveAndActiveUser',
        allowBothInactiveAndActiveUser,
      );

      if (!user.isVerified && !allowBothVerifiedAndNonVerifiedUser) {
        throw new UnauthorizedException();
      }

      if (user.isDeactivated && !allowBothInactiveAndActiveUser) {
        throw new UnauthorizedException();
      }

      request['user'] = user;
    } catch (error) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private _extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
