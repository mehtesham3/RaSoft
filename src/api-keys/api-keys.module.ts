import { Module } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service.js';
import { ApiKeysController } from './api-keys.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from '../schema/apiKey.js';
import { Tenant } from '../schema/tenant.js';

@Module({
  imports:[TypeOrmModule.forFeature([ApiKey,Tenant])],
  controllers: [ApiKeysController],
  providers: [ApiKeysService],
})
export class ApiKeysModule {}
