import { beforeAll, afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import ProdutoService from '../../src/services/produtoService.js';
import ProdutoRepository from '../../src/repositories/produtoRepository.js';
import Produto from '../../src/models/Produto.js';
import Fornecedor from '../../src/models/Fornecedor.js';
import { CustomError } from '../../src/utils/helpers/index.js';

// Mock the console.log to avoid cluttering test output
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('ProdutoService', () => {
  let mongoServer;
  let produtoService;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
    
    produtoService = new ProdutoService();
  });

  describe('Constructor', () => {
    it('should initialize with ProdutoRepository', () => {
      expect(produtoService.repository).toBeInstanceOf(ProdutoRepository);
    });
  });

  describe('enriquecerComNomesFornecedores', () => {
    beforeEach(async () => {
      // Create test fornecedor
      const fornecedorData = {
        nome_fornecedor: 'Fornecedor Teste',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 99999-9999',
        email: 'teste@fornecedor.com'
      };
      await new Fornecedor(fornecedorData).save();
    });

    it('should enrich paginated product data with fornecedor names', async () => {
      const productData = {
        docs: [
          {
            _id: new mongoose.Types.ObjectId(),
            nome_produto: 'Produto Teste',
            id_fornecedor: 1,
            toObject: function() { return this; }
          }
        ],
        totalDocs: 1,
        page: 1
      };

      const result = await produtoService.enriquecerComNomesFornecedores(productData);

      expect(result.docs[0].nome_fornecedor).toBeDefined();
      expect(typeof result.docs[0].nome_fornecedor).toBe('string');
    });

    it('should enrich single product data with fornecedor names', async () => {
      const productData = {
        _id: new mongoose.Types.ObjectId(),
        nome_produto: 'Produto Teste',
        id_fornecedor: 1,
        toObject: function() { return this; }
      };

      const result = await produtoService.enriquecerComNomesFornecedores(productData);

      expect(result.nome_fornecedor).toBeDefined();
      expect(typeof result.nome_fornecedor).toBe('string');
    });

    it('should enrich array of products with fornecedor names', async () => {
      const productArray = [
        {
          _id: new mongoose.Types.ObjectId(),
          nome_produto: 'Produto Teste 1',
          id_fornecedor: 1,
          toObject: function() { return this; }
        },
        {
          _id: new mongoose.Types.ObjectId(),
          nome_produto: 'Produto Teste 2',
          id_fornecedor: 1,
          toObject: function() { return this; }
        }
      ];

      const result = await produtoService.enriquecerComNomesFornecedores(productArray);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].nome_fornecedor).toBeDefined();
      expect(result[1].nome_fornecedor).toBeDefined();
    });

    it('should return original data when no products found', async () => {
      const emptyData = { docs: [], totalDocs: 0 };

      const result = await produtoService.enriquecerComNomesFornecedores(emptyData);

      expect(result).toEqual(emptyData);
    });

    it('should handle products without toObject method', async () => {
      const productData = {
        docs: [
          {
            _id: new mongoose.Types.ObjectId(),
            nome_produto: 'Produto Teste',
            id_fornecedor: 1
            // no toObject method
          }
        ],
        totalDocs: 1
      };

      const result = await produtoService.enriquecerComNomesFornecedores(productData);

      expect(result.docs[0].nome_fornecedor).toBeDefined();
    });
  });

  describe('listarProdutos', () => {
    it('should list products with enriched fornecedor data', async () => {
      const mockProducts = {
        docs: [
          { _id: '1', nome_produto: 'Produto 1', id_fornecedor: 1 }
        ],
        totalDocs: 1
      };

      jest.spyOn(produtoService.repository, 'listarProdutos').mockResolvedValue(mockProducts);
      jest.spyOn(produtoService, 'enriquecerComNomesFornecedores').mockResolvedValue(mockProducts);

      const req = { query: {} };
      const result = await produtoService.listarProdutos(req);

      expect(produtoService.repository.listarProdutos).toHaveBeenCalledWith(req);
      expect(produtoService.enriquecerComNomesFornecedores).toHaveBeenCalledWith(mockProducts);
      expect(result).toEqual(mockProducts);
    });
  });

  describe('cadastrarProduto', () => {
    it('should create product with default values', async () => {
      const produtoData = {
        nome_produto: 'Produto Teste',
        preco: 100.00,
        custo: 80.00,
        categoria: 'Eletrônicos',
        estoque: 10,
        estoque_min: 2,
        id_fornecedor: 1,
        codigo_produto: 'PROD001'
      };

      const mockCreatedProduct = { _id: '1', ...produtoData };

      jest.spyOn(produtoService.repository, 'cadastrarProduto').mockResolvedValue(mockCreatedProduct);

      const result = await produtoService.cadastrarProduto(produtoData);

      expect(produtoData.data_ultima_entrada).toBeDefined();
      expect(produtoData.status).toBe(true);
      expect(produtoService.repository.cadastrarProduto).toHaveBeenCalledWith(produtoData);
      expect(result).toEqual(mockCreatedProduct);
    });

    it('should preserve existing data_ultima_entrada', async () => {
      const customDate = new Date('2023-01-01');
      const produtoData = {
        nome_produto: 'Produto Teste',
        preco: 100.00,
        custo: 80.00,
        categoria: 'Eletrônicos',
        estoque: 10,
        estoque_min: 2,
        id_fornecedor: 1,
        codigo_produto: 'PROD001',
        data_ultima_entrada: customDate
      };

      const mockCreatedProduct = { _id: '1', ...produtoData };

      jest.spyOn(produtoService.repository, 'cadastrarProduto').mockResolvedValue(mockCreatedProduct);

      await produtoService.cadastrarProduto(produtoData);

      expect(produtoData.data_ultima_entrada).toEqual(customDate);
    });

    it('should preserve custom status value', async () => {
      const produtoData = {
        nome_produto: 'Produto Teste',
        preco: 100.00,
        custo: 80.00,
        categoria: 'Eletrônicos',
        estoque: 10,
        estoque_min: 2,
        id_fornecedor: 1,
        codigo_produto: 'PROD001',
        status: false
      };

      const mockCreatedProduct = { _id: '1', ...produtoData };

      jest.spyOn(produtoService.repository, 'cadastrarProduto').mockResolvedValue(mockCreatedProduct);

      await produtoService.cadastrarProduto(produtoData);

      expect(produtoData.status).toBe(false);
    });

    it('should handle produto without preco for categoria calculation', async () => {
      const produtoData = {
        nome_produto: 'Produto Teste',
        custo: 80.00,
        categoria: 'Eletrônicos',
        estoque: 10,
        estoque_min: 2,
        id_fornecedor: 1,
        codigo_produto: 'PROD001'
      };

      const mockCreatedProduct = { _id: '1', ...produtoData };

      jest.spyOn(produtoService.repository, 'cadastrarProduto').mockResolvedValue(mockCreatedProduct);

      const result = await produtoService.cadastrarProduto(produtoData);

      expect(produtoService.repository.cadastrarProduto).toHaveBeenCalledWith(produtoData);
      expect(result).toEqual(mockCreatedProduct);
    });
  });

  describe('buscarProdutoPorID', () => {
    it('should find product by ID with enriched data', async () => {
      const validId = new mongoose.Types.ObjectId();
      const mockProduct = {
        _id: validId,
        nome_produto: 'Produto Teste',
        id_fornecedor: 1
      };

      jest.spyOn(produtoService.repository, 'buscarProdutoPorID').mockResolvedValue(mockProduct);
      jest.spyOn(produtoService, 'enriquecerComNomesFornecedores').mockResolvedValue(mockProduct);

      const result = await produtoService.buscarProdutoPorID(validId.toString());

      expect(produtoService.repository.buscarProdutoPorID).toHaveBeenCalledWith(validId.toString());
      expect(produtoService.enriquecerComNomesFornecedores).toHaveBeenCalledWith(mockProduct);
      expect(result).toEqual(mockProduct);
    });

    it('should throw error for invalid ObjectId', async () => {
      await expect(
        produtoService.buscarProdutoPorID('invalid-id')
      ).rejects.toThrow(CustomError);
    });
  });

  describe('buscarProdutosPorNome', () => {
    it('should search products by name with enriched data', async () => {
      const mockProducts = {
        docs: [{ nome_produto: 'Notebook Dell', id_fornecedor: 1 }],
        totalDocs: 1
      };

      jest.spyOn(produtoService.repository, 'listarProdutos').mockResolvedValue(mockProducts);
      jest.spyOn(produtoService, 'enriquecerComNomesFornecedores').mockResolvedValue(mockProducts);

      const result = await produtoService.buscarProdutosPorNome('Notebook', 1, 10);

      expect(produtoService.repository.listarProdutos).toHaveBeenCalledWith({
        params: {},
        query: {
          nome_produto: 'Notebook',
          page: 1,
          limite: 10
        }
      });
      expect(result).toEqual(mockProducts);
    });

    it('should throw error if nome is empty', async () => {
      await expect(
        produtoService.buscarProdutosPorNome('')
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if nome is null', async () => {
      await expect(
        produtoService.buscarProdutosPorNome(null)
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if nome is only whitespace', async () => {
      await expect(
        produtoService.buscarProdutosPorNome('   ')
      ).rejects.toThrow(CustomError);
    });
  });

  describe('buscarProdutosPorCategoria', () => {
    it('should search products by categoria with enriched data', async () => {
      const mockProducts = {
        docs: [{ categoria: 'Eletrônicos', id_fornecedor: 1 }],
        totalDocs: 1
      };

      jest.spyOn(produtoService.repository, 'listarProdutos').mockResolvedValue(mockProducts);
      jest.spyOn(produtoService, 'enriquecerComNomesFornecedores').mockResolvedValue(mockProducts);

      const result = await produtoService.buscarProdutosPorCategoria('Eletrônicos', 1, 10);

      expect(produtoService.repository.listarProdutos).toHaveBeenCalledWith({
        params: {},
        query: {
          categoria: 'Eletrônicos',
          page: 1,
          limite: 10
        }
      });
      expect(result).toEqual(mockProducts);
    });

    it('should throw error if categoria is empty', async () => {
      await expect(
        produtoService.buscarProdutosPorCategoria('')
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if categoria is null', async () => {
      await expect(
        produtoService.buscarProdutosPorCategoria(null)
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if categoria is only whitespace', async () => {
      await expect(
        produtoService.buscarProdutosPorCategoria('   ')
      ).rejects.toThrow(CustomError);
    });
  });

  describe('atualizarProduto', () => {
    it('should update product successfully', async () => {
      const validId = new mongoose.Types.ObjectId();
      const updateData = { preco: 150.00 };
      const mockUpdatedProduct = {
        _id: validId,
        nome_produto: 'Produto Teste',
        preco: 150.00,
        categoria: 'Media'
      };

      jest.spyOn(produtoService.repository, 'atualizarProduto').mockResolvedValue(mockUpdatedProduct);

      const result = await produtoService.atualizarProduto(validId.toString(), updateData);

      expect(updateData.categoria).toBeDefined(); // Category should be recalculated
      expect(produtoService.repository.atualizarProduto).toHaveBeenCalledWith(validId.toString(), updateData);
      expect(result).toEqual(mockUpdatedProduct);
    });

    it('should throw error for invalid ObjectId', async () => {
      await expect(
        produtoService.atualizarProduto('invalid-id', { preco: 100 })
      ).rejects.toThrow(CustomError);
    });

    it('should not recalculate category if preco is not provided', async () => {
      const validId = new mongoose.Types.ObjectId();
      const updateData = { estoque: 20 };
      const mockUpdatedProduct = {
        _id: validId,
        nome_produto: 'Produto Teste',
        estoque: 20
      };

      jest.spyOn(produtoService.repository, 'atualizarProduto').mockResolvedValue(mockUpdatedProduct);

      const result = await produtoService.atualizarProduto(validId.toString(), updateData);

      expect(updateData.categoria).toBeUndefined();
      expect(result).toEqual(mockUpdatedProduct);
    });
  });

  describe('deletarProduto', () => {
    it('should delete product successfully', async () => {
      const validId = new mongoose.Types.ObjectId();
      const mockDeletedProduct = {
        _id: validId,
        nome_produto: 'Produto Deletado'
      };

      jest.spyOn(produtoService.repository, 'deletarProduto').mockResolvedValue(mockDeletedProduct);

      const result = await produtoService.deletarProduto(validId.toString());

      expect(produtoService.repository.deletarProduto).toHaveBeenCalledWith(validId.toString());
      expect(result).toEqual(mockDeletedProduct);
    });

    it('should throw error for invalid ObjectId', async () => {
      await expect(
        produtoService.deletarProduto('invalid-id')
      ).rejects.toThrow(CustomError);
    });
  });

  // Add missing method tests
  describe('buscarProdutosPorCodigo', () => {
    it('should search products by codigo with enriched data', async () => {
      const mockProducts = {
        docs: [{ codigo_produto: 'PROD001', id_fornecedor: 1 }],
        totalDocs: 1
      };

      jest.spyOn(produtoService.repository, 'listarProdutos').mockResolvedValue(mockProducts);
      jest.spyOn(produtoService, 'enriquecerComNomesFornecedores').mockResolvedValue(mockProducts);

      const result = await produtoService.buscarProdutosPorCodigo('PROD001', 1, 10);

      expect(produtoService.repository.listarProdutos).toHaveBeenCalledWith({
        params: {},
        query: {
          codigo_produto: 'PROD001',
          page: 1,
          limite: 10
        }
      });
      expect(result).toEqual(mockProducts);
    });

    it('should throw error if codigo is empty', async () => {
      await expect(
        produtoService.buscarProdutosPorCodigo('')
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if codigo is null', async () => {
      await expect(
        produtoService.buscarProdutosPorCodigo(null)
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if codigo is only whitespace', async () => {
      await expect(
        produtoService.buscarProdutosPorCodigo('   ')
      ).rejects.toThrow(CustomError);
    });
  });

  describe('buscarProdutosPorFornecedor', () => {
    it('should search products by fornecedor ID with enriched data', async () => {
      const mockProducts = {
        docs: [{ id_fornecedor: 123, nome_produto: 'Produto Teste' }],
        totalDocs: 1
      };

      jest.spyOn(produtoService.repository, 'listarProdutos').mockResolvedValue(mockProducts);
      jest.spyOn(produtoService, 'enriquecerComNomesFornecedores').mockResolvedValue(mockProducts);

      const result = await produtoService.buscarProdutosPorFornecedor(123, 1, 10, false);

      expect(produtoService.repository.listarProdutos).toHaveBeenCalledWith({
        params: {},
        query: {
          id_fornecedor: 123,
          page: 1,
          limite: 10
        }
      });
      expect(result).toEqual(mockProducts);
    });

    it('should search products by fornecedor name with enriched data', async () => {
      const mockProducts = {
        docs: [{ nome_fornecedor: 'Fornecedor Teste', nome_produto: 'Produto Teste' }],
        totalDocs: 1
      };

      jest.spyOn(produtoService.repository, 'listarProdutos').mockResolvedValue(mockProducts);
      jest.spyOn(produtoService, 'enriquecerComNomesFornecedores').mockResolvedValue(mockProducts);

      const result = await produtoService.buscarProdutosPorFornecedor('Fornecedor Teste', 1, 10, true);

      expect(produtoService.repository.listarProdutos).toHaveBeenCalledWith({
        params: {},
        query: {
          nome_fornecedor: 'Fornecedor Teste',
          page: 1,
          limite: 10
        }
      });
      expect(result).toEqual(mockProducts);
    });

    it('should throw error if fornecedor ID is empty', async () => {
      await expect(
        produtoService.buscarProdutosPorFornecedor('', 1, 10, false)
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if fornecedor name is empty', async () => {
      await expect(
        produtoService.buscarProdutosPorFornecedor('', 1, 10, true)
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if fornecedor is null', async () => {
      await expect(
        produtoService.buscarProdutosPorFornecedor(null, 1, 10, false)
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if fornecedor is only whitespace', async () => {
      await expect(
        produtoService.buscarProdutosPorFornecedor('   ', 1, 10, true)
      ).rejects.toThrow(CustomError);
    });
  });

  describe('listarEstoqueBaixo', () => {
    it('should list products with low stock and enriched data', async () => {
      const mockProducts = [
        { nome_produto: 'Produto 1', estoque: 2, estoque_min: 5, id_fornecedor: 1 },
        { nome_produto: 'Produto 2', estoque: 1, estoque_min: 3, id_fornecedor: 2 }
      ];

      jest.spyOn(produtoService.repository, 'listarEstoqueBaixo').mockResolvedValue(mockProducts);
      jest.spyOn(produtoService, 'enriquecerComNomesFornecedores').mockResolvedValue(mockProducts);

      const result = await produtoService.listarEstoqueBaixo();

      expect(produtoService.repository.listarEstoqueBaixo).toHaveBeenCalled();
      expect(produtoService.enriquecerComNomesFornecedores).toHaveBeenCalledWith(mockProducts);
      expect(result).toEqual(mockProducts);
    });
  });

  describe('desativarProduto', () => {
    it('should deactivate product successfully', async () => {
      const validId = new mongoose.Types.ObjectId();
      const mockDeactivatedProduct = {
        _id: validId,
        nome_produto: 'Produto Teste',
        status: false
      };

      jest.spyOn(produtoService.repository, 'desativarProduto').mockResolvedValue(mockDeactivatedProduct);

      const result = await produtoService.desativarProduto(validId.toString());

      expect(produtoService.repository.desativarProduto).toHaveBeenCalledWith(validId.toString());
      expect(result).toEqual(mockDeactivatedProduct);
    });

    it('should throw error for invalid ObjectId', async () => {
      await expect(
        produtoService.desativarProduto('invalid-id')
      ).rejects.toThrow(CustomError);
    });
  });

  describe('reativarProduto', () => {
    it('should reactivate product successfully', async () => {
      const validId = new mongoose.Types.ObjectId();
      const mockReactivatedProduct = {
        _id: validId,
        nome_produto: 'Produto Teste',
        status: true
      };

      jest.spyOn(produtoService.repository, 'reativarProduto').mockResolvedValue(mockReactivatedProduct);

      const result = await produtoService.reativarProduto(validId.toString());

      expect(produtoService.repository.reativarProduto).toHaveBeenCalledWith(validId.toString());
      expect(result).toEqual(mockReactivatedProduct);
    });

    it('should throw error for invalid ObjectId', async () => {
      await expect(
        produtoService.reativarProduto('invalid-id')
      ).rejects.toThrow(CustomError);
    });
  });
});
