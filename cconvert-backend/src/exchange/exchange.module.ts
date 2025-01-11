import { Module } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [ExchangeService, PrismaService],
  controllers: [ExchangeController]
})
export class ExchangeModule { }
