import { ApiProperty } from '@nestjs/swagger';

export class DeactivateUserParamsDto {
  @ApiProperty({
    description: 'User id',
    type: String,
    required: true,
    example: '60f1b2b3b3f4c3b3f4b3f4b3',
  })
  readonly id: string;
}

export class DeactivateUserResponseDto {
  @ApiProperty({
    description: 'Message response',
    type: String,
    example: 'User deactivated',
  })
  readonly message: string;

  @ApiProperty({
    description: 'Determine whether user is modified or not',
    type: Boolean,
    example: true,
  })
  readonly isModified: boolean;
}
