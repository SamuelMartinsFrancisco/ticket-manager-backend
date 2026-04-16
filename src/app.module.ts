import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TicketModule } from './modules/tickets/ticket.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './core/guards/auth/auth.guard';
import { RolesGuard } from './core/guards/rbac/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        ENCRYPTION_SECRET: Joi.string().required(),
        BLIND_INDEX_SECRET: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
      })
    }),
    TicketModule,
    UserModule,
    AuthModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule { }
