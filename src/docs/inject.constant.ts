export const INGESTION_QUEUE = 'doc-processing';
export const PROCESS_DOC = 'doc-process-work';
export const PROCESS_DOCUMENT_JOB = 'process-document';

export interface ProcessDocumentPayload {
  documentId: string;
  filePath: string;
}

