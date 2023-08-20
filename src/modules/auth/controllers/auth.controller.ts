import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { JoiValidationPipe } from '@/common/pipes/joi-validation.pipe';
import { Public } from '@/common/decorators/Public.decorator';
import { BadRequestResponseDto } from '@/common/dto.common';

import { AuthService } from './../services/auth.service';
import {
  LocalRegisterDto,
  LocalRegisterResponseDto,
} from '../dtos/register.dto';
import { LocalLoginDto, LocalLoginResponseDto } from '../dtos/login.dto';
import {
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from '../dtos/refresh-token.dto';
import { localRegisterBody } from '../validations/register.validation';
import { localLoginBody } from '../validations/login.validation';
import { refreshTokenBody } from '../validations/refresh-token.validation';
import { verifyAccountQuery } from '../validations/verify-account.validation';
import {
  VerifyAccountQueryDto,
  VerifyAccountResponseDto,
} from '../dtos/verify-account.dto';
import { GetMeResponseDto } from '../dtos/get-me.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Register user',
    description:
      'Register user - return user and tokens if success - exclude password',
  })
  @ApiCreatedResponse({
    description: 'Register user successfully',
    type: LocalRegisterResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - Invalid body',
    type: BadRequestResponseDto,
  })
  @Public()
  @Post('/register/local')
  @UsePipes(new JoiValidationPipe(localRegisterBody))
  async localRegister(
    @Res() res: Response,
    @Body() localRegisterDto: LocalRegisterDto,
  ) {
    const user = await this.authService.createLocalUser(localRegisterDto);
    const { accessToken, refreshToken } =
      await this.authService.registerUserSession(user);

    res.json({
      user: this.authService.excludeUserPassword(user),
      tokens: { accessToken, refreshToken },
    });

    const verificationToken = await this.authService.createVerificationToken(
      user,
    );
    await Promise.all([
      this.authService.saveVerifyEmailToken(verificationToken),
      this.authService.sendVerificationEmail(verificationToken, user),
    ]);
  }

  @ApiOperation({
    summary: 'Login user',
    description:
      'Login user - return user and tokens if success - exclude password',
  })
  @ApiOkResponse({
    description: 'Login user successfully',
    type: LocalLoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - Invalid body',
    type: BadRequestResponseDto,
  })
  @Public()
  @Post('/login/local')
  @HttpCode(200)
  @UsePipes(new JoiValidationPipe(localLoginBody))
  async localLogin(@Body() localLoginDto: LocalLoginDto) {
    const user = await this.authService.validateLocalUser(localLoginDto);
    const { accessToken, refreshToken } =
      await this.authService.registerUserSession(user);

    return {
      user: this.authService.excludeUserPassword(user),
      tokens: { accessToken, refreshToken },
    };
  }

  @ApiOperation({
    summary: 'Verify account email',
    description: 'Verify account email - return message OK if success',
  })
  @ApiOkResponse({
    description: 'Verify account email successfully',
    type: VerifyAccountResponseDto,
  })
  @Public()
  @Get('/verify-account')
  async verifyAccount(
    @Query(new JoiValidationPipe(verifyAccountQuery))
    query: VerifyAccountQueryDto,
  ) {
    const { token } = query;
    const { user, tokenInDB } = await this.authService.verifyEmailToken(token);
    await Promise.all([
      this.authService.deleteVerifyEmailToken(tokenInDB),
      this.authService.updateVerifiedAccount(user),
    ]);

    // TODO: Redirect to frontend when have frontend app ready to handle this route (frontend will redirect to login page)
    return { message: 'OK' };
  }

  @ApiOperation({
    summary: 'Refresh token',
    description: 'Refresh token - return new access token and refresh token',
  })
  @ApiCreatedResponse({
    description:
      'Refresh token successfully - return new access token and refresh token with user info',
    type: RefreshTokenResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request - Invalid body',
  })
  @Public()
  @Post('/refresh-token')
  @UsePipes(new JoiValidationPipe(refreshTokenBody))
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refreshToken: token } = refreshTokenDto;
    const { user, tokenInDB } = await this.authService.verifyRefreshToken(
      token,
    );

    const pUnregisterUserSession =
      this.authService.unregisterUserSession(tokenInDB);
    const pRegisterUserSession = this.authService.registerUserSession(user);
    const [, { accessToken, refreshToken }] = await Promise.all([
      pUnregisterUserSession,
      pRegisterUserSession,
    ]);

    return { accessToken, refreshToken };
  }

  @ApiOperation({
    summary: 'Get user info',
    description: 'Get user info by access token - exclude password',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Get user info successfully - return user info - exclude password',
    type: GetMeResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid access token',
  })
  @Get('/me')
  async getMe(@Req() req: Request) {
    const requestUser = AuthService.getAuthenticatedRequestUser(req);
    return this.authService.getUserById(requestUser._id);
  }
}
