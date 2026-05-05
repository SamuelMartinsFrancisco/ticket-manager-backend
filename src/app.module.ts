import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TicketModule } from './modules/tickets/ticket.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './core/guards/auth/auth.guard';
import { RolesGuard } from './core/guards/rbac/roles.guard';
import configuration from './configuration';
import { SeedsModule } from './infrastructure/database/seeds/seeds.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      expandVariables: true,
      envFilePath: '.env',
    }),
    TicketModule,
    UserModule,
    AuthModule,
    SeedsModule
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
