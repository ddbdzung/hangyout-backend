import { ApiProperty } from '@nestjs/swagger';
import { TokensResponse } from './shared/TokenResponse';
import { UserResponse } from './shared/UserResponse';

export class LocalLoginDto {
  @ApiProperty({
    example: 'example@hotmail.com',
    description: 'Email of user',
    type: String,
  })
  readonly email: string;

  @ApiProperty({
    example: 'StrongPasswordAs123!',
    type: String,
  })
  readonly password: string;
}

export class LocalLoginResponseDto {
  @ApiProperty({ type: UserResponse })
  readonly user: UserResponse;

  @ApiProperty({ type: TokensResponse })
  readonly tokens: TokensResponse;
}
