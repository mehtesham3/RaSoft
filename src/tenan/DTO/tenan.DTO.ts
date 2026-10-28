import { IsEnum, IsString } from "class-validator";
import { Plan } from "../../schema/tenant.js";

export class upgradePlanDTO {
    @IsEnum(Plan)
    plan:Plan;
}

export class updateName{
    @IsString()
    name:string;
}
