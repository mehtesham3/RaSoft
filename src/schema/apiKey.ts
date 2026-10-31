import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Tenant } from "./tenant.js";


@Entity()
export class ApiKey{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({length: 20})
    keyPrefix: string;

    @Column({length: 100})
    keyHash: string;

    @ManyToOne('Tenant', {onDelete: "CASCADE"})
    @JoinColumn({
        name: "tenantId",
        foreignKeyConstraintName: "FK_ApiKey_Tenant"
    })
    tenant:Tenant;
    
    @Column({name:"tenantId"})
    tenantId: string;

    @Column({default: true})
    isActive: boolean;

    @CreateDateColumn({type:'timestamptz'})
    lastUsedAt: Date;

    @CreateDateColumn({type:'timestamptz',default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date;
}
