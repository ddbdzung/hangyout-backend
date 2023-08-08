import { ApiProperty } from '@nestjs/swagger';

export class PaginationQueryParam {
  @ApiProperty({
    description: 'Page number',
    type: Number,
    minimum: 1,
    required: false,
  })
  page: number;

  @ApiProperty({
    description: 'Size number',
    type: Number,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  size: number;
}

export class PaginationResult {
  @ApiProperty({
    type: Number,
    description: 'Total records',
    example: 1,
  })
  totalRecords: number;

  @ApiProperty({
    type: Number,
    description: 'Current page',
    minimum: 1,
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    type: Number,
    description: 'Total pages',
    example: 1,
  })
  totalPages: number;

  @ApiProperty({
    type: Number,
    description: 'Next page',
    minimum: 1,
    example: null,
  })
  nextPage: number | null;

  @ApiProperty({
    type: Number,
    description: 'Previous page',
    minimum: 1,
    example: null,
  })
  prevPage: number | null;
}
