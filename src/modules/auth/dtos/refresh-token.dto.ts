import { ApiProperty } from '@nestjs/swagger';
import { TokensResponse } from './shared/TokenResponse';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRhbmdkdW5ndmRsQGdtYWlsLmNvbSIsInN1YiI6IjY0Y2U4YTJiZjE3NThmZWI3YjA4ODRmZCIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNjkxNDMyNjc0LCJleHAiOjE2OTIwMzc0NzR9.lDot94tJ5CmHTOnEMM4E3lOgGzpPHU8iSuRdeUAb6WU',
    type: String,
  })
  readonly refreshToken: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'Tokens to authenticate user',
    type: TokensResponse,
  })
  readonly tokens: TokensResponse;
}
