import { ApiProperty } from '@nestjs/swagger';

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

  constructor(article: ArticleWithRelations) {
    this.id = article.id;
    this.title = article.title;
    this.description = article.description;
    this.body = article.body;
    this.slug = article.slug;
    this.createdAt = article.createdAt;
    this.updatedAt = article.updatedAt;
    this.author = article.author;
    this.tags = article.tags.map((tag) => tag.name);
  }
}

export class ArticleResponseWrapper {
  @ApiProperty({ type: ArticleResponseDto })
  article: ArticleResponseDto;
}
