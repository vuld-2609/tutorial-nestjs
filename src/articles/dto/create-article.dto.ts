import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateArticleDto {
  @IsString({ message: i18nValidationMessage('validation.article.title.invalid') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.article.title.empty') })
  @MinLength(5, { message: i18nValidationMessage('validation.article.title.too_short') })
  @MaxLength(100, { message: i18nValidationMessage('validation.article.title.too_long') })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title: string;

  @IsString({ message: i18nValidationMessage('validation.article.description.invalid') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.article.description.empty') })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description: string;

  @IsString({ message: i18nValidationMessage('validation.article.body.invalid') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.article.body.empty') })
  body: string;

  @IsArray({ message: i18nValidationMessage('validation.article.tag_list.invalid') })
  @IsOptional()
  @IsString({ each: true, message: i18nValidationMessage('validation.article.tag_list.invalid_item') })
  tagList: string[];
}

export class CreateArticleWrapperDto {
  @ValidateNested()
  @Type(() => CreateArticleDto)
  article: CreateArticleDto;
}
