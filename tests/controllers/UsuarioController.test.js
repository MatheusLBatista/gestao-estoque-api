    import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Configurar os mocks
jest.mock('../../src/services/usuarioService.js', () => {
    return jest.fn().mockImplementation(() => ({
        listarUsuarios: jest.fn(),
        cadastrarUsuario: jest.fn(),
        buscarUsuarioPorID: jest.fn(),
        buscarUsuarioPorMatricula: jest.fn(),
        atualizarUsuario: jest.fn(),
        deletarUsuario: jest.fn(),
        desativarUsuario: jest.fn(),
        reativarUsuario: jest.fn(),
        criarComSenha: jest.fn(),
        verificarEmailExistente: jest.fn(),
        criarUsuario: jest.fn(),
        adicionarUsuarioAoGrupo: jest.fn(),
        removerUsuarioDoGrupo: jest.fn(),
        adicionarPermissaoAoUsuario: jest.fn(),
        removerPermissaoDoUsuario: jest.fn(),
        obterPermissoesUsuario: jest.fn(),
    }));
});

jest.mock('../../src/services/EmailService.js', () => ({
    default: {
        enviarCodigoCadastro: jest.fn(),
    }
}));

jest.mock('../../src/utils/helpers/index.js', () => ({
    CommonResponse: {
        success: jest.fn(),
        error: jest.fn(),
        created: jest.fn(),
    },
    CustomError: class extends Error {
        constructor(options) {
            super(options.customMessage || 'Custom error');
            this.statusCode = options.statusCode;
            this.errorType = options.errorType;
            this.field = options.field;
            this.customMessage = options.customMessage;
        }
    },
    HttpStatusCodes: {
        BAD_REQUEST: { code: 400 },
        NOT_FOUND: { code: 404 },
        OK: { code: 200 },
        CREATED: { code: 201 }
    },
}));

jest.mock('../../src/utils/validators/schemas/zod/UsuarioSchema.js', () => ({
    UsuarioSchema: { parse: jest.fn() },
    UsuarioUpdateSchema: { parseAsync: jest.fn() },
}));

jest.mock('../../src/utils/validators/schemas/zod/querys/UsuarioQuerySchema.js', () => ({
    UsuarioQuerySchema: { parseAsync: jest.fn() },
    UsuarioIdSchema: {
        parse: jest.fn((id) => {
            if (!id || typeof id !== 'string' || id.length !== 24) {
                throw new Error('Invalid ObjectId');
            }
            return id;
        })
    },
    UsuarioMatriculaSchema: { parse: jest.fn() },
}));

jest.mock('../../src/middlewares/LogMiddleware.js', () => ({
    __esModule: true,
    default: {
        log: jest.fn(),
        logCriticalEvent: jest.fn()
    }
}));

// Importar o controller
import UsuarioController from '../../src/controllers/UsuarioController.js';
import UsuarioService from '../../src/services/usuarioService.js';
import EmailService from '../../src/services/EmailService.js';
import { CommonResponse } from '../../src/utils/helpers/index.js';
import { UsuarioSchema } from '../../src/utils/validators/schemas/zod/UsuarioSchema.js';
import { UsuarioQuerySchema, UsuarioIdSchema, UsuarioMatriculaSchema } from '../../src/utils/validators/schemas/zod/querys/UsuarioQuerySchema.js';
import LogMiddleware from '../../src/middlewares/LogMiddleware.js';

