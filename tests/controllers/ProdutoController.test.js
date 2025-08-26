import ProdutoController from '../../src/controllers/ProdutoController.js';
import ProdutoService from '../../src/services/produtoService.js';
import { CommonResponse, CustomError, HttpStatusCodes } from '../../src/utils/helpers/index.js';
import { ProdutoQuerySchema, ProdutoIdSchema } from '../../src/utils/validators/schemas/zod/querys/ProdutoQuerySchema.js';
import { ProdutoSchema, ProdutoUpdateSchema } from '../../src/utils/validators/schemas/zod/ProdutoSchema.js';

// Mocks
jest.mock('../../src/services/produtoService.js');
jest.mock('../../src/utils/helpers/index.js', () => ({
    CommonResponse: {
        success: jest.fn(),
        error: jest.fn(),
        created: jest.fn()
    },
    CustomError: jest.fn().mockImplementation((args) => {
        const error = new Error(args.customMessage || 'Custom error');
        error.statusCode = args.statusCode;
        error.errorType = args.errorType;
        error.field = args.field;
        return error;
    }),
    HttpStatusCodes: {
        BAD_REQUEST: { code: 400 },
        CREATED: { code: 201 },
        NOT_FOUND: { code: 404 }
    }
}));

jest.mock('../../src/utils/validators/schemas/zod/querys/ProdutoQuerySchema.js', () => ({
    ProdutoQuerySchema: {
        parseAsync: jest.fn()
    },
    ProdutoIdSchema: {
        parse: jest.fn()
    }
}));

jest.mock('../../src/utils/validators/schemas/zod/ProdutoSchema.js', () => ({
    ProdutoSchema: {
        parse: jest.fn()
    },
    ProdutoUpdateSchema: {
        parseAsync: jest.fn()
    }
}));

