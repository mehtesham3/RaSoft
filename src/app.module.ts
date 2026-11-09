import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from './auth/auth.module.js';
import { TenanModule } from './tenan/tenan.module.js';
import { ApiKeysModule } from './api-keys/api-keys.module.js';
import { DocsModule } from './docs/docs.module.js';
import { BullModule } from '@nestjs/bullmq';
import { INGESTION_QUEUE } from './docs/inject.constant.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost', 
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: INGESTION_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URI, //Supabase connection string
        autoLoadEntities: true,
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    TerminusModule,
    AuthModule,
    TenanModule,
    ApiKeysModule,
    DocsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
