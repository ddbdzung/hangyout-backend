import { TOKEN_TYPE } from './auth.constant';
import { ROLE } from '../users/users.constant';

export interface IJsonWebToken {
  sub: string;
  iat: number;
  exp: number;
  [key: string]: any;
}

export interface IRefreshTokenPayload extends IJsonWebToken {
  type: TOKEN_TYPE;
  role: ROLE;
  email: string;
}

export interface IAccessTokenPayload extends IJsonWebToken {
  role: ROLE;
  email: string;
}

export interface IVerifyEmailTokenPayload extends IJsonWebToken {
  email: string;
  type: TOKEN_TYPE;
}
