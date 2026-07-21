import { ApiProperty } from '@nestjs/swagger';

import { PaginationMetaDto } from '@/common/dto/pagination-meta.dto';

type ArticleWithRelations = {
  id: number;
  title: string;
  description: string;
  body: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  author: { username: string; bio: string | null; image: string | null };
  tags: { name: string }[];
  _count: { favorites: number };
};

export class ArticleResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  author: { username: string; bio: string | null; image: string | null };

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  favoritesCount: number;

  @ApiProperty()
  favorited: boolean;

  constructor(article: ArticleWithRelations, favorited: boolean = false) {
    this.id = article.id;
    this.title = article.title;
    this.description = article.description;
    this.body = article.body;
    this.slug = article.slug;
    this.createdAt = article.createdAt;
    this.updatedAt = article.updatedAt;
    this.author = article.author;
    this.tags = article.tags.map((tag) => tag.name);
    this.favoritesCount = article._count.favorites;
    this.favorited = favorited;
  }
}

export class ArticleResponseWrapper {
  @ApiProperty({ type: ArticleResponseDto })
  article: ArticleResponseDto;
}

export class ArticleListResponseDto {
  @ApiProperty({ type: [ArticleResponseDto] })
  data: ArticleResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;

  constructor(data: ArticleResponseDto[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
