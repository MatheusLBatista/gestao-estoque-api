import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Configurar os mocks
jest.mock('../../src/services/AuthService.js', () => ({
    AuthService: jest.fn().mockImplementation(() => ({
        autenticar: jest.fn(),
        logout: jest.fn(),
        refreshToken: jest.fn(),
        revoke: jest.fn(),
        recuperarSenha: jest.fn(),
        redefinirSenhaComToken: jest.fn(),
        redefinirSenhaComCodigo: jest.fn(),
        alterarSenha: jest.fn(),
        solicitarRecuperacao: jest.fn(),
        verificarCodigoRecuperacao: jest.fn(),
        redefinirSenha: jest.fn(),
    })),
}));

jest.mock('../../src/utils/helpers/CommonResponse.js', () => ({
    __esModule: true,
    default: class MockCommonResponse {
        static success = jest.fn();
        static error = jest.fn();
        static created = jest.fn();
    }
}));

jest.mock('../../src/middlewares/LogMiddleware.js', () => ({
    __esModule: true,
    default: {
        startSession: jest.fn(),
        endSession: jest.fn(),
        logAction: jest.fn(),
        logCriticalEvent: jest.fn(),
        logFailedLogin: jest.fn(),
        getUserLogs: jest.fn(),
        searchEvents: jest.fn(),
        log: jest.fn(() => (req, res, next) => next()),
    },
}));

import AuthController from '../../src/controllers/AuthController.js';
import { AuthService } from '../../src/services/AuthService.js';
import LogMiddleware from '../../src/middlewares/LogMiddleware.js';
import CommonResponse from '../../src/utils/helpers/CommonResponse.js';

