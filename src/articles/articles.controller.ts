import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { CurrentUser } from '@/passport/current-user.decorator';
import type { TAuthenticatedUser } from '@/types/users.type';

import { ArticlesService } from './articles.service';
import { CreateArticleWrapperDto } from './dto/create-article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createArticle(
    @CurrentUser() user: TAuthenticatedUser,
    @Body() createArticleDto: CreateArticleWrapperDto,
  ) {
    return this.articlesService.create(user.id, createArticleDto.article);
  }
}
