import MovimentacoesController from '../../src/controllers/MovimentacoesController.js';
import MovimentacaoService from '../../src/services/movimentacaoService.js';
import { CommonResponse, CustomError, HttpStatusCodes } from '../../src/utils/helpers/index.js';
import LogMiddleware from '../../src/middlewares/LogMiddleware.js';
import { MovimentacaoQuerySchema, MovimentacaoIdSchema } from '../../src/utils/validators/schemas/zod/querys/MovimentacaoQuerySchema.js';
import { MovimentacaoSchema, MovimentacaoUpdateSchema } from '../../src/utils/validators/schemas/zod/MovimentacaoSchema.js';

// Mocks
jest.mock('../../src/services/movimentacaoService.js');
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
        OK: { code: 200 }
    }
}));

jest.mock('../../src/middlewares/LogMiddleware.js', () => ({
    default: {
        logCriticalEvent: jest.fn()
    },
    logCriticalEvent: jest.fn()
}));

jest.mock('../../src/utils/validators/schemas/zod/querys/MovimentacaoQuerySchema.js', () => ({
    MovimentacaoQuerySchema: {
        parseAsync: jest.fn()
    },
    MovimentacaoIdSchema: {
        parse: jest.fn()
    }
}));

jest.mock('../../src/utils/validators/schemas/zod/MovimentacaoSchema.js', () => ({
    MovimentacaoSchema: {
        parseAsync: jest.fn()
    },
    MovimentacaoUpdateSchema: {
        parseAsync: jest.fn()
    }
}));

