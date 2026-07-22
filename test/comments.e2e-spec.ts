import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { setupApp } from '@/setup-app';

describe('CommentsController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const author = { username: 'cmt_author_e2e', email: 'cmt_author_e2e@test.com', password: 'password123' };
  const other = { username: 'cmt_other_e2e', email: 'cmt_other_e2e@test.com', password: 'password123' };

  let authorToken: string;
  let otherToken: string;
  let articleSlug: string;

  async function register(user: typeof author) {
    await request(app.getHttpServer()).post('/users').send({ user });
  }

  async function login(user: typeof author): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: user.email, password: user.password });
    return res.body.user.token;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();

    prisma = app.get(PrismaService);

    // Clean slate: remove any leftover data from a previous failed run.
    await prisma.comment.deleteMany({});
    await prisma.article.deleteMany({ where: { title: 'Comments e2e article' } });
    await prisma.user.deleteMany({ where: { email: { in: [author.email, other.email] } } });

    await register(author);
    await register(other);
    authorToken = await login(author);
    otherToken = await login(other);

    const articleRes = await request(app.getHttpServer())
      .post('/articles')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({
        article: {
          title: 'Comments e2e article',
          description: 'Fixture article for comments e2e tests',
          body: 'Body content',
          tagList: [],
        },
      });
    articleSlug = articleRes.body.article.slug;
  });

  afterAll(async () => {
    await prisma.comment.deleteMany({});
    await prisma.article.deleteMany({ where: { title: 'Comments e2e article' } });
    await prisma.user.deleteMany({ where: { email: { in: [author.email, other.email] } } });
    await app.close();
  });

  describe('POST /articles/:slug/comments', () => {
    it('rejects an unauthenticated request with 401', () => {
      return request(app.getHttpServer())
        .post(`/articles/${articleSlug}/comments`)
        .send({ comment: { body: 'no auth' } })
        .expect(401);
    });

    it('returns 404 when the article does not exist', () => {
      return request(app.getHttpServer())
        .post('/articles/no-such-article-e2e/comments')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ comment: { body: 'hello' } })
        .expect(404);
    });

    it('creates a comment and returns it with the author profile', async () => {
      const res = await request(app.getHttpServer())
        .post(`/articles/${articleSlug}/comments`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ comment: { body: 'First comment' } })
        .expect(201);

      expect(res.body.comment).toMatchObject({
        body: 'First comment',
        author: { username: other.username },
      });
    });
  });

  describe('GET /articles/:slug/comments', () => {
    it('lists comments for the article, newest first', async () => {
      const res = await request(app.getHttpServer())
        .get(`/articles/${articleSlug}/comments`)
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(200);

      expect(res.body.comments).toHaveLength(1);
      expect(res.body.comments[0]).toMatchObject({ body: 'First comment' });
      expect(res.body.meta).toMatchObject({ totalCount: 1 });
    });
  });

  describe('DELETE /articles/:slug/comments/:id', () => {
    let commentId: number;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post(`/articles/${articleSlug}/comments`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ comment: { body: 'To be deleted' } });
      commentId = res.body.comment.id;
    });

    it('rejects deletion by a user who is not the comment author with 403', () => {
      return request(app.getHttpServer())
        .delete(`/articles/${articleSlug}/comments/${commentId}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(403);
    });

    it('returns 404 for a comment id that does not exist', () => {
      return request(app.getHttpServer())
        .delete(`/articles/${articleSlug}/comments/999999`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);
    });

    it('deletes the comment when the author requests it', () => {
      return request(app.getHttpServer())
        .delete(`/articles/${articleSlug}/comments/${commentId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.success).toBe(true);
        });
    });
  });
});
