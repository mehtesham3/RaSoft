import {
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from '../schema/doc.js';
import { Repository } from 'typeorm';
import { Chunk } from '../schema/chunk.js';

@Injectable()
export class DocsService {
  constructor(
    @InjectRepository(Document) private docsModule: Repository<Document>,
    @InjectRepository(Chunk) private chunkModule: Repository<Chunk>,
  ) {}

  async uploadDocs(file: Express.Multer.File, tenanId: any) {
      const fileMetadata = {
      originalName: file.originalname,
      generatedName: file.filename,
      mimeType: file.mimetype,
      sizeInBytes: file.size,
      localPath: file.path,
      uploadedAt: new Date(),
    };

    const newDoc = this.docsModule.create({
      name: fileMetadata.originalName,
      location: fileMetadata.localPath,
      tenantId: tenanId,
      mimeType: fileMetadata.mimeType,
      fileSizeBytes: fileMetadata.sizeInBytes,
    });

    await this.docsModule.save(newDoc);

    return {
      message: 'Document uploaded successfully!',
      data:fileMetadata,
    };
  }

}
