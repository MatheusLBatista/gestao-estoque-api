// tests/utils/helpers/index.test.js

import * as helpers from '../../../src/utils/helpers/index.js';
import { 
    CommonResponse, 
    CustomError, 
    HttpStatusCodes, 
    errorHandler, 
    messages, 
    StatusService,
    asyncWrapper 
} from '../../../src/utils/helpers/index.js';

describe('Helpers Index Export', () => {
    describe('Named exports', () => {
        test('should export CommonResponse', () => {
            expect(CommonResponse).toBeDefined();
            expect(typeof CommonResponse).toBe('function');
        });

        test('should export CustomError', () => {
            expect(CustomError).toBeDefined();
            expect(typeof CustomError).toBe('function');
        });

        test('should export HttpStatusCodes', () => {
            expect(HttpStatusCodes).toBeDefined();
            expect(typeof HttpStatusCodes).toBe('function');
        });

        test('should export errorHandler', () => {
            expect(errorHandler).toBeDefined();
            expect(typeof errorHandler).toBe('function');
        });

        test('should export messages', () => {
            expect(messages).toBeDefined();
            expect(typeof messages).toBe('object');
        });

        test('should export StatusService', () => {
            expect(StatusService).toBeDefined();
            expect(typeof StatusService).toBe('function');
        });

        test('should export asyncWrapper', () => {
            expect(asyncWrapper).toBeDefined();
            expect(typeof asyncWrapper).toBe('function');
        });
    });

    describe('Wildcard import', () => {
        test('should export all modules through wildcard import', () => {
            expect(helpers.CommonResponse).toBeDefined();
            expect(helpers.CustomError).toBeDefined();
            expect(helpers.HttpStatusCodes).toBeDefined();
            expect(helpers.errorHandler).toBeDefined();
            expect(helpers.messages).toBeDefined();
            expect(helpers.StatusService).toBeDefined();
            expect(helpers.asyncWrapper).toBeDefined();
        });

        test('should have correct object structure', () => {
            const exportedKeys = Object.keys(helpers);
            const expectedKeys = [
                'CommonResponse',
                'CustomError', 
                'HttpStatusCodes',
                'errorHandler',
                'messages',
                'StatusService',
                'asyncWrapper'
            ];

            expectedKeys.forEach(key => {
                expect(exportedKeys).toContain(key);
            });
        });
    });

    describe('Export types validation', () => {
        test('CommonResponse should be a class/constructor', () => {
            expect(typeof helpers.CommonResponse).toBe('function');
            expect(helpers.CommonResponse.prototype).toBeDefined();
        });

        test('CustomError should be a class/constructor', () => {
            expect(typeof helpers.CustomError).toBe('function');
            expect(helpers.CustomError.prototype).toBeDefined();
        });

        test('HttpStatusCodes should be a class with static properties', () => {
            expect(typeof helpers.HttpStatusCodes).toBe('function');
            expect(helpers.HttpStatusCodes).not.toBeNull();
        });

        test('errorHandler should be a function', () => {
            expect(typeof helpers.errorHandler).toBe('function');
        });

        test('messages should be an object', () => {
            expect(typeof helpers.messages).toBe('object');
            expect(helpers.messages).not.toBeNull();
        });

        test('StatusService should be a class/constructor', () => {
            expect(typeof helpers.StatusService).toBe('function');
            expect(helpers.StatusService.prototype).toBeDefined();
        });

        test('asyncWrapper should be a function', () => {
            expect(typeof helpers.asyncWrapper).toBe('function');
        });
    });

    describe('Export consistency', () => {
        test('named imports should match wildcard imports', () => {
            expect(CommonResponse).toBe(helpers.CommonResponse);
            expect(CustomError).toBe(helpers.CustomError);
            expect(HttpStatusCodes).toBe(helpers.HttpStatusCodes);
            expect(errorHandler).toBe(helpers.errorHandler);
            expect(messages).toBe(helpers.messages);
            expect(StatusService).toBe(helpers.StatusService);
            expect(asyncWrapper).toBe(helpers.asyncWrapper);
        });
    });

    describe('Integration test', () => {
        test('should be able to instantiate exported classes', () => {
            // Test CommonResponse instantiation
            const response = new CommonResponse(200, 'Success', {});
            expect(response).toBeInstanceOf(CommonResponse);

            // Test CustomError instantiation
            const error = new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'test',
                details: [],
                customMessage: 'Test error'
            });
            expect(error).toBeInstanceOf(CustomError);

            // Test StatusService instantiation
            const statusService = new StatusService();
            expect(statusService).toBeInstanceOf(StatusService);
        });

        test('should be able to use exported functions', () => {
            // Test asyncWrapper usage
            const testFunction = async () => 'test';
            const wrappedFunction = asyncWrapper(testFunction);
            expect(typeof wrappedFunction).toBe('function');

            // Test that HttpStatusCodes has expected properties
            expect(typeof HttpStatusCodes.OK).toBe('object');
            expect(HttpStatusCodes.OK.code).toBe(200);

            // Test that messages object has properties
            expect(typeof messages).toBe('object');
        });
    });

    describe('Index file execution', () => {
        test('should execute all export statements', () => {
            // Import the module to execute the export statements
            const indexModule = require('../../../src/utils/helpers/index.js');
            
            expect(indexModule).toBeDefined();
            expect(indexModule.CommonResponse).toBeDefined();
            expect(indexModule.CustomError).toBeDefined();
            expect(indexModule.HttpStatusCodes).toBeDefined();
            expect(indexModule.errorHandler).toBeDefined();
            expect(indexModule.messages).toBeDefined();
            expect(indexModule.StatusService).toBeDefined();
            expect(indexModule.asyncWrapper).toBeDefined();
        });

        test('should have correct module structure', () => {
            const indexModule = require('../../../src/utils/helpers/index.js');
            const keys = Object.keys(indexModule);
            
            expect(keys.length).toBeGreaterThan(0);
            expect(keys).toContain('CommonResponse');
            expect(keys).toContain('CustomError');
            expect(keys).toContain('HttpStatusCodes');
            expect(keys).toContain('errorHandler');
            expect(keys).toContain('messages');
            expect(keys).toContain('StatusService');
            expect(keys).toContain('asyncWrapper');
        });
    });
});
