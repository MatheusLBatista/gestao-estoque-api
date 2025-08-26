// src/utils/errors/TokenExpiredError.js
class TokenExpiredError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TokenExpiredError';
    this.statusCode = 498;
    this.isOperational = true;
  }
}

export default TokenExpiredError;
