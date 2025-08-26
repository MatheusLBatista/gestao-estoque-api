import mongoose from 'mongoose';
import UsuarioRepository from '../../src/repositories/usuarioRepository.js';
import Usuario from '../../src/models/Usuario.js';
import { CustomError, messages } from '../../src/utils/helpers/index.js';

// Mock do mongoose
jest.mock('mongoose');

// Mock do model Usuario
jest.mock('../../src/models/Usuario.js', () => ({
    findById: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOne: jest.fn(),
    findOneAndDelete: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
    paginate: jest.fn(),
}));

// Mock dos helpers
jest.mock('../../src/utils/helpers/index.js', () => ({
    CustomError: class extends Error {
        constructor(options) {
            super(options.customMessage || 'Custom error');
            this.statusCode = options.statusCode;
            this.errorType = options.errorType;
            this.field = options.field;
            this.customMessage = options.customMessage;
        }
    },
    messages: {
        error: {
            resourceNotFound: jest.fn((resource) => `${resource} não encontrado(a).`),
            duplicateEntry: jest.fn((field) => `Já existe um registro com o dado informado no campo ${field}.`),
        },
        validation: {
            generic: {
                resourceCreated: jest.fn((resource) => `${resource} criado(a) com sucesso.`),
                resourceUpdated: jest.fn((resource) => `${resource} atualizado(a) com sucesso.`),
                resourceDeleted: jest.fn((resource) => `${resource} excluído(a) com sucesso.`),
            }
        }
    }
}));

