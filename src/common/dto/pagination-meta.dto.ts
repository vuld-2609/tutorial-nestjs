import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalPage: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;

  constructor(meta: PaginationMetaDto) {
    this.totalCount = meta.totalCount;
    this.currentPage = meta.currentPage;
    this.pageSize = meta.pageSize;
    this.totalPage = meta.totalPage;
    this.hasNextPage = meta.hasNextPage;
    this.hasPreviousPage = meta.hasPreviousPage;
  }
}
