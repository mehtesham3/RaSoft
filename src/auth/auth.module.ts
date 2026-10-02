import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../schema/user.js';

@Module({
  imports:[
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global:true,
      secret: process.env.JWT_SECRET || 'PasswordIs123',
      signOptions:{expiresIn:'1h'}
    })

  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
