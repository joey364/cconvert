import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      this.logger.log('Connecting to the database');
      await this.$connect();
    } catch {
      this.logger.warn('Failed to connect to the db');
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {
      this.logger.warn('Failed to disconnect from the db properly');
    }
  }
}
