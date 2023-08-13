import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dtos/create-users.dto';
import { UserRepository } from '../repositories/user.repository';
import { PaginationQueryParam } from '../dtos/shared/Pagination';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(userId: Types.ObjectId): Promise<UserDocument> {
    return this.userRepository.findById(userId);
  }

  async countUsers(): Promise<number> {
    return this.userRepository.countAll();
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
    // TODO: Admin can not get superadmin user
    const filter = {}; // Find all
    const projection = '-password';

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
