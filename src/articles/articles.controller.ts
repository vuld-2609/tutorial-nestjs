import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { CurrentUser } from '@/passport/current-user.decorator';
import type { TAuthenticatedUser } from '@/types/users.type';

import { ArticlesService } from './articles.service';
import { CreateArticleWrapperDto } from './dto/create-article.dto';
import { FindAllArticlesDto } from './dto/find-all-article.dto';
import { ArticleListResponseDto, ArticleResponseWrapper } from './dto/response-article.dto';
import { UpdateArticleWrapperDto } from './dto/update-article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: ArticleResponseWrapper })
  @Post()
  async createArticle(
    @CurrentUser() user: TAuthenticatedUser,
    @Body() createArticleDto: CreateArticleWrapperDto,
  ) {
    return this.articlesService.create(user.id, createArticleDto.article);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: ArticleListResponseDto })
  @Get()
  async getArticles(@CurrentUser() user: TAuthenticatedUser, @Query() query: FindAllArticlesDto) {
    return this.articlesService.findAll(query, user.id);
  }

  @ApiOkResponse({ type: ArticleResponseWrapper })
  @Get(':slug')
  async getArticle(@Param('slug') slug: string) {
    return this.articlesService.getBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: ArticleResponseWrapper })
  @Put(':slug')
  async updateArticle(
    @CurrentUser() user: TAuthenticatedUser,
    @Param('slug') slug: string,
    @Body() updateArticleDto: UpdateArticleWrapperDto,
  ) {
    return this.articlesService.update(slug, user.id, updateArticleDto.article);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete(':slug')
  async deleteArticle(@CurrentUser() user: TAuthenticatedUser, @Param('slug') slug: string) {
    return this.articlesService.delete(slug, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: ArticleResponseWrapper })
  @Post(':slug/favorite')
  async favoriteArticle(@CurrentUser() user: TAuthenticatedUser, @Param('slug') slug: string) {
    return this.articlesService.favoriteArticle(slug, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: ArticleResponseWrapper })
  @Delete(':slug/favorite')
  async unfavoriteArticle(@CurrentUser() user: TAuthenticatedUser, @Param('slug') slug: string) {
    return this.articlesService.unfavoriteArticle(slug, user.id);
  }
}
