import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';

import slugify from 'slugify';

import { Prisma } from '@generated/prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { t } from '@/utils/i18n.util';

import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleResponseDto } from './dto/response-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(authorId: number, dto: CreateArticleDto) {
    let slug = slugify(dto.title, { lower: true, strict: true, locale: 'vi' });
    const existingArticle = await this.prismaService.article.findUnique({ where: { slug } });

    if (existingArticle) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    try {
      const article = await this.prismaService.article.create({
        data: {
          title: dto.title,
          description: dto.description,
          body: dto.body,
          slug,
          authorId: authorId,
          tags: dto.tagList
            ? {
                connectOrCreate: dto.tagList.map((tagName) => ({
                  where: { name: tagName },
                  create: { name: tagName },
                })),
              }
            : undefined,
        },
        include: {
          author: {
            select: { username: true, bio: true, image: true },
          },
          tags: {
            select: { name: true },
          },
        },
      });

      return { article: new ArticleResponseDto(article) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(
          t('common.errors.already_exists', { args: { field: 'slug' } }),
        );
      }
      throw new InternalServerErrorException(t('common.errors.internal_server_error'));
    }
  }
}
