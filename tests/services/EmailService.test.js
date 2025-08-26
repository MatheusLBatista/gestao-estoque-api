import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock dependencies
jest.mock('axios');
jest.mock('dotenv', () => ({
    config: jest.fn()
}));
jest.mock('../../src/middlewares/LogMiddleware.js', () => ({
    logError: jest.fn(),
    logInfo: jest.fn()
}));

import axios from 'axios';
import LogMiddleware from '../../src/middlewares/LogMiddleware.js';

describe('EmailService', () => {
    let consoleSpy;
    let EmailService;
    
    beforeEach(async () => {
        jest.clearAllMocks();
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        // Reset environment variables
        process.env.MAIL_API_URL = 'http://localhost:5013';
        process.env.MAIL_API_KEY = 'test-api-key';
        process.env.MAIL_API_TIMEOUT = '5000';
        process.env.SYSTEM_URL = 'http://localhost:5011';
        
        // Re-import EmailService to get fresh instance with new env vars
        delete require.cache[require.resolve('../../src/services/EmailService.js')];
        EmailService = (await import('../../src/services/EmailService.js')).default;
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('initialization', () => {
        it('should initialize with environment variables', () => {
            expect(EmailService.mailApiUrl).toBe('http://localhost:5013');
            expect(EmailService.mailApiKey).toBe('test-api-key');
            expect(EmailService.mailApiTimeout).toBe(5000);
            expect(EmailService.systemUrl).toBe('http://localhost:5011');
        });
    });

    describe('enviarCodigoCadastro', () => {
        const mockUser = {
            _id: 'user123',
            email: 'test@example.com',
            nome_usuario: 'Test User',
            matricula: '12345'
        };
        const mockCode = 'ABC123';

        it('should always log the verification code to console', async () => {
            await EmailService.enviarCodigoCadastro(mockUser, mockCode);
            
            expect(consoleSpy).toHaveBeenCalledWith(`Código de recuperação: ${mockCode}`);
        });

        it('should return success false when MAIL_API_KEY is not configured', async () => {
            // Temporarily remove the API key from the service
            const originalApiKey = EmailService.mailApiKey;
            EmailService.mailApiKey = undefined;
            
            const result = await EmailService.enviarCodigoCadastro(mockUser, mockCode);
            
            expect(result).toEqual({
                success: true,
                sentViaEmail: false,
                reason: 'API Key não configurada'
            });
            expect(LogMiddleware.logError).toHaveBeenCalledWith('EMAIL_CONFIG_MISSING', {
                usuario_id: mockUser._id,
                email: mockUser.email,
                error: 'MAIL_API_KEY não configurada'
            });
            
            // Restore the original API key
            EmailService.mailApiKey = originalApiKey;
        });

        it('should send email successfully when API key is configured', async () => {
            const mockResponse = {
                data: {
                    info: {
                        messageId: 'msg-123'
                    }
                }
            };
            
            axios.post.mockResolvedValue(mockResponse);
            
            const result = await EmailService.enviarCodigoCadastro(mockUser, mockCode);
            
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:5013/emails/send',
                {
                    to: mockUser.email,
                    subject: 'Bem-vindo(a) ao Sistema de Gestão de Estoque!',
                    template: 'first-access',
                    data: {
                        name: mockUser.nome_usuario,
                        matricula: mockUser.matricula,
                        verificationCode: mockCode,
                        systemUrl: 'http://localhost:5011',
                        expirationHours: 24,
                        year: new Date().getFullYear(),
                        company: 'HR - Gestão de Estoque'
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'test-api-key'
                    },
                    timeout: 5000
                }
            );
            
            expect(result).toEqual({
                success: true,
                sentViaEmail: true,
                messageId: 'msg-123'
            });
            
            expect(consoleSpy).toHaveBeenCalledWith(`✅ Email enviado com sucesso para ${mockUser.email}`);
            expect(LogMiddleware.logInfo).toHaveBeenCalledWith('EMAIL_SENT_SUCCESS', {
                usuario_id: mockUser._id,
                email: mockUser.email,
                template: 'first-access',
                matricula: mockUser.matricula
            });
        });

        it('should handle axios error gracefully', async () => {
            const mockError = new Error('Network error');
            mockError.stack = 'Error stack trace';
            
            axios.post.mockRejectedValue(mockError);
            
            const result = await EmailService.enviarCodigoCadastro(mockUser, mockCode);
            
            expect(result).toEqual({
                success: true,
                sentViaEmail: false,
                reason: 'Erro no envio: Network error'
            });
            
            expect(consoleSpy).toHaveBeenCalledWith(`❌ Falha ao enviar email para ${mockUser.email}: Network error`);
            expect(LogMiddleware.logError).toHaveBeenCalledWith('EMAIL_SEND_FAILED', {
                usuario_id: mockUser._id,
                email: mockUser.email,
                error: mockError.message,
                stack: mockError.stack,
                mailApiUrl: 'http://localhost:5013'
            });
        });

        it('should handle response without messageId', async () => {
            const mockResponse = {
                data: {
                    info: null
                }
            };
            
            axios.post.mockResolvedValue(mockResponse);
            
            const result = await EmailService.enviarCodigoCadastro(mockUser, mockCode);
            
            expect(result).toEqual({
                success: true,
                sentViaEmail: true,
                messageId: 'unknown'
            });
        });
    });

    describe('enviarCodigoRecuperacao', () => {
        const mockUser = {
            _id: 'user456',
            email: 'recovery@example.com',
            nome_usuario: 'Recovery User'
        };
        const mockCode = 'XYZ789';

        it('should return failure when MAIL_API_KEY is not configured', async () => {
            // Temporarily remove the API key from the service
            const originalApiKey = EmailService.mailApiKey;
            EmailService.mailApiKey = undefined;
            
            const result = await EmailService.enviarCodigoRecuperacao(mockUser, mockCode);
            
            expect(result).toEqual({
                success: true,
                sentViaEmail: false,
                reason: 'API Key não configurada'
            });
            expect(LogMiddleware.logError).toHaveBeenCalledWith('EMAIL_CONFIG_MISSING', {
                usuario_id: mockUser._id,
                email: mockUser.email,
                error: 'MAIL_API_KEY não configurada'
            });
            
            // Restore the original API key
            EmailService.mailApiKey = originalApiKey;
        });

        it('should send recovery email successfully', async () => {
            const mockResponse = {
                data: {
                    info: {
                        messageId: 'recovery-msg-456'
                    }
                }
            };
            
            axios.post.mockResolvedValue(mockResponse);
            
            const result = await EmailService.enviarCodigoRecuperacao(mockUser, mockCode);
            
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:5013/emails/send',
                {
                    to: mockUser.email,
                    subject: 'Código de Recuperação de Senha',
                    template: 'verification-code',
                    data: {
                        name: mockUser.nome_usuario,
                        appName: 'Sistema de Gestão de Estoque',
                        verificationCode: mockCode,
                        expirationMinutes: 60,
                        year: new Date().getFullYear(),
                        company: 'Gestão de Estoque'
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'test-api-key'
                    },
                    timeout: 5000
                }
            );
            
            expect(result).toEqual({
                success: true,
                sentViaEmail: true,
                messageId: 'recovery-msg-456'
            });
            
            expect(consoleSpy).toHaveBeenCalledWith(`✅ Email de recuperação enviado para ${mockUser.email}`);
            expect(LogMiddleware.logInfo).toHaveBeenCalledWith('EMAIL_RECOVERY_SENT', {
                usuario_id: mockUser._id,
                email: mockUser.email,
                template: 'verification-code'
            });
        });

        it('should handle axios error in recovery email', async () => {
            const mockError = new Error('SMTP server unavailable');
            mockError.stack = 'SMTP error stack';
            
            axios.post.mockRejectedValue(mockError);
            
            const result = await EmailService.enviarCodigoRecuperacao(mockUser, mockCode);
            
            expect(result).toEqual({
                success: true,
                sentViaEmail: false,
                reason: 'Erro no envio: SMTP server unavailable'
            });
            
            expect(consoleSpy).toHaveBeenCalledWith(`❌ Falha ao enviar email de recuperação para ${mockUser.email}: SMTP server unavailable`);
            expect(LogMiddleware.logError).toHaveBeenCalledWith('EMAIL_RECOVERY_FAILED', {
                usuario_id: mockUser._id,
                email: mockUser.email,
                error: mockError.message,
                stack: mockError.stack
            });
        });

        it('should handle response without messageId in recovery email', async () => {
            const mockResponse = {
                data: {}
            };
            
            axios.post.mockResolvedValue(mockResponse);
            
            const result = await EmailService.enviarCodigoRecuperacao(mockUser, mockCode);
            
            expect(result).toEqual({
                success: true,
                sentViaEmail: true,
                messageId: 'unknown'
            });
        });
    });
});
