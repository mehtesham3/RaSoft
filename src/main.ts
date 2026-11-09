import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { INGESTION_QUEUE } from './docs/inject.constant.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
    const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  // 2. Fetch your registered BullMQ queues from the NestJS context
  // Replace 'AUDIO_QUEUE' and 'VIDEO_QUEUE' with your actual queue names
  const ragProcessQueue = app.get<Queue>(getQueueToken(INGESTION_QUEUE));

  // 3. Initialize Bull Board with the adapter and your queues
  createBullBoard({
    queues: [
      new BullMQAdapter(ragProcessQueue),
    ],
    serverAdapter: serverAdapter,
  });

  // 4. Mount the dashboard UI as Express middleware
  app.use('/admin/queues', serverAdapter.getRouter());

  await app.listen(process.env.PORT ?? 4000);
}
await bootstrap();
