import { ApiProperty } from '@nestjs/swagger';

import { TUSer } from '@/types/users.type';

export class UserResponseDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  token: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ nullable: true })
  bio: string | null;

  @ApiProperty({ nullable: true })
  image: string | null;

  constructor(user: TUSer, token: string) {
    this.email = user.email;
    this.token = token;
    this.username = user.username;
    this.bio = user.bio ?? null;
    this.image = user.image ?? null;
  }
}

export class UserResponseWrapperDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

export class UserProfileDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ nullable: true })
  bio: string | null;

  @ApiProperty({ nullable: true })
  image: string | null;

  constructor(user: TUSer) {
    this.email = user.email;
    this.username = user.username;
    this.bio = user.bio ?? null;
    this.image = user.image ?? null;
  }
}

export class UserProfileWrapperDto {
  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;
}
