import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKey } from '../schema/apiKey.js';
import { Repository } from 'typeorm';
import { Tenant } from '../schema/tenant.js';
import { apikeyUtils, keyPrfix } from '../common/apiKey.gen.js';
import { apiKeyDTO } from './DTO/apiKey.DTO.js';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey) private apiModule: Repository<ApiKey>,
    @InjectRepository(Tenant) private tenModule: Repository<Tenant>,
  ) {}

  async createApiKey(tenantId: string, keyName: string) {
    try{
        const tenan = await this.tenModule.findOneBy({ id: tenantId });
    if (!tenan?.isActive) throw new NotFoundException('Tenant not found');
    const tenMax = tenan.maxApiKey;
    const { plainKey, keyHsh } = apikeyUtils.generate();
    if (tenMax == 0)
      throw new ConflictException(
        'Your key limit is reached you can revoke and generate new by visiting /api-keys/:id/rotate',
      );
    if (tenMax !== -1 && tenMax < 1) {
      throw new ConflictException(
        'Key limit reached. Revoke a key or rotate at /api-keys/:id/rotate',
      );
    }

    const apiKey = this.apiModule.create({
      name: keyName ?? 'Default API key',
      keyPrefix: keyPrfix.LIVE,
      keyHash: keyHsh,
      tenantId: tenantId,
    });
    if (tenMax > 0) {
      tenan.maxApiKey = tenMax - 1;
    }

    const [savedApiKey] = await Promise.all([
    this.apiModule.save(apiKey),
    this.tenModule.save(tenan),
    ]);
    // const tenSav = this.tenModule.save(tenan);
    // const apiSav = this.apiModule.save(apiKey);
    const { keyHash, ...withoutHash } = savedApiKey;

    const dispResult = {
      msg: 'API key generated successfully',
      apiKey: plainKey,
      apiDetail: withoutHash,
      warning: 'Key is displayed only once, Save it carefully for future use '
    };
    return dispResult;
    }catch(error){
        if(error instanceof HttpException) throw error;
        throw new InternalServerErrorException('Api key creation failed')
    }
  }

  async listKeys(tenantId:string){
    try{
      const keysAvail = await this.apiModule.findBy({tenantId});
    const data : any = [];
    keysAvail.forEach(ele => {
      const {keyHash, ...withoutHash} = ele;
      data.push(withoutHash);
    });
    if(data.length === 0) throw new NotFoundException('Api key is not available')
    return {data};
   }catch(error){
      if(error instanceof HttpException) throw error;
        throw new InternalServerErrorException('Api key display failed')
    }
  }

  async deleteKeys(tenantId:string,keyId:string){
    try {
      const revoke = await this.apiModule.findOneBy({id:keyId,tenantId});
      if(!revoke || !revoke.isActive) throw new NotFoundException('Api key is not available or already revoke')
        
      revoke.isActive = false;
      const data = {
        msg:"your apikey is revoke ",
        resp: await this.apiModule.save(revoke)
      }
      return data;
    } catch (error) {
      if(error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Api key display failed')
    }
  }

  async revokeAndGen(tenantId:string,keyId:string,keyname:string){
    try {
      const {plainKey,keyHsh,keyPrefix}:any = apikeyUtils.generate();
      await this.deleteKeys(tenantId,keyId);
      const genKey = this.apiModule.create({
        name:keyname ?? 'Default API key',
        tenantId:tenantId,
        keyHash:keyHsh,
        keyPrefix:keyPrefix,
      });

      const saved = await this.apiModule.save(genKey)
      const {keyHash, ...withoutHash} = saved;
      const respData = {
      msg: 'API key generated successfully',
      apiKey: plainKey,
      apiDetail: withoutHash,
      warning: 'Key is displayed only once, Save it carefully for future use '
    };

    return respData;
    } catch (error) {
      if(error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Api key revoke & generate failed')
    }
  }

  async adminRevokeUnrevoke(keyId:string){
    try {
      const apiDetail = await this.apiModule.findOneBy({id:keyId});
      if(!apiDetail) throw new NotFoundException('This key is not found');
      
      if(apiDetail.isActive) {
        apiDetail.isActive = false;
      }else{
        apiDetail.isActive = true;
      }
      const dispResult = {
        msg: !apiDetail.isActive ? `key is revoked no longer in use` : `key is unrevoked and ready to use`,
        data: await this.apiModule.save(apiDetail)
      }

      return dispResult;
    } catch (error) {
      if(error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Api key revoke or unrevoke failed')
    }
  }

}
