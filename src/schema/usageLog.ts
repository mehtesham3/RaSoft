import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tenant } from "./tenant.js";
import { ApiKey } from "./apiKey.js";

Entity()
export class UsageLog{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({name:'tenant_id'})
    tenantId: string;

    @ManyToOne(()=> Tenant,{onDelete:'CASCADE'})
    @JoinColumn({name:'tenant_id'})
    tenant: Tenant;

    @Column({name:'api_keyId',nullable:true})
    apiKeyId: string;

    @ManyToOne(()=>ApiKey,{onDelete:'SET NULL'})
    @JoinColumn({name:'api_keyId'})
    apikey:ApiKey;

    @Column()
    tokenIn: number;

    @Column()
    tokenOut:number;
    
}