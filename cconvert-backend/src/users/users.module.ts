import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports:[],
  providers: [UsersService, PrismaService]
})
export class UsersModule {}
