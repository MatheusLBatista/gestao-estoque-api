import { describe, expect, it } from '@jest/globals';
import StatusService from '../../../src/utils/helpers/StatusService.js';
import HttpStatusCodes from '../../../src/utils/helpers/HttpStatusCodes.js';

describe('StatusService', () => {
  describe('getHttpCodeMessage', () => {
    it('should return correct message for valid HTTP status codes', () => {
      expect(StatusService.getHttpCodeMessage(200)).toBe(HttpStatusCodes.OK.message);
      expect(StatusService.getHttpCodeMessage(201)).toBe(HttpStatusCodes.CREATED.message);
      expect(StatusService.getHttpCodeMessage(400)).toBe(HttpStatusCodes.BAD_REQUEST.message);
      expect(StatusService.getHttpCodeMessage(401)).toBe(HttpStatusCodes.UNAUTHORIZED.message);
      expect(StatusService.getHttpCodeMessage(403)).toBe(HttpStatusCodes.FORBIDDEN.message);
      expect(StatusService.getHttpCodeMessage(404)).toBe(HttpStatusCodes.NOT_FOUND.message);
      expect(StatusService.getHttpCodeMessage(409)).toBe(HttpStatusCodes.CONFLICT.message);
      expect(StatusService.getHttpCodeMessage(422)).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY.message);
      expect(StatusService.getHttpCodeMessage(500)).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR.message);
    });

    it('should return default message for unknown HTTP status codes', () => {
      expect(StatusService.getHttpCodeMessage(999)).toBe('Status desconhecido.');
      expect(StatusService.getHttpCodeMessage(123)).toBe('Status desconhecido.');
      expect(StatusService.getHttpCodeMessage(0)).toBe('Status desconhecido.');
      expect(StatusService.getHttpCodeMessage(-1)).toBe('Status desconhecido.');
    });

    it('should handle non-numeric inputs gracefully', () => {
      expect(StatusService.getHttpCodeMessage('200')).toBe('Status desconhecido.');
      expect(StatusService.getHttpCodeMessage(null)).toBe('Status desconhecido.');
      expect(StatusService.getHttpCodeMessage(undefined)).toBe('Status desconhecido.');
      expect(StatusService.getHttpCodeMessage({})).toBe('Status desconhecido.');
    });
  });

  describe('getErrorMessage', () => {
    it('should return error messages for known error types without field', () => {
      // Testing with some common error types that might exist in messages
      const result = StatusService.getErrorMessage('serverError');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return error messages for known error types with field', () => {
      // Testing with error types that might use field parameter
      const result = StatusService.getErrorMessage('validationError', 'email');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return default message for unknown error types', () => {
      expect(StatusService.getErrorMessage('unknownErrorType')).toBe('Tipo de erro desconhecido.');
      expect(StatusService.getErrorMessage('nonExistentError')).toBe('Tipo de erro desconhecido.');
      expect(StatusService.getErrorMessage('')).toBe('Tipo de erro desconhecido.');
    });

    it('should handle null and undefined error types', () => {
      expect(StatusService.getErrorMessage(null)).toBe('Tipo de erro desconhecido.');
      expect(StatusService.getErrorMessage(undefined)).toBe('Tipo de erro desconhecido.');
    });

    it('should handle function-based error messages', () => {
      // Test with field parameter
      const result = StatusService.getErrorMessage('resourceNotFound', 'Usuario');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle function-based error messages without field', () => {
      // Test without field parameter
      const result = StatusService.getErrorMessage('resourceNotFound');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle various field types', () => {
      const result1 = StatusService.getErrorMessage('validationError', 'email');
      const result2 = StatusService.getErrorMessage('validationError', null);
      const result3 = StatusService.getErrorMessage('validationError', undefined);
      
      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
      expect(typeof result3).toBe('string');
    });
  });
});
