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
import { I18nCustomService } from '@/global/i18n/i18n.service';

import { IS_NON_VERIFIED_USER_KEY } from '../decorators/Is-verified-user.decorator';
import { IS_INACTIVE_USER_KEY } from '../decorators/Active-user.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
    private usersRepositoy: UserRepository,
    private i18n: I18nCustomService,
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
      throw new UnauthorizedException(
        this.i18n.translate('auth.TOKEN.MISSING_TOKEN'),
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt.secretKey.access'),
      });

      const user = await this.usersRepositoy.findOneByCondition(
        { _id: new Types.ObjectId(payload.sub) },
        '_id email fullname role isVerified isDeactivated',
      );

      if (user.email !== payload.email) {
        throw new UnauthorizedException(
          this.i18n.translate('auth.UNAUTHORIZED.ACCOUNT_EMAIL_CHANGED'),
        );
      }

      LoggerService.log(Tag.INFO, 'UserSessionInfo', user);
      if (!user) {
        throw new UnauthorizedException(
          this.i18n.translate('auth.UNAUTHORIZED.ACCOUNT_NOT_EXIST'),
        );
      }

      if (!user.isVerified && !allowBothVerifiedAndNonVerifiedUser) {
        throw new UnauthorizedException(
          this.i18n.translate('auth.UNAUTHORIZED.ACCOUNT_NOT_VERIFIED'),
        );
      }

      if (user.isDeactivated && !allowBothInactiveAndActiveUser) {
        throw new UnauthorizedException(
          this.i18n.translate('auth.UNAUTHORIZED.ACCOUNT_DEACTIVATED'),
        );
      }

      request['user'] = user;
    } catch (error) {
      LoggerService.log(Tag.DEBUG, 'AuthGuard', error.message);
      throw new UnauthorizedException(error?.response);
    }
    return true;
  }

  private _extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
