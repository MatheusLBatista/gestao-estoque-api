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
    CustomError: jest.fn().mockImplementation(opts => {
      const error = new Error(opts.customMessage);
      error.statusCode = opts.statusCode;
      error.errorType = opts.errorType;
      error.field = opts.field;
      error.details = opts.details;
      error.customMessage = opts.customMessage;
      return error;
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

      await expect(produtoController.buscarProdutoPorID(req, res)).rejects.toMatchObject({
        statusCode: 404,
        errorType: 'resourceNotFound',
        field: 'Produto',
        customMessage: 'Produto não encontrado'
      });
    });

    it('deve tratar outros erros adequadamente', async () => {
      req.params = { id: '123' };
      const error = new Error('Erro de teste');

      mockService.buscarProdutoPorID.mockRejectedValue(error);

      await expect(produtoController.buscarProdutoPorID(req, res)).rejects.toThrow('Erro de teste');
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

    it('deve retornar erro quando nenhum filtro é fornecido', async () => {
      req.query = {};

      await expect(produtoController.buscarProdutos(req, res)).rejects.toMatchObject({
        statusCode: 400,
        errorType: 'validationError',
        field: 'query'
      });
    });

    it('deve tratar erros adequadamente', async () => {
      req.query = { nome: 'Teste' };
      const error = new Error('Erro de teste');

      mockService.buscarProdutosPorNome.mockRejectedValue(error);

      await expect(produtoController.buscarProdutos(req, res)).rejects.toThrow('Erro de teste');
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
      req.body = { nome_produto: 'Novo Produto' };
      const validationError = new Error('Erro de validação');

      ProdutoSchema.parse.mockImplementation(() => { throw validationError; });

      await expect(produtoController.cadastrarProduto(req, res)).rejects.toThrow('Erro de validação');
    });

    it('deve tratar erros do service', async () => {
      req.body = { nome_produto: 'Novo Produto' };
      const serviceError = new Error('Erro no service');

      ProdutoSchema.parse.mockReturnValue(req.body);
      mockService.cadastrarProduto.mockRejectedValue(serviceError);

      await expect(produtoController.cadastrarProduto(req, res)).rejects.toThrow('Erro no service');
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

      await expect(produtoController.atualizarProduto(req, res)).rejects.toMatchObject({
        statusCode: 400,
        errorType: 'validationError',
        field: 'id'
      });
    });

    it('deve retornar erro quando o corpo da requisição está vazio', async () => {
      req.params = { id: '123' };
      req.body = {};

      ProdutoIdSchema.parse.mockReturnValue('123');

      await expect(produtoController.atualizarProduto(req, res)).rejects.toMatchObject({
        statusCode: 400,
        errorType: 'validationError',
        field: 'body'
      });
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

      await expect(produtoController.atualizarProduto(req, res)).rejects.toMatchObject({
        statusCode: 400,
        errorType: 'validationError',
        field: 'preco'
      });
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

      await expect(produtoController.atualizarProduto(req, res)).rejects.toMatchObject({
        statusCode: 500,
        errorType: 'internalServerError'
      });
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

      await expect(produtoController.deletarProduto(req, res)).rejects.toMatchObject({
        statusCode: 400,
        errorType: 'validationError',
        field: 'id'
      });
    });

    it('deve retornar erro quando o ID é inválido', async () => {
      req.params = { id: '123' };
      const validationError = new Error('ID inválido');

      ProdutoIdSchema.parse.mockImplementation(() => { throw validationError; });

      await expect(produtoController.deletarProduto(req, res)).rejects.toThrow('ID inválido');
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

      await expect(produtoController.deletarProduto(req, res)).rejects.toMatchObject({
        statusCode: 404,
        errorType: 'resourceNotFound'
      });
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

      await expect(produtoController.listarEstoqueBaixo(req, res)).rejects.toThrow('Erro de teste');
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

      await expect(produtoController.desativarProduto(req, res)).rejects.toMatchObject({
        statusCode: 400,
        errorType: 'validationError',
        field: 'id'
      });
    });

    it('deve retornar erro quando o ID é inválido', async () => {
      req.params = { id: '123' };
      const validationError = new Error('ID inválido');

      ProdutoIdSchema.parse.mockImplementation(() => { throw validationError; });

      await expect(produtoController.desativarProduto(req, res)).rejects.toThrow('ID inválido');
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

      await expect(produtoController.desativarProduto(req, res)).rejects.toMatchObject({
        statusCode: 404,
        errorType: 'resourceNotFound'
      });
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

      await expect(produtoController.reativarProduto(req, res)).rejects.toMatchObject({
        statusCode: 400,
        errorType: 'validationError',
        field: 'id'
      });
    });

    it('deve retornar erro quando o ID é inválido', async () => {
      req.params = { id: '123' };
      const validationError = new Error('ID inválido');

      ProdutoIdSchema.parse.mockImplementation(() => { throw validationError; });

      await expect(produtoController.reativarProduto(req, res)).rejects.toThrow('ID inválido');
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

      await expect(produtoController.reativarProduto(req, res)).rejects.toMatchObject({
        statusCode: 404,
        errorType: 'resourceNotFound'
      });
    });
  });
});
