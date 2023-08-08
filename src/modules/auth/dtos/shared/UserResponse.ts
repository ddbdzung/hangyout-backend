import { ApiProperty } from '@nestjs/swagger';

import { ROLE } from '@/modules/users/users.constant';

export class UserResponse {
  @ApiProperty({
    example: '64d26c6e1b0170982a4ef9ad',
    type: String,
  })
  readonly _id: string;

  @ApiProperty({
    example: 'John Doe',
    type: String,
  })
  readonly fullname: string;

  @ApiProperty({
    example: 'example@hotmail.com',
    type: String,
  })
  readonly email: string;

  @ApiProperty({
    example: ROLE.USER,
    enum: ROLE,
  })
  readonly role: ROLE;

  @ApiProperty({
    example: false,
    type: Boolean,
  })
  readonly isVerified: boolean;

  @ApiProperty({
    example: '2021-08-11T14:00:00.000Z',
    type: Date,
  })
  readonly createdAt: Date;

  @ApiProperty({
    example: '2021-08-11T14:00:00.000Z',
    type: Date,
  })
  readonly updatedAt: Date;

  @ApiProperty({
    example: 0,
    type: Number,
  })
  readonly __v: number;
}