// Mock do console.log para evitar poluir a saída dos testes
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('UsuarioController', () => {
    let usuarioController;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        usuarioController = new UsuarioController();
        
        // Mock response object
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };

        // Mock request object
        mockReq = {
            params: {},
            query: {},
            body: {},
            userId: '507f1f77bcf86cd799439011',
            userMatricula: '12345'
        };

        // Limpar mocks
        jest.clearAllMocks();

        // Setup EmailService mock
        EmailService.enviarCodigoCadastro = jest.fn();
    });

    describe('Constructor', () => {
        it('should initialize with UsuarioService', () => {
            expect(usuarioController.service).toBeDefined();
        });
    });

    describe('validateId method', () => {
        it('should validate valid ObjectId', () => {
            const validId = '507f1f77bcf86cd799439011';
            
            expect(() => usuarioController.validateId(validId)).not.toThrow();
        });

        it('should throw error for empty ID', () => {
            expect(() => usuarioController.validateId('')).toThrow();
        });

        it('should throw error for null ID', () => {
            expect(() => usuarioController.validateId(null)).toThrow();
        });

        it('should throw error for undefined ID', () => {
            expect(() => usuarioController.validateId(undefined)).toThrow();
        });
    });

    describe('listarUsuarios', () => {
        it('should return usuarios list successfully', async () => {
            const mockData = {
                docs: [
                    { _id: '507f1f77bcf86cd799439011', nome: 'Usuario 1' },
                    { _id: '507f1f77bcf86cd799439012', nome: 'Usuario 2' }
                ]
            };
            
            usuarioController.service.listarUsuarios.mockResolvedValue(mockData);
            
            await usuarioController.listarUsuarios(mockReq, mockRes);
            
            expect(usuarioController.service.listarUsuarios).toHaveBeenCalledWith(mockReq);
            expect(CommonResponse.success).toHaveBeenCalledWith(mockRes, mockData);
        });

        it('should return error when no usuarios found', async () => {
            const mockData = { docs: [] };
            
            usuarioController.service.listarUsuarios.mockResolvedValue(mockData);
            
            await usuarioController.listarUsuarios(mockReq, mockRes);
            
            expect(CommonResponse.error).toHaveBeenCalledWith(
                mockRes,
                404,
                'resourceNotFound',
                'Usuario',
                [],
                'Nenhum usuário encontrado com os critérios informados.'
            );
        });

        it('should validate ID when provided in params', async () => {
            mockReq.params.id = '507f1f77bcf86cd799439011';
            const mockData = { docs: [{ _id: '507f1f77bcf86cd799439011', nome: 'Usuario 1' }] };
            
            usuarioController.service.listarUsuarios.mockResolvedValue(mockData);
            
            await usuarioController.listarUsuarios(mockReq, mockRes);
            
            expect(UsuarioIdSchema.parse).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });

        it('should validate query when provided', async () => {
            mockReq.query = { nome: 'test' };
            const mockData = { docs: [{ _id: '507f1f77bcf86cd799439011', nome: 'test' }] };
            
            usuarioController.service.listarUsuarios.mockResolvedValue(mockData);
            
            await usuarioController.listarUsuarios(mockReq, mockRes);
            
            expect(UsuarioQuerySchema.parseAsync).toHaveBeenCalledWith({ nome: 'test' });
        });
    });

    describe('buscarUsuarioPorID', () => {
        it('should find user by ID successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const mockUser = { id: userId, nome: 'Test User', email: 'test@example.com' };

            mockReq.params = { id: userId };
            usuarioController.service.buscarUsuarioPorID.mockResolvedValue(mockUser);

            await usuarioController.buscarUsuarioPorID(mockReq, mockRes);

            expect(UsuarioIdSchema.parse).toHaveBeenCalledWith(userId);
            expect(usuarioController.service.buscarUsuarioPorID).toHaveBeenCalledWith(userId);
            expect(CommonResponse.success).toHaveBeenCalledWith(mockRes, mockUser, 200, 'Usuário encontrado com sucesso.');
        });
    });

    describe('buscarUsuarioPorMatricula', () => {
        it('should find user by matricula successfully', async () => {
            const matricula = 'MAT123';
            const mockUser = { id: '507f1f77bcf86cd799439011', matricula, nome: 'Test User' };

            mockReq.params = { matricula };
            usuarioController.service.buscarUsuarioPorMatricula.mockResolvedValue(mockUser);

            await usuarioController.buscarUsuarioPorMatricula(mockReq, mockRes);

            expect(usuarioController.service.buscarUsuarioPorMatricula).toHaveBeenCalledWith(matricula);
            expect(CommonResponse.success).toHaveBeenCalledWith(mockRes, mockUser, 200, 'Usuário encontrado com sucesso.');
        });

        it('should throw error when matricula is missing in buscarUsuarioPorMatricula', async () => {
            mockReq.params = {}; // missing matricula

            await expect(usuarioController.buscarUsuarioPorMatricula(mockReq, mockRes))
                .rejects.toThrow('A matrícula é obrigatória para esta busca.');
        });
    });

    describe('cadastrarUsuario', () => {
        it('should register user successfully', async () => {
            const mockUserData = { 
                nome: 'Test User', 
                email: 'test@example.com', 
                perfil: 'estoquista' 
            };
            const mockCreatedUser = { 
                _id: '507f1f77bcf86cd799439011', 
                matricula: 'MAT123', 
                ...mockUserData,
                toObject: jest.fn().mockReturnValue({
                    _id: '507f1f77bcf86cd799439011',
                    matricula: 'MAT123',
                    ...mockUserData
                })
            };
            const codigoSeguranca = '123456';

            mockReq.body = mockUserData;
            mockReq.userId = 'admin123';
            mockReq.userMatricula = 'ADMIN001';
            UsuarioSchema.parse.mockReturnValue(mockUserData);
            usuarioController.service.cadastrarUsuario.mockResolvedValue(mockCreatedUser);
            EmailService.enviarCodigoCadastro.mockResolvedValue({ sentViaEmail: true });

            await usuarioController.cadastrarUsuario(mockReq, mockRes);

            expect(UsuarioSchema.parse).toHaveBeenCalledWith(mockUserData);
            expect(usuarioController.service.cadastrarUsuario).toHaveBeenCalled();
            expect(EmailService.enviarCodigoCadastro).toHaveBeenCalled();
            expect(LogMiddleware.logCriticalEvent).toHaveBeenCalled();
            expect(CommonResponse.created).toHaveBeenCalled();
        });

        it('should register user with password successfully (admin case)', async () => {
            const mockUserData = { 
                nome: 'Test User', 
                email: 'test@example.com', 
                perfil: 'admin',
                senha: 'password123' // With password
            };
            const mockCreatedUser = { 
                _id: '507f1f77bcf86cd799439011', 
                matricula: 'MAT123', 
                ...mockUserData 
            };

            mockReq.body = mockUserData;
            mockReq.userId = 'admin123';
            mockReq.userMatricula = 'ADMIN001';
            UsuarioSchema.parse.mockReturnValue(mockUserData);
            usuarioController.service.cadastrarUsuario.mockResolvedValue(mockCreatedUser);

            await usuarioController.cadastrarUsuario(mockReq, mockRes);

            expect(UsuarioSchema.parse).toHaveBeenCalledWith(mockUserData);
            expect(usuarioController.service.cadastrarUsuario).toHaveBeenCalledWith(mockUserData);
            expect(LogMiddleware.logCriticalEvent).toHaveBeenCalledWith(
                mockReq.userId,
                'USUARIO_CRIADO',
                {
                    usuario_criado: mockCreatedUser._id,
                    matricula: mockCreatedUser.matricula,
                    perfil: mockCreatedUser.perfil,
                    criado_por: mockReq.userMatricula
                },
                mockReq
            );
            expect(CommonResponse.created).toHaveBeenCalledWith(
                mockRes,
                mockCreatedUser,
                201,
                'Usuário cadastrado com sucesso.'
            );
        });

        it('should handle email sending failure in cadastrarUsuario', async () => {
            const mockUserData = { 
                nome: 'Test User', 
                email: 'test@example.com', 
                perfil: 'estoquista'
                // no senha - will trigger password-less flow
            };
            const mockCreatedUser = { 
                _id: '507f1f77bcf86cd799439011', 
                matricula: 'MAT123', 
                ...mockUserData,
                toObject: jest.fn().mockReturnValue({
                    _id: '507f1f77bcf86cd799439011',
                    matricula: 'MAT123',
                    ...mockUserData
                })
            };

            mockReq.body = mockUserData;
            mockReq.userId = 'admin123';
            mockReq.userMatricula = 'ADMIN001';
            UsuarioSchema.parse.mockReturnValue(mockUserData);
            usuarioController.service.cadastrarUsuario.mockResolvedValue(mockCreatedUser);
            EmailService.enviarCodigoCadastro.mockResolvedValue({ 
                sentViaEmail: false, 
                reason: 'Email service unavailable' 
            });

            await usuarioController.cadastrarUsuario(mockReq, mockRes);

            expect(EmailService.enviarCodigoCadastro).toHaveBeenCalled();
            expect(CommonResponse.created).toHaveBeenCalled();
            // Should have called with email failure information
            expect(CommonResponse.created.mock.calls[0][1]).toEqual(
                expect.objectContaining({
                    email_enviado: false,
                    motivo_email_nao_enviado: 'Email service unavailable'
                })
            );
        });
    });

    describe('criarComSenha', () => {
        it('should create user with password successfully', async () => {
            const mockUserData = {
                nome: 'Test User',
                email: 'test@example.com',
                senha: 'senha123',
                perfil: 'admin'
            };
            const mockCreatedUser = { 
                _id: '507f1f77bcf86cd799439011', 
                nome: 'Test User',
                email: 'test@example.com',
                perfil: 'admin',
                ativo: true
            };

            mockReq.body = mockUserData;
            usuarioController.service.verificarEmailExistente.mockResolvedValue(false);
            usuarioController.service.criarUsuario.mockResolvedValue(mockCreatedUser);

            await usuarioController.criarComSenha(mockReq, mockRes);

            expect(usuarioController.service.verificarEmailExistente).toHaveBeenCalledWith(mockUserData.email);
            expect(usuarioController.service.criarUsuario).toHaveBeenCalledWith({
                nome: mockUserData.nome,
                email: mockUserData.email,
                senha: mockUserData.senha,
                perfil: mockUserData.perfil,
                ativo: true
            });
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Usuário criado com sucesso',
                usuario: {
                    id: mockCreatedUser._id,
                    nome: mockCreatedUser.nome,
                    email: mockCreatedUser.email,
                    perfil: mockCreatedUser.perfil,
                    ativo: mockCreatedUser.ativo
                }
            });
        });

        it('should return error when required fields are missing', async () => {
            mockReq.body = { nome: 'Test User' }; // missing email and senha

            await usuarioController.criarComSenha(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Nome, email e senha são obrigatórios',
                type: 'validationError'
            });
        });

        it('should return error when email already exists', async () => {
            const mockUserData = {
                nome: 'Test User',
                email: 'test@example.com',
                senha: 'senha123'
            };

            mockReq.body = mockUserData;
            usuarioController.service.verificarEmailExistente.mockResolvedValue(true);

            await usuarioController.criarComSenha(mockReq, mockRes);

            expect(usuarioController.service.verificarEmailExistente).toHaveBeenCalledWith(mockUserData.email);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Este email já está em uso',
                type: 'validationError'
            });
        });
    });

    describe('adicionarUsuarioAoGrupo', () => {
        it('should add user to group successfully', async () => {
            const usuarioId = '507f1f77bcf86cd799439011';
            const grupoId = '507f1f77bcf86cd799439012';
            const mockResult = { success: true };
            
            mockReq.body = { usuarioId, grupoId };
            usuarioController.service.adicionarUsuarioAoGrupo.mockResolvedValue(mockResult);
            
            await usuarioController.adicionarUsuarioAoGrupo(mockReq, mockRes);
            
            expect(usuarioController.service.adicionarUsuarioAoGrupo).toHaveBeenCalledWith(usuarioId, grupoId);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockResult,
                200,
                'Usuário adicionado ao grupo com sucesso.'
            );
        });

        it('should throw error when userId is missing', async () => {
            mockReq.body = { grupoId: '507f1f77bcf86cd799439012' };
            
            await expect(usuarioController.adicionarUsuarioAoGrupo(mockReq, mockRes))
                .rejects.toThrow('ID do usuário e ID do grupo são obrigatórios.');
        });
    });

    describe('removerUsuarioDoGrupo', () => {
        it('should remove user from group successfully', async () => {
            const usuarioId = '507f1f77bcf86cd799439011';
            const grupoId = '507f1f77bcf86cd799439012';
            const mockResult = { success: true };
            
            mockReq.body = { usuarioId, grupoId };
            usuarioController.service.removerUsuarioDoGrupo.mockResolvedValue(mockResult);
            
            await usuarioController.removerUsuarioDoGrupo(mockReq, mockRes);
            
            expect(usuarioController.service.removerUsuarioDoGrupo).toHaveBeenCalledWith(usuarioId, grupoId);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockResult,
                200,
                'Usuário removido do grupo com sucesso.'
            );
        });

        it('should throw error when userId is missing', async () => {
            mockReq.body = { grupoId: '507f1f77bcf86cd799439012' };
            
            await expect(usuarioController.removerUsuarioDoGrupo(mockReq, mockRes))
                .rejects.toThrow('ID do usuário e ID do grupo são obrigatórios.');
        });
    });

    describe('adicionarPermissaoAoUsuario', () => {
        it('should add permission to user successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const permissao = { rota: 'usuarios', metodo: 'GET' };
            const mockResult = { success: true };
            
            mockReq.params = { id: userId };
            mockReq.body = permissao;
            mockReq.userId = 'admin123';
            usuarioController.service.adicionarPermissaoAoUsuario.mockResolvedValue(mockResult);
            
            await usuarioController.adicionarPermissaoAoUsuario(mockReq, mockRes);
            
            expect(usuarioController.service.adicionarPermissaoAoUsuario).toHaveBeenCalledWith(userId, permissao);
            expect(LogMiddleware.logCriticalEvent).toHaveBeenCalled();
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockResult,
                200,
                'Permissão adicionada ao usuário com sucesso.'
            );
        });

        it('should throw error when userId is missing', async () => {
            mockReq.params = {};
            mockReq.body = { rota: 'usuarios' };
            
            await expect(usuarioController.adicionarPermissaoAoUsuario(mockReq, mockRes))
                .rejects.toThrow('ID do usuário é obrigatório.');
        });
    });

    describe('removerPermissaoDoUsuario', () => {
        it('should remove permission from user successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const rota = 'usuarios';
            const dominio = 'admin';
            const mockResult = { success: true };
            
            mockReq.params = { id: userId };
            mockReq.body = { rota, dominio };
            mockReq.userId = 'admin123';
            usuarioController.service.removerPermissaoDoUsuario.mockResolvedValue(mockResult);
            
            await usuarioController.removerPermissaoDoUsuario(mockReq, mockRes);
            
            expect(usuarioController.service.removerPermissaoDoUsuario).toHaveBeenCalledWith(userId, rota, dominio);
            expect(LogMiddleware.logCriticalEvent).toHaveBeenCalled();
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockResult,
                200,
                'Permissão removida do usuário com sucesso.'
            );
        });

        it('should throw error when userId is missing', async () => {
            mockReq.params = {};
            mockReq.body = { rota: 'usuarios' };
            
            await expect(usuarioController.removerPermissaoDoUsuario(mockReq, mockRes))
                .rejects.toThrow('ID do usuário é obrigatório.');
        });

        it('should throw error when rota is missing', async () => {
            mockReq.params = { id: '507f1f77bcf86cd799439011' };
            mockReq.body = { dominio: 'admin' };
            
            await expect(usuarioController.removerPermissaoDoUsuario(mockReq, mockRes))
                .rejects.toThrow('Nome da rota é obrigatório.');
        });
    });

    // Testes adicionais para melhorar a cobertura
    describe('edge cases and validation', () => {
        it('should handle missing query parameters in listarUsuarios', async () => {
            mockReq.params = {};
            mockReq.query = {};
            
            const mockData = { docs: [{ id: '1', nome: 'Test' }] };
            usuarioController.service.listarUsuarios.mockResolvedValue(mockData);
            
            await usuarioController.listarUsuarios(mockReq, mockRes);
            
            expect(usuarioController.service.listarUsuarios).toHaveBeenCalledWith(mockReq);
            expect(CommonResponse.success).toHaveBeenCalled();
        });

        it('should handle empty results in listarUsuarios', async () => {
            mockReq.params = {};
            mockReq.query = {};
            
            const mockData = { docs: [] };
            usuarioController.service.listarUsuarios.mockResolvedValue(mockData);
            
            await usuarioController.listarUsuarios(mockReq, mockRes);
            
            expect(CommonResponse.error).toHaveBeenCalledWith(
                mockRes,
                404,
                'resourceNotFound',
                'Usuario',
                [],
                'Nenhum usuário encontrado com os critérios informados.'
            );
        });

        it('should validate ID in buscarUsuarioPorID', async () => {
            const userId = '507f1f77bcf86cd799439011';
            mockReq.params = { id: userId };
            
            const mockUser = { id: userId, nome: 'Test User' };
            usuarioController.service.buscarUsuarioPorID.mockResolvedValue(mockUser);
            
            await usuarioController.buscarUsuarioPorID(mockReq, mockRes);
            
            expect(UsuarioIdSchema.parse).toHaveBeenCalledWith(userId);
            expect(CommonResponse.success).toHaveBeenCalled();
        });

        it('should throw error when ID is missing in obterPermissoesUsuario', async () => {
            mockReq.params = {}; // missing id

            await expect(usuarioController.obterPermissoesUsuario(mockReq, mockRes))
                .rejects.toThrow('ID do usuário é obrigatório.');
        });

        it('should throw error when ID is missing in atualizarUsuario', async () => {
            mockReq.params = {}; // missing id
            mockReq.body = { nome: 'Updated Name' };

            await expect(usuarioController.atualizarUsuario(mockReq, mockRes))
                .rejects.toThrow('ID do usuário é obrigatório.');
        });

        it('should throw error when no data provided for update', async () => {
            mockReq.params = { id: '507f1f77bcf86cd799439011' };
            mockReq.body = {}; // empty body

            await expect(usuarioController.atualizarUsuario(mockReq, mockRes))
                .rejects.toThrow('Nenhum dado fornecido para atualização.');
        });
    });
});
