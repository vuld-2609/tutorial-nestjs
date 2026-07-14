import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './http-exception.filter';
import { formatValidationErrors } from './validation-error.formatter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new I18nValidationExceptionFilter({
      errorFormatter: formatValidationErrors,
      responseBodyFormatter: (_host, exception, message) => ({
        statusCode: exception.getStatus(),
        timestamp: new Date().toISOString(),
        message,
      }),
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Tutorial Nest API')
    .setDescription('API description for tutorial-nest')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
