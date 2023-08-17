import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Types, isObjectIdOrHexString } from 'mongoose';

import { UserRepository } from '@/modules/users/repositories/user.repository';

import { LoggerService } from '../logger/logger.service';
import { Tag } from '../logger/logger.constant';
import { RequestAttachment } from './casl.constant';

@Injectable()
export class PreparePolicy implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
    private userRepository: UserRepository,
  ) {}

  _transformId(id: string) {
    if (!id) return null;

    if (!isObjectIdOrHexString(id)) {
      return null;
    }

    return new Types.ObjectId(id);
  }

  async canActivate(context: ExecutionContext): Promise<true> {
    const request = context.switchToHttp().getRequest();
    const isUserRoute = request.url.includes('/users');

    try {
      if (isUserRoute) {
        const id = this._transformId(request.params.id);
        if (!id) return true;

        const user = (await this.userRepository.findById(id)) ?? {};
        request[RequestAttachment.PolicyParamUser] = user;
      }
    } catch (error) {
      LoggerService.log(Tag.WARN, 'PreparePolicy', error.message);
      return true;
    } finally {
      return true;
    }
  }
}
