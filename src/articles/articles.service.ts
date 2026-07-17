import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import slugify from 'slugify';

import { Prisma } from '@generated/prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { t } from '@/utils/i18n.util';

import { CreateArticleDto } from './dto/create-article.dto';
import { FindAllArticlesDto } from './dto/find-all-article.dto';
import { ArticleResponseDto } from './dto/response-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(authorId: number, dto: CreateArticleDto) {
    let slug = slugify(dto.title, { lower: true, strict: true, locale: 'vi' });
    const existingArticle = await this.prismaService.article.findUnique({
      where: { slug },
      select: { id: true },
    });

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
        throw new ConflictException(t('common.errors.already_exists', { args: { field: 'slug' } }));
      }
      throw new InternalServerErrorException(t('common.errors.internal_server_error'));
    }
  }

  async findAll(query: FindAllArticlesDto) {
    const { limit, offset, author, tag } = query;

    const where: Prisma.ArticleWhereInput = {};

    if (author) {
      where.author = {
        username: author,
      };
    }

    if (tag) {
      where.tags = {
        some: {
          name: tag,
        },
      };
    }

    const [articles, articlesCount] = await Promise.all([
      this.prismaService.article.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          author: {
            select: { username: true, bio: true, image: true },
          },
          tags: {
            select: { name: true },
          },
        },
      }),
      this.prismaService.article.count({ where }),
    ]);

    return { articles: articles.map((article) => new ArticleResponseDto(article)), articlesCount };
  }

  async getBySlug(slug: string) {
    const article = await this.prismaService.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: { username: true, bio: true, image: true },
        },
        tags: {
          select: { name: true },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(t('common.errors.not_found', { args: { entity: 'Article' } }));
    }

    return { article: new ArticleResponseDto(article) };
  }

  async update(slug: string, userId: number, dto: UpdateArticleDto) {
    const existingArticle = await this.prismaService.article.findUnique({
      where: { slug },
      select: { id: true, authorId: true },
    });

    if (!existingArticle) {
      throw new NotFoundException(t('common.errors.not_found', { args: { entity: 'Article' } }));
    }

    if (existingArticle.authorId !== userId) {
      throw new ForbiddenException(t('common.errors.access_denied'));
    }

    const { tagList, ...rest } = dto;

    try {
      const article = await this.prismaService.article.update({
        where: { slug },
        data: {
          ...rest,
          tags: tagList
            ? {
                set: [],
                connectOrCreate: tagList.map((tagName) => ({
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
        throw new ConflictException(t('common.errors.already_exists', { args: { field: 'slug' } }));
      }
      throw new InternalServerErrorException(t('common.errors.internal_server_error'));
    }
  }

  async delete(slug: string, userId: number) {
    const article = await this.prismaService.article.findUnique({
      where: { slug },
      select: { authorId: true },
    });
    if (!article) {
      throw new NotFoundException(t('common.errors.not_found', { args: { entity: 'Article' } }));
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException(t('common.errors.access_denied'));
    }

    await this.prismaService.article.delete({ where: { slug } });

    return { success: true };
  }
}
