import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // Then combine it with a RabbitMQ microservice
  const microservice = app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://localhost:5672`],
      queue: 'notification_queue',
      queueOptions: { durable: false },
      prefetchCount: 1,
    },
  });

  await app.startAllMicroservices();
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('User Post Comment APIs')
    .setDescription('User Post Comment APIs Description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
