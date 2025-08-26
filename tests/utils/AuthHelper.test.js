// tests/utils/AuthHelper.test.js

import AuthHelper from '../../src/utils/AuthHelper.js';

describe.skip('AuthHelper', () => {
    describe('generateToken', () => {
        it('should generate a token', () => {
            const token = AuthHelper.generateToken();
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(0);
        });

        it('should generate different tokens', () => {
            const token1 = AuthHelper.generateToken();
            const token2 = AuthHelper.generateToken();
            expect(token1).not.toBe(token2);
        });

        it('should generate tokens with specified length', () => {
            const length = 32;
            const token = AuthHelper.generateToken(length);
            expect(token.length).toBe(length * 2); // hex encoding doubles length
        });
    });

    describe('validateTokenFormat', () => {
        it('should validate valid token format', () => {
            const validToken = 'abc123def456';
            expect(AuthHelper.validateTokenFormat(validToken)).toBe(true);
        });

        it('should invalidate empty token', () => {
            expect(AuthHelper.validateTokenFormat('')).toBe(false);
            expect(AuthHelper.validateTokenFormat(null)).toBe(false);
            expect(AuthHelper.validateTokenFormat(undefined)).toBe(false);
        });

        it('should invalidate tokens with invalid characters', () => {
            expect(AuthHelper.validateTokenFormat('token with spaces')).toBe(false);
            expect(AuthHelper.validateTokenFormat('token@#$%')).toBe(false);
        });

        it('should validate tokens with only alphanumeric characters', () => {
            expect(AuthHelper.validateTokenFormat('abc123DEF456')).toBe(true);
            expect(AuthHelper.validateTokenFormat('123456789')).toBe(true);
            expect(AuthHelper.validateTokenFormat('abcdefghijk')).toBe(true);
        });
    });

    describe('isTokenExpired', () => {
        it('should detect expired tokens', () => {
            const expiredDate = new Date(Date.now() - 1000); // 1 second ago
            expect(AuthHelper.isTokenExpired(expiredDate)).toBe(true);
        });

        it('should detect valid tokens', () => {
            const futureDate = new Date(Date.now() + 1000); // 1 second from now
            expect(AuthHelper.isTokenExpired(futureDate)).toBe(false);
        });

        it('should handle null expiration date', () => {
            expect(AuthHelper.isTokenExpired(null)).toBe(true);
            expect(AuthHelper.isTokenExpired(undefined)).toBe(true);
        });

        it('should handle current time edge case', () => {
            const now = new Date();
            expect(AuthHelper.isTokenExpired(now)).toBe(true); // should be true since <= comparison
        });
    });

    describe('hashPassword', () => {
        it('should hash password', () => {
            const password = 'testPassword123';
            const hash = AuthHelper.hashPassword(password);
            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(typeof hash).toBe('string');
        });

        it('should generate different hashes for same password', () => {
            const password = 'testPassword123';
            const hash1 = AuthHelper.hashPassword(password);
            const hash2 = AuthHelper.hashPassword(password);
            expect(hash1).not.toBe(hash2); // due to salt
        });

        it('should handle empty password', () => {
            const hash = AuthHelper.hashPassword('');
            expect(hash).toBeDefined();
            expect(typeof hash).toBe('string');
        });
    });

    describe('verifyPassword', () => {
        it('should verify correct password', () => {
            const password = 'testPassword123';
            const hash = AuthHelper.hashPassword(password);
            expect(AuthHelper.verifyPassword(password, hash)).toBe(true);
        });

        it('should reject incorrect password', () => {
            const password = 'testPassword123';
            const wrongPassword = 'wrongPassword456';
            const hash = AuthHelper.hashPassword(password);
            expect(AuthHelper.verifyPassword(wrongPassword, hash)).toBe(false);
        });

        it('should handle empty passwords', () => {
            const hash = AuthHelper.hashPassword('');
            expect(AuthHelper.verifyPassword('', hash)).toBe(true);
            expect(AuthHelper.verifyPassword('notEmpty', hash)).toBe(false);
        });

        it('should handle invalid hash', () => {
            expect(AuthHelper.verifyPassword('password', 'invalidHash')).toBe(false);
            expect(AuthHelper.verifyPassword('password', null)).toBe(false);
            expect(AuthHelper.verifyPassword('password', undefined)).toBe(false);
        });
    });

    describe('generateRefreshToken', () => {
        it('should generate refresh token', () => {
            const refreshToken = AuthHelper.generateRefreshToken();
            expect(refreshToken).toBeDefined();
            expect(typeof refreshToken).toBe('string');
            expect(refreshToken.length).toBeGreaterThan(0);
        });

        it('should generate different refresh tokens', () => {
            const token1 = AuthHelper.generateRefreshToken();
            const token2 = AuthHelper.generateRefreshToken();
            expect(token1).not.toBe(token2);
        });
    });
});
