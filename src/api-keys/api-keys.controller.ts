import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service.js';
import { Request } from 'express';
import { apiKeyDTO } from './DTO/apiKey.DTO.js';
import { authMidd } from '../common/auth.guard.js';
import { Roles, RolesGuard } from '../common/guard/role.guard.js';

@Controller('api-keys')
@UseGuards(authMidd)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  createKey(@Req() req:Request & {user:any},@Body() dto:apiKeyDTO){
    const tenantId = req.user.tenantId;
    return this.apiKeysService.createApiKey(tenantId,dto.ApiKeyName);
  }

  @Get()
  listkeys(@Req() req:Request & {user:any}){
    const tenantId = req.user.tenantId;
    return this.apiKeysService.listKeys(tenantId)
  }

  @Delete(':id')
  deleteKey(@Req() req:Request & {user:any},@Param('id') id:string){
    const tenantId = req.user.tenantId;
    const keyId = id;
    return this.apiKeysService.deleteKeys(tenantId,keyId);
  }

  @Post(':id/rotate')
  revokeAndGenerate(@Req() req:Request & {user:any},@Param('id') keyId:string,@Body() dtoName:apiKeyDTO){
    const tenantId = req.user.tenantId;
    return this.apiKeysService.revokeAndGen(tenantId,keyId,dtoName.ApiKeyName);
  }

  @Post(':id/admn')
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  adminControl(@Req() req:Request & {user:any},@Param('id') keyId:string){
    const tenantId = req.user.tenantId;
    return this.apiKeysService.adminRevokeUnrevoke(keyId);
  }
}
