import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';

import { AuthService } from '@/modules/auth/services/auth.service';
import { JoiValidationPipe } from '@/common/pipes/joi-validation.pipe';
import { PoliciesGuard } from '@/global/casl/policy.guard';
import { CheckPolicies } from '@/global/casl/Policy.decorator';

import { UsersService } from './../services/users.service';
import { CreateUserDto } from './../dtos/create-users.dto';
import { createUserSchema } from './../validations/create-user.validation';
import { PaginationQueryParam, PaginationResult } from '../users.type';
import { getUsersQuery } from '../validations/get-users.validation';
import { User } from '../schemas/user.schema';
import {
  ManageUsersPolicyHandler,
  ReadUserPolicyHandler,
} from '../users.policy';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UsePipes(new JoiValidationPipe(createUserSchema))
  async createUser(@Body() createUserDto: CreateUserDto): Promise<any> {
    const createdUser = await this.usersService.createUser(createUserDto);

    return this.authService.excludeUserPassword(createdUser);
  }

  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ManageUsersPolicyHandler())
  async getUsers(
    @Query(new JoiValidationPipe(getUsersQuery))
    query: PaginationQueryParam,
  ) {
    const totalUsers = await this.usersService.countUsers();
    const totalPages = Math.ceil(totalUsers / query.size);

    const defaultPagination: PaginationResult = {
      totalRecords: totalUsers,
      currentPage: query.page,
      totalPages: totalPages,
      nextPage: null,
      prevPage: null,
    };
    if (totalUsers === 0 || query.page > totalPages) {
      return {
        users: [],
        pagination: defaultPagination,
      };
    }

    const users = await this.usersService.getUsers(query, { lean: true });
    const pagination: PaginationResult = {
      totalRecords: totalUsers,
      currentPage: query.page,
      totalPages: totalPages,
      nextPage: query.page + 1 < totalPages ? query.page + 1 : null,
      prevPage: query.page - 1 !== 0 ? query.page - 1 : null,
    };
    return {
      users,
      pagination,
    };
  }
}
