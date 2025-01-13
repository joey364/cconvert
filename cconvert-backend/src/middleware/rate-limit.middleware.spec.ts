import { RateLimitMiddleware } from './rate-limit.middleware';
import { ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const createMockRequest = (ip: string) =>
  ({
    ip,
  }) as unknown as Request;

const createMockResponse = () =>
  ({
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  }) as unknown as Response;

const createMockNextFunction = jest.fn();

jest.useFakeTimers({ advanceTimers: true });

describe('RateLimitMiddleware', () => {
  let middleware: RateLimitMiddleware;

  beforeEach(() => {
    middleware = new RateLimitMiddleware();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests to avoid side effects
    jest.clearAllTimers();
  });

  it('should allow the first request from a user', () => {
    const req = createMockRequest('192.168.0.1');
    const res = createMockResponse();
    const next = createMockNextFunction;

    middleware.use(req, res, next);

    // Assert the request was allowed and next was called
    expect(next).toHaveBeenCalled();
    expect(middleware['rateLimitData']['192.168.0.1']).toEqual({
      count: 1,
      lastRequestTime: expect.any(Number),
    });
  });

  it('should allow requests within the time window up to the limit', () => {
    const req = createMockRequest('192.168.0.1');
    const res = createMockResponse();
    const next = createMockNextFunction;
    const MAX_REQUESTS = 5;

    // Simulate multiple requests
    for (let i = 0; i < MAX_REQUESTS - 1; i++) {
      middleware.use(req, res, next);
    }

    // Assert the count is 4 and next is called
    expect(next).toHaveBeenCalledTimes(4);
    expect(middleware['rateLimitData']['192.168.0.1'].count).toBe(4);
  });

  it('should throw ForbiddenException if rate limit is exceeded', () => {
    const req = createMockRequest('192.168.0.1');
    const res = createMockResponse();
    const next = createMockNextFunction;
    const MAX_REQUESTS = 5;

    for (let i = 0; i < MAX_REQUESTS; i++) {
      middleware.use(req, res, next);
    }

    // The 6th request should throw a ForbiddenException
    expect(() => middleware.use(req, res, next)).toThrowError(
      ForbiddenException,
    );
    expect(() => middleware.use(req, res, next)).toThrowError(
      'Rate limit exceeded. Please try again later.',
    );
  });

  it('should reset the count after the time window has passed', async () => {
    const req = createMockRequest('192.168.0.1');
    const res = createMockResponse();
    const next = createMockNextFunction;

    // Simulate 5 requests, reaching the limit
    for (let i = 0; i < 5; i++) {
      middleware.use(req, res, next);
    }

    // Simulate waiting for the time window to pass (more than 1 minute)
    jest.advanceTimersByTime(60 * 1000 + 1); // Advance time by 1 minute + 1ms

    // Now the next request should be allowed, as the time window has passed
    middleware.use(req, res, next);

    // Assert the count is reset and next is called
    expect(next).toHaveBeenCalledTimes(6); // 6th call
    expect(middleware['rateLimitData']['192.168.0.1'].count).toBe(1);
  });

  it('should allow the first request after the time window has passed', () => {
    const req = createMockRequest('192.168.0.1');
    const res = createMockResponse();
    const next = createMockNextFunction;
    const TIME_PERIOD = 60 * 1000;

    // Simulate the first request
    middleware.use(req, res, next);

    // Simulate waiting for the time window to pass (more than 1 minute)
    jest.advanceTimersByTime(TIME_PERIOD + 1);

    // Simulate another request after the time window
    middleware.use(req, res, next);

    // Assert the count is reset and next is called again
    expect(next).toHaveBeenCalledTimes(2);
    expect(middleware['rateLimitData']['192.168.0.1'].count).toBe(1);
  });
});
