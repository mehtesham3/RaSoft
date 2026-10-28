import { Module } from '@nestjs/common';
import { TenanService } from './tenan.service.js';
import { TenanController } from './tenan.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../schema/tenant.js';
import { UsageLog } from '../schema/usageLog.js';

@Module({
  imports:[
    TypeOrmModule.forFeature([Tenant,UsageLog])
  ],
  controllers: [TenanController],
  providers: [TenanService],
})
export class TenanModule {}
