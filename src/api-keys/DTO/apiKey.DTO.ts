import { IsOptional, IsString, MaxLength } from "class-validator";


export class apiKeyDTO{
    @IsString()
    @IsOptional()
    @MaxLength(80)
    ApiKeyName: string;
}