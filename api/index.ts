/**
 * Vercel Serverless Function Entry Point
 * This file allows the NestJS app to run as a Vercel serverless function
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

const server = express();

let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    // Set global prefix
    app.setGlobalPrefix('api');

    // Enable CORS
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Swagger API documentation
    const config = new DocumentBuilder()
      .setTitle('NestJS Prisma API')
      .setDescription('Backend API with JWT Auth, PostgreSQL, and Redis Rate Limiting')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
    cachedApp = app;
  }

  return cachedApp;
}

// Vercel serverless function handler
export default async function handler(req: Request, res: Response) {
  await bootstrap();
  server(req, res);
}
