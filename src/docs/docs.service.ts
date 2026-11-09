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
import { INGESTION_QUEUE, PROCESS_DOC } from './inject.constant.js';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class DocsService {
  constructor(
    @InjectRepository(Document) private docsModule: Repository<Document>,
    @InjectRepository(Chunk) private chunkModule: Repository<Chunk>,
    @InjectRepository(ApiKey) private apiModule: Repository<ApiKey>,
    @InjectQueue(INGESTION_QUEUE) private readonly docQ : Queue,
    private readonly fileProcess:FileProcessService
  ) {}

  async verifyApiKey(tenanId:string, plainKey: string) {
    const genKeyHash = apikeyUtils.hash(plainKey);
    const record = await this.apiModule.findOne({where: {tenantId:tenanId,isActive:true,keyHash:genKeyHash}});

    if(!record) throw new Error('Invalid API key');
    return true;
  }

  async uploadDocs(file: any, tenanId: any) {
    const startTime = new Date();

    const newDoc = this.docsModule.create({
      name: file.originalName,
      location: file.path,
      tenantId: tenanId,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
    });

    const savedDoc = await this.docsModule.save(newDoc);

    // Extract text from the uploaded document
    const extractTxt = await this.fileProcess.extractText(savedDoc.location);
    // Split the extracted text into chunks
    const chunks = await this.fileProcess.splitText(extractTxt,600,100);
    // Generate embeddings for the chunks
    const embedAndSave = await this.fileProcess.genEmbedding(chunks,savedDoc.id,tenanId);

    const chunkCount = chunks.length;

    newDoc.chunkCount = chunkCount;
    const tokenCount = chunks.reduce((count, chunk) => count + chunk.split(' ').length, 0);
    if (!embedAndSave || tokenCount === 0) {
      newDoc.status = DocumentStatus.FAILED;
      await this.docsModule.save(newDoc);
      throw new Error('Document processing failed');
    }
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

  async getAllDocs(tenanId: string){
    const docs = await this.docsModule.find({where:{tenantId: tenanId},select:{id:true,name:true,location:true,status:true}});
    
    if(!docs || docs.length === 0) throw new Error('No documents found');

    return docs;
  }

  async getDocById(tenanId: string, docId: string){
    const doc = await this.docsModule.findOne({where:{tenantId: tenanId, id: docId}});

    if(!doc) throw new Error('Document not found');

    return doc;
  }

  async deleteDocById(tenanId: string, docId: string){
    const result = await this.docsModule.delete({tenantId: tenanId, id: docId});

    if(result.affected === 0) throw new Error('Document not found');

    return { result: result.raw };
  }

  async retryFailedIngestion(tenanId: string, docId: string) {
    const doc = await this.docsModule.findOne({where:{tenantId: tenanId, id: docId}});

    if(!doc) throw new Error('Document not found');

    if(doc.status === DocumentStatus.COMPLETED) throw new Error('Document is already in a completed state');

    const docJob = await this.docQ.add(PROCESS_DOC,{
          file: {
            originalName: doc.name,
            path: doc.location,
            mimetype: doc.mimeType,
            size: doc.fileSizeBytes
          },
          tenantId: tenanId,
        },{
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 }
      }
      );
       await this.docsModule.update(doc.id, { status: DocumentStatus.PROCESSING });
    
    const respData = {
      jobId: docJob.id,
      docJob: `Job created !! `
    }

    return respData;
  }

}
