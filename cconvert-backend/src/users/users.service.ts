import { Injectable } from '@nestjs/common';
import { LoginRequest } from 'src/dto/auth/auth.dto';
import { UserResponse } from 'src/dto/user/user.response.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService
  ) { }

  async getUserByEmail(email: string) {
    const user = await this.prisma.user
      .findUnique({ where: { email } })

    return UserResponse.fromUser(user)
  }

  async createUser(dto: LoginRequest) {
    const newUser = await this.prisma.user.create({
      data: { ...dto }
    })

    return UserResponse.fromUser(newUser)
  }
}
