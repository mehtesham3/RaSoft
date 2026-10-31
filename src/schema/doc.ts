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
  tenantId: number;

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
  pages: number;

  @Column()
  chunkCount: number;

  // Inside your existing Document entity class:
@OneToMany(() => Chunk, (chunk) => chunk.document)
chunks: Chunk[];

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
  
}