import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "./tenant.js";


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

    @ManyToOne(()=>Tenant, (tenant)=>tenant.apiKeys, {onDelete: "CASCADE"})
    @JoinColumn({
        name: "tenantId",
        foreignKeyConstraintName: "FK_ApiKey_Tenant"
    })
    tenantId: Tenant;

    @Column({default: true})
    isActive: boolean;

    @CreateDateColumn({type:'timestamptz'})
    lastUsedAt: Date;

    @CreateDateColumn({type:'timestamptz',default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date;
}
