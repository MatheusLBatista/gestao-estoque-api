import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import CommonResponse from '../../../src/utils/helpers/CommonResponse.js';
import StatusService from '../../../src/utils/helpers/StatusService.js';

describe('CommonResponse', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('Constructor', () => {
    it('should create instance with default values', () => {
      const response = new CommonResponse('Test message');
      
      expect(response.message).toBe('Test message');
      expect(response.data).toBeNull();
      expect(response.errors).toEqual([]);
      expect(response.error).toBe(false);
      expect(response.code).toBe(200);
    });

    it('should create instance with custom values', () => {
      const testData = { id: 1, name: 'Test' };
      const testErrors = ['Error 1', 'Error 2'];
      const response = new CommonResponse('Custom message', testData, testErrors, true, 400);
      
      expect(response.message).toBe('Custom message');
      expect(response.data).toEqual(testData);
      expect(response.errors).toEqual(testErrors);
      expect(response.error).toBe(true);
      expect(response.code).toBe(400);
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON structure', () => {
      const testData = { id: 1, name: 'Test' };
      const response = new CommonResponse('Test message', testData, [], false, 200);
      const json = response.toJSON();
      
      expect(json).toEqual({
        error: false,
        code: 200,
        message: 'Test message',
        data: testData,
        errors: []
      });
    });
  });

  describe('success', () => {
    it('should return success response with default values', () => {
      const testData = { id: 1, name: 'Test' };
      jest.spyOn(StatusService, 'getHttpCodeMessage').mockReturnValue('Success');
      
      CommonResponse.success(mockRes, testData);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: false,
        code: 200,
        message: 'Success',
        data: testData,
        errors: []
      });
    });

    it('should return success response with custom code and message', () => {
      const testData = { id: 1, name: 'Test' };
      
      CommonResponse.success(mockRes, testData, 201, 'Custom success message');
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: false,
        code: 201,
        message: 'Custom success message',
        data: testData,
        errors: []
      });
    });

    it('should use StatusService when no custom message provided', () => {
      const testData = { id: 1, name: 'Test' };
      const mockMessage = 'Status Service Message';
      jest.spyOn(StatusService, 'getHttpCodeMessage').mockReturnValue(mockMessage);
      
      CommonResponse.success(mockRes, testData, 202);
      
      expect(StatusService.getHttpCodeMessage).toHaveBeenCalledWith(202);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: false,
        code: 202,
        message: mockMessage,
        data: testData,
        errors: []
      });
    });
  });

  describe('error', () => {
    it('should return error response with default message from StatusService', () => {
      const testErrors = ['Error 1', 'Error 2'];
      const mockErrorMessage = 'Validation Error';
      jest.spyOn(StatusService, 'getErrorMessage').mockReturnValue(mockErrorMessage);
      
      CommonResponse.error(mockRes, 400, 'validationError', 'field', testErrors);
      
      expect(StatusService.getErrorMessage).toHaveBeenCalledWith('validationError', 'field');
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: true,
        code: 400,
        message: mockErrorMessage,
        data: null,
        errors: testErrors
      });
    });

    it('should return error response with custom message', () => {
      const customMessage = 'Custom error message';
      
      CommonResponse.error(mockRes, 404, 'notFound', null, [], customMessage);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: true,
        code: 404,
        message: customMessage,
        data: null,
        errors: []
      });
    });

    it('should handle error with minimal parameters', () => {
      const mockErrorMessage = 'Server Error';
      jest.spyOn(StatusService, 'getErrorMessage').mockReturnValue(mockErrorMessage);
      
      CommonResponse.error(mockRes, 500, 'serverError');
      
      expect(StatusService.getErrorMessage).toHaveBeenCalledWith('serverError', null);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: true,
        code: 500,
        message: mockErrorMessage,
        data: null,
        errors: []
      });
    });
  });

  describe('created', () => {
    it('should return created response with default message', () => {
      const testData = { id: 1, name: 'Created Item' };
      jest.spyOn(StatusService, 'getHttpCodeMessage').mockReturnValue('Created');
      
      CommonResponse.created(mockRes, testData);
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: false,
        code: 201,
        message: 'Created',
        data: testData,
        errors: []
      });
    });

    it('should return created response with custom message', () => {
      const testData = { id: 1, name: 'Created Item' };
      const customMessage = 'Item created successfully';
      
      CommonResponse.created(mockRes, testData, customMessage);
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: false,
        code: 201,
        message: customMessage,
        data: testData,
        errors: []
      });
    });
  });

  describe('serverError', () => {
    it('should return server error response with default message', () => {
      const mockErrorMessage = 'Internal Server Error';
      jest.spyOn(StatusService, 'getErrorMessage').mockReturnValue(mockErrorMessage);
      
      CommonResponse.serverError(mockRes);
      
      expect(StatusService.getErrorMessage).toHaveBeenCalledWith('serverError');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: true,
        code: 500,
        message: mockErrorMessage,
        data: null,
        errors: []
      });
    });

    it('should return server error response with custom message', () => {
      const customMessage = 'Custom server error';
      
      CommonResponse.serverError(mockRes, customMessage);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: true,
        code: 500,
        message: customMessage,
        data: null,
        errors: []
      });
    });
  });

  describe('getSwaggerSchema', () => {
    it('should return swagger schema with default values', () => {
      const schema = CommonResponse.getSwaggerSchema();
      
      expect(schema).toEqual({
        type: "object",
        properties: {
          data: { type: "array", items: {}, example: [] },
          message: { type: "string", example: "Operação realizada com sucesso" },
          errors: { type: "array", example: [] }
        }
      });
    });

    it('should return swagger schema with schema reference', () => {
      const schemaRef = "#/components/schemas/User";
      const customMessage = "User created successfully";
      
      const schema = CommonResponse.getSwaggerSchema(schemaRef, customMessage);
      
      expect(schema).toEqual({
        type: "object",
        properties: {
          data: { $ref: schemaRef },
          message: { type: "string", example: customMessage },
          errors: { type: "array", example: [] }
        }
      });
    });

    it('should return swagger schema with custom message only', () => {
      const customMessage = "Operation completed";
      
      const schema = CommonResponse.getSwaggerSchema(null, customMessage);
      
      expect(schema).toEqual({
        type: "object",
        properties: {
          data: { type: "array", items: {}, example: [] },
          message: { type: "string", example: customMessage },
          errors: { type: "array", example: [] }
        }
      });
    });
  });
});
