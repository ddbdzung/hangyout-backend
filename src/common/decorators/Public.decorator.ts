import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
// Allow API to be accessed without authentication
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
