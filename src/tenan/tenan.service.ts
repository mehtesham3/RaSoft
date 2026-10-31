import { GoneException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan, Tenant } from '../schema/tenant.js';
import { Repository } from 'typeorm';
import { UsageLog } from '../schema/usageLog.js';
import { planLimits } from '../common/plan.limit.js';

@Injectable()
export class TenanService {
    constructor(
        @InjectRepository(Tenant) private tenantModule: Repository<Tenant>,
        // @InjectRepository(UsageLog) private usageLogModule: Repository<UsageLog>
    ){}

    async tenantInfo(tenantId: string){
        const tenant = await this.tenantModule.findOne({where:{id:tenantId}});
        // const usageLog = await this.usageLogModule.find({where:{tenantId:tenantId}});
        let logAvailable = true;
        if(!tenant) throw new Error('Tenant not found');
        // if(!usageLog) logAvailable = false;

        const dataDisp = {
            tenant,
            // usageLog: logAvailable ? usageLog : 'log not available',
        }

        return tenant;
    }

    async updateTenanName(tenantId:string, newName: string){
      const updateData = await this.tenantModule.findOneBy({id:tenantId});
      if(!updateData?.isActive) throw new Error('Tenant not found');
      updateData.name = newName;

      return this.tenantModule.save(updateData);
    }

    async upgradeTenanPlan(tenantId:string, newPlan:Plan){
        const tenantPlan = await this.tenantModule.findOneBy({id:tenantId});
        if(!tenantPlan?.isActive) throw new Error('Tenant not found');
        const limit = planLimits[newPlan];
        tenantPlan.plan = newPlan;
        tenantPlan.maxApiKey = limit.maxApiKey;
        tenantPlan.maxPages = limit.maxPages;
        tenantPlan.maxQueries = limit.maxQueries;

        return this.tenantModule.save(tenantPlan);
    }

    async deleteTenant(tenantId:string){
        try{
        // const deleteResult = await this.tenantModule.delete({id:tenantId});
        // if(!deleteResult) throw new Error('Tenant not found');
        // if(deleteResult.affected === 0) throw new Error('Tenant deletion failed');
        const tenDel = await this.tenantModule.findOneBy({id:tenantId});

        if(!tenDel?.isActive) throw new GoneException('Tenant already deleted')
        tenDel.isActive = false;
        const tenDelsave = await this.tenantModule.save(tenDel);
        return {msg: 'Tenant deleted successfully',teanan:tenDelsave}
    }catch(error){
        if (error instanceof HttpException) throw error;
        throw new InternalServerErrorException('Tenant deletion failed');
    }
 }

    async createTenant(tenantId:string,newName:string){
        try {
            const createTen = await this.tenantModule.findOneBy({id:tenantId});
            if(!createTen) throw new Error('Tenant not found')
            createTen.isActive = true;
            createTen.name = newName;
            return this.tenantModule.save(createTen);
        } catch (error) {
           if (error instanceof HttpException) throw error;
        throw new InternalServerErrorException('Tenant creation failed');
    }
    }
}
