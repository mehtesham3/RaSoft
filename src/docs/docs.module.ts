import { Module } from '@nestjs/common';
import { DocsService } from './docs.service.js';
import { DocsController } from './docs.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../schema/doc.js';
import { Chunk } from '../schema/chunk.js';
import { ApiKey } from '../schema/apiKey.js';
import { FileProcessService } from './file.process.js';

@Module({
  imports:[TypeOrmModule.forFeature([Document,Chunk,ApiKey])],
  controllers: [DocsController],
  providers: [DocsService,FileProcessService],
})
export class DocsModule {}
