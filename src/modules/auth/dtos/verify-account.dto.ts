import { ApiProperty } from '@nestjs/swagger';

export class VerifyAccountQueryDto {
  @ApiProperty({
    description: 'Token to verify account',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRhbmdkdW5ndmRsQGdtYWlsLmNvbSIsInN1YiI6IjY0YmE0NGZjNTZkMWQ1Mjc2MjBkMjcwMyIsInR5cGUiOiJ2ZXJpZnlFbWFpbCIsImlhdCI6MTY4OTkyODk1NywiZXhwIjoxNjkwMDE1MzU3fQ._Pq3opHdhMP6SQDLzyE63BYKRaT7GByZU4v9u7nVZxA',
  })
  token: string;
}

export class VerifyAccountResponseDto {
  @ApiProperty({
    description: 'Message to notify user',
    default: 'OK',
  })
  message: string;
}
