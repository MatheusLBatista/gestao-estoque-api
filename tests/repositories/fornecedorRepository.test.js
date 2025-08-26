import FornecedorRepository from '../../src/repositories/fornecedorRepository.js';
import Fornecedor from '../../src/models/Fornecedor.js';
import CustomError from '../../src/utils/helpers/CustomError.js';
import mongoose from 'mongoose';

// Mock dos models
jest.mock('../../src/models/Fornecedor.js');
jest.mock('../../src/utils/helpers/CustomError.js');
jest.mock('../../src/utils/helpers/messages.js', () => ({
    error: {
        resourceNotFound: jest.fn().mockReturnValue('Fornecedor não encontrado')
    }
}));

// Mock do FornecedorFilterBuilder
jest.mock('../../src/repositories/filters/FornecedorFilterBuilder.js', () => {
    return jest.fn().mockImplementation(() => ({
        comCNPJ: jest.fn().mockReturnThis(),
        comNome: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue({})
    }));
});

describe('FornecedorRepository', () => {
    let fornecedorRepository;
    
    beforeEach(() => {
        jest.clearAllMocks();
        fornecedorRepository = new FornecedorRepository();
        
        // Mock do mongoose.Types.ObjectId.isValid
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
    });

    describe('criar', () => {
        it('deve criar fornecedor com sucesso', async () => {
            const dadosFornecedor = {
                nome: 'Fornecedor Teste',
                cnpj: '11111111000111',
                email: 'contato@fornecedor.com'
            };

            const mockFornecedor = {
                _id: '507f1f77bcf86cd799439011',
                ...dadosFornecedor,
                save: jest.fn().mockResolvedValue({
                    _id: '507f1f77bcf86cd799439011',
                    ...dadosFornecedor
                })
            };

            // Mock do constructor
            fornecedorRepository.model = jest.fn().mockImplementation(() => mockFornecedor);

            const result = await fornecedorRepository.criar(dadosFornecedor);

            expect(fornecedorRepository.model).toHaveBeenCalledWith(dadosFornecedor);
            expect(mockFornecedor.save).toHaveBeenCalled();
            expect(result).toEqual({
                _id: '507f1f77bcf86cd799439011',
                ...dadosFornecedor
            });
        });
    });

    describe('listar', () => {
        it('deve listar fornecedores com sucesso', async () => {
            const mockResult = {
                docs: [
                    { _id: '507f1f77bcf86cd799439011', nome: 'Fornecedor A', cnpj: '11111111000111' },
                    { _id: '507f1f77bcf86cd799439012', nome: 'Fornecedor B', cnpj: '22222222000222' }
                ],
                totalDocs: 2,
                page: 1,
                limit: 10
            };

            fornecedorRepository.model.paginate = jest.fn().mockResolvedValue(mockResult);

            const req = { query: { page: 1, limite: 10 }, params: {} };
            const result = await fornecedorRepository.listar(req);

            expect(result).toEqual(mockResult);
            expect(fornecedorRepository.model.paginate).toHaveBeenCalled();
        });

        it('deve buscar fornecedor por ID quando ID é fornecido', async () => {
            const mockFornecedor = { 
                _id: '507f1f77bcf86cd799439011', 
                nome: 'Fornecedor A', 
                cnpj: '11111111000111' 
            };

            fornecedorRepository.model.findById = jest.fn().mockResolvedValue(mockFornecedor);

            const req = { params: { id: '507f1f77bcf86cd799439011' }, query: {} };
            const result = await fornecedorRepository.listar(req);

            expect(result).toEqual(mockFornecedor);
            expect(fornecedorRepository.model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });
    });

    describe('buscarPorId', () => {
        it('deve buscar fornecedor por ID com sucesso', async () => {
            const mockFornecedor = { 
                _id: '507f1f77bcf86cd799439011', 
                nome: 'Fornecedor A', 
                cnpj: '11111111000111' 
            };

            fornecedorRepository.model.findById = jest.fn().mockResolvedValue(mockFornecedor);

            const result = await fornecedorRepository.buscarPorId('507f1f77bcf86cd799439011');

            expect(result).toEqual(mockFornecedor);
            expect(fornecedorRepository.model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });

        it('deve lançar erro quando fornecedor não existe', async () => {
            fornecedorRepository.model.findById = jest.fn().mockResolvedValue(null);
            CustomError.mockImplementation((params) => {
                const error = new Error(params.customMessage);
                error.statusCode = params.statusCode;
                return error;
            });

            await expect(fornecedorRepository.buscarPorId('507f1f77bcf86cd799439999')).rejects.toThrow();
            expect(fornecedorRepository.model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439999');
        });
    });

    describe('atualizar', () => {
        it('deve atualizar fornecedor com sucesso', async () => {
            const fornecedorId = '507f1f77bcf86cd799439011';
            const updateData = { nome: 'Fornecedor Atualizado' };
            const mockFornecedor = { 
                _id: fornecedorId, 
                nome: 'Fornecedor Atualizado', 
                cnpj: '11111111000111' 
            };

            fornecedorRepository.model.findByIdAndUpdate = jest.fn().mockResolvedValue(mockFornecedor);

            const result = await fornecedorRepository.atualizar(fornecedorId, updateData);

            expect(result).toEqual(mockFornecedor);
            expect(fornecedorRepository.model.findByIdAndUpdate).toHaveBeenCalledWith(
                fornecedorId,
                updateData,
                { new: true }
            );
        });
    });

    describe('deletar', () => {
        it('deve deletar fornecedor com sucesso', async () => {
            const fornecedorId = '507f1f77bcf86cd799439011';
            const mockFornecedor = { 
                _id: fornecedorId, 
                nome: 'Fornecedor A', 
                cnpj: '11111111000111' 
            };

            fornecedorRepository.model.findByIdAndDelete = jest.fn().mockResolvedValue(mockFornecedor);

            const result = await fornecedorRepository.deletar(fornecedorId);

            expect(result).toEqual(mockFornecedor);
            expect(fornecedorRepository.model.findByIdAndDelete).toHaveBeenCalledWith(fornecedorId);
        });

        it('deve lançar erro quando fornecedor não existe para deletar', async () => {
            const fornecedorId = '507f1f77bcf86cd799439999';

            fornecedorRepository.model.findByIdAndDelete = jest.fn().mockResolvedValue(null);
            CustomError.mockImplementation((params) => {
                const error = new Error(params.customMessage);
                error.statusCode = params.statusCode;
                return error;
            });

            await expect(fornecedorRepository.deletar(fornecedorId)).rejects.toThrow();
            expect(fornecedorRepository.model.findByIdAndDelete).toHaveBeenCalledWith(fornecedorId);
        });
    });

    describe('desativarFornecedor', () => {
        it('deve desativar fornecedor com sucesso', async () => {
            const fornecedorId = '507f1f77bcf86cd799439011';
            const mockFornecedor = { 
                _id: fornecedorId, 
                nome: 'Fornecedor A', 
                status: false 
            };

            fornecedorRepository.model.findByIdAndUpdate = jest.fn().mockResolvedValue(mockFornecedor);

            const result = await fornecedorRepository.desativarFornecedor(fornecedorId);

            expect(result).toEqual(mockFornecedor);
            expect(fornecedorRepository.model.findByIdAndUpdate).toHaveBeenCalledWith(
                fornecedorId,
                { status: false },
                { new: true }
            );
        });
    });

    describe('reativarFornecedor', () => {
        it('deve reativar fornecedor com sucesso', async () => {
            const fornecedorId = '507f1f77bcf86cd799439011';
            const mockFornecedor = { 
                _id: fornecedorId, 
                nome: 'Fornecedor A', 
                status: true 
            };

            fornecedorRepository.model.findByIdAndUpdate = jest.fn().mockResolvedValue(mockFornecedor);

            const result = await fornecedorRepository.reativarFornecedor(fornecedorId);

            expect(result).toEqual(mockFornecedor);
            expect(fornecedorRepository.model.findByIdAndUpdate).toHaveBeenCalledWith(
                fornecedorId,
                { status: true },
                { new: true }
            );
        });
    });
});
