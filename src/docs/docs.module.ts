import { Module } from '@nestjs/common';
import { DocsService } from './docs.service.js';
import { DocsController } from './docs.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../schema/doc.js';
import { Chunk } from '../schema/chunk.js';
import { ApiKey } from '../schema/apiKey.js';
import { FileProcessService } from './file.process.js';
import { BullModule } from '@nestjs/bullmq';
import { INGESTION_QUEUE } from './inject.constant.js';
import { DocProcessWorker } from './docProcess.worker.js';

@Module({
  imports:[TypeOrmModule.forFeature([Document,Chunk,ApiKey]),
  BullModule.registerQueue({
    name: INGESTION_QUEUE,
  })],
  controllers: [DocsController],
  providers: [DocsService, FileProcessService, DocProcessWorker],
})
export class DocsModule {}