describe('AuthController', () => {
    let authController;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        // AuthController já é uma instância, não precisamos criar uma nova
        authController = AuthController;
        
        mockReq = {
            body: {},
            params: {},
            query: {},
            userId: 'user123',
            userMatricula: 'MAT123'
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        // Reset dos mocks
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('deve fazer login com sucesso', async () => {
            const mockAuthData = {
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                usuario: {
                    id: 'user123',
                    matricula: 'MAT123',
                    nome_usuario: 'João Silva',
                    perfil: 'estoquista'
                }
            };

            mockReq.body = { matricula: 'MAT123', senha: 'senha123' };
            authController.service.autenticar.mockResolvedValue(mockAuthData);

            await authController.login(mockReq, mockRes);

            expect(authController.service.autenticar).toHaveBeenCalledWith('MAT123', 'senha123');
            expect(LogMiddleware.startSession).toHaveBeenCalledWith(
                'user123',
                {
                    matricula: 'MAT123',
                    nome: 'João Silva',
                    perfil: 'estoquista'
                },
                mockReq
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Login realizado com sucesso',
                ...mockAuthData
            });
        });

        it('deve retornar erro quando matrícula não for fornecida', async () => {
            mockReq.body = { senha: 'senha123' };

            await authController.login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Matrícula e senha são obrigatórios',
                type: 'validationError'
            });
        });

        it('deve retornar erro quando senha não for fornecida', async () => {
            mockReq.body = { matricula: 'MAT123' };

            await authController.login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Matrícula e senha são obrigatórios',
                type: 'validationError'
            });
        });
    });

    describe('logout', () => {
        it('deve fazer logout com sucesso', async () => {
            mockReq.userId = 'user123';
            authController.service.logout.mockResolvedValue();

            await authController.logout(mockReq, mockRes);

            expect(authController.service.logout).toHaveBeenCalledWith('user123');
            expect(LogMiddleware.endSession).toHaveBeenCalledWith('user123', 'manual');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Logout realizado com sucesso'
            });
        });
    });

    describe('refresh', () => {
        it('deve renovar token com sucesso', async () => {
            const mockTokens = {
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token'
            };

            mockReq.body = { refreshToken: 'valid-refresh-token' };
            authController.service.refreshToken.mockResolvedValue(mockTokens);

            await authController.refresh(mockReq, mockRes);

            expect(authController.service.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Token atualizado com sucesso',
                ...mockTokens
            });
        });

        it('deve retornar erro quando refreshToken não for fornecido', async () => {
            mockReq.body = {};

            await authController.refresh(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Token de atualização não fornecido',
                type: 'validationError'
            });
        });
    });

    describe('revoke', () => {
        it('deve revogar token com sucesso', async () => {
            mockReq.body = { matricula: 'MAT456' };
            mockReq.userId = 'user123';
            mockReq.userMatricula = 'MAT123';
            authController.service.revoke.mockResolvedValue();

            await authController.revoke(mockReq, mockRes);

            expect(authController.service.revoke).toHaveBeenCalledWith('MAT456');
            expect(LogMiddleware.logCriticalEvent).toHaveBeenCalledWith(
                'user123',
                'TOKEN_REVOKE',
                {
                    matricula_revogada: 'MAT456',
                    revogado_por: 'MAT123'
                },
                mockReq
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Token revogado com sucesso'
            });
        });

        it('deve retornar erro quando corpo da requisição estiver ausente', async () => {
            mockReq.body = null;

            await authController.revoke(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Corpo da requisição ausente',
                type: 'validationError'
            });
        });

        it('deve retornar erro quando matrícula não for fornecida', async () => {
            mockReq.body = {};

            await authController.revoke(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Matrícula não fornecida',
                type: 'validationError'
            });
        });
    });

    describe('solicitarRecuperacaoSenha', () => {
        it('deve solicitar recuperação de senha com sucesso', async () => {
            const mockResultado = { message: 'Email de recuperação enviado' };
            mockReq.body = { email: 'test@example.com' };
            authController.service.recuperarSenha.mockResolvedValue(mockResultado);

            await authController.solicitarRecuperacaoSenha(mockReq, mockRes);

            expect(authController.service.recuperarSenha).toHaveBeenCalledWith('test@example.com');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockResultado);
        });

        it('deve retornar erro quando email não for fornecido', async () => {
            mockReq.body = {};

            await authController.solicitarRecuperacaoSenha(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Email é obrigatório',
                type: 'validationError'
            });
        });
    });

    describe('redefinirSenhaComToken', () => {
        it('deve redefinir senha com token com sucesso', async () => {
            const mockResultado = { message: 'Senha redefinida com sucesso' };
            mockReq.query = { token: 'valid-token' };
            mockReq.body = { senha: 'nova-senha' };
            authController.service.redefinirSenhaComToken.mockResolvedValue(mockResultado);

            await authController.redefinirSenhaComToken(mockReq, mockRes);

            expect(authController.service.redefinirSenhaComToken).toHaveBeenCalledWith('valid-token', 'nova-senha');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockResultado);
        });

        it('deve retornar erro quando token não for fornecido', async () => {
            mockReq.query = {};
            mockReq.body = { senha: 'nova-senha' };

            await authController.redefinirSenhaComToken(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Token e senha são obrigatórios',
                type: 'validationError'
            });
        });

        it('deve retornar erro quando senha não for fornecida', async () => {
            mockReq.query = { token: 'valid-token' };
            mockReq.body = {};

            await authController.redefinirSenhaComToken(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Token e senha são obrigatórios',
                type: 'validationError'
            });
        });
    });

    describe('redefinirSenhaComCodigo', () => {
        it('deve redefinir senha com código com sucesso', async () => {
            const mockResultado = { message: 'Senha redefinida com sucesso' };
            mockReq.body = { codigo: '123456', senha: 'nova-senha' };
            authController.service.redefinirSenhaComCodigo.mockResolvedValue(mockResultado);

            await authController.redefinirSenhaComCodigo(mockReq, mockRes);

            expect(authController.service.redefinirSenhaComCodigo).toHaveBeenCalledWith('123456', 'nova-senha');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockResultado);
        });

        it('deve retornar erro quando código não for fornecido', async () => {
            mockReq.body = { senha: 'nova-senha' };

            await authController.redefinirSenhaComCodigo(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Código e senha são obrigatórios',
                type: 'validationError'
            });
        });

        it('deve retornar erro quando senha não for fornecida', async () => {
            mockReq.body = { codigo: '123456' };

            await authController.redefinirSenhaComCodigo(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Código e senha são obrigatórios',
                type: 'validationError'
            });
        });
    });
});