import { Body, Controller, Delete, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { TenanService } from './tenan.service.js';
import { authMidd } from '../common/auth.guard.js';
import { updateName, upgradePlanDTO } from './DTO/tenan.DTO.js';

@Controller('tenan')
@UseGuards(authMidd)
export class TenanController {
  constructor(private readonly tenanService: TenanService) {}

  @Get('/me')
  getTenanInfo(@Req() req: Request & {user:any}){
    const tenantId = req.user.tenantId;
    return this.tenanService.tenantInfo(tenantId);
  }

  @Patch('/me')
  updateTenanName(@Req() req:Request & {user:any} ,@Body() dto:updateName){
    const tenantId = req.user.tenantId;
    return this.tenanService.updateTenanName(tenantId,dto.name);
  }

  @Post('/me/upgrade')
  upgradeTenanPlan(@Req() req:Request & {user:any} ,@Body() dto:upgradePlanDTO){
    const tenantId = req.user.tenantId;
    return this.tenanService.upgradeTenanPlan(tenantId,dto.plan);
  }

  @Delete('/me')
  deleteTenan(@Req() req:Request & {user:any}){
    const tenantId = req.user.tenantId;
    return this.tenanService.deleteTenant(tenantId);
  }

  @Post('/me/create')
  createTenan(@Req() req:Request & {user:any},@Body() dto:updateName){
    const tenantId = req.user.tenantId;
    
    return this.tenanService.createTenant(tenantId,dto.name)
  }

}
