import { ApiProperty } from '@nestjs/swagger';
import { ROLE } from '../users.constant';

export class CreateUserDto {
  constructor(partial: Partial<CreateUserDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty({
    example: 'Nguyen Van A',
    type: String,
    minLength: 1,
    maxLength: 50,
    required: true,
  })
  readonly fullname: string;

  @ApiProperty({
    example: 'example@email.com',
    type: String,
    minLength: 1,
    maxLength: 256,
    required: true,
  })
  readonly email: string;

  @ApiProperty({
    example: 'Abcdef123!@#$',
    type: String,
    required: true,
  })
  readonly password: string;

  @ApiProperty({
    example: ROLE.USER,
    enum: ROLE,
    default: ROLE.USER,
  })
  readonly role: ROLE;
}
