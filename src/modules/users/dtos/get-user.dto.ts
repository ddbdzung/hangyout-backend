import { ApiProperty } from '@nestjs/swagger';

export class GetUserParamsDto {
  @ApiProperty({
    description: 'User id',
    type: String,
    required: true,
    example: '60f1b2b3b3f4c3b3f4b3f4b3',
  })
  readonly id: string;
}
