import {
  BadRequestException,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

export class NonceValidatorMiddleware implements NestMiddleware {
  private nonceExpiry = 5 * 60 * 1000; // 5 minutes
  private logger = new Logger(NonceValidatorMiddleware.name);
  private usedNonces = new Map<string, number>(); // Map<hashedNonce, timestamp>

  use(req: Request, res: Response, next: NextFunction) {
    const nonce = req.headers['x-cconvert-nonce'] as string;

    this.logger.debug(`Received nonce: ${nonce}`);

    if (!nonce) {
      throw new BadRequestException('Nonce is missing');
    }

    const nonceParts = nonce.split('-');
    if (nonceParts.length !== 2) {
      throw new BadRequestException('Invalid nonce format');
    }

    const [timestampStr, randomPart] = nonceParts;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      throw new BadRequestException('Invalid nonce timestamp');
    }

    const currentTime = Date.now();
    if (currentTime - timestamp > this.nonceExpiry) {
      throw new BadRequestException('Nonce has expired');
    }

    const randomRegex = /^[a-f0-9]{16}$/i;
    if (!randomRegex.test(randomPart)) {
      throw new BadRequestException('Invalid nonce random part');
    }

    const hashedNonce = crypto.createHash('sha256').update(nonce).digest('hex');

    if (this.usedNonces.has(hashedNonce)) {
      throw new UnauthorizedException('Nonce already used');
    }

    this.usedNonces.set(hashedNonce, currentTime);

    this.cleanupExpiredNonces();

    next();
  }

  private cleanupExpiredNonces() {
    const now = Date.now();
    for (const [nonce, timestamp] of this.usedNonces) {
      if (now - timestamp > this.nonceExpiry) {
        this.usedNonces.delete(nonce);
      }
    }
  }
}
