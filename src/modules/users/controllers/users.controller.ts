import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from '@/modules/auth/services/auth.service';
import { JoiValidationPipe } from '@/common/pipes/joi-validation.pipe';
import { PoliciesGuard } from '@/global/casl/policy.guard';
import { CheckPolicies } from '@/global/casl/Policy.decorator';
import {
  BadRequestResponseDto,
  ForbiddenResponseDto,
  UnauthorizedResponseDto,
} from '@/common/dto.common';

import { UsersService } from './../services/users.service';
import { CreateUserDto } from './../dtos/create-users.dto';
import { createUserSchema } from './../validations/create-user.validation';
import { getUsersQuery } from '../validations/get-users.validation';
import { ManageUsersPolicyHandler } from '../users.policy';
import {
  PaginationQueryParam,
  PaginationResult,
} from '../dtos/shared/Pagination';
import { GetUserResponseDto } from '../dtos/get-users.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  // TODO: Refactor this endpoint
  @Post()
  @UsePipes(new JoiValidationPipe(createUserSchema))
  async createUser(@Body() createUserDto: CreateUserDto): Promise<any> {
    const createdUser = await this.usersService.createUser(createUserDto);

    return this.authService.excludeUserPassword(createdUser);
  }

  @ApiOperation({
    summary: 'Get users',
    description: 'Get users - Only admin can access this resource',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Get users successfully',
    type: GetUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - Invalid query params',
    type: BadRequestResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid access token',
    type: UnauthorizedResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden resource - Only admin can access this resource',
    type: ForbiddenResponseDto,
  })
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
