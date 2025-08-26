// src/utils/errors/AuthenticationError.js
class AuthenticationError extends Error {
    constructor(message) {
      super(message);
      this.name = 'AuthenticationError';
      this.statusCode = 498;
      this.isOperational = true;
    }
  }
  
  export default AuthenticationError;
  