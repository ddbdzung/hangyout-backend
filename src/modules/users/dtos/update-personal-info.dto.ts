import { ApiProperty } from '@nestjs/swagger';

import { GenderDto, PhoneNumberDto } from './shared/User';
import { UserResponse } from './shared/UserResponse';

export class UpdatePersonalInfoDto {
  constructor(partial: Partial<UpdatePersonalInfoDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty({
    example: 'Nguyen Van A',
    type: String,
    minLength: 1,
    maxLength: 50,
  })
  readonly fullname: string;

  @ApiProperty({
    example: 'example@hotmail.com',
    type: String,
    maxLength: 50,
  })
  readonly email: string;

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

  readonly phoneNumber: PhoneNumberDto;
  readonly gender: GenderDto;
}

export class UpdatePersonalInfoResponseDto {
  @ApiProperty({
    description: 'User',
    type: UserResponse,
  })
  readonly user: UserResponse;
}
