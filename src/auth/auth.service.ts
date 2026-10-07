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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userModel: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async userSignIn(registerDTO: RegisterDTO): Promise<User> {
    const existingUser = await this.userModel.findOne({
      where: { email: registerDTO.email },
    });
    if (existingUser) throw new ConflictException('Email already exists');

    const hashPass = await bcrypt.hash(registerDTO.password, 10);
    const newUser = this.userModel.create({
      name: registerDTO.name,
      email: registerDTO.email,
      role: registerDTO.role ?? 'user',
      passwordHash: hashPass,
    });

    await this.userModel.save(newUser);
    return newUser;
  }

  async userLogin(loginDTO: LoginDTO) {
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

    const payLoad = { id: isUser.id, email: isUser.email, role: isUser.role };
    const token = await this.jwtService.signAsync(payLoad);
    
    return { token };
  }

  async usrProfile(userId:string) {
    const user = await this.userModel.findOne({where:{id:userId}});
    if(!user) throw new NotFoundException('User not found');
    const { passwordHash, ...userData } = user;
    return {msg:`Marhaba ${userData.name}`, user:userData};
  }
}
