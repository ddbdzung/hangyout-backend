import { ApiProperty } from '@nestjs/swagger';

export class BadRequestResponseDto {
  @ApiProperty({
    default: 400,
    type: Number,
  })
  statusCode: number;

  @ApiProperty({
    default: 'Bad Request',
    type: String,
  })
  message: string;
}

export class UnauthorizedResponseDto {
  @ApiProperty({
    default: 401,
    type: Number,
  })
  statusCode: number;

  @ApiProperty({
    default: 'Unauthorized',
    type: String,
  })
  message: string;
}

export class ForbiddenResponseDto {
  @ApiProperty({
    default: 403,
    type: Number,
  })
  statusCode: number;

  @ApiProperty({
    default: 'Forbidden',
    type: String,
  })
  message: string;
}

export class NotFoundResponseDto {
  @ApiProperty({
    default: 404,
    type: Number,
  })
  statusCode: number;

  @ApiProperty({
    default: 'Not Found',
    type: String,
  })
  message: string;
}
