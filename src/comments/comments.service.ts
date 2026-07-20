import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { ArticlesService } from '@/articles/articles.service';
import { PrismaService } from '@/prisma/prisma.service';
import { t } from '@/utils/i18n.util';

import { CommentResponseDto } from './dto/response-comment.dto';

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

  async findAll(slug: string) {
    const comments = await this.prisma.comment.findMany({
      where: {
        article: {
          slug,
        },
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
      comments: comments.map((comment) => new CommentResponseDto(comment)),
    };
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
