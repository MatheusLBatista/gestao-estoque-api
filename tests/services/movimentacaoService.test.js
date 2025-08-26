import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Configurar os mocks
jest.mock('../../src/repositories/movimentacaoRepository.js', () => {
    return jest.fn().mockImplementation(() => ({
        listarMovimentacoes: jest.fn(),
        buscarMovimentacaoPorID: jest.fn(),
        cadastrarMovimentacao: jest.fn(),
        atualizarMovimentacao: jest.fn(),
        deletarMovimentacao: jest.fn(),
        filtrarMovimentacoesAvancado: jest.fn(),
        desativarMovimentacao: jest.fn(),
        reativarMovimentacao: jest.fn()
    }));
});

jest.mock('../../src/services/produtoService.js', () => {
    return jest.fn().mockImplementation(() => ({
        buscarProdutoPorID: jest.fn(),
        atualizarProduto: jest.fn()
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
        }
    },
    HttpStatusCodes: {
        BAD_REQUEST: { code: 400 },
        NOT_FOUND: { code: 404 },
        FORBIDDEN: { code: 403 }
    }
}));

import MovimentacaoService from '../../src/services/movimentacaoService.js';
import MovimentacaoRepository from '../../src/repositories/movimentacaoRepository.js';
import ProdutoService from '../../src/services/produtoService.js';
import { CustomError, HttpStatusCodes } from '../../src/utils/helpers/index.js';
import mongoose from 'mongoose';

