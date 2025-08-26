import TokenExpiredError from '../../../src/utils/errors/TokenExpiredError.js';

describe('TokenExpiredError', () => {
  it('should create a token expired error with default properties', () => {
    const message = 'Token has expired';
    const error = new TokenExpiredError(message);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(TokenExpiredError);
    expect(error.message).toBe(message);
    expect(error.name).toBe('TokenExpiredError');
    expect(error.statusCode).toBe(498);
    expect(error.isOperational).toBe(true);
  });

  it('should create a token expired error without message', () => {
    const error = new TokenExpiredError();

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(TokenExpiredError);
    expect(error.message).toBe('');
    expect(error.name).toBe('TokenExpiredError');
    expect(error.statusCode).toBe(498);
    expect(error.isOperational).toBe(true);
  });

  it('should create a token expired error with custom message', () => {
    const customMessage = 'JWT token expired at 2025-07-10';
    const error = new TokenExpiredError(customMessage);

    expect(error.message).toBe(customMessage);
    expect(error.name).toBe('TokenExpiredError');
    expect(error.statusCode).toBe(498);
    expect(error.isOperational).toBe(true);
  });
});
