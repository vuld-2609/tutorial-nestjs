import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidateNested,
} from 'class-validator';

export class CreateArticleDto {
  @IsString({ message: 'Tiêu đề phải là một chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @MinLength(5, { message: 'Tiêu đề phải có ít nhất 5 ký tự' })
  @MaxLength(100, { message: 'Tiêu đề không được vượt quá 100 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title: string;

  @IsString({ message: 'Mô tả ngắn phải là chuỗi' })
  @IsNotEmpty({ message: 'Mô tả ngắn không được để trống' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  description: string;

  @IsString({ message: 'Nội dung bài viết phải là chuỗi' })
  @IsNotEmpty({ message: 'Nội dung bài viết không được để trống' })
  body: string;

  @IsArray({ message: 'Tags phải là một mảng' })
  @IsOptional()
  @IsString({ each: true, message: 'Tags phải là chuỗi' })
  tagList: string[];
}

export class CreateArticleWrapperDto {
  @ValidateNested()
  @Type(() => CreateArticleDto)
  article: CreateArticleDto;
}