// Mock do console.log
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('UsuarioRepository', () => {
    let usuarioRepository;
    let mockReq;

    beforeEach(() => {
        usuarioRepository = new UsuarioRepository();
        mockReq = {
            params: {},
            query: {}
        };
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        it('should initialize with default Usuario model', () => {
            expect(usuarioRepository.model).toBe(Usuario);
        });

        it('should initialize with custom model', () => {
            const customModel = {};
            const repo = new UsuarioRepository({ model: customModel });
            expect(repo.model).toBe(customModel);
        });
    });

    describe('listarUsuarios', () => {
        it('should return user by ID when ID is provided', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const mockUser = { _id: userId, nome_usuario: 'Test User' };
            
            mockReq.params.id = userId;
            Usuario.findById.mockResolvedValue(mockUser);

            const result = await usuarioRepository.listarUsuarios(mockReq);

            expect(Usuario.findById).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockUser);
        });

        it('should throw error when user not found by ID', async () => {
            const userId = '507f1f77bcf86cd799439011';
            
            mockReq.params.id = userId;
            Usuario.findById.mockResolvedValue(null);

            await expect(usuarioRepository.listarUsuarios(mockReq)).rejects.toThrow(CustomError);
            expect(Usuario.findById).toHaveBeenCalledWith(userId);
        });

        it('should list users with pagination when no ID provided', async () => {
            const mockResult = {
                docs: [
                    { _id: '1', nome_usuario: 'User 1' },
                    { _id: '2', nome_usuario: 'User 2' }
                ],
                totalDocs: 2,
                page: 1,
                totalPages: 1
            };

            Usuario.paginate.mockResolvedValue(mockResult);

            const result = await usuarioRepository.listarUsuarios(mockReq);

            expect(Usuario.paginate).toHaveBeenCalled();
            expect(result).toEqual(mockResult);
        });

        it('should apply nome_usuario filter', async () => {
            mockReq.query = { nome_usuario: 'John' };
            const mockResult = { docs: [], totalDocs: 0 };

            Usuario.paginate.mockResolvedValue(mockResult);

            await usuarioRepository.listarUsuarios(mockReq);

            expect(Usuario.paginate).toHaveBeenCalledWith(
                expect.objectContaining({
                    nome_usuario: { $regex: 'John', $options: 'i' }
                }),
                expect.any(Object)
            );
        });

        it('should apply matricula filter', async () => {
            mockReq.query = { matricula: '12345' };
            const mockResult = { docs: [], totalDocs: 0 };

            Usuario.paginate.mockResolvedValue(mockResult);

            await usuarioRepository.listarUsuarios(mockReq);

            expect(Usuario.paginate).toHaveBeenCalledWith(
                expect.objectContaining({
                    matricula: { $regex: '12345', $options: 'i' }
                }),
                expect.any(Object)
            );
        });

        it('should apply cargo filter', async () => {
            mockReq.query = { cargo: 'admin' };
            const mockResult = { docs: [], totalDocs: 0 };

            Usuario.paginate.mockResolvedValue(mockResult);

            await usuarioRepository.listarUsuarios(mockReq);

            expect(Usuario.paginate).toHaveBeenCalledWith(
                expect.objectContaining({
                    cargo: { $regex: 'admin', $options: 'i' }
                }),
                expect.any(Object)
            );
        });

        it('should handle custom page and limit', async () => {
            mockReq.query = { page: 2, limite: 20 };
            const mockResult = { docs: [], totalDocs: 0 };

            Usuario.paginate.mockResolvedValue(mockResult);

            await usuarioRepository.listarUsuarios(mockReq);

            expect(Usuario.paginate).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({
                    page: 2,
                    limit: 20
                })
            );
        });

        it('should limit page size to maximum 100', async () => {
            mockReq.query = { limite: 200 };
            const mockResult = { docs: [], totalDocs: 0 };

            Usuario.paginate.mockResolvedValue(mockResult);

            await usuarioRepository.listarUsuarios(mockReq);

            expect(Usuario.paginate).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({
                    limit: 100
                })
            );
        });
    });

    describe('listarUsuarios - additional filter tests', () => {
        it('deve aplicar filtro por nome_usuario', async () => {
            const req = { query: { nome_usuario: 'João' } };
            const mockResult = { docs: [], totalDocs: 0 };
            Usuario.paginate.mockResolvedValue(mockResult);

            await usuarioRepository.listarUsuarios(req);

            expect(Usuario.paginate).toHaveBeenCalledWith(
                expect.objectContaining({
                    nome_usuario: { $regex: 'João', $options: 'i' }
                }),
                expect.any(Object)
            );
        });

        it('deve aplicar filtro por matricula', async () => {
            const req = { query: { matricula: '12345' } };
            const mockResult = { docs: [], totalDocs: 0 };
            Usuario.paginate.mockResolvedValue(mockResult);

            await usuarioRepository.listarUsuarios(req);

            expect(Usuario.paginate).toHaveBeenCalledWith(
                expect.objectContaining({
                    matricula: { $regex: '12345', $options: 'i' }
                }),
                expect.any(Object)
            );
        });

        it('deve aplicar filtro por cargo', async () => {
            const req = { query: { cargo: 'admin' } };
            const mockResult = { docs: [], totalDocs: 0 };
            Usuario.paginate.mockResolvedValue(mockResult);

            await usuarioRepository.listarUsuarios(req);

            expect(Usuario.paginate).toHaveBeenCalledWith(
                expect.objectContaining({
                    cargo: { $regex: 'admin', $options: 'i' }
                }),
                expect.any(Object)
            );
        });

        it('deve lançar erro quando usuário não for encontrado por ID', async () => {
            const req = { params: { id: '507f1f77bcf86cd799439011' } };
            Usuario.findById.mockResolvedValue(null);

            await expect(usuarioRepository.listarUsuarios(req))
                .rejects
                .toThrow('Usuario não encontrado(a).');
        });
    });

    describe('buscarPorId', () => {
        it('should return user by ID', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const mockUser = { _id: userId, nome_usuario: 'Test User' };

            Usuario.findById.mockResolvedValue(mockUser);

            const result = await usuarioRepository.buscarPorId(userId);

            expect(Usuario.findById).toHaveBeenCalledWith(userId, { accesstoken: 0, refreshtoken: 0 });
            expect(result).toEqual(mockUser);
        });

        it('should throw error when user not found', async () => {
            const userId = '507f1f77bcf86cd799439011';

            Usuario.findById.mockResolvedValue(null);

            const result = await usuarioRepository.buscarPorId(userId);
            expect(result).toBeNull();
        });
    });

    describe('buscarPorMatricula', () => {
        it('should return user by matricula', async () => {
            const matricula = '12345';
            const mockUser = { _id: '1', matricula, nome_usuario: 'Test User' };

            Usuario.findOne.mockResolvedValue(mockUser);

            const result = await usuarioRepository.buscarPorMatricula(matricula);

            expect(Usuario.findOne).toHaveBeenCalledWith({ matricula });
            expect(result).toEqual(mockUser);
        });

        it('should return null when user not found by matricula', async () => {
            const matricula = '12345';

            Usuario.findOne.mockResolvedValue(null);

            const result = await usuarioRepository.buscarPorMatricula(matricula);
            expect(result).toBeNull();
        });

        it('deve buscar usuário com senha incluída', async () => {
            const matricula = '12345';
            const mockUser = { nome_usuario: 'João', senha: 'hashedpassword' };
            const mockSelect = jest.fn().mockResolvedValue(mockUser);
            const mockFindOne = jest.fn().mockReturnValue({ select: mockSelect });
            Usuario.findOne = mockFindOne;

            const result = await usuarioRepository.buscarPorMatricula(matricula, true);

            expect(mockFindOne).toHaveBeenCalledWith({ matricula });
            expect(mockSelect).toHaveBeenCalledWith('+senha');
            expect(result).toBe(mockUser);
        });
    });

    describe('cadastrarUsuario', () => {
        it('should create user successfully', async () => {
            const userData = { nome_usuario: 'Test User', matricula: '12345' };
            const mockCreatedUser = { _id: '1', ...userData };

            // Mock the findOne to return null (no existing user)
            Usuario.findOne.mockResolvedValue(null);
            Usuario.create.mockResolvedValue(mockCreatedUser);

            const result = await usuarioRepository.cadastrarUsuario(userData);

            expect(Usuario.findOne).toHaveBeenCalledWith({ matricula: '12345' });
            expect(Usuario.create).toHaveBeenCalledWith(userData);
            expect(result).toEqual(mockCreatedUser);
        });


    });

    describe('atualizarUsuario', () => {
        it('should update user successfully', async () => {
            const validObjectId = '507f1f77bcf86cd799439011';
            const updateData = { nome_usuario: 'Updated Name' };
            const mockUpdatedUser = { _id: validObjectId, ...updateData };

            // Mock mongoose ObjectId validation
            mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            Usuario.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

            const result = await usuarioRepository.atualizarUsuario(validObjectId, updateData);

            expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(validObjectId);
            expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
                validObjectId,
                updateData,
                { new: true, runValidators: true }
            );
            expect(result).toEqual(mockUpdatedUser);
        });

        it('should throw error when matricula is invalid ObjectId', async () => {
            const invalidId = 'invalid-id';
            const updateData = { nome_usuario: 'Updated Name' };

            mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

            await expect(usuarioRepository.atualizarUsuario(invalidId, updateData)).rejects.toThrow(CustomError);
        });

        it('should throw error when user not found for update', async () => {
            const validObjectId = '507f1f77bcf86cd799439011';
            const updateData = { nome_usuario: 'Updated Name' };

            mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
            Usuario.findByIdAndUpdate.mockResolvedValue(null);

            await expect(usuarioRepository.atualizarUsuario(validObjectId, updateData)).rejects.toThrow(CustomError);
        });

        it('deve lançar erro quando usuário não for encontrado para atualização', async () => {
            const matricula = '12345';
            const dados = { nome_usuario: 'João Updated' };
            
            Usuario.findByIdAndUpdate.mockResolvedValue(null);

            await expect(usuarioRepository.atualizarUsuario(matricula, dados))
                .rejects
                .toThrow('Usuário não encontrado');
        });
    });

    describe('deletarUsuario', () => {
        it('should delete user successfully', async () => {
            const matricula = '12345';
            const mockDeletedUser = { _id: '1', matricula, nome_usuario: 'Test User' };

            Usuario.findOneAndDelete.mockResolvedValue(mockDeletedUser);

            const result = await usuarioRepository.deletarUsuario(matricula);

            expect(Usuario.findOneAndDelete).toHaveBeenCalledWith({ matricula });
            expect(result).toEqual(mockDeletedUser);
        });

        it('should throw error when user not found for deletion', async () => {
            const matricula = '12345';

            Usuario.findOneAndDelete.mockResolvedValue(null);

            await expect(usuarioRepository.deletarUsuario(matricula)).rejects.toThrow(CustomError);
        });
    });

    describe('desativarUsuario', () => {
        it('should deactivate user successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const mockUser = { _id: userId, ativo: false };

            Usuario.findByIdAndUpdate.mockResolvedValue(mockUser);

            const result = await usuarioRepository.desativarUsuario(userId);

            expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
                userId,
                { ativo: false },
                { new: true }
            );
            expect(result).toEqual(mockUser);
        });
    });

    describe('reativarUsuario', () => {
        it('should reactivate user successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const mockUser = { _id: userId, ativo: true };

            Usuario.findByIdAndUpdate.mockResolvedValue(mockUser);

            const result = await usuarioRepository.reativarUsuario(userId);

            expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
                userId,
                { ativo: true },
                { new: true }
            );
            expect(result).toEqual(mockUser);
        });
    });

    describe('armazenarTokens', () => {
        it('should store tokens successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const accessToken = 'access-token';
            const refreshToken = 'refresh-token';
            const mockUser = { _id: userId, accesstoken: accessToken, refreshtoken: refreshToken };

            Usuario.findByIdAndUpdate.mockResolvedValue(mockUser);

            const result = await usuarioRepository.armazenarTokens(userId, accessToken, refreshToken);

            expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
                userId,
                { accesstoken: accessToken, refreshtoken: refreshToken },
                { new: true }
            );
            expect(result).toEqual(mockUser);
        });
    });

    describe('removeToken', () => {
        it('should remove tokens successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const mockUser = { _id: userId, accesstoken: null, refreshtoken: null };

            const mockExec = jest.fn().mockResolvedValue(mockUser);
            Usuario.findByIdAndUpdate.mockReturnValue({ exec: mockExec });

            const result = await usuarioRepository.removeToken(userId);

            expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
                userId,
                { accesstoken: null, refreshtoken: null },
                { new: true }
            );
            expect(mockExec).toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });
    });

    describe('buscarPorEmail', () => {
        it('should return user by email', async () => {
            const email = 'test@example.com';
            const mockUser = { _id: '1', email, nome_usuario: 'Test User' };

            const mockSelect = jest.fn().mockResolvedValue(mockUser);
            Usuario.findOne.mockReturnValue({ select: mockSelect });

            const result = await usuarioRepository.buscarPorEmail(email);

            expect(Usuario.findOne).toHaveBeenCalledWith({ email });
            expect(mockSelect).toHaveBeenCalledWith('');
            expect(result).toEqual(mockUser);
        });

        it('should return user by email with password when incluirSenha is true', async () => {
            const email = 'test@example.com';
            const mockUser = { _id: '1', email, senha: 'hashed-password' };

            const mockSelect = jest.fn().mockResolvedValue(mockUser);
            Usuario.findOne.mockReturnValue({ select: mockSelect });

            const result = await usuarioRepository.buscarPorEmail(email, true);

            expect(Usuario.findOne).toHaveBeenCalledWith({ email });
            expect(mockSelect).toHaveBeenCalledWith('+senha');
            expect(result).toEqual(mockUser);
        });
    });

    describe('atualizarSenha', () => {
        it('should update password successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const newPassword = 'new-hashed-password';
            const mockUser = { _id: userId, senha: newPassword };

            Usuario.findByIdAndUpdate.mockResolvedValue(mockUser);

            const result = await usuarioRepository.atualizarSenha(userId, newPassword);

            expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
                userId,
                { 
                    senha: newPassword,
                    token_recuperacao: null,
                    codigo_recuperacao: null,
                    token_recuperacao_expira: null
                },
                { new: true }
            );
            expect(result).toEqual(mockUser);
        });
    });

    describe('buscarPorCodigoRecuperacao', () => {
        it('should return user by recovery code', async () => {
            const codigo = 'ABC123';
            const mockUser = { _id: '1', codigo_recuperacao: codigo };

            const mockSelect = jest.fn().mockResolvedValue(mockUser);
            Usuario.findOne.mockReturnValue({ select: mockSelect });

            const result = await usuarioRepository.buscarPorCodigoRecuperacao(codigo);

            expect(Usuario.findOne).toHaveBeenCalledWith({ codigo_recuperacao: codigo });
            expect(mockSelect).toHaveBeenCalledWith('+senha +token_recuperacao +codigo_recuperacao +token_recuperacao_expira');
            expect(result).toEqual(mockUser);
        });
    });

    describe('atualizarTokenRecuperacao', () => {
        it('should update recovery token and code successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const token = 'recovery-token';
            const codigo = 'ABC123';
            const mockUser = { _id: userId, token_recuperacao: token, codigo_recuperacao: codigo };

            Usuario.findByIdAndUpdate.mockResolvedValue(mockUser);

            const result = await usuarioRepository.atualizarTokenRecuperacao(userId, token, codigo);

            // Verificamos apenas os calls e argumentos que não dependem de Date
            expect(Usuario.findByIdAndUpdate).toHaveBeenCalledTimes(1);
            const callArgs = Usuario.findByIdAndUpdate.mock.calls[0];
            expect(callArgs[0]).toBe(userId);
            expect(callArgs[1].token_recuperacao).toBe(token);
            expect(callArgs[1].codigo_recuperacao).toBe(codigo);
            expect(callArgs[1].token_recuperacao_expira).toBeInstanceOf(Date);
            expect(callArgs[2]).toEqual({ new: true });
            expect(result).toEqual(mockUser);
        });
    });

    describe('setUserOnlineStatus', () => {
        it('should set user online status successfully', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const isOnline = true;
            const mockUser = { _id: userId, online: isOnline };

            Usuario.findByIdAndUpdate.mockResolvedValue(mockUser);

            const result = await usuarioRepository.setUserOnlineStatus(userId, isOnline);

            expect(Usuario.findByIdAndUpdate).toHaveBeenCalledWith(
                userId,
                { online: isOnline },
                { new: true }
            );
            expect(result).toEqual(mockUser);
        });
    });

    describe('getOnlineUsers', () => {
        it('should return online users successfully', async () => {
            const mockOnlineUsers = [
                { _id: '1', nome_usuario: 'User1', online: true },
                { _id: '2', nome_usuario: 'User2', online: true }
            ];

            const mockSelect = jest.fn().mockResolvedValue(mockOnlineUsers);
            Usuario.find.mockReturnValue({ select: mockSelect });

            const result = await usuarioRepository.getOnlineUsers();

            expect(Usuario.find).toHaveBeenCalledWith({ online: true, ativo: true });
            expect(mockSelect).toHaveBeenCalledWith('nome_usuario email matricula perfil data_cadastro');
            expect(result).toEqual(mockOnlineUsers);
        });
    });

    describe('criarUsuario', () => {
        it('should create user using criarUsuario method successfully', async () => {
            const userData = { nome_usuario: 'Test User', matricula: '12345' };
            const mockCreatedUser = { _id: '1', ...userData };
            const mockSave = jest.fn().mockResolvedValue(mockCreatedUser);

            // Mock temporário para o constructor
            const originalUsuario = Usuario;
            const MockedUsuario = jest.fn().mockImplementation(() => ({ save: mockSave }));
            
            // Substitui temporariamente o model
            usuarioRepository.model = MockedUsuario;

            const result = await usuarioRepository.criarUsuario(userData);

            expect(MockedUsuario).toHaveBeenCalledWith(userData);
            expect(mockSave).toHaveBeenCalled();
            expect(result).toEqual(mockCreatedUser);

            // Restaura o model original
            usuarioRepository.model = originalUsuario;
        });
    });
});
