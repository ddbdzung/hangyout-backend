import { ApiProperty } from '@nestjs/swagger';

import { UserResponse } from './shared/UserResponse';

export class GetUserParamsDto {
  @ApiProperty({
    description: 'User id',
    type: String,
    required: true,
    example: '60f1b2b3b3f4c3b3f4b3f4b3',
  })
  readonly id: string;
}

export class GetUserResponseDto {
  @ApiProperty({
    description: 'User',
    type: UserResponse,
  })
  readonly user: UserResponse;
}
