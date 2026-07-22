import { INestApplication } from '@nestjs/common';

import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

import { AllExceptionsFilter } from './http-exception.filter';
import { formatValidationErrors } from './validation-error.formatter';

export function setupApp(app: INestApplication): void {
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
}
