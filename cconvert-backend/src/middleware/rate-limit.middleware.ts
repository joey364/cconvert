import {
  ForbiddenException,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitData {
  lastRequestTime: number;
  count: number;
}

const REQUEST_LIMIT = 5;
const TIME_PERIOD = 60 * 1000; // 1 minute

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly rateLimitData: Record<string, RateLimitData> = {};
  private readonly maxRequests = REQUEST_LIMIT;
  private readonly timeWindow = TIME_PERIOD;

  private readonly logger = new Logger(RateLimitMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const userIp = req.ip;

    const currentTime = Date.now();
    const rateData = this.rateLimitData[userIp];

    if (!rateData) {
      this.rateLimitData[userIp] = {
        count: 1,
        lastRequestTime: currentTime,
      };
      next();
      return;
    }

    this.logger.debug(
      `Recieved request from: ${userIp}, number of reqs: ${rateData.count} lastRequestTime: ${rateData.lastRequestTime}`,
    );

    // reset count if lastRequestTimeDelta is greater than the allowed time window
    if (currentTime - rateData.lastRequestTime > this.timeWindow) {
      this.rateLimitData[userIp] = {
        count: 1,
        lastRequestTime: currentTime,
      };
      next();
      return;
    }

    // If within time window, check the count
    if (rateData.count >= this.maxRequests) {
      this.logger.debug(
        `requests from: ${userIp}, has exceeded limit: ${rateData.count} lastRequestTime: ${rateData.lastRequestTime}`,
      );

      throw new ForbiddenException(
        'Rate limit exceeded. Please try again later.',
      );
    }

    // Increment the count if rate limit is not exceeded
    this.rateLimitData[userIp].count += 1;
    next();
  }
}
