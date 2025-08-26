import TokenUtil from '../../src/utils/TokenUtil.js';
import jwt from 'jsonwebtoken';

// Mock do jwt para testes
jest.mock('jsonwebtoken');

describe('TokenUtil', () => {
  // Configuração de variáveis de ambiente para testes
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = {
      ...originalEnv,
      JWT_SECRET_ACCESS_TOKEN: 'access-secret',
      JWT_SECRET_REFRESH_TOKEN: 'refresh-secret',
      JWT_SECRET_PASSWORD_RECOVERY: 'recovery-secret',
      JWT_ACCESS_TOKEN_EXPIRATION: '15m',
      JWT_REFRESH_TOKEN_EXPIRATION: '7d',
      JWT_PASSWORD_RECOVERY_EXPIRATION: '30m'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('generateAccessToken', () => {
    it('should generate access token successfully', async () => {
      const mockToken = 'mock-access-token';
      const userId = 'user123';

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken);
      });

      const token = await TokenUtil.generateAccessToken(userId);

      expect(token).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        'access-secret',
        { expiresIn: '15m' },
        expect.any(Function)
      );
    });

    it('should use default expiration when env var is not set', async () => {
      delete process.env.JWT_ACCESS_TOKEN_EXPIRATION;
      const mockToken = 'mock-access-token';
      const userId = 'user123';

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken);
      });

      await TokenUtil.generateAccessToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        'access-secret',
        { expiresIn: '15m' },
        expect.any(Function)
      );
    });

    it('should reject when jwt.sign fails', async () => {
      const error = new Error('JWT sign error');
      const userId = 'user123';

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(error, null);
      });

      await expect(TokenUtil.generateAccessToken(userId)).rejects.toThrow('JWT sign error');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token successfully', async () => {
      const mockToken = 'mock-refresh-token';
      const userId = 'user123';

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken);
      });

      const token = await TokenUtil.generateRefreshToken(userId);

      expect(token).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        'refresh-secret',
        { expiresIn: '7d' },
        expect.any(Function)
      );
    });

    it('should use default expiration when env var is not set', async () => {
      delete process.env.JWT_REFRESH_TOKEN_EXPIRATION;
      const mockToken = 'mock-refresh-token';
      const userId = 'user123';

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken);
      });

      await TokenUtil.generateRefreshToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        'refresh-secret',
        { expiresIn: '7d' },
        expect.any(Function)
      );
    });

    it('should reject when jwt.sign fails', async () => {
      const error = new Error('JWT sign error');
      const userId = 'user123';

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(error, null);
      });

      await expect(TokenUtil.generateRefreshToken(userId)).rejects.toThrow('JWT sign error');
    });
  });

  describe('generatePasswordRecoveryToken', () => {
    it('should generate password recovery token successfully', async () => {
      const mockToken = 'mock-recovery-token';
      const userId = 'user123';

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken);
      });

      const token = await TokenUtil.generatePasswordRecoveryToken(userId);

      expect(token).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        'recovery-secret',
        { expiresIn: '30m' },
        expect.any(Function)
      );
    });

    it('should use default expiration when env var is not set', async () => {
      delete process.env.JWT_PASSWORD_RECOVERY_EXPIRATION;
      const mockToken = 'mock-recovery-token';
      const userId = 'user123';

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken);
      });

      await TokenUtil.generatePasswordRecoveryToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        'recovery-secret',
        { expiresIn: '30m' },
        expect.any(Function)
      );
    });

    it('should reject when jwt.sign fails', async () => {
      const error = new Error('JWT sign error');
      const userId = 'user123';

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(error, null);
      });

      await expect(TokenUtil.generatePasswordRecoveryToken(userId)).rejects.toThrow('JWT sign error');
    });
  });

  describe('decodeAccessToken', () => {
    it('should decode access token successfully', async () => {
      const token = 'valid-access-token';
      const userId = 'user123';
      const mockDecoded = { id: userId, exp: 1234567890 };

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockDecoded);
      });

      const result = await TokenUtil.decodeAccessToken(token);

      expect(result).toBe(userId);
      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        'access-secret',
        expect.any(Function)
      );
    });

    it('should reject when token is invalid', async () => {
      const token = 'invalid-token';
      const error = new Error('Invalid token');

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(error, null);
      });

      await expect(TokenUtil.decodeAccessToken(token)).rejects.toThrow('Invalid token');
    });

    it('should reject when token is expired', async () => {
      const token = 'expired-token';
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(error, null);
      });

      await expect(TokenUtil.decodeAccessToken(token)).rejects.toThrow('Token expired');
    });
  });

  describe('decodeRefreshToken', () => {
    it('should decode refresh token successfully', async () => {
      const token = 'valid-refresh-token';
      const userId = 'user123';
      const mockDecoded = { id: userId, exp: 1234567890 };

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockDecoded);
      });

      const result = await TokenUtil.decodeRefreshToken(token);

      expect(result).toBe(userId);
      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        'refresh-secret',
        expect.any(Function)
      );
    });

    it('should reject when token is invalid', async () => {
      const token = 'invalid-token';
      const error = new Error('Invalid token');

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(error, null);
      });

      await expect(TokenUtil.decodeRefreshToken(token)).rejects.toThrow('Invalid token');
    });
  });

  describe('decodePasswordRecoveryToken', () => {
    it('should decode password recovery token successfully', async () => {
      const token = 'valid-recovery-token';
      const userId = 'user123';
      const mockDecoded = { id: userId, exp: 1234567890 };

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockDecoded);
      });

      const result = await TokenUtil.decodePasswordRecoveryToken(token);

      expect(result).toBe(userId);
      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        'recovery-secret',
        expect.any(Function)
      );
    });

    it('should use custom key when provided', async () => {
      const token = 'valid-recovery-token';
      const customKey = 'custom-secret';
      const userId = 'user123';
      const mockDecoded = { id: userId, exp: 1234567890 };

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockDecoded);
      });

      const result = await TokenUtil.decodePasswordRecoveryToken(token, customKey);

      expect(result).toBe(userId);
      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        customKey,
        expect.any(Function)
      );
    });

    it('should reject when token is invalid', async () => {
      const token = 'invalid-token';
      const error = new Error('Invalid token');

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(error, null);
      });

      await expect(TokenUtil.decodePasswordRecoveryToken(token)).rejects.toThrow('Invalid token');
    });

    it('should handle JsonWebTokenError', async () => {
      const token = 'malformed-token';
      const error = new Error('jwt malformed');
      error.name = 'JsonWebTokenError';

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(error, null);
      });

      await expect(TokenUtil.decodePasswordRecoveryToken(token)).rejects.toThrow('jwt malformed');
    });
  });

  describe('Error handling', () => {
    it('should handle different JWT error types in generateAccessToken', async () => {
      const userId = 'user123';
      const jwtError = new Error('Token generation failed');
      jwtError.name = 'JsonWebTokenError';

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(jwtError, null);
      });

      await expect(TokenUtil.generateAccessToken(userId)).rejects.toThrow('Token generation failed');
    });

    it('should handle TokenExpiredError in decodeAccessToken', async () => {
      const token = 'expired-token';
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(error, null);
      });

      await expect(TokenUtil.decodeAccessToken(token)).rejects.toThrow('jwt expired');
    });

    it('should handle NotBeforeError in decodeRefreshToken', async () => {
      const token = 'not-before-token';
      const error = new Error('jwt not active');
      error.name = 'NotBeforeError';

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(error, null);
      });

      await expect(TokenUtil.decodeRefreshToken(token)).rejects.toThrow('jwt not active');
    });
  });

  describe('Environment variables', () => {
    it('should handle missing environment variables gracefully', async () => {
      // Remove all JWT environment variables
      delete process.env.JWT_SECRET_ACCESS_TOKEN;
      delete process.env.JWT_SECRET_REFRESH_TOKEN;
      delete process.env.JWT_SECRET_PASSWORD_RECOVERY;
      delete process.env.JWT_ACCESS_TOKEN_EXPIRATION;
      delete process.env.JWT_REFRESH_TOKEN_EXPIRATION;
      delete process.env.JWT_PASSWORD_RECOVERY_EXPIRATION;

      const mockToken = 'mock-token';
      const userId = 'user123';

      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken);
      });

      // Should still work with undefined secrets (JWT will handle the error)
      await TokenUtil.generateAccessToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        undefined,
        { expiresIn: '15m' },
        expect.any(Function)
      );
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete token lifecycle', async () => {
      const userId = 'user123';
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';
      const mockRecoveryToken = 'mock-recovery-token';

      // Mock token generation
      jwt.sign
        .mockImplementationOnce((payload, secret, options, callback) => {
          callback(null, mockAccessToken);
        })
        .mockImplementationOnce((payload, secret, options, callback) => {
          callback(null, mockRefreshToken);
        })
        .mockImplementationOnce((payload, secret, options, callback) => {
          callback(null, mockRecoveryToken);
        });

      // Mock token verification
      jwt.verify
        .mockImplementationOnce((token, secret, callback) => {
          callback(null, { id: userId });
        })
        .mockImplementationOnce((token, secret, callback) => {
          callback(null, { id: userId });
        })
        .mockImplementationOnce((token, secret, callback) => {
          callback(null, { id: userId });
        });

      // Generate tokens
      const accessToken = await TokenUtil.generateAccessToken(userId);
      const refreshToken = await TokenUtil.generateRefreshToken(userId);
      const recoveryToken = await TokenUtil.generatePasswordRecoveryToken(userId);

      expect(accessToken).toBe(mockAccessToken);
      expect(refreshToken).toBe(mockRefreshToken);
      expect(recoveryToken).toBe(mockRecoveryToken);

      // Verify tokens
      const decodedAccessUserId = await TokenUtil.decodeAccessToken(accessToken);
      const decodedRefreshUserId = await TokenUtil.decodeRefreshToken(refreshToken);
      const decodedRecoveryUserId = await TokenUtil.decodePasswordRecoveryToken(recoveryToken);

      expect(decodedAccessUserId).toBe(userId);
      expect(decodedRefreshUserId).toBe(userId);
      expect(decodedRecoveryUserId).toBe(userId);
    });
  });
});
