import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DrizzleExceptionFilter } from '@src/filters/drizzle-exception.filter';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error'],
    rawBody: true,
  });

  app.enableCors({
    origin: [
      'http://localhost:3000', // frontend dev
      'http://localhost:5173', // Vite dev
      'https://lite-transpose-banatrics.onrender.com',
      'https://banatrics.vercel.app'
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, x-active-role',
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new DrizzleExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('BANATRICS API') // Title of your docs
    .setDescription('BANATRICS API') // Small description
    .setVersion('1.0') // Version
    .addBearerAuth()
    .addServer('http://localhost:3000', 'Local Dev')
    .addServer('https://lite-transpose-banatrics.onrender.com', 'Production')
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token', 
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true, 
    },
  }); 

  app.getHttpAdapter().get('/', (req, res) => {
    res.send({ status: 'ok', message: 'Banatrics Project API' });
  });
  app.getHttpAdapter().get('/favicon.ico', (req, res) => res.status(204).end());

  await app.listen(process.env.PORT ?? 3000);
  console.log('------------Server is running at port 3000----------');
}
bootstrap();
