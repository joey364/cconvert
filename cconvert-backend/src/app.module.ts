import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma.service';
import { AuthController } from './auth/auth.controller';
import { UsersService } from './users/users.service';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth/auth.service';
import { ExchangeModule } from './exchange/exchange.module';
import { TransactionsService } from './transactions/transactions.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ExchangeModule,
  ],
  controllers: [AuthController],
  providers: [UsersService, PrismaService, AuthService, TransactionsService],
})
export class AppModule {}
