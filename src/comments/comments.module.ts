import { Module } from '@nestjs/common';

import { ArticlesModule } from '@/articles/articles.module';

import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [ArticlesModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
