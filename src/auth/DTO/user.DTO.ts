import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";


export class RegisterDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(20)
    name:string;

    @IsEmail()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(30)
    email:string;

    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(30)
    password:string;

    @IsIn(['owner', 'admin', 'member', 'guest'])
    @IsString()
    @IsOptional()
    role:string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    apiKeyName:string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    tenantName:string;
}

export class LoginDTO {
    @IsEmail()
    @IsNotEmpty()
    email:string;

    @IsNotEmpty()
    password:string;

}