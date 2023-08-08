import { ApiProperty } from '@nestjs/swagger';

export class TokensResponse {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRhbmdkdW5ndmRsQGdtYWlsLmNvbSIsInN1YiI6IjY0Y2U4YTJiZjE3NThmZWI3YjA4ODRmZCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY5MTQzMjY3NCwiZXhwIjoxNjkxNTE5MDc0fQ.lRUjKtZk_9roVYEqeXNBbdk4Yq3CwRt2-tn6wtBrxVg',
    type: String,
  })
  readonly accessToken: string;
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRhbmdkdW5ndmRsQGdtYWlsLmNvbSIsInN1YiI6IjY0Y2U4YTJiZjE3NThmZWI3YjA4ODRmZCIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNjkxNDMyNjc0LCJleHAiOjE2OTIwMzc0NzR9.lDot94tJ5CmHTOnEMM4E3lOgGzpPHU8iSuRdeUAb6WU',
    type: String,
  })
  readonly refreshToken: string;
}
