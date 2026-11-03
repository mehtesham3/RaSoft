import {
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from '../schema/doc.js';
import { Repository } from 'typeorm';
import { Chunk } from '../schema/chunk.js';
import { ApiKey } from '../schema/apiKey.js';
import { apikeyUtils } from '../common/apiKey.gen.js';

@Injectable()
export class DocsService {
  constructor(
    @InjectRepository(Document) private docsModule: Repository<Document>,
    @InjectRepository(Chunk) private chunkModule: Repository<Chunk>,
    @InjectRepository(ApiKey) private apiModule: Repository<ApiKey>,
  ) {}

  async verifyApiKey(tenanId:string, plainKey: string) {
    const genKeyHash = apikeyUtils.hash(plainKey);
    const record = await this.apiModule.findOne({where: {tenantId:tenanId,isActive:true,keyHash:genKeyHash}});

    if(!record) throw new Error('Invalid API key');
    return true;
  }

  async uploadDocs(file: Express.Multer.File, tenanId: any,plainKey:string) {
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

    const savedDoc = await this.docsModule.save(newDoc);

    return {
      message: 'Document uploaded successfully!',
      data: savedDoc,
    };
  }

}
