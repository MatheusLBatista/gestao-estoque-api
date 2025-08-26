import errorHandler from '../../../src/utils/helpers/errorHandler.js';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import AuthenticationError from '../../../src/utils/errors/AuthenticationError.js';
import TokenExpiredError from '../../../src/utils/errors/TokenExpiredError.js';
import CustomError from '../../../src/utils/helpers/CustomError.js';
import CommonResponse from '../../../src/utils/helpers/CommonResponse.js';

// Mock CommonResponse
jest.mock('../../../src/utils/helpers/CommonResponse.js');

describe('errorHandler', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      path: '/test',
      requestId: 'test-request-id'
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res)
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('ZodError handling', () => {
    it('should handle ZodError with validation errors', () => {
      const zodError = new ZodError([
        {
          path: ['field1'],
          message: 'Required field missing'
        },
        {
          path: ['field2', 'nested'],
          message: 'Invalid format'
        }
      ]);

      errorHandler(zodError, req, res, next);

      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        400,
        'validationError',
        null,
        [
          { path: 'field1', message: 'Required field missing' },
          { path: 'field2.nested', message: 'Invalid format' }
        ],
        'Erro de validação. 2 campo(s) inválido(s).'
      );
    });
  });

  describe('MongoDB duplicate key error handling', () => {
    it('should handle duplicate key error (code 11000)', () => {
      const mongoError = {
        code: 11000,
        keyValue: { email: 'test@example.com' }
      };

      errorHandler(mongoError, req, res, next);

      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        409,
        'duplicateEntry',
        'email',
        [{ path: 'email', message: 'O valor "test@example.com" já está em uso.' }],
        'Entrada duplicada no campo "email".'
      );
    });

    it('should handle duplicate key error without keyValue', () => {
      const mongoError = {
        code: 11000,
        keyValue: null
      };

      errorHandler(mongoError, req, res, next);

      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        409,
        'duplicateEntry',
        undefined,
        [{ path: undefined, message: 'O valor "duplicado" já está em uso.' }],
        'Entrada duplicada no campo "undefined".'
      );
    });
  });

  describe('Mongoose validation error handling', () => {
    it('should handle mongoose validation error', () => {
      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = {
        name: { path: 'name', message: 'Name is required' },
        email: { path: 'email', message: 'Invalid email format' }
      };

      errorHandler(validationError, req, res, next);

      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        400,
        'validationError',
        null,
        [
          { path: 'name', message: 'Name is required' },
          { path: 'email', message: 'Invalid email format' }
        ]
      );
    });
  });

  describe('Authentication error handling', () => {
    it('should handle AuthenticationError', () => {
      const authError = new AuthenticationError('Invalid credentials');

      errorHandler(authError, req, res, next);

      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        498,
        'authenticationError',
        null,
        [{ message: 'Invalid credentials' }],
        'Invalid credentials'
      );
    });

    it('should handle TokenExpiredError', () => {
      const tokenError = new TokenExpiredError('Token has expired');

      errorHandler(tokenError, req, res, next);

      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        498,
        'authenticationError',
        null,
        [{ message: 'Token has expired' }],
        'Token has expired'
      );
    });
  });

  describe('CustomError handling', () => {
    it('should handle CustomError with tokenExpired type', () => {
      const customError = new CustomError({ 
        statusCode: 401, 
        errorType: 'tokenExpired', 
        field: null, 
        details: [], 
        customMessage: 'Please login again' 
      });

      errorHandler(customError, req, res, next);

      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        401,
        'tokenExpired',
        null,
        [{ message: 'Please login again' }],
        'Please login again'
      );
    });

    it('should handle CustomError with tokenExpired type and default message', () => {
      const customError = new CustomError({ 
        statusCode: 401, 
        errorType: 'tokenExpired' 
      });

      errorHandler(customError, req, res, next);

      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        401,
        'tokenExpired',
        null,
        [{ message: 'Token expirado.' }],
        'Token expirado. Por favor, faça login novamente.'
      );
    });

    it('should handle generic CustomError (not tokenExpired)', () => {
      const customError = new CustomError({ 
        statusCode: 400, 
        errorType: 'customType', 
        field: 'field1', 
        details: [{ detail: 'error' }], 
        customMessage: 'Custom message' 
      });

      errorHandler(customError, req, res, next);

      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        400,
        'customType',
        'field1',
        [{ detail: 'error' }],
        'Custom message'
      );
    });
  });

  describe('Operational error handling', () => {
    it('should handle operational errors', () => {
      const operationalError = new Error('Operational error');
      operationalError.isOperational = true;
      operationalError.statusCode = 400;
      operationalError.errorType = 'businessLogic';
      operationalError.field = 'quantity';
      operationalError.details = [{ message: 'Insufficient stock' }];
      operationalError.customMessage = 'Not enough items in stock';

      errorHandler(operationalError, req, res, next);

      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        400,
        'businessLogic',
        'quantity',
        [{ message: 'Insufficient stock' }],
        'Not enough items in stock'
      );
    });

    it('should handle operational errors with defaults', () => {
      const operationalError = new Error('Operational error');
      operationalError.isOperational = true;
      operationalError.statusCode = 400;

      errorHandler(operationalError, req, res, next);

      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        400,
        'operationalError',
        null,
        [],
        'Erro operacional.'
      );
    });
  });

  describe('Internal server error handling', () => {
    it('should handle internal server errors in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const internalError = new Error('Internal server error');

      errorHandler(internalError, req, res, next);

      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        500,
        'serverError',
        null,
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringMatching(/Erro interno do servidor\. Referência: .+/)
          })
        ])
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle internal server errors in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const internalError = new Error('Internal server error');
      internalError.stack = 'Error stack trace';

      errorHandler(internalError, req, res, next);

      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        500,
        'serverError',
        null,
        [{ message: 'Internal server error', stack: 'Error stack trace' }]
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Request without requestId', () => {
    it('should handle errors when req.requestId is not present', () => {
      req.requestId = undefined;
      const error = new Error('Test error');

      errorHandler(error, req, res, next);

      expect(CommonResponse.error).toHaveBeenCalled();
    });
  });
});
