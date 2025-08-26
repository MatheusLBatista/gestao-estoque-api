import GrupoRepository from '../../src/repositories/grupoRepository.js';
import Grupo from '../../src/models/Grupo.js';
import Usuario from '../../src/models/Usuario.js';
import Rota from '../../src/models/Rotas.js';
import { CustomError } from '../../src/utils/helpers/index.js';

// Mock dos models
jest.mock('../../src/models/Grupo.js');
jest.mock('../../src/models/Usuario.js');
jest.mock('../../src/models/Rotas.js');
jest.mock('../../src/utils/helpers/index.js', () => ({
    CustomError: jest.fn(),
    messages: {
        error: {
            resourceNotFound: jest.fn().mockReturnValue('Grupo não encontrado')
        }
    }
}));

describe('GrupoRepository', () => {
    let grupoRepository;
    
    beforeEach(() => {
        jest.clearAllMocks();
        grupoRepository = new GrupoRepository();
    });

    describe('listar', () => {
        it('deve listar grupos com sucesso', async () => {
            const mockResult = {
                docs: [
                    { _id: '507f1f77bcf86cd799439011', nome: 'Grupo A', descricao: 'Descrição A' },
                    { _id: '507f1f77bcf86cd799439012', nome: 'Grupo B', descricao: 'Descrição B' }
                ],
                totalDocs: 2,
                page: 1,
                limit: 10
            };

            grupoRepository.model.paginate = jest.fn().mockResolvedValue(mockResult);

            const req = { query: { page: 1, limite: 10 } };
            const result = await grupoRepository.listar(req);

            expect(result).toEqual(mockResult);
            expect(grupoRepository.model.paginate).toHaveBeenCalled();
        });

        it('deve buscar grupo por ID quando ID é fornecido', async () => {
            const mockGrupo = { 
                _id: '507f1f77bcf86cd799439011', 
                nome: 'Grupo A', 
                descricao: 'Descrição A' 
            };

            const mockQuery = {
                lean: jest.fn().mockResolvedValue(mockGrupo)
            };

            grupoRepository.model.findById = jest.fn().mockReturnValue(mockQuery);

            const req = { params: { id: '507f1f77bcf86cd799439011' }, query: {} };
            const result = await grupoRepository.listar(req);

            expect(result).toEqual(mockGrupo);
            expect(grupoRepository.model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });

        it('deve lançar erro quando grupo não é encontrado por ID', async () => {
            const mockQuery = {
                lean: jest.fn().mockResolvedValue(null)
            };

            grupoRepository.model.findById = jest.fn().mockReturnValue(mockQuery);
            CustomError.mockImplementation((params) => {
                const error = new Error(params.customMessage);
                error.statusCode = params.statusCode;
                return error;
            });

            const req = { params: { id: '507f1f77bcf86cd799439011' }, query: {} };

            await expect(grupoRepository.listar(req)).rejects.toThrow();
            expect(grupoRepository.model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });
    });

    describe('buscarPorId', () => {
        it('deve buscar grupo por ID com sucesso', async () => {
            const mockGrupo = { 
                _id: '507f1f77bcf86cd799439011', 
                nome: 'Grupo A', 
                descricao: 'Descrição A' 
            };

            const mockQuery = {
                lean: jest.fn().mockResolvedValue(mockGrupo)
            };

            grupoRepository.model.findById = jest.fn().mockReturnValue(mockQuery);

            const result = await grupoRepository.buscarPorId('507f1f77bcf86cd799439011');

            expect(result).toEqual(mockGrupo);
            expect(grupoRepository.model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });

        it('deve lançar erro quando grupo não existe', async () => {
            const mockQuery = {
                lean: jest.fn().mockResolvedValue(null)
            };

            grupoRepository.model.findById = jest.fn().mockReturnValue(mockQuery);
            CustomError.mockImplementation((params) => {
                const error = new Error(params.customMessage);
                error.statusCode = params.statusCode;
                return error;
            });

            await expect(grupoRepository.buscarPorId('507f1f77bcf86cd799439999')).rejects.toThrow();
            expect(grupoRepository.model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439999');
        });
    });

    describe('buscarPorNome', () => {
        it('deve buscar grupo por nome com sucesso', async () => {
            const mockGrupo = { 
                _id: '507f1f77bcf86cd799439011', 
                nome: 'Grupo A', 
                descricao: 'Descrição A' 
            };

            const mockQuery = {
                lean: jest.fn().mockResolvedValue(mockGrupo)
            };

            grupoRepository.model.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await grupoRepository.buscarPorNome('Grupo A');

            expect(result).toEqual(mockGrupo);
            expect(grupoRepository.model.findOne).toHaveBeenCalledWith({
                nome: { $regex: '^Grupo A$', $options: 'i' }
            });
        });

        it('deve buscar grupo por nome ignorando ID', async () => {
            const mockGrupo = { 
                _id: '507f1f77bcf86cd799439011', 
                nome: 'Grupo A', 
                descricao: 'Descrição A' 
            };

            const mockQuery = {
                lean: jest.fn().mockResolvedValue(mockGrupo)
            };

            grupoRepository.model.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await grupoRepository.buscarPorNome('Grupo A', '507f1f77bcf86cd799439012');

            expect(result).toEqual(mockGrupo);
            expect(grupoRepository.model.findOne).toHaveBeenCalledWith({
                nome: { $regex: '^Grupo A$', $options: 'i' },
                _id: { $ne: '507f1f77bcf86cd799439012' }
            });
        });
    });

    describe('criar', () => {
        it('deve criar grupo com sucesso', async () => {
            const grupoData = {
                nome: 'Novo Grupo',
                descricao: 'Nova descrição'
            };

            const mockGrupo = {
                _id: '507f1f77bcf86cd799439011',
                ...grupoData,
                save: jest.fn().mockResolvedValue({
                    _id: '507f1f77bcf86cd799439011',
                    ...grupoData
                })
            };

            // Mock do constructor
            grupoRepository.model = jest.fn().mockImplementation(() => mockGrupo);

            const result = await grupoRepository.criar(grupoData);

            expect(grupoRepository.model).toHaveBeenCalledWith(grupoData);
            expect(mockGrupo.save).toHaveBeenCalled();
            expect(result).toEqual({
                _id: '507f1f77bcf86cd799439011',
                ...grupoData
            });
        });

        it('deve lançar erro quando nome já existe', async () => {
            const grupoData = {
                nome: 'Grupo Existente',
                descricao: 'Nova descrição'
            };

            const mockError = new Error('Já existe um grupo com este nome');
            mockError.code = 11000;

            const mockGrupo = {
                save: jest.fn().mockRejectedValue(mockError)
            };

            grupoRepository.model = jest.fn().mockImplementation(() => mockGrupo);
            CustomError.mockImplementation((params) => {
                const error = new Error(params.customMessage);
                error.statusCode = params.statusCode;
                return error;
            });

            await expect(grupoRepository.criar(grupoData)).rejects.toThrow();
            expect(CustomError).toHaveBeenCalledWith({
                statusCode: 400,
                errorType: 'validationError',
                field: 'nome',
                details: [],
                customMessage: 'Já existe um grupo com este nome'
            });
        });
    });

    describe('atualizar', () => {
        it('deve atualizar grupo com sucesso', async () => {
            const grupoId = '507f1f77bcf86cd799439011';
            const updateData = { nome: 'Grupo Atualizado' };
            const mockGrupo = { 
                _id: grupoId, 
                nome: 'Grupo Atualizado', 
                descricao: 'Descrição A' 
            };

            grupoRepository.model.findByIdAndUpdate = jest.fn().mockResolvedValue(mockGrupo);

            const result = await grupoRepository.atualizar(grupoId, updateData);

            expect(result).toEqual(mockGrupo);
            expect(grupoRepository.model.findByIdAndUpdate).toHaveBeenCalledWith(
                grupoId,
                updateData,
                { new: true, runValidators: true }
            );
        });

        it('deve lançar erro quando grupo não existe para atualizar', async () => {
            const grupoId = '507f1f77bcf86cd799439999';
            const updateData = { nome: 'Grupo Atualizado' };

            grupoRepository.model.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
            CustomError.mockImplementation((params) => {
                const error = new Error(params.customMessage);
                error.statusCode = params.statusCode;
                return error;
            });

            await expect(grupoRepository.atualizar(grupoId, updateData)).rejects.toThrow();
            expect(grupoRepository.model.findByIdAndUpdate).toHaveBeenCalledWith(
                grupoId,
                updateData,
                { new: true, runValidators: true }
            );
        });
    });

    describe('deletar', () => {
        it('deve deletar grupo com sucesso', async () => {
            const grupoId = '507f1f77bcf86cd799439011';

            // Mock verificarUsuariosAssociados
            grupoRepository.verificarUsuariosAssociados = jest.fn().mockResolvedValue(false);
            grupoRepository.model.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: grupoId });

            const result = await grupoRepository.deletar(grupoId);

            expect(result).toBe(true);
            expect(grupoRepository.verificarUsuariosAssociados).toHaveBeenCalledWith(grupoId);
            expect(grupoRepository.model.findByIdAndDelete).toHaveBeenCalledWith(grupoId);
        });

        it('deve lançar erro quando há usuários associados', async () => {
            const grupoId = '507f1f77bcf86cd799439011';

            grupoRepository.verificarUsuariosAssociados = jest.fn().mockResolvedValue(true);
            CustomError.mockImplementation((params) => {
                const error = new Error(params.customMessage);
                error.statusCode = params.statusCode;
                return error;
            });

            await expect(grupoRepository.deletar(grupoId)).rejects.toThrow();
            expect(grupoRepository.verificarUsuariosAssociados).toHaveBeenCalledWith(grupoId);
        });

        it('deve lançar erro quando grupo não existe para deletar', async () => {
            const grupoId = '507f1f77bcf86cd799439999';

            grupoRepository.verificarUsuariosAssociados = jest.fn().mockResolvedValue(false);
            grupoRepository.model.findByIdAndDelete = jest.fn().mockResolvedValue(null);
            CustomError.mockImplementation((params) => {
                const error = new Error(params.customMessage);
                error.statusCode = params.statusCode;
                return error;
            });

            await expect(grupoRepository.deletar(grupoId)).rejects.toThrow();
            expect(grupoRepository.model.findByIdAndDelete).toHaveBeenCalledWith(grupoId);
        });
    });

    describe('verificarUsuariosAssociados', () => {
        it('deve retornar true quando há usuários associados', async () => {
            const grupoId = '507f1f77bcf86cd799439011';

            const mockQuery = {
                lean: jest.fn().mockResolvedValue({ _id: 'usuario123' })
            };

            grupoRepository.usuarioModel.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await grupoRepository.verificarUsuariosAssociados(grupoId);

            expect(result).toBe(true);
            expect(grupoRepository.usuarioModel.findOne).toHaveBeenCalledWith({ grupos: grupoId });
        });

        it('deve retornar false quando não há usuários associados', async () => {
            const grupoId = '507f1f77bcf86cd799439011';

            const mockQuery = {
                lean: jest.fn().mockResolvedValue(null)
            };

            grupoRepository.usuarioModel.findOne = jest.fn().mockReturnValue(mockQuery);

            const result = await grupoRepository.verificarUsuariosAssociados(grupoId);

            expect(result).toBe(false);
            expect(grupoRepository.usuarioModel.findOne).toHaveBeenCalledWith({ grupos: grupoId });
        });
    });

    describe('buscarPorPermissao', () => {
        it('deve buscar rotas por permissões', async () => {
            const permissoes = [
                { rota: 'usuarios', dominio: 'localhost' },
                { rota: 'grupos', dominio: 'localhost' }
            ];

            const mockRotas = [
                { _id: 'rota1', rota: 'usuarios', dominio: 'localhost' },
                { _id: 'rota2', rota: 'grupos', dominio: 'localhost' }
            ];

            const mockQuery = {
                lean: jest.fn().mockResolvedValue(mockRotas)
            };

            grupoRepository.rotaModel.find = jest.fn().mockReturnValue(mockQuery);

            const result = await grupoRepository.buscarPorPermissao(permissoes);

            expect(result).toEqual(mockRotas);
            expect(grupoRepository.rotaModel.find).toHaveBeenCalledWith({
                $or: [
                    { rota: 'usuarios', dominio: 'localhost' },
                    { rota: 'grupos', dominio: 'localhost' }
                ]
            });
        });

        it('deve retornar array vazio quando não há permissões', async () => {
            const result = await grupoRepository.buscarPorPermissao([]);
            expect(result).toEqual([]);

            const result2 = await grupoRepository.buscarPorPermissao(null);
            expect(result2).toEqual([]);
        });
    });

    describe('alterarStatus', () => {
        it('deve alterar status do grupo com sucesso', async () => {
            const grupoId = '507f1f77bcf86cd799439011';
            const ativo = false;
            const mockGrupo = { 
                _id: grupoId, 
                nome: 'Grupo A', 
                ativo: false 
            };

            grupoRepository.model.findByIdAndUpdate = jest.fn().mockResolvedValue(mockGrupo);

            const result = await grupoRepository.alterarStatus(grupoId, ativo);

            expect(result).toEqual(mockGrupo);
            expect(grupoRepository.model.findByIdAndUpdate).toHaveBeenCalledWith(
                grupoId,
                { ativo },
                { new: true }
            );
        });

        it('deve lançar erro quando grupo não existe para alterar status', async () => {
            const grupoId = '507f1f77bcf86cd799439999';
            const ativo = false;

            grupoRepository.model.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
            CustomError.mockImplementation((params) => {
                const error = new Error(params.customMessage);
                error.statusCode = params.statusCode;
                return error;
            });

            await expect(grupoRepository.alterarStatus(grupoId, ativo)).rejects.toThrow();
            expect(grupoRepository.model.findByIdAndUpdate).toHaveBeenCalledWith(
                grupoId,
                { ativo },
                { new: true }
            );
        });
    });
});
