import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import slugify from 'slugify';

import { Prisma } from '@generated/prisma/client';

import { PaginationMetaDto } from '@/common/dto/pagination-meta.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { t } from '@/utils/i18n.util';

import { CreateArticleDto } from './dto/create-article.dto';
import { FindAllArticlesDto } from './dto/find-all-article.dto';
import { ArticleListResponseDto, ArticleResponseDto } from './dto/response-article.dto';
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
          _count: {
            select: { favorites: true },
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

  async findAll(query: FindAllArticlesDto, currentUserId?: number) {
    const { limit, author, tag, page } = query;

    const where: Prisma.ArticleWhereInput = {};
    const skip = (page - 1) * limit;

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
        skip,
        include: {
          author: {
            select: { username: true, bio: true, image: true },
          },
          tags: {
            select: { name: true },
          },
          _count: {
            select: { favorites: true },
          },
        },
      }),
      this.prismaService.article.count({ where }),
    ]);

    const favoritedArticleIds = await this.getFavoritedArticleIds(
      articles.map((article) => article.id),
      currentUserId,
    );

    const totalPage = Math.ceil(articlesCount / limit);
    const hasNextPage = page < totalPage;
    const hasPreviousPage = page > 1;

    return new ArticleListResponseDto(
      articles.map((article) => new ArticleResponseDto(article, favoritedArticleIds.has(article.id))),
      new PaginationMetaDto({
        totalCount: articlesCount,
        currentPage: page,
        pageSize: limit,
        hasNextPage,
        hasPreviousPage,
        totalPage,
      }),
    );
  }

  async getBySlug(slug: string, currentUserId?: number) {
    const article = await this.prismaService.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: { username: true, bio: true, image: true },
        },
        tags: {
          select: { name: true },
        },
        _count: {
          select: { favorites: true },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(t('common.errors.not_found', { args: { entity: 'Article' } }));
    }

    const favorited = await this.isFavoritedByUser(article.id, currentUserId);

    return { article: new ArticleResponseDto(article, favorited) };
  }

  private async getFavoritedArticleIds(
    articleIds: number[],
    currentUserId?: number,
  ): Promise<Set<number>> {
    if (!currentUserId || articleIds.length === 0) {
      return new Set();
    }

    const favorites = await this.prismaService.favorite.findMany({
      where: { userId: currentUserId, articleId: { in: articleIds } },
      select: { articleId: true },
    });

    return new Set(favorites.map((favorite) => favorite.articleId));
  }

  private async isFavoritedByUser(articleId: number, currentUserId?: number): Promise<boolean> {
    if (!currentUserId) {
      return false;
    }

    const favorite = await this.prismaService.favorite.findUnique({
      where: { userId_articleId: { userId: currentUserId, articleId } },
      select: { userId: true },
    });

    return !!favorite;
  }

  async getArticle(slug: string) {
    return await this.prismaService.article.findUnique({
      where: { slug },
      select: { id: true, authorId: true },
    });
  }

  async update(slug: string, userId: number, dto: UpdateArticleDto) {
    const existingArticle = await this.getArticle(slug);

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
          _count: {
            select: { favorites: true },
          },
        },
      });

      const favorited = await this.isFavoritedByUser(article.id, userId);

      return { article: new ArticleResponseDto(article, favorited) };
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

  async favoriteArticle(slug: string, userId: number) {
    const article = await this.getArticle(slug);

    if (!article) {
      throw new NotFoundException(t('common.errors.not_found', { args: { entity: 'Article' } }));
    }

    try {
      await this.prismaService.favorite.create({
        data: {
          userId,
          articleId: article.id,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(t('common.errors.already_favorited'));
      }
      throw new InternalServerErrorException(t('common.errors.internal_server_error'));
    }

    return this.getBySlug(slug, userId);
  }

  async unfavoriteArticle(slug: string, userId: number) {
    const article = await this.getArticle(slug);

    if (!article) {
      throw new NotFoundException(t('common.errors.not_found', { args: { entity: 'Article' } }));
    }

    try {
      await this.prismaService.favorite.delete({
        where: { userId_articleId: { userId, articleId: article.id } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(t('common.errors.not_favorited'));
      }
      throw new InternalServerErrorException(t('common.errors.internal_server_error'));
    }

    return this.getBySlug(slug, userId);
  }
}
