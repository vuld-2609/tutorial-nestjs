import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { CurrentUser } from '@/passport/current-user.decorator';
import type { TAuthenticatedUser } from '@/types/users.type';

import { CommentsService } from './comments.service';
import { CreateCommentDto, CreateCommentWrapperDto } from './dto/create-comment.dto';

@Controller('articles/:slug/comments')
@ApiBearerAuth('access-token')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBody({ type: CreateCommentWrapperDto })
  createComment(
    @CurrentUser() user: TAuthenticatedUser,
    @Param('slug') slug: string,
    @Body('comment') comment: CreateCommentDto,
  ) {
    return this.commentsService.createComment(slug, user.id, comment.body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllComments(@Param('slug') slug: string) {
    return this.commentsService.findAll(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteComment(@Param('id') id: number) {
    return this.commentsService.deleteComment(id);
  }
}
