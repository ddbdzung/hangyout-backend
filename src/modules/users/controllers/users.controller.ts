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
  UsePipes,
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

import { UsersService } from './../services/users.service';
import { CreateUserDto } from './../dtos/create-users.dto';
import { createUserSchema } from './../validations/create-user.validation';
import { getUsersQuery } from '../validations/get-users.validation';
import {
  CreateUserPolicyHandler,
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
import { GetUserSChema } from '../validations/get-user.validation';
// TODO: Rearrange imports
import { I18nCustomService } from '@/global/i18n/i18n.service';
import {
  updateUserBody,
  updateUserParams,
} from '../validations/update-user.validation';
import {
  UpdateUserDto,
  UpdateUserParamsDto,
  UpdateUserResponseDto,
} from '../dtos/update-user.dto';

@ApiTags('users')
// TODO: Remove usePipes(), only use JoiValidationPipe inside DTO (@Body(), @Param(), @Query())
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
  @UsePipes(new JoiValidationPipe(createUserSchema))
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new CreateUserPolicyHandler())
  async createUser(@Body() createUserDto: CreateUserDto) {
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
    @Param(new JoiValidationPipe(GetUserSChema))
    getUserParamsDto: GetUserParamsDto,
  ) {
    const user = await this.usersService.getUserById(getUserParamsDto.id);
    if (!user) {
      throw new NotFoundException(
        this.i18n.translate('user.GET_DETAIL_INFO_USER.USER_NOT_FOUND'),
      );
    }

    // TODO: Add excludeUserPassword()
    // return { user: this.authService.excludeUserPassword(user) };
    return { user };
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
}
