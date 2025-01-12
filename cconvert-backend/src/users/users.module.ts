import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma.service';
import { UsersController } from './users.controller';

@Module({
  imports: [],
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
})
export class UsersModule {}
