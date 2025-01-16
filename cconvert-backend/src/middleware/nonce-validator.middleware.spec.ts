import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { NonceValidatorMiddleware } from './nonce-validator.middleware';

describe('NonceValidatorMiddleware', () => {
  let middleware: NonceValidatorMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    middleware = new NonceValidatorMiddleware();
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should throw BadRequestException if nonce is missing', () => {
    mockRequest.headers = {};

    expect(() =>
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      ),
    ).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if nonce format is invalid', () => {
    mockRequest.headers = { 'x-cconvert-nonce': 'invalid-nonce' };

    expect(() =>
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      ),
    ).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if nonce timestamp is invalid', () => {
    mockRequest.headers = {
      'x-cconvert-nonce': `invalidtimestamp-${'a'.repeat(16)}`,
    };

    expect(() =>
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      ),
    ).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if nonce has expired', () => {
    const oldTimestamp = Date.now() - 6 * 60 * 1000; // 6 minutes ago
    mockRequest.headers = {
      'x-cconvert-nonce': `${oldTimestamp}-${'a'.repeat(16)}`,
    };

    expect(() =>
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      ),
    ).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if random part of nonce is invalid', () => {
    const timestamp = Date.now();
    mockRequest.headers = {
      'x-cconvert-nonce': `${timestamp}-invalidRandomPart`,
    };

    expect(() =>
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      ),
    ).toThrow(BadRequestException);
  });

  it('should throw UnauthorizedException if nonce is already used', () => {
    const timestamp = Date.now();
    const nonce = `${timestamp}-${'a'.repeat(16)}`;
    mockRequest.headers = { 'x-cconvert-nonce': nonce };

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    // Second use: Should throw
    expect(() =>
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      ),
    ).toThrow(UnauthorizedException);
  });

  it('should call next() if nonce is valid', () => {
    const timestamp = Date.now();
    const nonce = `${timestamp}-${'a'.repeat(16)}`;
    mockRequest.headers = { 'x-cconvert-nonce': nonce };

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(nextFunction).toHaveBeenCalledTimes(1);
  });

  it('should periodically clean up expired nonces', () => {
    const oldTimestamp = Date.now() - 6 * 60 * 1000; // 6 minutes ago
    const validTimestamp = Date.now();
    const expiredNonce = `${oldTimestamp}-${'a'.repeat(16)}`;
    const validNonce = `${validTimestamp}-${'b'.repeat(16)}`;

    middleware['usedNonces'].set(expiredNonce, oldTimestamp);
    middleware['usedNonces'].set(validNonce, validTimestamp);

    middleware['cleanupExpiredNonces']();

    expect(middleware['usedNonces'].has(expiredNonce)).toBe(false);
    expect(middleware['usedNonces'].has(validNonce)).toBe(true);
  });
});