describe('ProdutoController', () => {
    let controller;
    let mockService;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        controller = new ProdutoController();
        mockService = new ProdutoService();
        controller.service = mockService;

        mockReq = {
            params: {},
            query: {},
            body: {}
        };

        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };

        // Reset mocks
        jest.clearAllMocks();
    });

    describe('listarProdutos', () => {
        it('deve listar produtos com sucesso', async () => {
            const mockData = {
                docs: [
                    { id: '1', nome: 'Produto 1' },
                    { id: '2', nome: 'Produto 2' }
                ]
            };

            mockService.listarProdutos.mockResolvedValue(mockData);
            mockReq.query = { page: 1, limite: 10 };

            await controller.listarProdutos(mockReq, mockRes);

            expect(mockService.listarProdutos).toHaveBeenCalledWith(mockReq);
            expect(CommonResponse.success).toHaveBeenCalledWith(mockRes, mockData);
        });

        it('deve validar ID quando fornecido nos params', async () => {
            const mockData = { docs: [{ id: '1', nome: 'Produto 1' }] };
            mockReq.params = { id: '507f1f77bcf86cd799439011' };
            mockService.listarProdutos.mockResolvedValue(mockData);

            await controller.listarProdutos(mockReq, mockRes);

            expect(ProdutoIdSchema.parse).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(CommonResponse.success).toHaveBeenCalledWith(mockRes, mockData);
        });

        it('deve retornar erro 404 quando nenhum produto for encontrado', async () => {
            const mockData = { docs: [] };
            mockService.listarProdutos.mockResolvedValue(mockData);

            await controller.listarProdutos(mockReq, mockRes);

            expect(CommonResponse.error).toHaveBeenCalledWith(
                mockRes,
                404,
                'resourceNotFound',
                'Produto',
                [],
                'Nenhum produto encontrado com os critérios informados.'
            );
        });

        it('deve validar query params quando presentes', async () => {
            const mockData = { docs: [{ id: '1', nome: 'Produto 1' }] };
            mockReq.query = { nome: 'Produto', page: 1, limite: 10 };
            mockService.listarProdutos.mockResolvedValue(mockData);
            ProdutoQuerySchema.parseAsync.mockResolvedValue(mockReq.query);

            await controller.listarProdutos(mockReq, mockRes);

            expect(ProdutoQuerySchema.parseAsync).toHaveBeenCalledWith(mockReq.query);
        });

        it('deve definir valores padrão para page e limite', async () => {
            const mockData = { docs: [{ id: '1', nome: 'Produto 1' }] };
            mockReq.query = {};
            mockService.listarProdutos.mockResolvedValue(mockData);

            await controller.listarProdutos(mockReq, mockRes);

            expect(mockReq.query.page).toBe(1);
            expect(mockReq.query.limite).toBe(10);
        });
    });

    describe('buscarProdutoPorID', () => {
        it('deve buscar produto por ID com sucesso', async () => {
            const mockData = { id: '1', nome: 'Produto 1' };
            mockReq.params = { id: '507f1f77bcf86cd799439011' };
            mockService.buscarProdutoPorID.mockResolvedValue(mockData);

            await controller.buscarProdutoPorID(mockReq, mockRes);

            expect(ProdutoIdSchema.parse).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(mockService.buscarProdutoPorID).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes, 
                mockData, 
                200, 
                'Produto encontrado com sucesso.'
            );
        });
    });

    describe('buscarProdutos', () => {
        it('deve buscar produtos por nome', async () => {
            const mockData = { docs: [{ id: '1', nome: 'Produto Test' }] };
            mockReq.query = { nome: 'Test', page: 1, limite: 10 };
            mockService.buscarProdutosPorNome.mockResolvedValue(mockData);

            await controller.buscarProdutos(mockReq, mockRes);

            expect(mockService.buscarProdutosPorNome).toHaveBeenCalledWith('Test', 1, 10);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes, 
                mockData, 
                200, 
                'Produtos encontrados com sucesso.'
            );
        });

        it('deve buscar produtos por categoria', async () => {
            const mockData = { docs: [{ id: '1', categoria: 'Eletrônicos' }] };
            mockReq.query = { categoria: 'Eletrônicos', page: 1, limite: 10 };
            mockService.buscarProdutosPorCategoria.mockResolvedValue(mockData);

            await controller.buscarProdutos(mockReq, mockRes);

            expect(mockService.buscarProdutosPorCategoria).toHaveBeenCalledWith('Eletrônicos', 1, 10);
        });

        it('deve buscar produtos por código', async () => {
            const mockData = { docs: [{ id: '1', codigo: '12345' }] };
            mockReq.query = { codigo: '12345', page: 1, limite: 10 };
            mockService.buscarProdutosPorCodigo.mockResolvedValue(mockData);

            await controller.buscarProdutos(mockReq, mockRes);

            expect(mockService.buscarProdutosPorCodigo).toHaveBeenCalledWith('12345', 1, 10);
        });

        it('deve buscar produtos por fornecedor', async () => {
            const mockData = { docs: [{ id: '1', fornecedor: 'Fornecedor X' }] };
            mockReq.query = { fornecedor: 'Fornecedor X', page: 1, limite: 10 };
            mockService.buscarProdutosPorFornecedor.mockResolvedValue(mockData);

            await controller.buscarProdutos(mockReq, mockRes);

            expect(mockService.buscarProdutosPorFornecedor).toHaveBeenCalledWith('Fornecedor X', 1, 10, true);
        });

        it('deve lançar erro quando nenhum parâmetro de busca for fornecido', async () => {
            mockReq.query = { page: 1, limite: 10 };

            await expect(controller.buscarProdutos(mockReq, mockRes)).rejects.toThrow();
            expect(CustomError).toHaveBeenCalledWith({
                statusCode: 400,
                errorType: 'validationError',
                field: 'query',
                details: [],
                customMessage: 'É necessário informar ao menos um parâmetro de busca: nome, categoria, codigo ou fornecedor.'
            });
        });

        it('deve retornar erro 404 quando nenhum produto for encontrado', async () => {
            const mockData = { docs: [] };
            mockReq.query = { nome: 'ProdutoInexistente', page: 1, limite: 10 };
            mockService.buscarProdutosPorNome.mockResolvedValue(mockData);

            await controller.buscarProdutos(mockReq, mockRes);

            expect(CommonResponse.error).toHaveBeenCalledWith(
                mockRes,
                404,
                'resourceNotFound',
                'Produto',
                [],
                'Nenhum produto encontrado com o(a) nome: ProdutoInexistente'
            );
        });

        it('deve limitar o número máximo de itens por página', async () => {
            const mockData = { docs: [{ id: '1', nome: 'Produto 1' }] };
            mockReq.query = { nome: 'Test', page: 1, limite: 200 };
            mockService.buscarProdutosPorNome.mockResolvedValue(mockData);

            await controller.buscarProdutos(mockReq, mockRes);

            expect(mockService.buscarProdutosPorNome).toHaveBeenCalledWith('Test', 1, 100);
        });
    });

    describe('cadastrarProduto', () => {
        it('deve cadastrar produto com sucesso', async () => {
            const mockProdutoData = { nome: 'Novo Produto', preco: 100 };
            const mockCreatedProduto = { id: '1', ...mockProdutoData };
            
            mockReq.body = mockProdutoData;
            ProdutoSchema.parse.mockReturnValue(mockProdutoData);
            mockService.cadastrarProduto.mockResolvedValue(mockCreatedProduto);

            await controller.cadastrarProduto(mockReq, mockRes);

            expect(ProdutoSchema.parse).toHaveBeenCalledWith(mockProdutoData);
            expect(mockService.cadastrarProduto).toHaveBeenCalledWith(mockProdutoData);
            expect(CommonResponse.created).toHaveBeenCalledWith(
                mockRes,
                mockCreatedProduto,
                201,
                'Produto cadastrado com sucesso.'
            );
        });
    });

    describe('atualizarProduto', () => {
        it('deve atualizar produto com sucesso', async () => {
            const mockId = '507f1f77bcf86cd799439011';
            const mockUpdateData = { nome: 'Produto Atualizado' };
            const mockUpdatedProduto = { id: mockId, ...mockUpdateData };

            mockReq.params = { id: mockId };
            mockReq.body = mockUpdateData;
            ProdutoUpdateSchema.parseAsync.mockResolvedValue(mockUpdateData);
            mockService.atualizarProduto.mockResolvedValue(mockUpdatedProduto);

            await controller.atualizarProduto(mockReq, mockRes);

            expect(ProdutoIdSchema.parse).toHaveBeenCalledWith(mockId);
            expect(ProdutoUpdateSchema.parseAsync).toHaveBeenCalledWith(mockUpdateData);
            expect(mockService.atualizarProduto).toHaveBeenCalledWith(mockId, mockUpdateData);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockUpdatedProduto,
                200,
                'Produto atualizado com sucesso.'
            );
        });

        it('deve lançar erro quando ID não for fornecido', async () => {
            mockReq.params = {};
            mockReq.body = { nome: 'Produto Atualizado' };

            await expect(controller.atualizarProduto(mockReq, mockRes)).rejects.toThrow();
            expect(CustomError).toHaveBeenCalledWith({
                statusCode: 400,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto é obrigatório.'
            });
        });

        it('deve lançar erro quando nenhum dado for fornecido para atualização', async () => {
            mockReq.params = { id: '507f1f77bcf86cd799439011' };
            mockReq.body = {};

            await expect(controller.atualizarProduto(mockReq, mockRes)).rejects.toThrow();
            expect(CustomError).toHaveBeenCalledWith({
                statusCode: 400,
                errorType: 'validationError',
                field: 'body',
                details: [],
                customMessage: 'Nenhum dado fornecido para atualização.'
            });
        });
    });

    describe('deletarProduto', () => {
        it('deve deletar produto com sucesso', async () => {
            const mockId = '507f1f77bcf86cd799439011';
            const mockDeleteResult = { message: 'Produto deletado' };

            mockReq.params = { id: mockId };
            mockService.deletarProduto.mockResolvedValue(mockDeleteResult);

            await controller.deletarProduto(mockReq, mockRes);

            expect(ProdutoIdSchema.parse).toHaveBeenCalledWith(mockId);
            expect(mockService.deletarProduto).toHaveBeenCalledWith(mockId);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockDeleteResult,
                200,
                'Produto excluído com sucesso.'
            );
        });

        it('deve lançar erro quando ID não for fornecido', async () => {
            mockReq.params = {};

            await expect(controller.deletarProduto(mockReq, mockRes)).rejects.toThrow();
            expect(CustomError).toHaveBeenCalledWith({
                statusCode: 400,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto é obrigatório para deletar.'
            });
        });
    });

    describe('listarEstoqueBaixo', () => {
        it('deve listar produtos com estoque baixo', async () => {
            const mockData = [
                { id: '1', nome: 'Produto 1', estoque: 5 },
                { id: '2', nome: 'Produto 2', estoque: 3 }
            ];

            mockService.listarEstoqueBaixo.mockResolvedValue(mockData);

            await controller.listarEstoqueBaixo(mockReq, mockRes);

            expect(mockService.listarEstoqueBaixo).toHaveBeenCalled();
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockData,
                200,
                'Lista de produtos com estoque baixo.'
            );
        });

        it('deve retornar erro 404 quando não houver produtos com estoque baixo', async () => {
            mockService.listarEstoqueBaixo.mockResolvedValue([]);

            await controller.listarEstoqueBaixo(mockReq, mockRes);

            expect(CommonResponse.error).toHaveBeenCalledWith(
                mockRes,
                404,
                'resourceNotFound',
                'Produto',
                [],
                'Nenhum produto com estoque baixo encontrado.'
            );
        });

        it('deve retornar erro 404 quando o resultado for null', async () => {
            mockService.listarEstoqueBaixo.mockResolvedValue(null);

            await controller.listarEstoqueBaixo(mockReq, mockRes);

            expect(CommonResponse.error).toHaveBeenCalledWith(
                mockRes,
                404,
                'resourceNotFound',
                'Produto',
                [],
                'Nenhum produto com estoque baixo encontrado.'
            );
        });
    });

    describe('desativarProduto', () => {
        it('deve desativar produto com sucesso', async () => {
            const mockId = '507f1f77bcf86cd799439011';
            const mockResult = { id: mockId, ativo: false };

            mockReq.params = { id: mockId };
            mockService.desativarProduto.mockResolvedValue(mockResult);

            await controller.desativarProduto(mockReq, mockRes);

            expect(ProdutoIdSchema.parse).toHaveBeenCalledWith(mockId);
            expect(mockService.desativarProduto).toHaveBeenCalledWith(mockId);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockResult,
                200,
                'Produto desativado com sucesso.'
            );
        });

        it('deve lançar erro quando ID não for fornecido', async () => {
            mockReq.params = {};

            await expect(controller.desativarProduto(mockReq, mockRes)).rejects.toThrow();
            expect(CustomError).toHaveBeenCalledWith({
                statusCode: 400,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto é obrigatório para desativar.'
            });
        });
    });

    describe('reativarProduto', () => {
        it('deve reativar produto com sucesso', async () => {
            const mockId = '507f1f77bcf86cd799439011';
            const mockResult = { id: mockId, ativo: true };

            mockReq.params = { id: mockId };
            mockService.reativarProduto.mockResolvedValue(mockResult);

            await controller.reativarProduto(mockReq, mockRes);

            expect(ProdutoIdSchema.parse).toHaveBeenCalledWith(mockId);
            expect(mockService.reativarProduto).toHaveBeenCalledWith(mockId);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockResult,
                200,
                'Produto reativado com sucesso.'
            );
        });

        it('deve lançar erro quando ID não for fornecido', async () => {
            mockReq.params = {};

            await expect(controller.reativarProduto(mockReq, mockRes)).rejects.toThrow();
            expect(CustomError).toHaveBeenCalledWith({
                statusCode: 400,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto é obrigatório para reativar.'
            });
        });
    });
});
