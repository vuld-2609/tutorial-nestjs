import { IsNotEmpty, IsString } from 'class-validator';

export class GreetDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
