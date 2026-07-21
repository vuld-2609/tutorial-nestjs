import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginDto {
  @IsEmail({}, { message: i18nValidationMessage('validation.email.invalid') })
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
