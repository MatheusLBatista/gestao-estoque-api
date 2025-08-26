import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Configurar os mocks
jest.mock('../../src/repositories/fornecedorRepository.js', () => {
    return jest.fn().mockImplementation(() => ({
        criar: jest.fn(),
        listar: jest.fn(),
        buscarPorId: jest.fn(),
        atualizar: jest.fn(),
        deletar: jest.fn(),
        desativarFornecedor: jest.fn(),
        reativarFornecedor: jest.fn(),
    }));
});

jest.mock('mongoose', () => ({
    Types: {
        ObjectId: {
            isValid: jest.fn(),
        },
    },
}));

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
    HttpStatusCodes: {
        BAD_REQUEST: { code: 400 },
        NOT_FOUND: { code: 404 },
        OK: { code: 200 },
        CREATED: { code: 201 }
    },
}));

import FornecedorService from '../../src/services/fornecedorService.js';
import FornecedorRepository from '../../src/repositories/fornecedorRepository.js';
import mongoose from 'mongoose';

describe('FornecedorService', () => {
    let fornecedorService;
    let mockRepository;

    beforeEach(() => {
        fornecedorService = new FornecedorService();
        mockRepository = fornecedorService.repository;

        // Reset dos mocks
        jest.clearAllMocks();
    });

    describe('criar', () => {
        it('deve criar fornecedor com sucesso', async () => {
            const mockFornecedor = {
                id: 'fornecedor123',
                nome: 'Fornecedor Teste',
                cnpj: '12.345.678/0001-90',
                email: 'contato@fornecedor.com'
            };

            const dadosFornecedor = {
                nome: 'Fornecedor Teste',
                cnpj: '12.345.678/0001-90',
                email: 'contato@fornecedor.com'
            };

            mockRepository.criar.mockResolvedValue(mockFornecedor);

            const result = await fornecedorService.criar(dadosFornecedor);

            expect(mockRepository.criar).toHaveBeenCalledWith(dadosFornecedor);
            expect(result).toEqual(mockFornecedor);
        });

        it('deve propagar erro do repository', async () => {
            const error = new Error('Erro ao criar fornecedor');
            const dadosFornecedor = { nome: 'Fornecedor Teste' };

            mockRepository.criar.mockRejectedValue(error);

            await expect(fornecedorService.criar(dadosFornecedor))
                .rejects.toThrow('Erro ao criar fornecedor');
        });
    });

    describe('listar', () => {
        it('deve listar fornecedores com sucesso', async () => {
            const mockFornecedores = {
                docs: [
                    { id: '1', nome: 'Fornecedor 1' },
                    { id: '2', nome: 'Fornecedor 2' }
                ],
                totalDocs: 2,
                page: 1,
                totalPages: 1
            };

            const mockReq = { query: { page: 1, limit: 10 } };
            mockRepository.listar.mockResolvedValue(mockFornecedores);

            const result = await fornecedorService.listar(mockReq);

            expect(mockRepository.listar).toHaveBeenCalledWith(mockReq);
            expect(result).toEqual(mockFornecedores);
        });

        it('deve propagar erro do repository', async () => {
            const error = new Error('Erro ao listar fornecedores');
            const mockReq = { query: {} };

            mockRepository.listar.mockRejectedValue(error);

            await expect(fornecedorService.listar(mockReq))
                .rejects.toThrow('Erro ao listar fornecedores');
        });
    });

    describe('buscarPorId', () => {
        it('deve buscar fornecedor por ID com sucesso', async () => {
            const mockFornecedor = {
                id: '123',
                nome: 'Fornecedor Teste',
                cnpj: '12.345.678/0001-90'
            };

            mockRepository.buscarPorId.mockResolvedValue(mockFornecedor);

            const result = await fornecedorService.buscarPorId('123');

            expect(mockRepository.buscarPorId).toHaveBeenCalledWith('123');
            expect(result).toEqual(mockFornecedor);
        });

        it('deve propagar erro quando fornecedor não encontrado', async () => {
            const error = new Error('Fornecedor não encontrado');
            mockRepository.buscarPorId.mockRejectedValue(error);

            await expect(fornecedorService.buscarPorId('999'))
                .rejects.toThrow('Fornecedor não encontrado');
        });
    });

    describe('atualizar', () => {
        it('deve atualizar fornecedor com sucesso', async () => {
            const mockFornecedor = {
                id: '123',
                nome: 'Fornecedor Atualizado',
                cnpj: '12.345.678/0001-90'
            };

            const dadosAtualizacao = { nome: 'Fornecedor Atualizado' };
            mockRepository.atualizar.mockResolvedValue(mockFornecedor);

            const result = await fornecedorService.atualizar('123', dadosAtualizacao);

            expect(mockRepository.atualizar).toHaveBeenCalledWith('123', dadosAtualizacao);
            expect(result).toEqual(mockFornecedor);
        });

        it('deve propagar erro do repository', async () => {
            const error = new Error('Erro ao atualizar fornecedor');
            const dadosAtualizacao = { nome: 'Fornecedor Atualizado' };

            mockRepository.atualizar.mockRejectedValue(error);

            await expect(fornecedorService.atualizar('123', dadosAtualizacao))
                .rejects.toThrow('Erro ao atualizar fornecedor');
        });
    });

    describe('deletar', () => {
        it('deve deletar fornecedor com sucesso', async () => {
            const mockResponse = { message: 'Fornecedor deletado com sucesso' };
            
            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.deletar.mockResolvedValue(mockResponse);

            const result = await fornecedorService.deletar('123');

            expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('123');
            expect(mockRepository.deletar).toHaveBeenCalledWith('123');
            expect(result).toEqual(mockResponse);
        });

        it('deve lançar erro quando ID for inválido', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(false);

            await expect(fornecedorService.deletar('invalid-id'))
                .rejects.toThrow('ID do fornecedor inválido.');
        });

        it('deve propagar erro do repository', async () => {
            const error = new Error('Erro ao deletar fornecedor');
            
            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.deletar.mockRejectedValue(error);

            await expect(fornecedorService.deletar('123'))
                .rejects.toThrow('Erro ao deletar fornecedor');
        });
    });

    describe('desativarFornecedor', () => {
        it('deve desativar fornecedor com sucesso', async () => {
            const mockResponse = { message: 'Fornecedor desativado com sucesso' };
            
            // Mock ObjectId validation to return true
            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.desativarFornecedor.mockResolvedValue(mockResponse);

            const result = await fornecedorService.desativarFornecedor('123');

            expect(mockRepository.desativarFornecedor).toHaveBeenCalledWith('123');
            expect(result).toEqual(mockResponse);
        });

        it('deve lançar erro quando ID for inválido', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(false);

            await expect(fornecedorService.desativarFornecedor('invalid-id'))
                .rejects.toThrow('ID do forecedor inválido.');
        });

        it('deve propagar erro do repository', async () => {
            const error = new Error('Erro ao desativar fornecedor');
            
            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.desativarFornecedor.mockRejectedValue(error);

            await expect(fornecedorService.desativarFornecedor('123'))
                .rejects.toThrow('Erro ao desativar fornecedor');
        });
    });

    describe('reativarFornecedor', () => {
        it('deve reativar fornecedor com sucesso', async () => {
            const mockResponse = { message: 'Fornecedor reativado com sucesso' };
            
            // Mock ObjectId validation to return true
            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.reativarFornecedor.mockResolvedValue(mockResponse);

            const result = await fornecedorService.reativarFornecedor('123');

            expect(mockRepository.reativarFornecedor).toHaveBeenCalledWith('123');
            expect(result).toEqual(mockResponse);
        });

        it('deve lançar erro quando ID for inválido', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(false);

            await expect(fornecedorService.reativarFornecedor('invalid-id'))
                .rejects.toThrow('ID do forecedor inválido.');
        });

        it('deve propagar erro do repository', async () => {
            const error = new Error('Erro ao reativar fornecedor');
            
            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.reativarFornecedor.mockRejectedValue(error);

            await expect(fornecedorService.reativarFornecedor('123'))
                .rejects.toThrow('Erro ao reativar fornecedor');
        });
    });
});
