import { ApiProperty } from '@nestjs/swagger';

import { UserResponse } from './shared/UserResponse';
// TODO: Remove unused variables
import { GENDER, ROLE } from '../users.constant';

class CanHidePropertyDto {
  value: any;
  isHidden: boolean;
}

export class PhoneNumberDto extends CanHidePropertyDto {
  @ApiProperty({
    example: '+84123456789',
    type: String,
  })
  readonly value: string;

  @ApiProperty({
    example: true,
    type: Boolean,
  })
  readonly isHidden: boolean;
}

export class GenderDto extends CanHidePropertyDto {
  @ApiProperty({
    example: GENDER.MALE,
    type: String,
  })
  readonly value: string;

  @ApiProperty({
    example: true,
    type: Boolean,
  })
  readonly isHidden: boolean;
}

export class UpdateUserDto {
  constructor(partial: Partial<UpdateUserDto>) {
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
    example: 'Abcdef123!@#$',
    type: String,
    required: true,
  })
  readonly password: string;

  @ApiProperty({
    example: 'https://example.com/avatar.png',
    type: String,
    maxLength: 256,
  })
  readonly avatar: string;

  @ApiProperty({
    example: 'This is my bio',
    type: String,
    maxLength: 256,
  })
  readonly bio: string;

  @ApiProperty({
    example: true,
    type: Boolean,
  })
  readonly isVerified: boolean;

  readonly phoneNumber: PhoneNumberDto;
  readonly gender: GenderDto;
}

export class UpdateUserResponseDto {
  @ApiProperty({
    description: 'User',
    type: UserResponse,
  })
  readonly user: UserResponse;
}

export class UpdateUserParamsDto {
  @ApiProperty({
    description: 'User id',
    type: String,
    required: true,
    example: '60f1b2b3b3f4c3b3f4b3f4b3',
  })
  readonly id: string;
}
