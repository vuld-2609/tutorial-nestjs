import { ApiProperty } from '@nestjs/swagger';

import { PaginationMetaDto } from '@/common/dto/pagination-meta.dto';

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
  @ApiProperty({ type: CommentResponseDto })
  comment: CommentResponseDto;
}

export class CommentListResponseDto {
  @ApiProperty({ type: [CommentResponseDto] })
  comments: CommentResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;

  constructor(comments: CommentResponseDto[], meta: PaginationMetaDto) {
    this.comments = comments;
    this.meta = meta;
  }
}
