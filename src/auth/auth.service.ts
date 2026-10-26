import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../schema/user.js';
import { Repository } from 'typeorm';
import { LoginDTO, RegisterDTO } from './DTO/user.DTO.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Tenant } from '../schema/tenant.js';
import { ApiKey } from '../schema/apiKey.js';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userModel: Repository<User>,
    @InjectRepository(Tenant) private tenantModel: Repository<Tenant>,
    @InjectRepository(ApiKey) private apiKeyModel: Repository<ApiKey>,
    private jwtService: JwtService,
  ) {}

  static generate(): {plainKey:string,keyHash:string,keyPrefix:unknown} {
    const random = randomBytes(27).toString('hex')

    const plainKey = `${process.env.DEFAULT_KEY_PREFIX}${random}`;
    const keyHash = createHash('sha256').update(plainKey).digest('hex');

    const keyPrefix = process.env.DEFAULT_KEY_PREFIX;  //plainKey.substring(0,12);

    return {plainKey,keyHash,keyPrefix}
  }

  async userSignIn(registerDTO: RegisterDTO): Promise<{ user: Object; apiKey: ApiKey; tenant: Tenant; plainKey:string; warning:string }> {
    const existingUser = await this.userModel.findOne({
      where: { email: registerDTO.email },
    });
    if (existingUser) throw new ConflictException('Email already exists');

    const hashPass = await bcrypt.hash(registerDTO.password, 10);
    const newUser = this.userModel.create({
      name: registerDTO.name,
      email: registerDTO.email,
      role: registerDTO.role ?? 'owner',
      passwordHash: hashPass,
    });

    const nwUsr = await this.userModel.save(newUser); // Save the new user

    const {keyHash,keyPrefix,plainKey} = AuthService.generate(); //api key generation

    const tenan = this.tenantModel.create({ 
      name: registerDTO.tenantName ?? registerDTO.name,
        userId: nwUsr.id
      })
    const ten = await this.tenantModel.save(tenan);  // Save the new tenant

      const apiKey = this.apiKeyModel.create({
        name: registerDTO.apiKeyName ?? 'Default API Key',
        keyPrefix:process.env.DEFAULT_KEY_PREFIX,
        keyHash:keyHash,
        tenantId: ten.id
      });

      await this.apiKeyModel.save(apiKey);  // Save the new API key

    const {passwordHash, ...userData} = nwUsr;

    const dispResult = { user: userData, apiKey, tenant: ten, plainKey, warning: 'API key will be shown only once, please save it securely.' };

    return dispResult;
  }

  async userLogin(loginDTO: LoginDTO) {
    try{
      const isUser = await this.userModel.findOne({
      where: { email: loginDTO.email },
    });
    if (!isUser) throw new NotFoundException('Invalid Credentials ');

    const isPasswordValid = await bcrypt.compare(
      loginDTO.password,
      isUser.passwordHash,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    // const tenant = await this.tenantModel.findOne({where:{userId:isUser.id}});
    const tenant = await this.tenantModel.findOneBy({userId:isUser.id});
    if(!tenant) throw new NotFoundException('Tenant not found for the user');
    const payLoad = { usrId: isUser.id, email: isUser.email, role: isUser.role, tenantId: tenant.id};
    const token = await this.jwtService.signAsync(payLoad);

    return { token };
  } catch (error) {
 
    console.error(error);
    return `Error occur due to ${error}`;
  }
  }

  async usrProfile(userId:string) {
    const user = await this.userModel.findOne({where:{id:userId}});
    if(!user) throw new NotFoundException('User not found');
    const { passwordHash, ...userData } = user;
    return {msg:`Marhaba ${userData.name}`, user:userData};
  }
}
