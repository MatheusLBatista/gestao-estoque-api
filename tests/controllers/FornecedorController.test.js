import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Configurar os mocks
jest.mock('../../src/services/fornecedorService.js', () => {
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

jest.mock('../../src/utils/helpers/CommonResponse.js', () => ({
    __esModule: true,
    default: class MockCommonResponse {
        static success = jest.fn();
        static error = jest.fn();
        static created = jest.fn();
    }
}));

jest.mock('../../src/utils/validators/schemas/zod/querys/FornecedorQuerySchema.js', () => ({
    FornecedorIdSchema: {
        parse: jest.fn(),
    },
}));

jest.mock('../../src/utils/helpers/HttpStatusCodes.js', () => ({
    __esModule: true,
    default: class MockHttpStatusCodes {
        static OK = { code: 200 };
        static CREATED = { code: 201 };
        static BAD_REQUEST = { code: 400 };
        static NOT_FOUND = { code: 404 };
    }
}));

jest.mock('../../src/utils/helpers/CustomError.js', () => {
    return {
        __esModule: true,
        default: class MockCustomError extends Error {
            constructor({ statusCode, errorType, field, details, customMessage }) {
                super(customMessage || 'Custom error');
                this.statusCode = statusCode;
                this.errorType = errorType;
                this.field = field;
                this.details = details;
                this.customMessage = customMessage;
            }
        }
    };
});

import FornecedorController from '../../src/controllers/FornecedorController.js';
import FornecedorService from '../../src/services/fornecedorService.js';
import CommonResponse from '../../src/utils/helpers/CommonResponse.js';
import HttpStatusCodes from '../../src/utils/helpers/HttpStatusCodes.js';
import { FornecedorIdSchema } from '../../src/utils/validators/schemas/zod/querys/FornecedorQuerySchema.js';
import CustomError from '../../src/utils/helpers/CustomError.js';

describe('FornecedorController', () => {
    let fornecedorController;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        fornecedorController = new FornecedorController();
        
        mockReq = {
            body: {},
            params: {},
            query: {},
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        jest.clearAllMocks();
    });

    describe('criar', () => {
        it('deve criar fornecedor com sucesso', async () => {
            const mockFornecedor = {
                id: 'fornecedor123',
                nome: 'Fornecedor Teste',
                cnpj: '12.345.678/0001-90'
            };

            mockReq.body = { nome: 'Fornecedor Teste', cnpj: '12.345.678/0001-90' };
            fornecedorController.service.criar.mockResolvedValue(mockFornecedor);
            CommonResponse.created.mockReturnValue('created response');

            const result = await fornecedorController.criar(mockReq, mockRes);

            expect(fornecedorController.service.criar).toHaveBeenCalledWith(mockReq.body);
            expect(CommonResponse.created).toHaveBeenCalledWith(
                mockRes,
                mockFornecedor,
                HttpStatusCodes.CREATED.code,
                "Fornecedor adicionado"
            );
            expect(result).toBe('created response');
        });

        it('deve retornar erro quando dados são inválidos', async () => {
            const error = new Error('Dados inválidos');
            mockReq.body = { nome: '' }; // dados inválidos
            fornecedorController.service.criar.mockRejectedValue(error);

            await expect(fornecedorController.criar(mockReq, mockRes))
                .rejects.toThrow('Dados inválidos');
        });
    });

    describe('listar', () => {
        it('deve listar fornecedores com sucesso', async () => {
            const mockFornecedores = [
                { id: 'fornecedor1', nome: 'Fornecedor 1' },
                { id: 'fornecedor2', nome: 'Fornecedor 2' }
            ];

            fornecedorController.service.listar.mockResolvedValue(mockFornecedores);
            CommonResponse.success.mockReturnValue('success response');

            const result = await fornecedorController.listar(mockReq, mockRes);

            expect(fornecedorController.service.listar).toHaveBeenCalled();
            expect(CommonResponse.success).toHaveBeenCalledWith(mockRes, mockFornecedores);
            expect(result).toBe('success response');
        });
    });

    describe('buscarPorId', () => {
        it('deve buscar fornecedor por ID com sucesso', async () => {
            const mockFornecedor = { id: 'fornecedor123', nome: 'Fornecedor Teste' };
            
            mockReq.params = { id: 'fornecedor123' };
            FornecedorIdSchema.parse.mockReturnValue('fornecedor123');
            fornecedorController.service.buscarPorId.mockResolvedValue(mockFornecedor);
            CommonResponse.success.mockReturnValue('success response');

            const result = await fornecedorController.buscarPorId(mockReq, mockRes);

            expect(FornecedorIdSchema.parse).toHaveBeenCalledWith('fornecedor123');
            expect(fornecedorController.service.buscarPorId).toHaveBeenCalledWith('fornecedor123');
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockFornecedor,
                200,
                "Fornecedor encontrado com sucesso."
            );
            expect(result).toBe('success response');
        });
    });

    describe('atualizar', () => {
        it('deve atualizar fornecedor com sucesso', async () => {
            const mockFornecedor = {
                id: 'fornecedor123',
                nome: 'Fornecedor Atualizado',
                cnpj: '12.345.678/0001-90'
            };

            mockReq.params = { id: 'fornecedor123' };

            fornecedorController.service.atualizar.mockResolvedValue(mockFornecedor);
            CommonResponse.success.mockReturnValue('success response');

            const result = await fornecedorController.atualizar(mockReq, mockRes);

            expect(fornecedorController.service.atualizar).toHaveBeenCalledWith('fornecedor123', mockReq.body);

            expect(fornecedorController.service.atualizar).toHaveBeenCalledWith('fornecedor123', mockReq.body);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockFornecedor,
                HttpStatusCodes.OK.code,
                "Fornecedor atualizada com sucesso."
            );
            expect(result).toBe('success response');
        });
    });

    describe('deletar', () => {
        it('deve deletar fornecedor com sucesso', async () => {
            const mockResponse = { message: 'Fornecedor deletado com sucesso' };
            
            mockReq.params = { id: 'fornecedor123' };
            fornecedorController.service.deletar.mockResolvedValue(mockResponse);
            CommonResponse.success.mockReturnValue('success response');

            const result = await fornecedorController.deletar(mockReq, mockRes);

            expect(fornecedorController.service.deletar).toHaveBeenCalledWith('fornecedor123');
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockResponse,
                HttpStatusCodes.OK.code,
                "Fornecedor eliminado com sucesso."
            );
            expect(result).toBe('success response');
        });
    });

    describe('desativarFornecedor', () => {
        it('deve desativar fornecedor com sucesso', async () => {
            const mockFornecedor = { id: 'fornecedor123', status: false };
            
            mockReq.params = { id: 'fornecedor123' };
            FornecedorIdSchema.parse.mockReturnValue('fornecedor123');
            fornecedorController.service.desativarFornecedor.mockResolvedValue(mockFornecedor);
            CommonResponse.success.mockReturnValue('success response');

            const result = await fornecedorController.desativarFornecedor(mockReq, mockRes);

            expect(FornecedorIdSchema.parse).toHaveBeenCalledWith('fornecedor123');
            expect(fornecedorController.service.desativarFornecedor).toHaveBeenCalledWith('fornecedor123');
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockFornecedor,
                200,
                "fornecedor desativado com sucesso."
            );
            expect(result).toBe('success response');
        });

        it('deve lançar erro quando ID não é fornecido', async () => {
            mockReq.params = {}; // sem ID

            await expect(fornecedorController.desativarFornecedor(mockReq, mockRes))
                .rejects.toThrow('ID do fornecedor é obrigatório para desativar.');
        });
    });

    describe('reativarFornecedor', () => {
        it('deve reativar fornecedor com sucesso', async () => {
            const mockFornecedor = { id: 'fornecedor123', status: true };
            
            mockReq.params = { id: 'fornecedor123' };
            FornecedorIdSchema.parse.mockReturnValue('fornecedor123');
            fornecedorController.service.reativarFornecedor.mockResolvedValue(mockFornecedor);
            CommonResponse.success.mockReturnValue('success response');

            const result = await fornecedorController.reativarFornecedor(mockReq, mockRes);

            expect(FornecedorIdSchema.parse).toHaveBeenCalledWith('fornecedor123');
            expect(fornecedorController.service.reativarFornecedor).toHaveBeenCalledWith('fornecedor123');
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockFornecedor,
                200,
                "fornecedor reativado com sucesso."
            );
            expect(result).toBe('success response');
        });

        it('deve lançar erro quando ID não é fornecido', async () => {
            mockReq.params = {}; // sem ID

            await expect(fornecedorController.reativarFornecedor(mockReq, mockRes))
                .rejects.toThrow('ID do fornecedor é obrigatório para reativar.');
        });
    });
});
