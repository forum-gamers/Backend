import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ForbiddenException } from '@nestjs/common';
import { AllExceptionsFilter } from './middlewares/global/exceptions.middleware';
import { GlobalLimiter } from './middlewares/global/globalLimiter.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api/v1');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(new GlobalLimiter().use);
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.enableCors({
    origin(origin, cb) {
      const isWhiteList = process.env.CORS_LIST.indexOf(origin) !== -1;

      cb(
        isWhiteList
          ? null
          : new ForbiddenException(`Not allowed by CORS for origin ${origin}`),
        isWhiteList ? true : void 0,
      );
    },
  });
  app.use(
    helmet({
      referrerPolicy: { policy: 'same-origin' },
    }),
  );
  app.use(helmet.xssFilter());
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
