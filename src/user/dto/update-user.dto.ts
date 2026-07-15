import { OmitType, PartialType } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { CreateUserDto } from '@/auth/dto/create-user.dto';
import { Match } from '@/utils/match.decorator';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'] as const)) {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @ValidateIf((dto: UpdateUserDto) => dto.newPassword !== undefined)
  @MinLength(6, { message: i18nValidationMessage('validation.password.too_short') })
  newPassword?: string;

  @ValidateIf((dto: UpdateUserDto) => dto.newPassword !== undefined)
  @Match('newPassword', { message: i18nValidationMessage('validation.password.mismatch') })
  confirmNewPassword?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class UpdateUserWrapperDto {
  @ValidateNested()
  @Type(() => UpdateUserDto)
  user: UpdateUserDto;
}
