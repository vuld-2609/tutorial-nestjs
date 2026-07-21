import { ApiProperty } from '@nestjs/swagger';

type ProfileUser = {
  username: string;
  bio: string | null;
  image: string | null;
};

export class ProfileResponseDto {
  @ApiProperty()
  username: string;

  @ApiProperty({ nullable: true })
  bio: string | null;

  @ApiProperty({ nullable: true })
  image: string | null;

  @ApiProperty()
  following: boolean;

  constructor(user: ProfileUser, following: boolean) {
    this.username = user.username;
    this.bio = user.bio;
    this.image = user.image;
    this.following = following;
  }
}

export class ProfileResponseWrapperDto {
  @ApiProperty({ type: ProfileResponseDto })
  profile: ProfileResponseDto;
}
