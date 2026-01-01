/**
 * DataBuddy Backend - Main Application Entry Point
 *
 * This is the main entry point for the DataBuddy backend application.
 * It initializes the NestJS application with all necessary configurations
 * including CORS, validation pipes, Swagger documentation, and WebSocket support.
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create NestJS application instance
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Enable global validation pipes for request validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are provided
      transform: true, // Transform payload to DTO instances
      disableErrorMessages: process.env.NODE_ENV === 'production', // Hide error messages in production
    }),
  );

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Configure Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('DataBuddy API')
    .setDescription('API documentation for DataBuddy - Data Management Platform')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('pipelines', 'Pipeline management endpoints')
    .addTag('data', 'Data import/export endpoints')
    .addTag('monitoring', 'Monitoring and analytics endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Get port from environment or default to 3001
  const port = process.env.PORT || 3001;

  // Start the server
  await app.listen(port);

  console.log(`🚀 DataBuddy Backend is running on: http://localhost:${port}`);
  console.log(`📖 API Documentation available at: http://localhost:${port}/api/docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start DataBuddy Backend:', error);
  process.exit(1);
});