import LogMiddleware from '../../src/middlewares/LogMiddleware.js';
import LogService from '../../src/services/LogService.js';
import fs from 'fs';
import path from 'path';

// Mocks
jest.mock('../../src/services/LogService.js');
jest.mock('fs');
jest.mock('path');

describe('LogMiddleware', () => {
    let mockLogService;
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        // Reset o middleware para ter uma instância limpa
        LogMiddleware.userSessions = new Map();
        
        mockLogService = {
            logEvent: jest.fn(),
            extractRequestInfo: jest.fn(),
            createSessionFile: jest.fn(),
            endSession: jest.fn(),
            ensureUserDirectory: jest.fn(),
            getUserLogs: jest.fn(),
            searchEvents: jest.fn()
        };
        
        LogMiddleware.logService = mockLogService;

        mockReq = {
            userId: 'test-user-id',
            method: 'GET',
            originalUrl: '/api/test',
            url: '/api/test',
            params: { id: '123' },
            query: { page: 1 },
            body: {}
        };

        mockRes = {};
        mockNext = jest.fn();

        // Reset mocks
        jest.clearAllMocks();
    });

    describe('log', () => {
        it('deve registrar evento para usuário autenticado', () => {
            const sessionFilePath = '/path/to/session.log';
            LogMiddleware.userSessions.set('test-user-id', sessionFilePath);
            
            const middleware = LogMiddleware.log('REQUEST');
            middleware(mockReq, mockRes, mockNext);

            expect(mockLogService.logEvent).toHaveBeenCalledWith(
                sessionFilePath,
                'REQUEST',
                {
                    metodo: 'GET',
                    rota: '/api/test',
                    params: { id: '123' },
                    query: { page: 1 }
                },
                mockReq
            );
            expect(mockNext).toHaveBeenCalled();
        });

        it('deve não registrar evento para usuário não autenticado', () => {
            mockReq.userId = null;
            
            const middleware = LogMiddleware.log('REQUEST');
            middleware(mockReq, mockRes, mockNext);

            expect(mockLogService.logEvent).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalled();
        });

        it('deve não registrar evento se não houver sessão', () => {
            const middleware = LogMiddleware.log('REQUEST');
            middleware(mockReq, mockRes, mockNext);

            expect(mockLogService.logEvent).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalled();
        });

        it('deve adicionar dados específicos para evento ESTOQUE_MOVIMENTO', () => {
            const sessionFilePath = '/path/to/session.log';
            LogMiddleware.userSessions.set('test-user-id', sessionFilePath);
            
            mockReq.body = {
                produto: 'produto-123',
                quantidade: 10,
                tipo: 'entrada'
            };
            
            const middleware = LogMiddleware.log('ESTOQUE_MOVIMENTO');
            middleware(mockReq, mockRes, mockNext);

            expect(mockLogService.logEvent).toHaveBeenCalledWith(
                sessionFilePath,
                'ESTOQUE_MOVIMENTO',
                {
                    metodo: 'GET',
                    rota: '/api/test',
                    params: { id: '123' },
                    query: { page: 1 },
                    produto: 'produto-123',
                    quantidade: 10,
                    tipo_movimentacao: 'entrada'
                },
                mockReq
            );
        });

        it('deve adicionar dados específicos para evento USUARIO_ACAO', () => {
            const sessionFilePath = '/path/to/session.log';
            LogMiddleware.userSessions.set('test-user-id', sessionFilePath);
            
            mockReq.body = { nome: 'João', email: 'joao@test.com' };
            
            const middleware = LogMiddleware.log('USUARIO_ACAO');
            middleware(mockReq, mockRes, mockNext);

            expect(mockLogService.logEvent).toHaveBeenCalledWith(
                sessionFilePath,
                'USUARIO_ACAO',
                {
                    metodo: 'GET',
                    rota: '/api/test',
                    params: { id: '123' },
                    query: { page: 1 },
                    acao: 'GET',
                    dados_alterados: ['nome', 'email']
                },
                mockReq
            );
        });

        it('deve tratar erro graciosamente', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            LogMiddleware.userSessions.set('test-user-id', '/path/to/session.log');
            mockLogService.logEvent.mockImplementation(() => {
                throw new Error('Erro de teste');
            });
            
            const middleware = LogMiddleware.log('REQUEST');
            middleware(mockReq, mockRes, mockNext);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro no middleware de log:', expect.any(Error));
            expect(mockNext).toHaveBeenCalled();
            
            consoleErrorSpy.mockRestore();
        });

        it('deve usar req.url quando originalUrl não existir', () => {
            const sessionFilePath = '/path/to/session.log';
            LogMiddleware.userSessions.set('test-user-id', sessionFilePath);
            delete mockReq.originalUrl;
            
            const middleware = LogMiddleware.log('REQUEST');
            middleware(mockReq, mockRes, mockNext);

            expect(mockLogService.logEvent).toHaveBeenCalledWith(
                sessionFilePath,
                'REQUEST',
                {
                    metodo: 'GET',
                    rota: '/api/test',
                    params: { id: '123' },
                    query: { page: 1 }
                },
                mockReq
            );
        });
    });

    describe('startSession', () => {
        it('deve iniciar sessão com sucesso', () => {
            const userInfo = { matricula: '12345', nome: 'João' };
            const sessionFilePath = '/path/to/session.log';
            
            mockLogService.extractRequestInfo.mockReturnValue({ ip: '127.0.0.1' });
            mockLogService.createSessionFile.mockReturnValue(sessionFilePath);

            const result = LogMiddleware.startSession('test-user-id', userInfo, mockReq);

            expect(mockLogService.extractRequestInfo).toHaveBeenCalledWith(mockReq);
            expect(mockLogService.createSessionFile).toHaveBeenCalledWith('test-user-id', {
                matricula: '12345',
                nome: 'João',
                ip: '127.0.0.1'
            });
            expect(mockLogService.logEvent).toHaveBeenCalledWith(
                sessionFilePath,
                'LOGIN',
                {
                    tipo: 'login_sucesso',
                    matricula: '12345'
                },
                mockReq
            );
            expect(LogMiddleware.userSessions.get('test-user-id')).toBe(sessionFilePath);
            expect(result).toBe(sessionFilePath);
        });

        it('deve converter userId para string', () => {
            const userInfo = { matricula: '12345' };
            const sessionFilePath = '/path/to/session.log';
            
            mockLogService.extractRequestInfo.mockReturnValue({});
            mockLogService.createSessionFile.mockReturnValue(sessionFilePath);

            LogMiddleware.startSession(123, userInfo, mockReq);

            expect(mockLogService.createSessionFile).toHaveBeenCalledWith('123', expect.any(Object));
            expect(LogMiddleware.userSessions.get('123')).toBe(sessionFilePath);
        });

        it('deve tratar erro e retornar null', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockLogService.extractRequestInfo.mockImplementation(() => {
                throw new Error('Erro de teste');
            });

            const result = LogMiddleware.startSession('test-user-id', {}, mockReq);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao iniciar sessão de log:', expect.any(Error));
            expect(result).toBe(null);
            
            consoleErrorSpy.mockRestore();
        });
    });

    describe('endSession', () => {
        it('deve finalizar sessão com sucesso', () => {
            const sessionFilePath = '/path/to/session.log';
            LogMiddleware.userSessions.set('test-user-id', sessionFilePath);

            LogMiddleware.endSession('test-user-id', 'manual');

            expect(mockLogService.logEvent).toHaveBeenCalledWith(
                sessionFilePath,
                'LOGOUT',
                { tipo: 'manual' }
            );
            expect(mockLogService.endSession).toHaveBeenCalledWith(sessionFilePath);
            expect(LogMiddleware.userSessions.has('test-user-id')).toBe(false);
        });

        it('deve usar logout type padrão', () => {
            const sessionFilePath = '/path/to/session.log';
            LogMiddleware.userSessions.set('test-user-id', sessionFilePath);

            LogMiddleware.endSession('test-user-id');

            expect(mockLogService.logEvent).toHaveBeenCalledWith(
                sessionFilePath,
                'LOGOUT',
                { tipo: 'manual' }
            );
        });

        it('deve não fazer nada se sessão não existir', () => {
            LogMiddleware.endSession('user-inexistente');

            expect(mockLogService.logEvent).not.toHaveBeenCalled();
            expect(mockLogService.endSession).not.toHaveBeenCalled();
        });

        it('deve tratar erro graciosamente', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const sessionFilePath = '/path/to/session.log';
            LogMiddleware.userSessions.set('test-user-id', sessionFilePath);
            mockLogService.logEvent.mockImplementation(() => {
                throw new Error('Erro de teste');
            });

            LogMiddleware.endSession('test-user-id');

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao finalizar sessão de log:', expect.any(Error));
            
            consoleErrorSpy.mockRestore();
        });
    });

    describe('logFailedLogin', () => {
        it('deve registrar tentativa de login falhada', () => {
            const securityDir = '/path/to/security';
            mockLogService.ensureUserDirectory.mockReturnValue(securityDir);
            mockLogService.extractRequestInfo.mockReturnValue({ ip: '127.0.0.1' });
            path.join.mockReturnValue('/path/to/security/failed_login_timestamp.log');

            LogMiddleware.logFailedLogin('12345', 'senha_incorreta', mockReq);

            expect(mockLogService.ensureUserDirectory).toHaveBeenCalledWith('SECURITY');
            expect(mockLogService.extractRequestInfo).toHaveBeenCalledWith(mockReq);
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                '/path/to/security/failed_login_timestamp.log',
                expect.stringContaining('"matricula": "12345"')
            );
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                '/path/to/security/failed_login_timestamp.log',
                expect.stringContaining('"motivo": "senha_incorreta"')
            );
        });

        it('deve tratar erro graciosamente', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockLogService.ensureUserDirectory.mockImplementation(() => {
                throw new Error('Erro de teste');
            });

            LogMiddleware.logFailedLogin('12345', 'senha_incorreta', mockReq);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao registrar tentativa de login falhada:', expect.any(Error));
            
            consoleErrorSpy.mockRestore();
        });
    });

    describe('logCriticalEvent', () => {
        it('deve registrar evento crítico', () => {
            const sessionFilePath = '/path/to/session.log';
            LogMiddleware.userSessions.set('test-user-id', sessionFilePath);
            
            const eventData = { produto: 'abc123', quantidade: 10 };

            LogMiddleware.logCriticalEvent('test-user-id', 'ESTOQUE_MOVIMENTO', eventData, mockReq);

            expect(mockLogService.logEvent).toHaveBeenCalledWith(
                sessionFilePath,
                'ESTOQUE_MOVIMENTO',
                {
                    produto: 'abc123',
                    quantidade: 10,
                    prioridade: 'CRITICA'
                },
                mockReq
            );
        });

        it('deve não fazer nada se sessão não existir', () => {
            LogMiddleware.logCriticalEvent('user-inexistente', 'EVENTO', {}, mockReq);

            expect(mockLogService.logEvent).not.toHaveBeenCalled();
        });

        it('deve tratar erro graciosamente', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const sessionFilePath = '/path/to/session.log';
            LogMiddleware.userSessions.set('test-user-id', sessionFilePath);
            mockLogService.logEvent.mockImplementation(() => {
                throw new Error('Erro de teste');
            });

            LogMiddleware.logCriticalEvent('test-user-id', 'EVENTO', {}, mockReq);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao registrar evento crítico:', expect.any(Error));
            
            consoleErrorSpy.mockRestore();
        });
    });

    describe('getUserLogs', () => {
        it('deve retornar logs do usuário', () => {
            const mockLogs = [{ timestamp: '2023-01-01', event: 'LOGIN' }];
            mockLogService.getUserLogs.mockReturnValue(mockLogs);

            const result = LogMiddleware.getUserLogs('test-user-id', 5);

            expect(mockLogService.getUserLogs).toHaveBeenCalledWith('test-user-id', 5);
            expect(result).toEqual(mockLogs);
        });

        it('deve usar limite padrão', () => {
            LogMiddleware.getUserLogs('test-user-id');

            expect(mockLogService.getUserLogs).toHaveBeenCalledWith('test-user-id', 10);
        });
    });

    describe('searchEvents', () => {
        it('deve buscar eventos', () => {
            const mockEvents = [{ timestamp: '2023-01-01', event: 'LOGIN' }];
            mockLogService.searchEvents.mockReturnValue(mockEvents);

            const result = LogMiddleware.searchEvents('LOGIN', '2023-01-01', '2023-12-31');

            expect(mockLogService.searchEvents).toHaveBeenCalledWith('LOGIN', '2023-01-01', '2023-12-31');
            expect(result).toEqual(mockEvents);
        });

        it('deve usar datas padrão', () => {
            LogMiddleware.searchEvents('LOGIN');

            expect(mockLogService.searchEvents).toHaveBeenCalledWith('LOGIN', null, null);
        });
    });
});
