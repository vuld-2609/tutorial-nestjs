import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { ArticlesService } from '@/articles/articles.service';
import { PaginationMetaDto } from '@/common/dto/pagination-meta.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { t } from '@/utils/i18n.util';

import { FindAllCommentsDto } from './dto/find-all-comment.dto';
import { CommentListResponseDto, CommentResponseDto } from './dto/response-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly articleService: ArticlesService,
  ) {}

  async createComment(slug: string, authorId: number, body: string) {
    const article = await this.articleService.getArticle(slug);
    if (!article) {
      throw new NotFoundException(t('common.errors.not_found', { args: { entity: 'Article' } }));
    }

    try {
      const comment = await this.prisma.comment.create({
        data: {
          articleId: article.id,
          authorId,
          body,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              bio: true,
              image: true,
            },
          },
        },
      });

      return {
        comment: new CommentResponseDto(comment),
      };
    } catch {
      throw new InternalServerErrorException(t('common.errors.internal_server_error'));
    }
  }

  async findAll(slug: string, query: FindAllCommentsDto) {
    const { limit, page } = query;
    const skip = (page - 1) * limit;

    const where = { article: { slug } };

    const [comments, totalCount] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              bio: true,
              image: true,
            },
          },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);

    const totalPage = Math.ceil(totalCount / limit);

    return new CommentListResponseDto(
      comments.map((comment) => new CommentResponseDto(comment)),
      new PaginationMetaDto({
        totalCount,
        currentPage: page,
        pageSize: limit,
        totalPage,
        hasNextPage: page < totalPage,
        hasPreviousPage: page > 1,
      }),
    );
  }

  async deleteComment(slug: string, id: number, userId: number) {
    const article = await this.articleService.getArticle(slug);
    if (!article) {
      throw new NotFoundException(t('common.errors.not_found', { args: { entity: 'Article' } }));
    }

    const existingComment = await this.prisma.comment.findUnique({
      where: { id },
      select: { authorId: true, articleId: true },
    });

    if (!existingComment || existingComment.articleId !== article.id) {
      throw new NotFoundException(t('common.errors.not_found', { args: { entity: 'Comment' } }));
    }

    if (existingComment.authorId !== userId) {
      throw new ForbiddenException(t('common.errors.access_denied'));
    }

    try {
      await this.prisma.comment.delete({
        where: { id },
      });

      return { success: true };
    } catch {
      throw new InternalServerErrorException(t('common.errors.internal_server_error'));
    }
  }
}
