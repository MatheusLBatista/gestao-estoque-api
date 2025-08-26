import ProdutoController from '../../controllers/ProdutoController.js';
import ProdutoService from '../../services/produtoService.js';
import { CommonResponse, CustomError, HttpStatusCodes } from '../../utils/helpers/index.js';
import { ProdutoSchema, ProdutoUpdateSchema } from '../../utils/validators/schemas/zod/ProdutoSchema.js';
import { ProdutoQuerySchema, ProdutoIdSchema } from '../../utils/validators/schemas/zod/querys/ProdutoQuerySchema.js';

// Mock das dependências
jest.mock('../../services/produtoService.js');
jest.mock('../../utils/validators/schemas/zod/ProdutoSchema.js', () => ({
  ProdutoSchema: {
    parse: jest.fn()
  },
  ProdutoUpdateSchema: {
    parseAsync: jest.fn()
  }
}));

jest.mock('../../utils/validators/schemas/zod/querys/ProdutoQuerySchema.js', () => ({
  ProdutoQuerySchema: {
    parseAsync: jest.fn()
  },
  ProdutoIdSchema: {
    parse: jest.fn()
  }
}));

jest.mock('../../utils/helpers/index.js', () => {
  const originalModule = jest.requireActual('../../utils/helpers/index.js');

  return {
    ...originalModule,
    CommonResponse: {
      success: jest.fn(),
      error: jest.fn(),
      created: jest.fn()
    },
    CustomError: jest.fn(opts => {
      return {
        statusCode: opts.statusCode,
        errorType: opts.errorType,
        field: opts.field,
        details: opts.details,
        customMessage: opts.customMessage
      };
    }),
    HttpStatusCodes: {
      OK: { code: 200 },
      CREATED: { code: 201 },
      BAD_REQUEST: { code: 400 },
      NOT_FOUND: { code: 404 }
    }
  };
});

