import { SetMetadata } from '@nestjs/common';

export const IS_NON_VERIFIED_USER_KEY = 'isNonVerifiedUser';
// Allow API to be access by non-verified user (deactivated user) without authentication
export const AllowNonVerifiedUser = () =>
  SetMetadata(IS_NON_VERIFIED_USER_KEY, true);
