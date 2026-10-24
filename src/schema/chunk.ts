import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "./doc.js";
import { Tenant } from "./tenant.js";


@Entity()
export class Chunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  Chunk: string;

    @Column({ name: 'document_id' })
  documentId: number;

//   @ManyToOne(() => Document, (document) => document.chunks, { onDelete: 'CASCADE' })
  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: Document;

    @Column({ name: 'tenant_id' })
  tenantId: number;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column("vector",{name:"embedding",nullable:true,length: 1536})
  embedding: number[];

  @Column("jsonb",{name:"metadata",nullable:true})
  metadata: any;

  @Column()
  tokenCount: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}