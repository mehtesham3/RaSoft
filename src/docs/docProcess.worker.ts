import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { INGESTION_QUEUE, PROCESS_DOC } from './inject.constant.js';
import { DocsService } from './docs.service.js';

@Processor(INGESTION_QUEUE)
export class DocProcessWorker extends WorkerHost{
  constructor(private readonly docService: DocsService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case PROCESS_DOC:
        const { file, tenantId } = job.data;

        return this.docService.uploadDocs(file, tenantId);

      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  @OnWorkerEvent('completed')
  onComplete(job: Job) {
    console.log(`Job ${job.id} has completed successfully.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    console.error(`Job ${job.id} failed with error: ${error.message}`);
  }
}
