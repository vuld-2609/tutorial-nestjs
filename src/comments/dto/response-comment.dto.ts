import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

type CommentWithRelation = {
  id: number;
  articleId: number;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: number;
    username: string;
    bio: string | null;
    image: string | null;
  };
};

export class CommentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  articleId: number;

  @ApiProperty()
  author: {
    id: number;
    username: string;
    bio: string | null;
    image: string | null;
  };

  @ApiProperty()
  body: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(comment: CommentWithRelation) {
    this.id = comment.id;
    this.articleId = comment.articleId;
    this.author = comment.author;
    this.body = comment.body;
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
  }
}

export class CommentResponseWrapperDto {
  @ValidateNested()
  @Type(() => CommentResponseDto)
  comment: CommentResponseDto;
}
