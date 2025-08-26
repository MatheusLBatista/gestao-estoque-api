import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Configurar os mocks
jest.mock('../../src/middlewares/LogMiddleware.js', () => ({
    __esModule: true,
    default: {
        getUserLogs: jest.fn(),
        searchEvents: jest.fn(),
        getOnlineUsers: jest.fn(),
        getUserSessionInfo: jest.fn(),
        clearLogs: jest.fn(),
        startSession: jest.fn(),
        endSession: jest.fn(),
        logCriticalEvent: jest.fn(),
        logFailedLogin: jest.fn(),
        log: jest.fn(() => (req, res, next) => next()),
    },
}));

jest.mock('../../src/repositories/usuarioRepository.js', () => {
    return jest.fn().mockImplementation(() => ({
        buscarPorId: jest.fn(),
        listarUsuarios: jest.fn(),
        getOnlineUsers: jest.fn(),
    }));
});

import LogController from '../../src/controllers/LogController.js';
import LogMiddleware from '../../src/middlewares/LogMiddleware.js';
import UsuarioRepository from '../../src/repositories/usuarioRepository.js';

describe('LogController', () => {
    let logController;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        logController = new LogController();
        
        mockReq = {
            body: {},
            params: {},
            query: {},
            userId: 'user123',
            userMatricula: 'MAT123',
            userPerfil: 'administrador'
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        // Reset dos mocks
        jest.clearAllMocks();
    });

    describe('getUserLogs', () => {
        it('deve obter logs do usuário com sucesso (administrador)', async () => {
            const mockLogs = [
                { timestamp: '2023-01-01T10:00:00Z', action: 'login', details: 'Login realizado' },
                { timestamp: '2023-01-01T11:00:00Z', action: 'logout', details: 'Logout realizado' }
            ];

            mockReq.params = { userId: 'user456' };
            mockReq.query = { limit: '5' };
            mockReq.userPerfil = 'administrador';
            
            LogMiddleware.getUserLogs.mockReturnValue(mockLogs);

            await logController.getUserLogs(mockReq, mockRes);

            expect(LogMiddleware.getUserLogs).toHaveBeenCalledWith('user456', 5);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Logs recuperados com sucesso',
                data: mockLogs,
                total: mockLogs.length
            });
        });

        it('deve obter logs do próprio usuário com sucesso', async () => {
            const mockLogs = [
                { timestamp: '2023-01-01T10:00:00Z', action: 'login', details: 'Login realizado' }
            ];

            mockReq.params = { userId: 'user123' }; // mesmo userId do req.userId
            mockReq.userId = 'user123';
            mockReq.userPerfil = 'estoquista'; // não é admin mas está vendo próprios logs
            
            LogMiddleware.getUserLogs.mockReturnValue(mockLogs);

            await logController.getUserLogs(mockReq, mockRes);

            expect(LogMiddleware.getUserLogs).toHaveBeenCalledWith('user123', 10);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Logs recuperados com sucesso',
                data: mockLogs,
                total: mockLogs.length
            });
        });

        it('deve negar acesso quando usuário não é admin e tenta ver logs de outro', async () => {
            mockReq.params = { userId: 'user456' };
            mockReq.userId = 'user123';
            mockReq.userPerfil = 'estoquista';

            await logController.getUserLogs(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Acesso negado. Você só pode visualizar seus próprios logs',
                type: 'permissionError'
            });
        });
    });

    describe('searchEvents', () => {
        it('deve buscar eventos com sucesso (administrador)', async () => {
            const mockEvents = [
                { usuario: 'user123', eventos: [{ tipo: 'LOGIN', timestamp: '2023-01-01T10:00:00Z' }] }
            ];

            mockReq.query = { eventType: 'LOGIN' };
            mockReq.userPerfil = 'administrador';
            
            LogMiddleware.searchEvents.mockReturnValue(mockEvents);

            await logController.searchEvents(mockReq, mockRes);

            expect(LogMiddleware.searchEvents).toHaveBeenCalledWith('LOGIN', undefined, undefined);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Busca realizada com sucesso',
                data: mockEvents,
                total: mockEvents.length
            });
        });

        it('deve negar acesso quando usuário não é administrador', async () => {
            mockReq.userPerfil = 'estoquista';

            await logController.searchEvents(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
        });

        it('deve retornar erro quando eventType não é fornecido', async () => {
            mockReq.userPerfil = 'administrador';
            mockReq.query = {}; // sem eventType

            await logController.searchEvents(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });

    describe('getOnlineUsers', () => {
        it('deve obter usuários ativos com sucesso (administrador)', async () => {
            const mockActiveUsers = [
                { userId: 'user123', sessionStarted: '2023-01-01T10:00:00Z' },
                { userId: 'user456', sessionStarted: '2023-01-01T11:00:00Z' }
            ];

            mockReq.userPerfil = 'administrador';
            
            // Mock da instância do repositório
            logController.usuarioRepository.getOnlineUsers.mockResolvedValue(mockActiveUsers);

            await logController.getOnlineUsers(mockReq, mockRes);

            expect(logController.usuarioRepository.getOnlineUsers).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Usuários online recuperados com sucesso',
                data: mockActiveUsers,
                total: mockActiveUsers.length,
                timestamp: expect.any(String)
            });
        });

        it('deve negar acesso quando usuário não é administrador', async () => {
            mockReq.userPerfil = 'estoquista';

            await logController.getOnlineUsers(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Acesso negado. Apenas administradores podem ver usuários online',
                type: 'permissionError'
            });
        });
    });

    describe('getLogStatistics', () => {
        it('deve obter estatísticas de logs com sucesso (administrador)', async () => {
            const mockLoginEvents = [
                { usuario: { id: 'user1' }, eventos: [{ timestamp: '2023-01-01T10:00:00Z' }] },
                { usuario: { id: 'user2' }, eventos: [{ timestamp: '2023-01-01T11:00:00Z' }] }
            ];
            const mockLogoutEvents = [
                { usuario: { id: 'user1' }, eventos: [{ timestamp: '2023-01-01T12:00:00Z' }] }
            ];
            const mockEstoqueEvents = [
                { usuario: { id: 'user1' }, eventos: [{ timestamp: '2023-01-01T13:00:00Z' }] }
            ];
            const mockCriticalEvents = [
                { usuario: { id: 'user2' }, eventos: [{ timestamp: '2023-01-01T14:00:00Z' }] }
            ];

            mockReq.userPerfil = 'administrador';
            
            LogMiddleware.searchEvents
                .mockReturnValueOnce(mockLoginEvents)    // LOGIN
                .mockReturnValueOnce(mockLogoutEvents)   // LOGOUT
                .mockReturnValueOnce(mockEstoqueEvents)  // ESTOQUE_MOVIMENTO
                .mockReturnValueOnce(mockCriticalEvents); // TOKEN_REVOKE

            await logController.getLogStatistics(mockReq, mockRes);

            expect(LogMiddleware.searchEvents).toHaveBeenCalledWith('LOGIN');
            expect(LogMiddleware.searchEvents).toHaveBeenCalledWith('LOGOUT');
            expect(LogMiddleware.searchEvents).toHaveBeenCalledWith('ESTOQUE_MOVIMENTO');
            expect(LogMiddleware.searchEvents).toHaveBeenCalledWith('TOKEN_REVOKE');
            
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Estatísticas recuperadas com sucesso',
                data: {
                    totalLogins: 2,
                    totalLogouts: 1,
                    movimentacoesEstoque: 1,
                    eventosCriticos: 1,
                    usuariosAtivos: 2
                }
            });
        });

        it('deve negar acesso quando usuário não é administrador', async () => {
            mockReq.userPerfil = 'estoquista';

            await logController.getLogStatistics(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Acesso negado. Apenas administradores podem ver estatísticas',
                type: 'permissionError'
            });
        });
    });

    describe('getCriticalEvents', () => {
        it('deve obter eventos críticos com sucesso (administrador)', async () => {
            const mockCriticalEvents = [
                { 
                    usuario: { id: 'user1' }, 
                    eventos: [{ timestamp: '2023-01-01T10:00:00Z', type: 'TOKEN_REVOKE' }] 
                },
                { 
                    usuario: { id: 'user2' }, 
                    eventos: [{ timestamp: '2023-01-01T11:00:00Z', type: 'ESTOQUE_MOVIMENTO' }] 
                }
            ];

            mockReq.userPerfil = 'administrador';
            mockReq.query = { days: '7' };
            
            LogMiddleware.searchEvents.mockReturnValue(mockCriticalEvents);

            await logController.getCriticalEvents(mockReq, mockRes);

            expect(LogMiddleware.searchEvents).toHaveBeenCalledTimes(3); // 3 tipos de eventos críticos
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Eventos críticos recuperados com sucesso',
                data: expect.any(Array),
                periodo: 'Últimos 7 dias',
                total: expect.any(Number)
            });
        });

        it('deve usar valor padrão de 7 dias quando não especificado', async () => {
            mockReq.userPerfil = 'administrador';
            mockReq.query = {}; // sem days especificado
            
            LogMiddleware.searchEvents.mockReturnValue([]);

            await logController.getCriticalEvents(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Eventos críticos recuperados com sucesso',
                data: [],
                periodo: 'Últimos 7 dias',
                total: 0
            });
        });

        it('deve negar acesso quando usuário não é administrador', async () => {
            mockReq.userPerfil = 'estoquista';

            await logController.getCriticalEvents(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Acesso negado. Apenas administradores podem ver eventos críticos',
                type: 'permissionError'
            });
        });
    });
});
