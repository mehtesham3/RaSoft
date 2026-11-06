// get-documents-query.dto.ts
import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum DocumentStatus {
  PENDING = 'PENDING',
  CHUNKING = 'CHUNKING',
  EMBEDDING = 'EMBEDDING',
  READY = 'READY',
  FAILED = 'FAILED',
}

export class GetDocumentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Prevent clients from requesting 10,000 records at once
  limit?: number = 20;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsOptional()
  @IsString()
  category?: string;
}