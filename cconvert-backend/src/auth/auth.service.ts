import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { LoginRequest, LoginResponse } from 'src/auth/auth.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import IUser from 'src/users/IUser';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(request: LoginRequest) {
    let user: User;
    user = await this.prisma.user.findUnique({
      where: { email: request.email },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(request.password, 16);
      user = await this.prisma.user.create({
        data: { ...request, password: hashedPassword },
      });
    }

    const passwordMatch = await bcrypt.compare(request.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: IUser = { userId: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    const response = new LoginResponse();
    response.token = token;

    return response;
  }
}
