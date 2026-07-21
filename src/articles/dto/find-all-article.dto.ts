import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export class FindAllArticlesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter articles by tag name' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: 'Filter articles by author username' })
  @IsOptional()
  @IsString()
  author?: string;
}
