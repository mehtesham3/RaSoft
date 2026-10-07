import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDTO, RegisterDTO } from './DTO/user.DTO.js';
import { authMidd } from '../common/auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

    @Get()
    respond(){
      return { msg: 'Auth endpoint' };
    }

    @Post('register')
    async register(@Body() register:RegisterDTO) {
      const rgstrUsr = await this.authService.userSignIn(register);
      return { msg: 'User registered successfully' ,user: rgstrUsr};
    }

    @Post('login')
    async login(@Body() login:LoginDTO){
      const user = await this.authService.userLogin(login);
      return { msg: 'User logged in successfully' ,user};
    }

    @Get('profile')
    @UseGuards(authMidd)
    async profile(@Request() req:unknown){
      const user = await this.authService.usrProfile((req as any).user.id);
      return user;
    }

}
