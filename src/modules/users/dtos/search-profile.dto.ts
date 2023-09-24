import { ApiProperty } from '@nestjs/swagger';

export class SearchProfileQueryParam {
  @ApiProperty({
    description: 'Query string to search for profile by fullname and email',
    type: String,
    minimum: 1,
    maximum: 256,
    required: true,
  })
  q: string;
}

export class SearchProfileItem {
  @ApiProperty({
    description: 'User id',
    type: String,
  })
  readonly _id: string;

  @ApiProperty({
    description: 'User fullname',
    type: String,
  })
  readonly fullname: string;

  @ApiProperty({
    description: 'User email',
    type: String,
  })
  readonly email: string;

  @ApiProperty({
    description: 'User avatar',
    type: String,
  })
  readonly avatar: string;
}

export class SearchProfileResponseDto {
  @ApiProperty({
    description: 'List of profile',
    type: [SearchProfileItem],
  })
  readonly items: SearchProfileItem[];
}
