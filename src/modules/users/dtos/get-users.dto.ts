import { ApiProperty } from '@nestjs/swagger';

import { UserResponse } from './shared/UserResponse';

import { PaginationResult } from './shared/Pagination';

export class GetUserResponseDto {
  @ApiProperty({
    description: 'Users',
    type: UserResponse,
    isArray: true,
  })
  readonly users: UserResponse[];

  @ApiProperty({
    description: 'Pagination information',
    type: PaginationResult,
  })
  readonly pagination: PaginationResult;
}
