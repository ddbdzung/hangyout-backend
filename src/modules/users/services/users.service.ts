import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types, isObjectIdOrHexString } from 'mongoose';

import { I18nCustomService } from '@/global/i18n/i18n.service';

import { UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dtos/create-users.dto';
import { UserRepository } from '../repositories/user.repository';
import { PaginationQueryParam } from '../dtos/shared/Pagination';
import { ROLE } from '../users.constant';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly i18n: I18nCustomService,
  ) {}

  private _transformObjectId(id: any) {
    if (!isObjectIdOrHexString(id)) {
      throw new Error(
        'Must be a valid ObjectId or string of 24 hex characters',
      );
    }

    return new Types.ObjectId(id);
  }

  async getUserById(userId: Types.ObjectId | string): Promise<UserDocument> {
    const id = this._transformObjectId(userId);
    return this.userRepository.findById(id);
  }

  async countUsers(): Promise<number> {
    return this.userRepository.countAll({ role: { $ne: ROLE.SUPERADMIN } });
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.userRepository.findOneByEmail(email);
    return !!user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const isEmailTaken = await this.isEmailTaken(createUserDto.email);
    if (isEmailTaken) {
      console.log('here');
      throw new BadRequestException(
        this.i18n.translate('user.CREATE_USER.EMAIL_IS_TAKEN', {
          args: { email: createUserDto.email },
        }),
      );
    }

    return this.userRepository.create(createUserDto);
  }

  async getUsers(query: PaginationQueryParam, { lean = false }) {
    const { page, size } = query;

    const filter = { role: { $ne: ROLE.SUPERADMIN } };
    const projection = '_id fullname email role createdAt';

    return this.userRepository.findAllByCondition(filter, projection, {
      lean,
      skip: (page - 1) * size,
      limit: size,
    });
  }

  async getUserByEmail(email: string): Promise<UserDocument> {
    return this.userRepository.findOneByEmail(email);
  }

  private async _isEmailExist(email: string): Promise<boolean> {
    const user = await this.userRepository.findOneByCondition(
      { email },
      '_id',
      {
        lean: true,
      },
    );
    return !!user;
  }

  async updateUserById(
    userId: Types.ObjectId | string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const id = this._transformObjectId(userId);
    if (Object.keys(updateUserDto).length === 0) {
      throw new BadRequestException(
        this.i18n.translate('common.API.NO_DATA_TO_UPDATE'),
      );
    }

    const updatedUser = await this.userRepository.findByConditionAndUpdate(
      { _id: id },
      updateUserDto,
      {
        projection: '-password',
        new: true,
      },
    );
    if (!updatedUser) {
      throw new NotFoundException(
        this.i18n.translate('user.UPDATE_USER.USER_NOT_FOUND'),
      );
    }

    return updatedUser;
  }

  async deactivateUserById(userId: Types.ObjectId | string) {
    const id = this._transformObjectId(userId);
    const user = await this.userRepository.findOneByCondition({ _id: id });

    if (!user) {
      throw new NotFoundException(
        this.i18n.translate('user.DEACTIVATE_USER.USER_NOT_FOUND'),
      );
    }

    if (user.isDeactivated) {
      return {
        isModified: false,
        message: this.i18n.translate(
          'user.DEACTIVATE_USER.USER_ALREADY_DEACTIVATED',
        ),
      };
    }

    user.isDeactivated = true;
    await user.save();

    return {
      isModified: true,
      message: this.i18n.translate('user.DEACTIVATE_USER.SUCCESS'),
    };
  }
}
