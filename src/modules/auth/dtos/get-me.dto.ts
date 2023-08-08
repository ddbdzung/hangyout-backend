import { ApiProperty } from '@nestjs/swagger';

import { UserResponse } from './shared/UserResponse';

export class GetMeResponseDto {
  @ApiProperty({
    type: UserResponse,
    description: 'User information - exclude password',
  })
  readonly user: UserResponse;
}
