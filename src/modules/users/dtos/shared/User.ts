import { ApiProperty } from '@nestjs/swagger';

import { GENDER } from '../../users.constant';

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
