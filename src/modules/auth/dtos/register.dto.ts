import { ApiProperty } from '@nestjs/swagger';

import { UserResponse } from './shared/UserResponse';
import { TokensResponse } from './shared/TokenResponse';

export class LocalRegisterDto {
  @ApiProperty({
    example: 'example@hotmail.com',
    type: String,
  })
  readonly email: string;

  @ApiProperty({
    example: 'StrongPasswordAs123!',
    type: String,
  })
  readonly password: string;

  @ApiProperty({
    example: 'John Doe',
    type: String,
  })
  readonly fullname: string;
}

export class LocalRegisterResponseDto {
  @ApiProperty({ type: UserResponse })
  readonly user: UserResponse;

  @ApiProperty({ type: TokensResponse })
  readonly tokens: TokensResponse;
}
