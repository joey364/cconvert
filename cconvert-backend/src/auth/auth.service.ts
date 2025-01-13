import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { LoginRequest } from 'src/dto/auth/auth.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  async login(request: LoginRequest) {
    let user: User;
    try {
      user = await this.prisma.user.findUnique({
        where: { email: request.email },
      });

      if (!user) {
        const hashedPassword = await bcrypt.hash(request.password, 16);
        user = await this.prisma.user.create({
          data: { ...request, password: hashedPassword },
        });
      }

      const passwordMatch = await bcrypt.compare(
        request.password,
        user.password,
      );
      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { userId: user.id, email: user.email };
      const token = this.jwtService.sign(payload);

      return token;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
