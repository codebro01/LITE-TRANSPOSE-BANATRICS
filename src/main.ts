import * as dotenv from 'dotenv';
dotenv.config()
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DrizzleExceptionFilter } from '@src/filters/drizzle-exception.filter';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true
  });

app.enableCors({
  origin: [
    'http://localhost:3000', // frontend dev
    'http://localhost:5173', // Vite dev
    'https://nest-js-real-estate-rema.onrender.com', // production frontend
  ],
  credentials: true, // allow cookies & auth headers
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
});

  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new DrizzleExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('Real Estate API') // Title of your docs
    .setDescription('Real estate api') // Small description
    .setVersion('1.0') // Version
    .addBearerAuth()
    .addServer('http://localhost:3000', 'Local Dev')
    .addServer('', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/api-docs', app, document); // localhost:3000/api-docs

  // Root health check
  app.getHttpAdapter().get('/', (req, res) => {
    res.send({ status: 'ok', message: 'Banatrics Project API' });
  });
  app.getHttpAdapter().get('/favicon.ico', (req, res) => res.status(204).end());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
