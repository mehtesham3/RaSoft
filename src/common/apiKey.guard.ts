import { CanActivate, ExecutionContext, HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { DocsService } from "../docs/docs.service.js";

@Injectable()
export class ApiKeyGuard implements CanActivate{
    constructor(private readonly docService:DocsService){}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const tenantId: string | undefined = request.user?.tenantId;
        if (!tenantId) {
        // Fail closed: misordered guards / missing auth context.
        throw new UnauthorizedException('Authentication context missing');
        }
        const apiKey = request.headers['x-api-key'];
        if(!apiKey) throw new Error('API key is missing');
        
        try {
            const isValid = await this.docService.verifyApiKey(tenantId,apiKey);
            if(isValid) request.apiKey = apiKey;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException('API key validation failed');
            }

        return true;
    }
}
