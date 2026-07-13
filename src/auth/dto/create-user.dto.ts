import { Type } from 'class-transformer';
import { IsEmail, IsString, MinLength, ValidateNested } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;
}
