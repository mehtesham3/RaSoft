import {
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document, DocumentStatus } from '../schema/doc.js';
import { Repository } from 'typeorm';
import { Chunk } from '../schema/chunk.js';
import { ApiKey } from '../schema/apiKey.js';
import { apikeyUtils } from '../common/apiKey.gen.js';
import { FileProcessService } from './file.process.js';

@Injectable()
export class DocsService {
  constructor(
    @InjectRepository(Document) private docsModule: Repository<Document>,
    @InjectRepository(Chunk) private chunkModule: Repository<Chunk>,
    @InjectRepository(ApiKey) private apiModule: Repository<ApiKey>,
    private readonly fileProcess:FileProcessService
  ) {}

  async verifyApiKey(tenanId:string, plainKey: string) {
    const genKeyHash = apikeyUtils.hash(plainKey);
    const record = await this.apiModule.findOne({where: {tenantId:tenanId,isActive:true,keyHash:genKeyHash}});

    if(!record) throw new Error('Invalid API key');
    return true;
  }

  async uploadDocs(file: Express.Multer.File, tenanId: any) {
      const fileMetadata = {
      originalName: file.originalname,
      generatedName: file.filename,
      mimeType: file.mimetype,
      sizeInBytes: file.size,
      localPath: file.path,
      uploadedAt: new Date(),
    };
    const startTime = new Date();

    const newDoc = this.docsModule.create({
      name: fileMetadata.originalName,
      location: fileMetadata.localPath,
      tenantId: tenanId,
      mimeType: fileMetadata.mimeType,
      fileSizeBytes: fileMetadata.sizeInBytes,
    });

    const savedDoc = await this.docsModule.save(newDoc);

    // Extract text from the uploaded document
    const extractTxt = await this.fileProcess.extractText(savedDoc.location);
    // Split the extracted text into chunks
    const chunks = await this.fileProcess.splitText(extractTxt,900,100);
    // Generate embeddings for the chunks
    const embedAndSave = await this.fileProcess.genEmbedding(chunks,savedDoc.id,tenanId);

    const chunkCount = chunks.length;

    newDoc.chunkCount = chunkCount;
    const tokenCount = chunks.reduce((count, chunk) => count + chunk.split(' ').length, 0);

    newDoc.tokenCount = tokenCount;
    newDoc.status = DocumentStatus.COMPLETED;
    await this.docsModule.save(newDoc);

    const duration = new Date().getTime() - startTime.getTime();
    console.log(`Document processing completed in ${duration} ms`);
    return {
      message: 'Document processed successfully! from upload to embedding and saving',
      data: savedDoc,
      chunkCount,
      duration,
      embedAndSave: embedAndSave.savedChunks,
      embedAndSaveDuration: embedAndSave.duration
    };
  }

}
