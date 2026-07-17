import { PartialType } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { CreateArticleDto } from './create-article.dto';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}

export class UpdateArticleWrapperDto {
  @ValidateNested()
  @Type(() => UpdateArticleDto)
  article: UpdateArticleDto;
}
