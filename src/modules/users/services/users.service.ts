import { BadRequestException, Injectable } from '@nestjs/common';
import { Types, isObjectIdOrHexString } from 'mongoose';

import { UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dtos/create-users.dto';
import { UserRepository } from '../repositories/user.repository';
import { PaginationQueryParam } from '../dtos/shared/Pagination';
import { ROLE } from '../users.constant';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  _transformObjectId(id: any) {
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
      throw new BadRequestException('Email already taken');
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

  async updateUser(
    userId: Types.ObjectId,
    updateUserDto: any,
  ): Promise<UserDocument> {
    return this.userRepository.updateOneById(userId, updateUserDto);
  }
}