describe('MovimentacoesController', () => {
    let controller;
    let mockService;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        controller = new MovimentacoesController();
        mockService = new MovimentacaoService();
        controller.service = mockService;

        mockReq = {
            params: {},
            query: {},
            body: {},
            userId: 'test-user-id'
        };

        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };

        // Reset mocks
        jest.clearAllMocks();
    });

    describe('validateId', () => {
        it('deve validar ID com sucesso', () => {
            MovimentacaoIdSchema.parse.mockReturnValue('507f1f77bcf86cd799439011');
            
            expect(() => controller.validateId('507f1f77bcf86cd799439011')).not.toThrow();
            expect(MovimentacaoIdSchema.parse).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });

        it('deve lançar erro quando ID não for fornecido', () => {
            expect(() => controller.validateId(null)).toThrow();
            expect(CustomError).toHaveBeenCalledWith({
                statusCode: 400,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID da movimentação é obrigatório para processar.'
            });
        });

        it('deve personalizar mensagem de erro baseada na ação', () => {
            expect(() => controller.validateId(null, 'movimentacao_id', 'deletar')).toThrow();
            expect(CustomError).toHaveBeenCalledWith({
                statusCode: 400,
                errorType: 'validationError',
                field: 'movimentacao_id',
                details: [],
                customMessage: 'ID da movimentação é obrigatório para deletar.'
            });
        });
    });

    describe('listarMovimentacoes', () => {
        it('deve listar movimentações com sucesso', async () => {
            const mockData = {
                docs: [
                    { id: '1', tipo: 'entrada' },
                    { id: '2', tipo: 'saida' }
                ]
            };

            mockService.listarMovimentacoes.mockResolvedValue(mockData);

            await controller.listarMovimentacoes(mockReq, mockRes);

            expect(mockService.listarMovimentacoes).toHaveBeenCalledWith(mockReq);
            expect(CommonResponse.success).toHaveBeenCalledWith(mockRes, mockData);
        });

        it('deve validar ID quando fornecido nos params', async () => {
            const mockData = { docs: [{ id: '1', tipo: 'entrada' }] };
            mockReq.params = { id: '507f1f77bcf86cd799439011' };
            mockService.listarMovimentacoes.mockResolvedValue(mockData);

            await controller.listarMovimentacoes(mockReq, mockRes);

            expect(MovimentacaoIdSchema.parse).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });

        it('deve validar query params quando presentes', async () => {
            const mockData = { docs: [{ id: '1', tipo: 'entrada' }] };
            mockReq.query = { tipo: 'entrada' };
            mockService.listarMovimentacoes.mockResolvedValue(mockData);
            MovimentacaoQuerySchema.parseAsync.mockResolvedValue(mockReq.query);

            await controller.listarMovimentacoes(mockReq, mockRes);

            expect(MovimentacaoQuerySchema.parseAsync).toHaveBeenCalledWith(mockReq.query);
        });

        it('deve retornar erro 404 quando nenhuma movimentação for encontrada', async () => {
            const mockData = { docs: [] };
            mockService.listarMovimentacoes.mockResolvedValue(mockData);

            await controller.listarMovimentacoes(mockReq, mockRes);

            expect(CommonResponse.error).toHaveBeenCalledWith(
                mockRes,
                404,
                'resourceNotFound',
                'Movimentacao',
                [],
                'Nenhuma movimentação encontrada com os critérios informados.'
            );
        });
    });

    describe('buscarMovimentacaoPorID', () => {
        it('deve buscar movimentação por ID com sucesso', async () => {
            const mockData = { id: '1', tipo: 'entrada' };
            mockReq.params = { id: '507f1f77bcf86cd799439011' };
            MovimentacaoIdSchema.parse.mockReturnValue('507f1f77bcf86cd799439011');
            mockService.buscarMovimentacaoPorID.mockResolvedValue(mockData);

            await controller.buscarMovimentacaoPorID(mockReq, mockRes);

            expect(MovimentacaoIdSchema.parse).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(mockService.buscarMovimentacaoPorID).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockData,
                200,
                'Movimentação encontrada com sucesso.'
            );
        });
    });

    describe('buscarMovimentacoes', () => {
        it('deve buscar movimentações por tipo', async () => {
            const mockData = { docs: [{ id: '1', tipo: 'entrada' }] };
            mockReq.query = { tipo: 'entrada', page: 1, limite: 10 };
            mockService.buscarMovimentacoesPorTipo.mockResolvedValue(mockData);

            await controller.buscarMovimentacoes(mockReq, mockRes);

            expect(mockService.buscarMovimentacoesPorTipo).toHaveBeenCalledWith('entrada', 1, 10);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockData,
                200,
                'Movimentações encontradas com sucesso.'
            );
        });

        it('deve buscar movimentações por período', async () => {
            const mockData = { docs: [{ id: '1', tipo: 'entrada' }] };
            mockReq.query = { data_inicio: '2023-01-01', data_fim: '2023-12-31', page: 1, limite: 10 };
            mockService.buscarMovimentacoesPorPeriodo.mockResolvedValue(mockData);

            await controller.buscarMovimentacoes(mockReq, mockRes);

            expect(mockService.buscarMovimentacoesPorPeriodo).toHaveBeenCalledWith('2023-01-01', '2023-12-31', 1, 10);
        });

        it('deve buscar movimentações por produto', async () => {
            const mockData = { docs: [{ id: '1', produto: 'Produto X' }] };
            mockReq.query = { produto: 'Produto X', page: 1, limite: 10 };
            mockService.buscarMovimentacoesPorProduto.mockResolvedValue(mockData);

            await controller.buscarMovimentacoes(mockReq, mockRes);

            expect(mockService.buscarMovimentacoesPorProduto).toHaveBeenCalledWith('Produto X', 1, 10);
        });

        it('deve buscar movimentações por usuário', async () => {
            const mockData = { docs: [{ id: '1', usuario: 'User 1' }] };
            mockReq.query = { usuario: 'User 1', page: 1, limite: 10 };
            mockService.buscarMovimentacoesPorUsuario.mockResolvedValue(mockData);

            await controller.buscarMovimentacoes(mockReq, mockRes);

            expect(mockService.buscarMovimentacoesPorUsuario).toHaveBeenCalledWith('User 1', 1, 10);
        });

        it('deve lançar erro quando nenhum parâmetro de busca for fornecido', async () => {
            mockReq.query = { page: 1, limite: 10 };

            await expect(controller.buscarMovimentacoes(mockReq, mockRes)).rejects.toThrow();
            expect(CustomError).toHaveBeenCalledWith({
                statusCode: 400,
                errorType: 'validationError',
                field: 'query',
                details: [],
                customMessage: 'É necessário informar ao menos um parâmetro de busca: tipo, periodo, produto ou usuario.'
            });
        });

        it('deve retornar erro 404 quando nenhuma movimentação for encontrada', async () => {
            const mockData = { docs: [] };
            mockReq.query = { tipo: 'entrada', page: 1, limite: 10 };
            mockService.buscarMovimentacoesPorTipo.mockResolvedValue(mockData);

            await controller.buscarMovimentacoes(mockReq, mockRes);

            expect(CommonResponse.error).toHaveBeenCalledWith(
                mockRes,
                404,
                'resourceNotFound',
                'Movimentacao',
                [],
                'Nenhuma movimentação encontrada com o(a) tipo informado.'
            );
        });

        it('deve limitar o número máximo de itens por página', async () => {
            const mockData = { docs: [{ id: '1', tipo: 'entrada' }] };
            mockReq.query = { tipo: 'entrada', page: 1, limite: 200 };
            mockService.buscarMovimentacoesPorTipo.mockResolvedValue(mockData);

            await controller.buscarMovimentacoes(mockReq, mockRes);

            expect(mockService.buscarMovimentacoesPorTipo).toHaveBeenCalledWith('entrada', 1, 100);
        });
    });

    describe('cadastrarMovimentacao', () => {
        it('deve cadastrar movimentação com sucesso', async () => {
            const mockMovimentacaoData = { 
                tipo: 'entrada', 
                quantidade: 10,
                data_movimentacao: '2023-01-01'
            };
            const mockCreatedMovimentacao = { id: '1', ...mockMovimentacaoData };
            const expectedInput = {
                ...mockMovimentacaoData,
                data_movimentacao: new Date('2023-01-01')
            };

            mockReq.body = mockMovimentacaoData;
            MovimentacaoSchema.parseAsync.mockResolvedValue(expectedInput);
            mockService.cadastrarMovimentacao.mockResolvedValue(mockCreatedMovimentacao);

            await controller.cadastrarMovimentacao(mockReq, mockRes);

            expect(MovimentacaoSchema.parseAsync).toHaveBeenCalledWith(expectedInput);
            expect(mockService.cadastrarMovimentacao).toHaveBeenCalledWith(expectedInput);
            expect(CommonResponse.created).toHaveBeenCalledWith(
                mockRes,
                mockCreatedMovimentacao,
                201,
                'Movimentação registrada com sucesso.'
            );
        });
    });

    describe('atualizarMovimentacao', () => {
        it('deve atualizar movimentação com sucesso', async () => {
            const mockId = '507f1f77bcf86cd799439011';
            const mockUpdateData = { tipo: 'saida', produtos: [{ id: 'prod1', quantidade: 5 }] };
            const mockUpdatedMovimentacao = { id: mockId, _id: mockId, ...mockUpdateData };

            mockReq.params = { id: mockId };
            mockReq.body = mockUpdateData;
            MovimentacaoIdSchema.parse.mockReturnValue(mockId);
            MovimentacaoUpdateSchema.parseAsync.mockResolvedValue(mockUpdateData);
            mockService.atualizarMovimentacao.mockResolvedValue(mockUpdatedMovimentacao);

            await controller.atualizarMovimentacao(mockReq, mockRes);

            expect(MovimentacaoIdSchema.parse).toHaveBeenCalledWith(mockId);
            expect(MovimentacaoUpdateSchema.parseAsync).toHaveBeenCalledWith(mockUpdateData);
            expect(mockService.atualizarMovimentacao).toHaveBeenCalledWith(mockId, mockUpdateData);
            expect(LogMiddleware.logCriticalEvent).toHaveBeenCalledWith(
                mockReq.userId,
                'ESTOQUE_MOVIMENTO',
                {
                    produtos: mockUpdateData.produtos,
                    tipo: mockUpdateData.tipo,
                    destino: mockUpdateData.destino,
                    movimentacao_id: mockUpdatedMovimentacao._id
                },
                mockReq
            );
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockUpdatedMovimentacao,
                200,
                'Movimentação atualizada com sucesso.'
            );
        });
    });

    describe('deletarMovimentacao', () => {
        it('deve deletar movimentação com sucesso', async () => {
            const mockId = '507f1f77bcf86cd799439011';
            const mockDeleteResult = { message: 'Movimentação deletada' };

            mockReq.params = { id: mockId };
            MovimentacaoIdSchema.parse.mockReturnValue(mockId);
            mockService.deletarMovimentacao.mockResolvedValue(mockDeleteResult);

            await controller.deletarMovimentacao(mockReq, mockRes);

            expect(MovimentacaoIdSchema.parse).toHaveBeenCalledWith(mockId);
            expect(mockService.deletarMovimentacao).toHaveBeenCalledWith(mockId);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockDeleteResult,
                200,
                'Movimentação excluída com sucesso.'
            );
        });
    });

    describe('filtrarMovimentacoesAvancado', () => {
        it('deve filtrar movimentações com sucesso', async () => {
            const mockQuery = {
                tipo: 'entrada',
                destino: 'estoque',
                data_inicio: '2023-01-01',
                data_fim: '2023-12-31',
                id_usuario: 'user1',
                nome_usuario: 'João',
                id_produto: 'prod1',
                codigo_produto: 'COD123',
                nome_produto: 'Produto X',
                id_fornecedor: 'forn1',
                nome_fornecedor: 'Fornecedor Y',
                quantidade_min: '10',
                quantidade_max: '100',
                page: '1',
                limite: '20'
            };

            const mockResult = {
                docs: [{ id: '1', tipo: 'entrada' }]
            };

            mockReq.query = mockQuery;
            mockService.filtrarMovimentacoesAvancado.mockResolvedValue(mockResult);

            await controller.filtrarMovimentacoesAvancado(mockReq, mockRes);

            expect(mockService.filtrarMovimentacoesAvancado).toHaveBeenCalledWith(
                {
                    tipo: 'entrada',
                    destino: 'estoque',
                    data: undefined,
                    dataInicio: '2023-01-01',
                    dataFim: '2023-12-31',
                    idUsuario: 'user1',
                    nomeUsuario: 'João',
                    idProduto: 'prod1',
                    codigoProduto: 'COD123',
                    nomeProduto: 'Produto X',
                    idFornecedor: 'forn1',
                    nomeFornecedor: 'Fornecedor Y',
                    quantidadeMin: 10,
                    quantidadeMax: 100
                },
                {
                    page: '1',
                    limite: '20'
                }
            );

            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockResult,
                200,
                'Movimentações encontradas com sucesso.'
            );
        });

        it('deve retornar erro 404 quando nenhuma movimentação for encontrada no filtro avançado', async () => {
            const mockResult = { docs: [] };
            mockReq.query = { tipo: 'entrada' };
            mockService.filtrarMovimentacoesAvancado.mockResolvedValue(mockResult);

            await controller.filtrarMovimentacoesAvancado(mockReq, mockRes);

            expect(CommonResponse.error).toHaveBeenCalledWith(
                mockRes,
                404,
                'resourceNotFound',
                'Movimentacao',
                [],
                'Nenhuma movimentação encontrada com os critérios informados.'
            );
        });
    });

    describe('desativarMovimentacao', () => {
        it('deve desativar movimentação com sucesso', async () => {
            const mockId = '507f1f77bcf86cd799439011';
            const mockResult = { id: mockId, ativo: false };

            mockReq.params = { id: mockId };
            MovimentacaoIdSchema.parse.mockReturnValue(mockId);
            mockService.desativarMovimentacao.mockResolvedValue(mockResult);

            await controller.desativarMovimentacao(mockReq, mockRes);

            expect(MovimentacaoIdSchema.parse).toHaveBeenCalledWith(mockId);
            expect(mockService.desativarMovimentacao).toHaveBeenCalledWith(mockId);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockResult,
                200,
                'movimentação desativada com sucesso.'
            );
        });
    });

    describe('reativarMovimentacao', () => {
        it('deve reativar movimentação com sucesso', async () => {
            const mockId = '507f1f77bcf86cd799439011';
            const mockResult = { id: mockId, ativo: true };

            mockReq.params = { id: mockId };
            MovimentacaoIdSchema.parse.mockReturnValue(mockId);
            mockService.reativarMovimentacao.mockResolvedValue(mockResult);

            await controller.reativarMovimentacao(mockReq, mockRes);

            expect(MovimentacaoIdSchema.parse).toHaveBeenCalledWith(mockId);
            expect(mockService.reativarMovimentacao).toHaveBeenCalledWith(mockId);
            expect(CommonResponse.success).toHaveBeenCalledWith(
                mockRes,
                mockResult,
                200,
                'movimentação reativada com sucesso.'
            );
        });
    });
});
