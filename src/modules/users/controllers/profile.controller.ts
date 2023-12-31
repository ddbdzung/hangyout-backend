import { Request } from 'express';
import { Body, Controller, Get, Patch, Query, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from '@/modules/auth/services/auth.service';
import { JoiValidationPipe } from '@/common/pipes/joi-validation.pipe';
import { I18nCustomService } from '@/global/i18n/i18n.service';
import {
  BadRequestResponseDto,
  UnauthorizedResponseDto,
} from '@/common/dto.common';

import { UsersService } from './../services/users.service';
import { ProfileService } from '../services/profile.service';
import { updatePersonalInfo } from '../validations/update-personal-info.validation';
import {
  UpdatePersonalInfoDto,
  UpdatePersonalInfoResponseDto,
} from '../dtos/update-personal-info.dto';
import { searchProfileQuery } from '../validations/search-profile.validation';
import {
  SearchProfileQueryParam,
  SearchProfileResponseDto,
} from '../dtos/search-profile.dto';

@ApiTags('profile')
@Controller('p')
export class ProfileController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly profileService: ProfileService,
    private readonly i18n: I18nCustomService,
  ) {}

  @ApiOperation({
    summary: 'Update personal information',
    description:
      'Update personal information - Authenticated account can access this resource',
  })
  @ApiBearerAuth()
  @ApiBadRequestResponse({
    description: 'Bad request - Invalid request body',
    type: BadRequestResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid access token',
    type: UnauthorizedResponseDto,
  })
  @ApiOkResponse({
    description: 'OK - Update personal information successfully',
    type: UpdatePersonalInfoResponseDto,
  })
  @Patch()
  async updatePersonalInformation(
    @Req() request: Request,
    @Body(new JoiValidationPipe(updatePersonalInfo))
    updatePersonalInformationDto: UpdatePersonalInfoDto,
  ) {
    const requestUser = AuthService.getAuthenticatedRequestUser(request);
    const user = await this.profileService.updatePersonalInfo(
      requestUser,
      updatePersonalInformationDto,
    );
    await this.profileService.syncUserToElasticsearch(user);

    return user;
  }

  @ApiOperation({
    summary: 'Search profile',
    description: 'Search profile',
  })
  @ApiOkResponse({
    description: 'OK - Search profile successfully',
    type: SearchProfileResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - Invalid request query',
    type: BadRequestResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid access token',
    type: UnauthorizedResponseDto,
  })
  @Get('/search')
  async searchProfile(
    @Query(new JoiValidationPipe(searchProfileQuery))
    query: SearchProfileQueryParam,
  ) {
    const result = await this.profileService.searchProfile(query.q);

    return { items: result };
  }
}
