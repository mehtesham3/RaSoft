import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,private db:TypeOrmHealthIndicator,private health:HealthCheckService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/health")
  @HealthCheck()
  healthCheck(){
    return this.health.check([
      () => this.db.pingCheck("database",{timeout:3000})
    ])
  }
}
