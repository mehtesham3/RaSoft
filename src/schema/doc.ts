import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "./tenant.js";
import { Chunk } from "./chunk.js";

export enum DocumentStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

@Entity()
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    location: string;

    @Column({ name: 'tenant_id' })
  tenantId: string;

  // 2. Define the TypeORM relation
  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.UPLOADED
  })
  status: DocumentStatus;

  @Column()
  fileSizeBytes: number;

  @Column({default: 0})
  chunkCount: number;

  @Column({default: 0})
  tokenCount: number;

  @Column()
  mimeType: string;

  @Column({type:'jsonb', nullable: true})
  metadata: Record<string, any>;

  // Inside your existing Document entity class:
// @OneToMany(() => Chunk, (chunk) => chunk.document)
// chunks: Chunk[];

  @Column({default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date;

  @Column({default: () => 'CURRENT_TIMESTAMP'})
  updatedAt: Date;
  
}