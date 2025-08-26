import AuthenticationError from '../../../src/utils/errors/AuthenticationError.js';

describe('AuthenticationError', () => {
  it('should create an authentication error with default properties', () => {
    const message = 'Invalid credentials';
    const error = new AuthenticationError(message);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.message).toBe(message);
    expect(error.name).toBe('AuthenticationError');
    expect(error.statusCode).toBe(498);
    expect(error.isOperational).toBe(true);
  });

  it('should create an authentication error without message', () => {
    const error = new AuthenticationError();

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.message).toBe('');
    expect(error.name).toBe('AuthenticationError');
    expect(error.statusCode).toBe(498);
    expect(error.isOperational).toBe(true);
  });

  it('should create an authentication error with custom message', () => {
    const customMessage = 'Token is invalid';
    const error = new AuthenticationError(customMessage);

    expect(error.message).toBe(customMessage);
    expect(error.name).toBe('AuthenticationError');
    expect(error.statusCode).toBe(498);
    expect(error.isOperational).toBe(true);
  });
});
