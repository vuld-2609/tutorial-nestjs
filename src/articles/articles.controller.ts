import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { CurrentUser } from '@/passport/current-user.decorator';
import type { TAuthenticatedUser } from '@/types/users.type';

import { ArticlesService } from './articles.service';
import { CreateArticleWrapperDto } from './dto/create-article.dto';
import { FindAllArticlesDto } from './dto/find-all-article.dto';
import { UpdateArticleWrapperDto } from './dto/update-article.dto';

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

  @UseGuards(JwtAuthGuard)
  @Get()
  async getArticles(@Query() query: FindAllArticlesDto) {
    return this.articlesService.findAll(query);
  }

  @Get(':slug')
  async getArticle(@Param('slug') slug: string) {
    return this.articlesService.getBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':slug')
  async updateArticle(
    @CurrentUser() user: TAuthenticatedUser,
    @Param('slug') slug: string,
    @Body() updateArticleDto: UpdateArticleWrapperDto,
  ) {
    return this.articlesService.update(slug, user.id, updateArticleDto.article);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':slug')
  async deleteArticle(@CurrentUser() user: TAuthenticatedUser, @Param('slug') slug: string) {
    return this.articlesService.delete(slug, user.id);
  }
}