describe('ProdutoController', () => {
  let produtoController;
  let mockService;
  let req, res;

  beforeEach(() => {
    // Limpar os mocks entre testes
    jest.clearAllMocks();

    // Configurar mock do serviço
    mockService = {
      listarProdutos: jest.fn(),
      cadastrarProduto: jest.fn(),
      buscarProdutoPorID: jest.fn(),
      buscarProdutosPorNome: jest.fn(),
      buscarProdutosPorCategoria: jest.fn(),
      buscarProdutosPorCodigo: jest.fn(),
      buscarProdutosPorFornecedor: jest.fn(),
      atualizarProduto: jest.fn(),
      deletarProduto: jest.fn(),
      listarEstoqueBaixo: jest.fn(),
      desativarProduto: jest.fn(),
      reativarProduto: jest.fn()
    };

    // Mock para ProdutoService
    ProdutoService.mockImplementation(() => mockService);

    // Criar instância do controlador
    produtoController = new ProdutoController();

    // Mock para req e res
    req = {
      params: {},
      query: {},
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // Testes para listarProdutos
  describe('listarProdutos', () => {
    it('deve listar produtos com sucesso', async () => {
      const mockProdutos = {
        docs: [{ nome_produto: 'Produto Teste' }],
        totalDocs: 1,
        limit: 10,
        page: 1
      };

      mockService.listarProdutos.mockResolvedValue(mockProdutos);

      await produtoController.listarProdutos(req, res);

      expect(mockService.listarProdutos).toHaveBeenCalledWith(req);
      expect(CommonResponse.success).toHaveBeenCalledWith(
        res,
        mockProdutos
      );
    });

    it('deve retornar erro quando a lista está vazia', async () => {
      const mockProdutos = {
        docs: [],
        totalDocs: 0,
        limit: 10,
        page: 1
      };

      mockService.listarProdutos.mockResolvedValue(mockProdutos);

      await produtoController.listarProdutos(req, res);

      expect(mockService.listarProdutos).toHaveBeenCalledWith(req);
      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        404,
        'resourceNotFound',
        'Produto',
        [],
        'Nenhum produto encontrado com os critérios informados.'
      );
    });

    it('deve validar ID quando fornecido nos parâmetros', async () => {
      req.params = { id: '123' };
      const mockProduto = { _id: '123', nome_produto: 'Produto Teste' };

      mockService.listarProdutos.mockResolvedValue(mockProduto);

      await produtoController.listarProdutos(req, res);

      expect(ProdutoIdSchema.parse).toHaveBeenCalledWith('123');
      expect(mockService.listarProdutos).toHaveBeenCalledWith(req);
      expect(CommonResponse.success).toHaveBeenCalled();
    });

    it('deve validar query params quando fornecidos', async () => {
      req.query = { nome_produto: 'Teste', page: 1 };
      const mockProdutos = {
        docs: [{ nome_produto: 'Produto Teste' }],
        totalDocs: 1,
        limit: 10,
        page: 1
      };

      mockService.listarProdutos.mockResolvedValue(mockProdutos);

      await produtoController.listarProdutos(req, res);

      expect(ProdutoQuerySchema.parseAsync).toHaveBeenCalledWith(req.query);
      expect(mockService.listarProdutos).toHaveBeenCalledWith(req);
      expect(CommonResponse.success).toHaveBeenCalled();
    });

    it('deve tratar erros adequadamente', async () => {
      const error = new Error('Erro de teste');
      mockService.listarProdutos.mockRejectedValue(error);

      await expect(produtoController.listarProdutos(req, res)).rejects.toThrow('Erro de teste');
    });
  });

  // Testes para buscarProdutoPorID
  describe('buscarProdutoPorID', () => {
    it('deve encontrar um produto pelo ID com sucesso', async () => {
      req.params = { id: '123' };
      const mockProduto = { _id: '123', nome_produto: 'Produto Teste' };

      mockService.buscarProdutoPorID.mockResolvedValue(mockProduto);

      await produtoController.buscarProdutoPorID(req, res);

      expect(ProdutoIdSchema.parse).toHaveBeenCalledWith('123');
      expect(mockService.buscarProdutoPorID).toHaveBeenCalledWith('123');
      expect(CommonResponse.success).toHaveBeenCalledWith(
        res,
        mockProduto,
        200,
        'Produto encontrado com sucesso.'
      );
    });

    it('deve retornar erro quando o produto não é encontrado', async () => {
      req.params = { id: '123' };
      const error = new CustomError({
        statusCode: 404,
        errorType: 'resourceNotFound',
        field: 'Produto',
        details: [],
        customMessage: 'Produto não encontrado'
      });

      mockService.buscarProdutoPorID.mockRejectedValue(error);

      await produtoController.buscarProdutoPorID(req, res);

      expect(ProdutoIdSchema.parse).toHaveBeenCalledWith('123');
      expect(mockService.buscarProdutoPorID).toHaveBeenCalledWith('123');
      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        404,
        'resourceNotFound',
        'Produto',
        [],
        'Produto não encontrado. Verifique se o ID está correto.'
      );
    });

    it('deve tratar outros erros adequadamente', async () => {
      req.params = { id: '123' };
      const error = new Error('Erro de teste');

      mockService.buscarProdutoPorID.mockRejectedValue(error);

      await produtoController.buscarProdutoPorID(req, res);

      expect(CommonResponse.error).toHaveBeenCalledWith(res, error);
    });
  });

  // Testes para buscarProdutos
  describe('buscarProdutos', () => {
    it('deve buscar produtos por nome com sucesso', async () => {
      req.query = { nome: 'Teste' };
      const mockProdutos = {
        docs: [{ nome_produto: 'Produto Teste' }],
        totalDocs: 1,
        limit: 10,
        page: 1
      };

      mockService.buscarProdutosPorNome.mockResolvedValue(mockProdutos);

      await produtoController.buscarProdutos(req, res);

      expect(mockService.buscarProdutosPorNome).toHaveBeenCalledWith('Teste', 1, 10);
      expect(CommonResponse.success).toHaveBeenCalledWith(
        res,
        mockProdutos,
        200,
        'Produtos encontrados com sucesso.'
      );
    });

    it('deve buscar produtos por categoria com sucesso', async () => {
      req.query = { categoria: 'Eletrônicos' };
      const mockProdutos = {
        docs: [{ nome_produto: 'Produto Teste', categoria: 'Eletrônicos' }],
        totalDocs: 1,
        limit: 10,
        page: 1
      };

      mockService.buscarProdutosPorCategoria.mockResolvedValue(mockProdutos);

      await produtoController.buscarProdutos(req, res);

      expect(mockService.buscarProdutosPorCategoria).toHaveBeenCalledWith('Eletrônicos', 1, 10);
      expect(CommonResponse.success).toHaveBeenCalledWith(
        res,
        mockProdutos,
        200,
        'Produtos encontrados com sucesso.'
      );
    });

    it('deve buscar produtos por código com sucesso', async () => {
      req.query = { codigo: 'ABC123' };
      const mockProdutos = {
        docs: [{ nome_produto: 'Produto Teste', codigo_produto: 'ABC123' }],
        totalDocs: 1,
        limit: 10,
        page: 1
      };

      mockService.buscarProdutosPorCodigo.mockResolvedValue(mockProdutos);

      await produtoController.buscarProdutos(req, res);

      expect(mockService.buscarProdutosPorCodigo).toHaveBeenCalledWith('ABC123', 1, 10);
      expect(CommonResponse.success).toHaveBeenCalledWith(
        res,
        mockProdutos,
        200,
        'Produtos encontrados com sucesso.'
      );
    });

    it('deve buscar produtos por fornecedor com sucesso', async () => {
      req.query = { fornecedor: 'Fornecedor A' };
      const mockProdutos = {
        docs: [{ nome_produto: 'Produto Teste', nome_fornecedor: 'Fornecedor A' }],
        totalDocs: 1,
        limit: 10,
        page: 1
      };

      mockService.buscarProdutosPorFornecedor.mockResolvedValue(mockProdutos);

      await produtoController.buscarProdutos(req, res);

      expect(mockService.buscarProdutosPorFornecedor).toHaveBeenCalledWith('Fornecedor A', 1, 10, true);
      expect(CommonResponse.success).toHaveBeenCalledWith(
        res,
        mockProdutos,
        200,
        'Produtos encontrados com sucesso.'
      );
    });

    it('deve retornar erro quando nenhum filtro é fornecido', async () => {
      req.query = {};

      await produtoController.buscarProdutos(req, res);

      expect(CommonResponse.error).toHaveBeenCalled();
      expect(mockService.buscarProdutosPorNome).not.toHaveBeenCalled();
      expect(mockService.buscarProdutosPorCategoria).not.toHaveBeenCalled();
      expect(mockService.buscarProdutosPorCodigo).not.toHaveBeenCalled();
      expect(mockService.buscarProdutosPorFornecedor).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando a busca não encontra resultados', async () => {
      req.query = { nome: 'ProdutoInexistente' };
      const mockProdutos = { docs: [], totalDocs: 0, limit: 10, page: 1 };

      mockService.buscarProdutosPorNome.mockResolvedValue(mockProdutos);

      await produtoController.buscarProdutos(req, res);

      expect(mockService.buscarProdutosPorNome).toHaveBeenCalledWith('ProdutoInexistente', 1, 10);
      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        404,
        'resourceNotFound',
        'Produto',
        [],
        'Nenhum produto encontrado com o(a) nome: ProdutoInexistente'
      );
    });

    it('deve tratar erros adequadamente', async () => {
      req.query = { nome: 'Teste' };
      const error = new Error('Erro de teste');

      mockService.buscarProdutosPorNome.mockRejectedValue(error);

      await produtoController.buscarProdutos(req, res);

      expect(CommonResponse.error).toHaveBeenCalledWith(res, error);
    });
  });

  // Testes para cadastrarProduto
  describe('cadastrarProduto', () => {
    it('deve cadastrar um produto com sucesso', async () => {
      req.body = {
        nome_produto: 'Novo Produto',
        codigo_produto: 'NP001',
        preco: 99.99
      };

      const produtoCadastrado = { ...req.body, _id: '123' };

      ProdutoSchema.parse.mockReturnValue(req.body);
      mockService.cadastrarProduto.mockResolvedValue(produtoCadastrado);

      await produtoController.cadastrarProduto(req, res);

      expect(ProdutoSchema.parse).toHaveBeenCalledWith(req.body);
      expect(mockService.cadastrarProduto).toHaveBeenCalledWith(req.body);
      expect(CommonResponse.created).toHaveBeenCalledWith(
        res,
        produtoCadastrado,
        201,
        'Produto cadastrado com sucesso.'
      );
    });

    it('deve tratar erros de validação', async () => {
      req.body = { nome_produto: 'Novo Produto' }; // Falta código e preço
      const validationError = new Error('Erro de validação');

      ProdutoSchema.parse.mockImplementation(() => { throw validationError; });

      await produtoController.cadastrarProduto(req, res);

      expect(ProdutoSchema.parse).toHaveBeenCalledWith(req.body);
      expect(mockService.cadastrarProduto).not.toHaveBeenCalled();
      expect(CommonResponse.error).toHaveBeenCalledWith(res, validationError);
    });

    it('deve tratar erros do service', async () => {
      req.params = { id: '123' };
      req.body = { nome_produto: 'Produto Atualizado' };

      const serviceError = new Error('Erro no service');

      ProdutoIdSchema.parse.mockReturnValue('123');
      ProdutoUpdateSchema.parseAsync.mockResolvedValue(req.body);
      mockService.atualizarProduto.mockRejectedValue(serviceError);

      await produtoController.atualizarProduto(req, res);

      expect(mockService.atualizarProduto).toHaveBeenCalledWith('123', req.body);

      expect(CommonResponse.error).toHaveBeenCalledWith(res, serviceError);
    });
  });

  // Testes para atualizarProduto
  describe('atualizarProduto', () => {
    it('deve atualizar um produto com sucesso', async () => {
      req.params = { id: '123' };
      req.body = { nome_produto: 'Produto Atualizado' };

      const produtoAtualizado = { _id: '123', nome_produto: 'Produto Atualizado' };

      ProdutoIdSchema.parse.mockReturnValue('123');
      ProdutoUpdateSchema.parseAsync.mockResolvedValue(req.body);
      mockService.atualizarProduto.mockResolvedValue(produtoAtualizado);

      await produtoController.atualizarProduto(req, res);

      expect(ProdutoIdSchema.parse).toHaveBeenCalledWith('123');
      expect(ProdutoUpdateSchema.parseAsync).toHaveBeenCalledWith(req.body);
      expect(mockService.atualizarProduto).toHaveBeenCalledWith('123', req.body);
      expect(CommonResponse.success).toHaveBeenCalledWith(
        res,
        produtoAtualizado,
        200,
        'Produto atualizado com sucesso.'
      );
    });

    it('deve retornar erro quando o ID não é fornecido', async () => {
      req.params = {};
      req.body = { nome_produto: 'Produto Atualizado' };

      await produtoController.atualizarProduto(req, res);

      expect(ProdutoIdSchema.parse).not.toHaveBeenCalled();
      expect(mockService.atualizarProduto).not.toHaveBeenCalled();
      expect(CommonResponse.error).toHaveBeenCalled();
    });

    it('deve retornar erro quando o corpo da requisição está vazio', async () => {
      req.params = { id: '123' };
      req.body = {};

      ProdutoIdSchema.parse.mockReturnValue('123');

      const validationError = new CustomError({
        statusCode: 400,
        errorType: 'validationError',
        field: 'body',
        details: [],
        customMessage: 'Nenhum dado fornecido para atualização.'
      });

      await produtoController.atualizarProduto(req, res);

      expect(ProdutoIdSchema.parse).toHaveBeenCalledWith('123');

      expect(ProdutoUpdateSchema.parseAsync).not.toHaveBeenCalled();

      expect(mockService.atualizarProduto).not.toHaveBeenCalled();

      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          statusCode: 400,
          errorType: 'validationError',
          field: 'body',
          customMessage: 'Nenhum dado fornecido para atualização.'
        })
      );
    });

    it('deve tratar erros de validação', async () => {
      req.params = { id: '123' };
      req.body = { preco: 'não é um número' };

      const validationError = new CustomError({
        statusCode: 400,
        errorType: 'validationError',
        field: 'preco',
        details: [],
        customMessage: 'Erro de validação: preco deve ser um número'
      });

      ProdutoIdSchema.parse.mockReturnValue('123');
      ProdutoUpdateSchema.parseAsync.mockRejectedValue(validationError);

      await produtoController.atualizarProduto(req, res);

      expect(ProdutoIdSchema.parse).toHaveBeenCalledWith('123');
      expect(ProdutoUpdateSchema.parseAsync).toHaveBeenCalledWith(req.body);
      expect(mockService.atualizarProduto).not.toHaveBeenCalled();
      expect(CommonResponse.error).toHaveBeenCalledWith(res, validationError);
    });

    it('deve tratar erros do service', async () => {
      req.params = { id: '123' };
      req.body = { nome_produto: 'Produto Atualizado' };

      const serviceError = new CustomError({
        statusCode: 500,
        errorType: 'internalServerError',
        field: 'server',
        details: [],
        customMessage: 'Erro no service'
      });

      ProdutoIdSchema.parse.mockReturnValue('123');
      ProdutoUpdateSchema.parseAsync.mockResolvedValue(req.body);

      mockService.atualizarProduto.mockRejectedValue(serviceError);

      await produtoController.atualizarProduto(req, res);

      expect(mockService.atualizarProduto).toHaveBeenCalledWith('123', req.body);

      expect(CommonResponse.error).toHaveBeenCalledWith(res, expect.objectContaining({
        statusCode: 500,
        errorType: 'internalServerError',
        field: 'server',
        customMessage: 'Erro no service'
      }));
    });
  });

  // Testes para deletarProduto
  describe('deletarProduto', () => {
    it('deve deletar um produto com sucesso', async () => {
      req.params = { id: '123' };
      const produtoDeletado = { _id: '123', nome_produto: 'Produto Deletado' };

      ProdutoIdSchema.parse.mockReturnValue('123');
      mockService.deletarProduto.mockResolvedValue(produtoDeletado);

      await produtoController.deletarProduto(req, res);

      expect(ProdutoIdSchema.parse).toHaveBeenCalledWith('123');
      expect(mockService.deletarProduto).toHaveBeenCalledWith('123');
      expect(CommonResponse.success).toHaveBeenCalledWith(
        res,
        produtoDeletado,
        200,
        'Produto excluído com sucesso.'
      );
    });

    it('deve retornar erro quando o ID não é fornecido', async () => {
      req.params = {};

      await produtoController.deletarProduto(req, res);

      expect(mockService.deletarProduto).not.toHaveBeenCalled();
      expect(CommonResponse.error).toHaveBeenCalled();
    });

    it('deve retornar erro quando o ID é inválido', async () => {
      req.params = { id: '123' };
      const validationError = new Error('ID inválido');

      ProdutoIdSchema.parse.mockImplementation(() => { throw validationError; });

      await produtoController.deletarProduto(req, res);

      expect(ProdutoIdSchema.parse).toHaveBeenCalledWith('123');
      expect(mockService.deletarProduto).not.toHaveBeenCalled();
      expect(CommonResponse.error).toHaveBeenCalled();
    });

    it('deve tratar erros quando o produto não é encontrado', async () => {
      req.params = { id: '123' };
      const notFoundError = new CustomError({
        statusCode: 404,
        errorType: 'resourceNotFound',
        field: 'Produto',
        details: [],
        customMessage: 'Produto não encontrado'
      });

      ProdutoIdSchema.parse.mockReturnValue('123');
      mockService.deletarProduto.mockRejectedValue(notFoundError);

      await produtoController.deletarProduto(req, res);

      expect(mockService.deletarProduto).toHaveBeenCalledWith('123');
      expect(CommonResponse.error).toHaveBeenCalled();
    });
  });

  // Testes para listarEstoqueBaixo
  describe('listarEstoqueBaixo', () => {
    it('deve listar produtos com estoque baixo com sucesso', async () => {
      const mockProdutos = [
        { nome_produto: 'Produto Crítico', estoque: 5, estoque_min: 10 }
      ];

      mockService.listarEstoqueBaixo.mockResolvedValue(mockProdutos);

      await produtoController.listarEstoqueBaixo(req, res);

      expect(mockService.listarEstoqueBaixo).toHaveBeenCalled();
      expect(CommonResponse.success).toHaveBeenCalledWith(
        res,
        mockProdutos,
        200,
        'Lista de produtos com estoque baixo.'
      );
    });

    it('deve retornar erro quando não há produtos com estoque baixo', async () => {
      mockService.listarEstoqueBaixo.mockResolvedValue([]);

      await produtoController.listarEstoqueBaixo(req, res);

      expect(mockService.listarEstoqueBaixo).toHaveBeenCalled();
      expect(CommonResponse.error).toHaveBeenCalledWith(
        res,
        404,
        'resourceNotFound',
        'Produto',
        [],
        'Nenhum produto com estoque baixo encontrado.'
      );
    });

    it('deve tratar erros adequadamente', async () => {
      const error = new Error('Erro de teste');
      mockService.listarEstoqueBaixo.mockRejectedValue(error);

      await produtoController.listarEstoqueBaixo(req, res);

      expect(CommonResponse.error).toHaveBeenCalledWith(res, error);
    });
  });

  // Testes para desativarProduto
  describe('desativarProduto', () => {
    it('deve desativar um produto com sucesso', async () => {
      req.params = { id: '123' };
      const produtoDesativado = { _id: '123', nome_produto: 'Produto', status: false };

      ProdutoIdSchema.parse.mockReturnValue('123');
      mockService.desativarProduto.mockResolvedValue(produtoDesativado);

      await produtoController.desativarProduto(req, res);

      expect(ProdutoIdSchema.parse).toHaveBeenCalledWith('123');
      expect(mockService.desativarProduto).toHaveBeenCalledWith('123');
      expect(CommonResponse.success).toHaveBeenCalledWith(
        res,
        produtoDesativado,
        200,
        'Produto desativado com sucesso.'
      );
    });

    it('deve retornar erro quando o ID não é fornecido', async () => {
      req.params = {};

      await produtoController.desativarProduto(req, res);

      expect(mockService.desativarProduto).not.toHaveBeenCalled();
      expect(CommonResponse.error).toHaveBeenCalled();
    });

    it('deve retornar erro quando o ID é inválido', async () => {
      req.params = { id: '123' };
      const validationError = new Error('ID inválido');

      ProdutoIdSchema.parse.mockImplementation(() => { throw validationError; });

      await produtoController.desativarProduto(req, res);

      expect(ProdutoIdSchema.parse).toHaveBeenCalledWith('123');
      expect(mockService.desativarProduto).not.toHaveBeenCalled();
      expect(CommonResponse.error).toHaveBeenCalled();
    });

    it('deve tratar erros quando o produto não é encontrado', async () => {
      req.params = { id: '123' };
      const notFoundError = new CustomError({
        statusCode: 404,
        errorType: 'resourceNotFound',
        field: 'Produto',
        details: [],
        customMessage: 'Produto não encontrado'
      });

      ProdutoIdSchema.parse.mockReturnValue('123');
      mockService.desativarProduto.mockRejectedValue(notFoundError);

      await produtoController.desativarProduto(req, res);

      expect(mockService.desativarProduto).toHaveBeenCalledWith('123');
      expect(CommonResponse.error).toHaveBeenCalled();
    });
  });

  // Testes para reativarProduto
  describe('reativarProduto', () => {
    it('deve reativar um produto com sucesso', async () => {
      req.params = { id: '123' };
      const produtoReativado = { _id: '123', nome_produto: 'Produto', status: true };

      ProdutoIdSchema.parse.mockReturnValue('123');
      mockService.reativarProduto.mockResolvedValue(produtoReativado);

      await produtoController.reativarProduto(req, res);

      expect(ProdutoIdSchema.parse).toHaveBeenCalledWith('123');
      expect(mockService.reativarProduto).toHaveBeenCalledWith('123');
      expect(CommonResponse.success).toHaveBeenCalledWith(
        res,
        produtoReativado,
        200,
        'Produto reativado com sucesso.'
      );
    });

    it('deve retornar erro quando o ID não é fornecido', async () => {
      req.params = {};

      await produtoController.reativarProduto(req, res);

      expect(mockService.reativarProduto).not.toHaveBeenCalled();
      expect(CommonResponse.error).toHaveBeenCalled();
    });

    it('deve retornar erro quando o ID é inválido', async () => {
      req.params = { id: '123' };
      const validationError = new Error('ID inválido');

      ProdutoIdSchema.parse.mockImplementation(() => { throw validationError; });

      await produtoController.reativarProduto(req, res);

      expect(ProdutoIdSchema.parse).toHaveBeenCalledWith('123');
      expect(mockService.reativarProduto).not.toHaveBeenCalled();
      expect(CommonResponse.error).toHaveBeenCalled();
    });

    it('deve tratar erros quando o produto não é encontrado', async () => {
      req.params = { id: '123' };
      const notFoundError = new CustomError({
        statusCode: 404,
        errorType: 'resourceNotFound',
        field: 'Produto',
        details: [],
        customMessage: 'Produto não encontrado'
      });

      ProdutoIdSchema.parse.mockReturnValue('123');
      mockService.reativarProduto.mockRejectedValue(notFoundError);

      await produtoController.reativarProduto(req, res);

      expect(mockService.reativarProduto).toHaveBeenCalledWith('123');
      expect(CommonResponse.error).toHaveBeenCalled();
    });
  });
});