import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../schema/user.js';
import { Tenant } from '../schema/tenant.js';
import { ApiKey } from '../schema/apiKey.js';

@Module({
  imports:[
    TypeOrmModule.forFeature([User,Tenant,ApiKey]),
    JwtModule.register({
      global:true,
      secret: process.env.JWT_SECRET || 'PasswordIs123',
      signOptions:{expiresIn:'24h'}
    })

  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
