import { Type } from 'class-transformer';
import { IsEmail, IsString, MinLength, ValidateNested } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateUserDto {
  @IsString({ message: i18nValidationMessage('validation.username.invalid') })
  username: string;

  @IsEmail({}, { message: i18nValidationMessage('validation.email.invalid') })
  email: string;

  @MinLength(6, { message: i18nValidationMessage('validation.password.too_short') })
  password: string;
}

export class RegisterDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;
}
