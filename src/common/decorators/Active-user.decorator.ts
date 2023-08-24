import { SetMetadata } from '@nestjs/common';

export const IS_INACTIVE_USER_KEY = 'isInactiveUser';
// Allow API to be access by non-active user (deactivated user) without authentication
export const AllowInactiveUser = () => SetMetadata(IS_INACTIVE_USER_KEY, true);
