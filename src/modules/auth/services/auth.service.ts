import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import * as mongoose from 'mongoose';

import { UserRepository } from '@/modules/users/repositories/user.repository';
import { UsersService } from '@/modules/users/services/users.service';
import { UserDocument } from '@/modules/users/schemas/user.schema';
import { RedisService } from '@/global/redis/redis.service';
import { I18nCustomService } from '@/global/i18n/i18n.service';
import { getSecondFromJwtExpiresIn } from '@/utils/time';
import { createEmailVerification } from '@/templates/EmailVerification';

import {
  IRefreshTokenPayload,
  IVerifyEmailTokenPayload,
} from '../auth.interface';
import { TOKEN_TYPE } from '../auth.constant';
import { LocalRegisterDto } from '../dtos/register.dto';
import { TokenRepository } from '../repositories/token.repository';
import { LocalLoginDto } from '../dtos/login.dto';
import { TokenDocument } from '../schemas/token.schema';
// TODO: Rearrange imports
import { Request } from 'express';
import { RequestUser } from '@/global/casl/casl-ability.factory';
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nCustomService,
    private readonly mailerService: MailerService,
  ) {}

  static getAuthenticatedRequestUser(req: Request) {
    return req['user'] as RequestUser;
  }

  async getUserById(userId: mongoose.Types.ObjectId): Promise<UserDocument> {
    return this.userRepository.findById(userId, '-password');
  }

  private async _createAccessToken(user: UserDocument): Promise<string> {
    const payload = { email: user.email, sub: user._id, role: user.role };
    return await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('jwt.expiresIn.access'),
      secret: this.configService.get('jwt.secretKey.access'),
    });
  }

  private async _createRefreshToken(user: UserDocument): Promise<string> {
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
      type: TOKEN_TYPE.REFRESH,
    };

    return await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('jwt.expiresIn.refresh'),
      secret: this.configService.get('jwt.secretKey.refresh'),
    });
  }

  private async _cacheRefreshToken(refreshToken: string): Promise<void> {
    return this.redisService.set(
      refreshToken,
      refreshToken,
      getSecondFromJwtExpiresIn(
        this.configService.get('jwt.expiresIn.refresh'),
      ),
    );
  }

  async getUserSessionByToken(refreshToken: string) {
    return this.tokenRepository.findOneByToken(refreshToken);
  }

  async createVerificationToken(user: UserDocument): Promise<string> {
    const payload = {
      email: user.email,
      sub: user._id,
      type: TOKEN_TYPE.VERIFY_EMAIL,
    };

    return await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('jwt.expiresIn.verifyEmail'),
      secret: this.configService.get('jwt.secretKey.verifyEmail'),
    });
  }

  async saveVerifyEmailToken(token: string): Promise<TokenDocument> {
    const { type, sub, exp } = this._decodeJwtToken(
      token,
    ) as IVerifyEmailTokenPayload;
    return this.tokenRepository.create({
      type,
      token,
      user: sub,
      expiresAt: this._cleanifyExpiresAt(exp),
    });
  }

  async sendVerificationEmail(
    token: string,
    user: UserDocument,
  ): Promise<void> {
    const brand = this.configService.get('mailer.brand');
    const from = this.configService.get('mailer.from');
    const baseUrl = this.configService.get('app.baseUrl');
    const url = `${baseUrl}/api/v1/auth/verify-account?token=${token}`;
    const email = {
      from,
      to: user.email,
      ...createEmailVerification(from, brand, url, user),
    };

    return this.mailerService.sendMail(email);
  }

  private _decodeJwtToken(token: string) {
    const decoded = this.jwtService.decode(token, {
      json: true,
    });

    return decoded;
  }

  private _isValidExpiresAt(expiresAt: number) {
    const now = Date.now();
    return expiresAt > now;
  }

  private _cleanifyExpiresAt(exp: number) {
    /**
     * @param val Time in seconds from JWT token expiration
     * @returns Exact JS date time in milliseconds
     */
    const toMillisecondsFromSeconds = (val: number) => {
      return val * 1000;
    };

    const cleanExpiresAt = !this._isValidExpiresAt(exp)
      ? toMillisecondsFromSeconds(exp)
      : exp;

    return cleanExpiresAt;
  }

  private async _saveRefreshToken(refreshToken: string) {
    const { exp, sub, type } = this._decodeJwtToken(
      refreshToken,
    ) as IRefreshTokenPayload;

    return this.tokenRepository.create({
      type,
      token: refreshToken,
      user: sub,
      expiresAt: this._cleanifyExpiresAt(exp),
    });
  }

  excludeUserPassword(user: UserDocument) {
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async createLocalUser(localRegisterDto: LocalRegisterDto): Promise<any> {
    const { email } = localRegisterDto;

    if (await this.userService.isEmailTaken(email)) {
      throw new BadRequestException(
        this.i18n.translate('auth.REGISTER_LOCAL.EMAIL_IS_TAKEN'),
      );
    }

    return this.userRepository.create(localRegisterDto);
  }

  private async _removeRefreshTokenFromDB(token: TokenDocument) {
    return this.tokenRepository.deleteOneById(token._id);
  }

  private async _clearCacheRefreshToken(token: TokenDocument) {
    return this.redisService.del(token.token);
  }

  async unregisterUserSession(refreshToken: TokenDocument) {
    const pRemoveRefreshTokenFromDB =
      this._removeRefreshTokenFromDB(refreshToken);
    const pClearCacheRefreshToken = this._clearCacheRefreshToken(refreshToken);

    await Promise.all([pRemoveRefreshTokenFromDB, pClearCacheRefreshToken]);
  }

  async registerUserSession(user: UserDocument) {
    const pAccessToken = this._createAccessToken(user);
    const pRefreshToken = this._createRefreshToken(user);

    const [accessToken, refreshToken] = await Promise.all([
      pAccessToken,
      pRefreshToken,
    ]);

    const pCacheRefreshToken = this._cacheRefreshToken(refreshToken);
    const pSaveRefreshToken = this._saveRefreshToken(refreshToken);

    await Promise.all([pCacheRefreshToken, pSaveRefreshToken]);

    return { accessToken, refreshToken };
  }

  async validateLocalUser(localLoginDto: LocalLoginDto): Promise<UserDocument> {
    const { email, password } = localLoginDto;

    const user = await this.userRepository.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        this.i18n.translate('auth.LOGIN_LOCAL.LOGIN_FAILED'),
      );
    }

    if (!(await this.userRepository.comparePassword(user, password))) {
      throw new UnauthorizedException(
        this.i18n.translate('auth.LOGIN_LOCAL.LOGIN_FAILED'),
      );
    }

    return user;
  }

  async verifyEmailToken(token: string) {
    try {
      const decoded = (await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt.secretKey.verifyEmail'),
      })) as IVerifyEmailTokenPayload;

      if (decoded.type !== TOKEN_TYPE.VERIFY_EMAIL) {
        throw new BadRequestException(
          this.i18n.translate('auth.TOKEN.INVALID_TOKEN'),
        );
      }
      if (!mongoose.isValidObjectId(decoded.sub)) {
        throw new BadRequestException(
          this.i18n.translate('auth.TOKEN.INVALID_TOKEN'),
        );
      }

      const pUser = this.userRepository.findOneByCondition({
        _id: decoded.sub,
      });
      const pTokenInDB = this.tokenRepository.findOneByUserIdAndType(
        new mongoose.Types.ObjectId(decoded.sub),
        TOKEN_TYPE.VERIFY_EMAIL,
        { lean: true },
      );
      const [user, tokenInDB] = await Promise.all([pUser, pTokenInDB]);
      if (!user || !tokenInDB) {
        throw new BadRequestException(
          this.i18n.translate('auth.TOKEN.INVALID_TOKEN'),
        );
      }

      return { user, tokenInDB };
    } catch (error) {
      if (['JsonWebTokenError', 'TokenExpiredError'].includes(error.name)) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  async deleteVerifyEmailToken(token: TokenDocument) {
    return this.tokenRepository.deleteOneById(token._id);
  }

  async updateVerifiedAccount(user: UserDocument): Promise<UserDocument> {
    user.isVerified = true;
    return user.save();
  }

  async verifyRefreshToken(token: string) {
    try {
      const decoded = (await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt.secretKey.refresh'),
      })) as IRefreshTokenPayload;

      if (decoded.type !== TOKEN_TYPE.REFRESH) {
        throw new BadRequestException(
          this.i18n.translate('auth.TOKEN.INVALID_TOKEN'),
        );
      }

      if (!mongoose.isValidObjectId(decoded.sub)) {
        throw new BadRequestException(
          this.i18n.translate('auth.TOKEN.INVALID_TOKEN'),
        );
      }
      const pUser = this.userRepository.findOneByCondition({
        _id: decoded.sub,
      });
      const pTokenInDB = this.tokenRepository.findOneByUserIdAndType(
        new mongoose.Types.ObjectId(decoded.sub),
        TOKEN_TYPE.REFRESH,
        { lean: true },
      );
      const [user, tokenInDB] = await Promise.all([pUser, pTokenInDB]);
      if (!user || !tokenInDB) {
        throw new BadRequestException(
          this.i18n.translate('auth.TOKEN.INVALID_TOKEN'),
        );
      }

      return { user, tokenInDB };
    } catch (error) {
      if (['JsonWebTokenError', 'TokenExpiredError'].includes(error.name)) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
