import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateCommentDto {
  @IsString({ message: i18nValidationMessage('validation.comment.body.invalid') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.comment.body.empty') })
  body: string;
}

export class CreateCommentWrapperDto {
  @ValidateNested()
  @Type(() => CreateCommentDto)
  comment: CreateCommentDto;
}