describe('MovimentacaoService', () => {
    let service;
    let mockRepository;
    let mockProdutoService;

    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn(); // Mock console.log
        console.error = jest.fn(); // Mock console.error
        
        service = new MovimentacaoService();
        mockRepository = service.repository;
        mockProdutoService = service.produtoService;
    });

    describe('listarMovimentacoes', () => {
        it('should return movement list successfully', async () => {
            const mockReq = { query: {} };
            const mockResult = { data: [], total: 0 };
            mockRepository.listarMovimentacoes.mockResolvedValue(mockResult);

            const result = await service.listarMovimentacoes(mockReq);

            expect(mockRepository.listarMovimentacoes).toHaveBeenCalledWith(mockReq);
            expect(result).toEqual(mockResult);
        });

        it('should handle repository errors', async () => {
            const mockReq = { query: {} };
            const error = new Error('Repository error');
            mockRepository.listarMovimentacoes.mockRejectedValue(error);

            await expect(service.listarMovimentacoes(mockReq)).rejects.toThrow('Repository error');
        });
    });

    describe('buscarMovimentacaoPorID', () => {
        it('should return movement by ID successfully', async () => {
            const mockId = '60d5ec49eb1563001544b4c8';
            const mockMovement = { _id: mockId, tipo: 'entrada' };
            
            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.buscarMovimentacaoPorID.mockResolvedValue(mockMovement);

            const result = await service.buscarMovimentacaoPorID(mockId);

            expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(mockId);
            expect(mockRepository.buscarMovimentacaoPorID).toHaveBeenCalledWith(mockId);
            expect(result).toEqual(mockMovement);
        });

        it('should throw error for invalid ID', async () => {
            const invalidId = 'invalid-id';
            mongoose.Types.ObjectId.isValid.mockReturnValue(false);

            await expect(service.buscarMovimentacaoPorID(invalidId)).rejects.toThrow('ID da movimentação inválido.');
            expect(mockRepository.buscarMovimentacaoPorID).not.toHaveBeenCalled();
        });

        it('should throw error when movement not found', async () => {
            const mockId = '60d5ec49eb1563001544b4c8';
            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.buscarMovimentacaoPorID.mockResolvedValue(null);

            await expect(service.buscarMovimentacaoPorID(mockId)).rejects.toThrow('Movimentação não encontrada.');
        });
    });

    describe('buscarMovimentacoesPorTipo', () => {
        it('should return movements by type successfully', async () => {
            const mockResult = { data: [], total: 0 };
            mockRepository.listarMovimentacoes.mockResolvedValue(mockResult);

            const result = await service.buscarMovimentacoesPorTipo('entrada', 1, 10);

            expect(mockRepository.listarMovimentacoes).toHaveBeenCalledWith({
                params: {},
                query: {
                    tipo: 'entrada',
                    page: 1,
                    limite: 10
                }
            });
            expect(result).toEqual(mockResult);
        });

        it('should throw error for invalid type', async () => {
            await expect(service.buscarMovimentacoesPorTipo('invalid')).rejects.toThrow('Tipo de movimentação inválido');
            await expect(service.buscarMovimentacoesPorTipo('')).rejects.toThrow('Tipo de movimentação inválido');
            await expect(service.buscarMovimentacoesPorTipo(null)).rejects.toThrow('Tipo de movimentação inválido');
        });

        it('should accept valid types', async () => {
            const mockResult = { data: [], total: 0 };
            mockRepository.listarMovimentacoes.mockResolvedValue(mockResult);

            await service.buscarMovimentacoesPorTipo('entrada');
            await service.buscarMovimentacoesPorTipo('saida');

            expect(mockRepository.listarMovimentacoes).toHaveBeenCalledTimes(2);
        });
    });

    describe('buscarMovimentacoesPorPeriodo', () => {
        it('should return movements by period successfully', async () => {
            const mockResult = { data: [], total: 0 };
            mockRepository.listarMovimentacoes.mockResolvedValue(mockResult);

            const result = await service.buscarMovimentacoesPorPeriodo('2023-01-01', '2023-01-31', 1, 10);

            expect(mockRepository.listarMovimentacoes).toHaveBeenCalledWith({
                params: {},
                query: {
                    data_inicio: '2023-01-01',
                    data_fim: '2023-01-31',
                    page: 1,
                    limite: 10
                }
            });
            expect(result).toEqual(mockResult);
        });

        it('should throw error for invalid date format', async () => {
            await expect(service.buscarMovimentacoesPorPeriodo('invalid-date', '2023-01-31'))
                .rejects.toThrow('Formato de data inválido');
        });

        it('should throw error when start date is after end date', async () => {
            await expect(service.buscarMovimentacoesPorPeriodo('2023-01-31', '2023-01-01'))
                .rejects.toThrow('Data de início não pode ser posterior à data de fim');
        });
    });

    describe('buscarMovimentacoesPorProduto', () => {
        it('should return movements by product successfully', async () => {
            const mockResult = { data: [], total: 0 };
            mockRepository.listarMovimentacoes.mockResolvedValue(mockResult);

            const result = await service.buscarMovimentacoesPorProduto('produto123', 1, 10);

            expect(mockRepository.listarMovimentacoes).toHaveBeenCalledWith({
                params: {},
                query: {
                    produto: 'produto123',
                    page: 1,
                    limite: 10
                }
            });
            expect(result).toEqual(mockResult);
        });

        it('should throw error for empty product identifier', async () => {
            await expect(service.buscarMovimentacoesPorProduto('')).rejects.toThrow('Identificador do produto é obrigatório');
            await expect(service.buscarMovimentacoesPorProduto(null)).rejects.toThrow('Identificador do produto é obrigatório');
            await expect(service.buscarMovimentacoesPorProduto('   ')).rejects.toThrow('Identificador do produto é obrigatório');
        });
    });

    describe('buscarMovimentacoesPorUsuario', () => {
        it('should return movements by user successfully', async () => {
            const mockResult = { data: [], total: 0 };
            mockRepository.listarMovimentacoes.mockResolvedValue(mockResult);

            const result = await service.buscarMovimentacoesPorUsuario('user123', 1, 10);

            expect(mockRepository.listarMovimentacoes).toHaveBeenCalledWith({
                params: {},
                query: {
                    usuario: 'user123',
                    page: 1,
                    limite: 10
                }
            });
            expect(result).toEqual(mockResult);
        });

        it('should throw error for empty user identifier', async () => {
            await expect(service.buscarMovimentacoesPorUsuario('')).rejects.toThrow('Identificador do usuário é obrigatório');
            await expect(service.buscarMovimentacoesPorUsuario(null)).rejects.toThrow('Identificador do usuário é obrigatório');
            await expect(service.buscarMovimentacoesPorUsuario('   ')).rejects.toThrow('Identificador do usuário é obrigatório');
        });
    });

    describe('cadastrarMovimentacao', () => {
        const mockProduct = {
            _id: 'product123',
            nome_produto: 'Test Product',
            quantidade_estoque: 100
        };

        it('should register entrada movement successfully', async () => {
            const dadosMovimentacao = {
                tipo: 'entrada',
                produtos: [{ produto_ref: 'product123', quantidade_produtos: 10 }]
            };
            const mockResult = { _id: 'movement123', ...dadosMovimentacao };

            mockProdutoService.buscarProdutoPorID.mockResolvedValue(mockProduct);
            mockProdutoService.atualizarProduto.mockResolvedValue(true);
            mockRepository.cadastrarMovimentacao.mockResolvedValue(mockResult);

            const result = await service.cadastrarMovimentacao(dadosMovimentacao);

            expect(mockProdutoService.buscarProdutoPorID).toHaveBeenCalledWith('product123');
            expect(mockProdutoService.atualizarProduto).toHaveBeenCalledWith('product123', {
                quantidade_estoque: 110,
                data_ultima_entrada: expect.any(Date)
            });
            expect(mockRepository.cadastrarMovimentacao).toHaveBeenCalledWith({
                ...dadosMovimentacao,
                data_movimentacao: expect.any(Date)
            });
            expect(result).toEqual(mockResult);
        });

        it('should register saida movement successfully', async () => {
            const dadosMovimentacao = {
                tipo: 'saida',
                produtos: [{ produto_ref: 'product123', quantidade_produtos: 10 }]
            };
            const mockResult = { _id: 'movement123', ...dadosMovimentacao };

            mockProdutoService.buscarProdutoPorID.mockResolvedValue(mockProduct);
            mockProdutoService.atualizarProduto.mockResolvedValue(true);
            mockRepository.cadastrarMovimentacao.mockResolvedValue(mockResult);

            const result = await service.cadastrarMovimentacao(dadosMovimentacao);

            expect(mockProdutoService.atualizarProduto).toHaveBeenCalledWith('product123', {
                quantidade_estoque: 90
            });
            expect(result).toEqual(mockResult);
        });

        it('should throw error when no products provided', async () => {
            const dadosMovimentacao = { tipo: 'entrada', produtos: [] };

            await expect(service.cadastrarMovimentacao(dadosMovimentacao))
                .rejects.toThrow('A movimentação deve conter pelo menos um produto');
        });

        it('should throw error for insufficient stock on saida', async () => {
            const dadosMovimentacao = {
                tipo: 'saida',
                produtos: [{ produto_ref: 'product123', quantidade_produtos: 150 }]
            };

            mockProdutoService.buscarProdutoPorID.mockResolvedValue(mockProduct);

            await expect(service.cadastrarMovimentacao(dadosMovimentacao))
                .rejects.toThrow('Estoque insuficiente para o produto Test Product');
        });

        it('should throw error when product not found', async () => {
            const dadosMovimentacao = {
                tipo: 'entrada',
                produtos: [{ produto_ref: 'nonexistent', quantidade_produtos: 10 }]
            };

            const error = new Error('Product not found');
            error.statusCode = 404;
            mockProdutoService.buscarProdutoPorID.mockRejectedValue(error);

            await expect(service.cadastrarMovimentacao(dadosMovimentacao))
                .rejects.toThrow('Produto não encontrado: nonexistent');
        });

        it('should rethrow CustomError for product service errors', async () => {
            const dadosMovimentacao = {
                tipo: 'entrada',
                produtos: [{ produto_ref: 'product123', quantidade_produtos: 10 }]
            };

            const customError = new Error('Custom error');
            customError.statusCode = 400;
            mockProdutoService.buscarProdutoPorID.mockRejectedValue(customError);

            await expect(service.cadastrarMovimentacao(dadosMovimentacao))
                .rejects.toThrow('Custom error');
        });
    });

    describe('atualizarMovimentacao', () => {
        const mockMovementOld = {
            _id: 'movement123',
            tipo: 'saida',
            data_movimentacao: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            produtos: [{ produto_ref: 'product123', quantidade_produtos: 10 }]
        };

        it('should update movement successfully', async () => {
            const id = 'movement123';
            const dadosAtualizacao = { observacoes: 'Updated notes' };
            const mockResult = { ...mockMovementOld, ...dadosAtualizacao };

            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.buscarMovimentacaoPorID.mockResolvedValue(mockMovementOld);
            mockRepository.atualizarMovimentacao.mockResolvedValue(mockResult);

            const result = await service.atualizarMovimentacao(id, dadosAtualizacao);

            expect(mockRepository.atualizarMovimentacao).toHaveBeenCalledWith(id, {
                ...dadosAtualizacao,
                data_ultima_atualizacao: expect.any(Date)
            });
            expect(result).toEqual(mockResult);
        });

        it('should throw error for invalid ID', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(false);

            await expect(service.atualizarMovimentacao('invalid', {}))
                .rejects.toThrow('ID da movimentação inválido');
        });

        it('should throw error when movement not found', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.buscarMovimentacaoPorID.mockResolvedValue(null);

            await expect(service.atualizarMovimentacao('movement123', {}))
                .rejects.toThrow('Movimentação não encontrada');
        });

        it('should throw error for movements older than 24 hours', async () => {
            const oldMovement = {
                ...mockMovementOld,
                data_movimentacao: new Date(Date.now() - 1000 * 60 * 60 * 25) // 25 hours ago
            };
            const dadosAtualizacao = { produtos: [{ produto_ref: 'product123', quantidade_produtos: 5 }] };

            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.buscarMovimentacaoPorID.mockResolvedValue(oldMovement);

            await expect(service.atualizarMovimentacao('movement123', dadosAtualizacao))
                .rejects.toThrow('Não é possível alterar produtos ou tipo de movimentações com mais de 24 horas');
        });
    });

    describe('deletarMovimentacao', () => {
        const mockMovement = {
            _id: 'movement123',
            tipo: 'saida',
            data_movimentacao: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            produtos: [{ produto_ref: 'product123', quantidade_produtos: 10 }]
        };

        it('should delete movement successfully', async () => {
            const id = 'movement123';
            const mockProduct = { _id: 'product123', quantidade_estoque: 90 };

            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.buscarMovimentacaoPorID.mockResolvedValue(mockMovement);
            mockProdutoService.buscarProdutoPorID.mockResolvedValue(mockProduct);
            mockProdutoService.atualizarProduto.mockResolvedValue(true);
            mockRepository.deletarMovimentacao.mockResolvedValue({ deletedCount: 1 });

            const result = await service.deletarMovimentacao(id);

            expect(mockProdutoService.atualizarProduto).toHaveBeenCalledWith('product123', {
                quantidade_estoque: 100 // restored stock
            });
            expect(mockRepository.deletarMovimentacao).toHaveBeenCalledWith(id);
            expect(result).toEqual({ deletedCount: 1 });
        });

        it('should throw error for invalid ID', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(false);

            await expect(service.deletarMovimentacao('invalid'))
                .rejects.toThrow('ID da movimentação inválido');
        });

        it('should throw error when movement not found', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.buscarMovimentacaoPorID.mockResolvedValue(null);

            await expect(service.deletarMovimentacao('movement123'))
                .rejects.toThrow('Movimentação não encontrada');
        });

        it('should throw error for movements older than 3 days', async () => {
            const oldMovement = {
                ...mockMovement,
                data_movimentacao: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4) // 4 days ago
            };

            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.buscarMovimentacaoPorID.mockResolvedValue(oldMovement);

            await expect(service.deletarMovimentacao('movement123'))
                .rejects.toThrow('Não é possível deletar movimentações com mais de 3 dias');
        });

        it('should handle product errors gracefully', async () => {
            const id = 'movement123';

            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.buscarMovimentacaoPorID.mockResolvedValue(mockMovement);
            mockProdutoService.buscarProdutoPorID.mockRejectedValue(new Error('Product error'));
            mockRepository.deletarMovimentacao.mockResolvedValue({ deletedCount: 1 });

            const result = await service.deletarMovimentacao(id);

            expect(console.error).toHaveBeenCalled();
            expect(result).toEqual({ deletedCount: 1 });
        });
    });

    describe('filtrarMovimentacoesAvancado', () => {
        it('should filter movements successfully', async () => {
            const filtros = { tipo: 'entrada' };
            const opcoesPaginacao = { page: 1, limit: 10 };
            const mockResult = { data: [], total: 0 };

            mockRepository.filtrarMovimentacoesAvancado.mockResolvedValue(mockResult);

            const result = await service.filtrarMovimentacoesAvancado(filtros, opcoesPaginacao);

            expect(mockRepository.filtrarMovimentacoesAvancado).toHaveBeenCalledWith(filtros, opcoesPaginacao);
            expect(result).toEqual(mockResult);
        });

        it('should validate date filters', async () => {
            const filtros = { dataInicio: 'invalid-date', dataFim: '2023-01-31' };

            await expect(service.filtrarMovimentacoesAvancado(filtros))
                .rejects.toThrow('Formato de data inválido');
        });

        it('should validate date range', async () => {
            const filtros = { dataInicio: '2023-01-31', dataFim: '2023-01-01' };

            await expect(service.filtrarMovimentacoesAvancado(filtros))
                .rejects.toThrow('Data de início não pode ser posterior à data de fim');
        });
    });

    describe('desativarMovimentacao', () => {
        it('should deactivate movement successfully', async () => {
            const id = 'movement123';
            const mockResult = { modifiedCount: 1 };

            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.desativarMovimentacao.mockResolvedValue(mockResult);

            const result = await service.desativarMovimentacao(id);

            expect(mockRepository.desativarMovimentacao).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResult);
        });

        it('should throw error for invalid ID', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(false);

            await expect(service.desativarMovimentacao('invalid'))
                .rejects.toThrow('ID da movimentacao inválido');
        });
    });

    describe('reativarMovimentacao', () => {
        it('should reactivate movement successfully', async () => {
            const id = 'movement123';
            const mockResult = { modifiedCount: 1 };

            mongoose.Types.ObjectId.isValid.mockReturnValue(true);
            mockRepository.reativarMovimentacao.mockResolvedValue(mockResult);

            const result = await service.reativarMovimentacao(id);

            expect(mockRepository.reativarMovimentacao).toHaveBeenCalledWith(id);
            expect(result).toEqual(mockResult);
        });

        it('should throw error for invalid ID', async () => {
            mongoose.Types.ObjectId.isValid.mockReturnValue(false);

            await expect(service.reativarMovimentacao('invalid'))
                .rejects.toThrow('ID da movimentacao inválido');
        });
    });
});
