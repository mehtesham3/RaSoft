import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.js";
import { ApiKey } from "./apiKey.js";

enum Plan {
    FREE = "free",
    PRO = "pro",
    ENTERPRISE = "enterprise"
}


@Entity()
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({length:50})
    name: string;

    @Column({default: Plan.FREE})
    plan: Plan;

    @Column({default: 50})
    maxPages: number;

    @Column({default: 90})
    maxQueries: number;

    @ManyToOne(()=> User, {onDelete: "CASCADE"})
    @JoinColumn({
        name: "userId",
        foreignKeyConstraintName: "FK_Tenant_User"
    })
    userId: User;

    @OneToMany(()=> ApiKey, (apiKey)=> apiKey.tenantId)
    apiKeys: ApiKey[];

    @CreateDateColumn({type:'timestamptz'})
    createdAt: Date;
}

