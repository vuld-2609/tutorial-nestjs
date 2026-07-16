import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import slugify from 'slugify';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const TAG_NAMES = ['nestjs', 'prisma', 'typescript', 'nodejs', 'postgresql', 'redis'];

const USERNAMES = [
  'alice',
  'bob',
  'carol',
  'dave',
  'erin',
  'frank',
  'grace',
  'heidi',
  'ivan',
  'judy',
];

const ARTICLE_TITLES = [
  'Getting Started with NestJS',
  'Understanding Prisma Migrations',
  'Building REST APIs with TypeScript',
  'JWT Authentication Explained',
  'Refresh Token Rotation Strategies',
  'Redis Caching Patterns',
  'PostgreSQL Indexing Tips',
  'Dependency Injection in NestJS',
  'Writing Clean DTOs',
  'Handling Errors in Express',
  'Guards vs Interceptors in NestJS',
  'Designing a Blog API',
  'Testing NestJS Services',
  'Database Schema Design 101',
  'Scaling Node.js Applications',
  'Introduction to i18n in NestJS',
  'Working with Prisma Relations',
  'Securing Your API with Rate Limiting',
  'Docker for Node.js Developers',
  'CI/CD Pipelines for NestJS Projects',
];

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const users = await Promise.all(
    USERNAMES.map((username) =>
      prisma.user.upsert({
        where: { email: `${username}@example.com` },
        update: {},
        create: {
          email: `${username}@example.com`,
          username,
          password,
          bio: `Hi, I'm ${username}.`,
          image: null,
        },
      }),
    ),
  );

  const tags = await Promise.all(
    TAG_NAMES.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  for (const [index, title] of ARTICLE_TITLES.entries()) {
    const author = users[index % users.length];
    const tagCount = (index % 3) + 1;
    const articleTags = Array.from({ length: tagCount }, (_, i) => tags[(index + i) % tags.length]);

    await prisma.article.upsert({
      where: { slug: slugify(title, { lower: true, strict: true }) },
      update: {},
      create: {
        title,
        slug: slugify(title, { lower: true, strict: true }),
        description: `A short description about "${title}".`,
        body: `This is the full body content of the article "${title}".`,
        authorId: author.id,
        tags: {
          connect: articleTags.map((tag) => ({ id: tag.id })),
        },
      },
    });
  }

  console.log(`Seeded ${users.length} users, ${tags.length} tags, ${ARTICLE_TITLES.length} articles.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
