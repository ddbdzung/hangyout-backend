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
import { Request, Response } from 'express';

import { JoiValidationPipe } from '@/common/pipes/joi-validation.pipe';
import { Public } from '@/common/decorators/Public.decorator';

import { AuthService } from './../services/auth.service';
import { LocalRegisterDto } from '../dtos/register.dto';
import { LocalLoginDto } from '../dtos/login.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { localRegisterBody } from '../validations/register.validation';
import { localLoginBody } from '../validations/login.validation';
import { refreshTokenBody } from '../validations/refresh-token.validation';
import { verifyAccountQuery } from '../validations/verify-account.validation';

export type VerifyAccountQuery = {
  token: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Public()
  @Get('/verify-account')
  async verifyAccount(
    @Query(new JoiValidationPipe(verifyAccountQuery)) query: VerifyAccountQuery,
  ) {
    const { token } = query;
    const { user, tokenInDB } = await this.authService.verifyEmailToken(token);
    await Promise.all([
      this.authService.deleteVerifyEmailToken(tokenInDB),
      this.authService.updateVerifiedAccount(user),
    ]);

    return { message: 'OK' };
  }

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

  @Get('/me')
  async getMe(@Req() req: Request) {
    const requestUser = AuthService.getAuthenticatedRequestUser(req);
    return this.authService.getUserById(requestUser._id);
  }
}
