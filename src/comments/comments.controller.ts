import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse } from '@nestjs/swagger';

import { SuccessResponseDto } from '@/common/dto/success-response.dto';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { CurrentUser } from '@/passport/current-user.decorator';
import type { TAuthenticatedUser } from '@/types/users.type';

import { CommentsService } from './comments.service';
import { CreateCommentDto, CreateCommentWrapperDto } from './dto/create-comment.dto';
import { FindAllCommentsDto } from './dto/find-all-comment.dto';
import { CommentListResponseDto, CommentResponseWrapperDto } from './dto/response-comment.dto';

@Controller('articles/:slug/comments')
@ApiBearerAuth('access-token')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBody({ type: CreateCommentWrapperDto })
  @ApiOkResponse({ type: CommentResponseWrapperDto })
  createComment(
    @CurrentUser() user: TAuthenticatedUser,
    @Param('slug') slug: string,
    @Body('comment') comment: CreateCommentDto,
  ) {
    return this.commentsService.createComment(slug, user.id, comment.body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOkResponse({ type: CommentListResponseDto })
  findAllComments(@Param('slug') slug: string, @Query() query: FindAllCommentsDto) {
    return this.commentsService.findAll(slug, query);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOkResponse({ type: SuccessResponseDto })
  deleteComment(
    @CurrentUser() user: TAuthenticatedUser,
    @Param('slug') slug: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.commentsService.deleteComment(slug, id, user.id);
  }
}
