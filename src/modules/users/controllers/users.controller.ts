import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from '@/modules/auth/services/auth.service';
import { JoiValidationPipe } from '@/common/pipes/joi-validation.pipe';
import { PoliciesGuard } from '@/global/casl/policy.guard';
import { CheckPolicies } from '@/global/casl/Policy.decorator';
import { PreparePolicy } from '@/global/casl/policy-util.guard';
import {
  BadRequestResponseDto,
  ForbiddenResponseDto,
  NotFoundResponseDto,
  UnauthorizedResponseDto,
} from '@/common/dto.common';
import { I18nCustomService } from '@/global/i18n/i18n.service';

import { UsersService } from './../services/users.service';
import { CreateUserDto } from './../dtos/create-users.dto';
import { createUserBody } from './../validations/create-user.validation';
import { getUsersQuery } from '../validations/get-users.validation';
import {
  CreateUserPolicyHandler,
  DeactivateUserPolicyHandler,
  ReadUserPolicyHandler,
  ReadUsersPolicyHandler,
  UpdateUserPolicyHandler,
} from '../users.policy';
import {
  PaginationQueryParam,
  PaginationResult,
} from '../dtos/shared/Pagination';
import { GetUsersResponseDto } from '../dtos/get-users.dto';
import { GetUserParamsDto, GetUserResponseDto } from '../dtos/get-user.dto';
import { getUserParams } from '../validations/get-user.validation';
import {
  updateUserBody,
  updateUserParams,
} from '../validations/update-user.validation';
import {
  UpdateUserDto,
  UpdateUserParamsDto,
  UpdateUserResponseDto,
} from '../dtos/update-user.dto';
import {
  DeactivateUserParamsDto,
  DeactivateUserResponseDto,
} from '../dtos/deactivate-user.dto';
import { deactivateUserParams } from '../validations/deactivate-user.validation';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly i18n: I18nCustomService,
  ) {}

  @ApiOperation({
    summary: 'Create user',
    description: 'Create user - Only admin can access this resource',
  })
  @ApiBearerAuth()
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
  @Post()
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new CreateUserPolicyHandler())
  async createUser(
    @Body(new JoiValidationPipe(createUserBody)) createUserDto: CreateUserDto,
  ) {
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
    type: GetUsersResponseDto,
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
  @CheckPolicies(new ReadUsersPolicyHandler())
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

  @ApiOperation({
    summary: 'Get a user',
    description: 'Get a user - Only admin can access this resource',
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid access token',
    type: UnauthorizedResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden resource - Only admin can access this resource',
    type: ForbiddenResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - Invalid id',
    type: BadRequestResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundResponseDto,
  })
  @ApiOkResponse({
    description: 'Get user successfully',
    type: GetUserResponseDto,
  })
  @Get('/:id')
  @UseGuards(PreparePolicy, PoliciesGuard)
  @CheckPolicies(new ReadUserPolicyHandler())
  async getUser(
    @Param(new JoiValidationPipe(getUserParams))
    getUserParamsDto: GetUserParamsDto,
  ) {
    const user = await this.usersService.getUserById(getUserParamsDto.id);
    if (!user) {
      throw new NotFoundException(
        this.i18n.translate('user.GET_DETAIL_INFO_USER.USER_NOT_FOUND'),
      );
    }

    return { user: this.authService.excludeUserPassword(user) };
  }

  @ApiOperation({
    summary: 'Update a user',
    description: 'Update a user - Only admin can access this resource',
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid access token',
    type: UnauthorizedResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden resource - Only admin can access this resource',
    type: ForbiddenResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - Invalid id',
    type: BadRequestResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundResponseDto,
  })
  @ApiOkResponse({
    description: 'Update user successfully',
    type: UpdateUserResponseDto,
  })
  @Patch('/:id')
  @UseGuards(PreparePolicy, PoliciesGuard)
  @CheckPolicies(new UpdateUserPolicyHandler())
  async updateUser(
    @Param(new JoiValidationPipe(updateUserParams))
    updateUserParamsDto: UpdateUserParamsDto,
    @Body(new JoiValidationPipe(updateUserBody)) updateUserDto: UpdateUserDto,
  ) {
    return {
      user: await this.usersService.updateUserById(
        updateUserParamsDto.id,
        updateUserDto,
      ),
    };
  }

  // TODO: Write custom decorator to check if user is deactivated or not
  // NOTE: Only apply for specific routes - controller scopes
  @ApiOperation({
    summary: 'Deactivate a user',
    description: 'Deactivate a user - Only admin can access this resource',
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid access token',
    type: UnauthorizedResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Forbidden resource - Only admin can access this resource',
    type: ForbiddenResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - Invalid id',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: NotFoundResponseDto,
  })
  @ApiOkResponse({
    description: 'Deactivate user successfully',
    type: DeactivateUserResponseDto,
  })
  @Patch('/:id/deactivate')
  @UseGuards(PreparePolicy, PoliciesGuard)
  @CheckPolicies(new DeactivateUserPolicyHandler())
  async deactivateUser(
    @Param(new JoiValidationPipe(deactivateUserParams))
    deactivateUserParamsDto: DeactivateUserParamsDto,
  ) {
    return this.usersService.deactivateUserById(deactivateUserParamsDto.id);
  }
}
