import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CatchEverythingFilter } from './filters/catchEverytingFilter';
import { deploymentConstants } from './config/deployment.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new CatchEverythingFilter(httpAdapterHost));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    methods: ['GET', 'POST'],
    origin: [
      deploymentConstants['cconvert-frontend'],
      deploymentConstants['cconvert-local'],
    ],
  });

  await app.listen(deploymentConstants.port);
}
bootstrap();
