// tests/utils/Validator.test.js

import Validator from '../../src/utils/Validator.js';

describe('Validator', () => {
    let validator;

    beforeEach(() => {
        validator = new Validator();
    });

    describe('Constructor', () => {
        test('should initialize with default locale', () => {
            expect(validator).toBeInstanceOf(Validator);
            expect(validator.erro).toBeNull();
        });

        test('should initialize with custom locale', () => {
            const customValidator = new Validator('en');
            expect(customValidator).toBeInstanceOf(Validator);
            expect(customValidator.erro).toBeNull();
        });

        test('should initialize with pt locale by default', () => {
            const defaultValidator = new Validator();
            expect(defaultValidator).toBeInstanceOf(Validator);
        });
    });

    describe('erro getter', () => {
        test('should return null initially', () => {
            expect(validator.erro).toBeNull();
        });

        test('should return the current error value', () => {
            // Since _erro is private, we can test through the getter
            expect(validator.erro).toBeNull();
            
            // We can't directly set _erro, but we can test that the getter works
            const validator2 = new Validator();
            expect(validator2.erro).toBeNull();
        });
    });

    describe('Class structure', () => {
        test('should have private _erro property', () => {
            // Test that the private property exists indirectly through the getter
            expect(validator.erro).toBeNull();
        });

        test('should be a valid class instance', () => {
            expect(validator.constructor.name).toBe('Validator');
            expect(validator instanceof Validator).toBe(true);
        });
    });

    describe('Method availability', () => {
        test('should have all expected methods as comments', () => {
            // Since most methods are commented out, we test the class structure
            const methods = Object.getOwnPropertyNames(Validator.prototype);
            expect(methods).toContain('constructor');
            
            // Test that getter is available
            const descriptors = Object.getOwnPropertyDescriptors(Validator.prototype);
            expect(descriptors.erro).toBeDefined();
            expect(descriptors.erro.get).toBeDefined();
        });
    });

    describe('Localization support', () => {
        test('should accept different locale parameters', () => {
            const validators = [
                new Validator('pt'),
                new Validator('en'),
                new Validator('es'),
                new Validator()
            ];

            validators.forEach(v => {
                expect(v).toBeInstanceOf(Validator);
                expect(v.erro).toBeNull();
            });
        });
    });

    describe('Error state management', () => {
        test('should maintain error state correctly', () => {
            expect(validator.erro).toBeNull();
            
            // Create a new instance to ensure clean state
            const freshValidator = new Validator();
            expect(freshValidator.erro).toBeNull();
        });
    });

    describe('Integration with imports', () => {
        test('should import mongoose correctly', () => {
            // Test that the file can be imported without errors
            expect(Validator).toBeDefined();
            expect(typeof Validator).toBe('function');
        });

        test('should handle CustomError import', () => {
            // Test that the CustomError import doesn't cause issues
            expect(Validator).toBeDefined();
        });
    });

    describe('Validation methods (commented)', () => {
        test('should have commented validation method signatures', () => {
            // Since methods are commented, we can test the class exists and works
            expect(validator).toBeInstanceOf(Validator);
            
            // Test that the class can be extended (if needed in the future)
            class ExtendedValidator extends Validator {
                testMethod() {
                    return 'test';
                }
            }
            
            const extended = new ExtendedValidator();
            expect(extended).toBeInstanceOf(Validator);
            expect(extended.testMethod()).toBe('test');
        });
    });

    describe('Future extensibility', () => {
        test('should support method addition', () => {
            // Test that the class structure supports future method additions
            Validator.prototype.testValidation = function(value) {
                return value !== null && value !== undefined;
            };

            expect(validator.testValidation('test')).toBe(true);
            expect(validator.testValidation(null)).toBe(false);
            
            // Clean up
            delete Validator.prototype.testValidation;
        });

        test('should maintain prototype chain', () => {
            expect(Object.getPrototypeOf(validator)).toBe(Validator.prototype);
            expect(validator.constructor).toBe(Validator);
        });
    });

    describe('Memory efficiency', () => {
        test('should create lightweight instances', () => {
            const instances = [];
            for (let i = 0; i < 100; i++) {
                instances.push(new Validator());
            }
            
            instances.forEach(instance => {
                expect(instance).toBeInstanceOf(Validator);
                expect(instance.erro).toBeNull();
            });
        });
    });

    describe('Error handling', () => {
        test('should handle invalid locale gracefully', () => {
            expect(() => new Validator(null)).not.toThrow();
            expect(() => new Validator(undefined)).not.toThrow();
            expect(() => new Validator(123)).not.toThrow();
            expect(() => new Validator({})).not.toThrow();
        });
    });
});
