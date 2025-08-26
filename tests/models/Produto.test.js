import { beforeAll, afterAll, beforeEach, describe, expect, it } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Produto from '../../src/models/Produto.js';

describe('Produto Model', () => {
  let mongoServer;

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
    await Produto.deleteMany({});
    // Ensure indexes are created
    await Produto.ensureIndexes();
  });

  describe('Schema Validation', () => {
    it('should create a valid product with required fields', async () => {
      const produtoData = {
        nome_produto: 'Notebook Dell',
        descricao: 'Notebook Dell Inspiron 15',
        preco: 2500.00,
        marca: 'Dell',
        custo: 2000.00,
        categoria: 'Eletrônicos',
        estoque: 10,
        estoque_min: 2,
        id_fornecedor: 1,
        codigo_produto: 'DELL001'
      };

      const produto = new Produto(produtoData);
      const savedProduct = await produto.save();

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.nome_produto).toBe(produtoData.nome_produto);
      expect(savedProduct.descricao).toBe(produtoData.descricao);
      expect(savedProduct.preco).toBe(produtoData.preco);
      expect(savedProduct.marca).toBe(produtoData.marca);
      expect(savedProduct.custo).toBe(produtoData.custo);
      expect(savedProduct.categoria).toBe(produtoData.categoria);
      expect(savedProduct.estoque).toBe(produtoData.estoque);
      expect(savedProduct.estoque_min).toBe(produtoData.estoque_min);
      expect(savedProduct.id_fornecedor).toBe(produtoData.id_fornecedor);
      expect(savedProduct.codigo_produto).toBe(produtoData.codigo_produto);
      expect(savedProduct.status).toBe(true); // default value
    });

    it('should fail to create product without required fields', async () => {
      const produto = new Produto({
        nome_produto: 'Notebook Dell'
        // missing required fields
      });

      await expect(produto.save()).rejects.toThrow();
    });

    it('should validate nome_produto uniqueness', async () => {
      const produtoData1 = {
        nome_produto: 'Notebook Dell',
        preco: 2500.00,
        custo: 2000.00,
        categoria: 'Eletrônicos',
        estoque: 10,
        estoque_min: 2,
        id_fornecedor: 1,
        codigo_produto: 'DELL001'
      };

      const produtoData2 = {
        nome_produto: 'Notebook Dell', // same name
        preco: 3000.00,
        custo: 2500.00,
        categoria: 'Eletrônicos',
        estoque: 5,
        estoque_min: 1,
        id_fornecedor: 2,
        codigo_produto: 'DELL002'
      };

      await new Produto(produtoData1).save();
      const produto2 = new Produto(produtoData2);

      await expect(produto2.save()).rejects.toThrow();
    });

    it('should validate codigo_produto uniqueness', async () => {
      const produtoData1 = {
        nome_produto: 'Notebook Dell',
        preco: 2500.00,
        custo: 2000.00,
        categoria: 'Eletrônicos',
        estoque: 10,
        estoque_min: 2,
        id_fornecedor: 1,
        codigo_produto: 'DELL001'
      };

      const produtoData2 = {
        nome_produto: 'Notebook HP',
        preco: 3000.00,
        custo: 2500.00,
        categoria: 'Eletrônicos',
        estoque: 5,
        estoque_min: 1,
        id_fornecedor: 2,
        codigo_produto: 'DELL001' // same code
      };

      await new Produto(produtoData1).save();
      const produto2 = new Produto(produtoData2);

      await expect(produto2.save()).rejects.toThrow();
    });

    it('should require numeric fields to be numbers', async () => {
      const produtoData = {
        nome_produto: 'Notebook Dell',
        preco: 'invalid_number',
        custo: 2000.00,
        categoria: 'Eletrônicos',
        estoque: 10,
        estoque_min: 2,
        id_fornecedor: 1,
        codigo_produto: 'DELL001'
      };

      const produto = new Produto(produtoData);
      await expect(produto.save()).rejects.toThrow();
    });

    it('should set default status to true', async () => {
      const produtoData = {
        nome_produto: 'Notebook Dell',
        preco: 2500.00,
        custo: 2000.00,
        categoria: 'Eletrônicos',
        estoque: 10,
        estoque_min: 2,
        id_fornecedor: 1,
        codigo_produto: 'DELL001'
      };

      const produto = new Produto(produtoData);
      const savedProduct = await produto.save();

      expect(savedProduct.status).toBe(true);
    });

    it('should allow setting custom status', async () => {
      const produtoData = {
        nome_produto: 'Notebook Dell',
        preco: 2500.00,
        custo: 2000.00,
        categoria: 'Eletrônicos',
        estoque: 10,
        estoque_min: 2,
        id_fornecedor: 1,
        codigo_produto: 'DELL001',
        status: false
      };

      const produto = new Produto(produtoData);
      const savedProduct = await produto.save();

      expect(savedProduct.status).toBe(false);
    });

    it('should allow optional fields to be undefined', async () => {
      const produtoData = {
        nome_produto: 'Notebook Dell',
        preco: 2500.00,
        custo: 2000.00,
        categoria: 'Eletrônicos',
        estoque: 10,
        estoque_min: 2,
        id_fornecedor: 1,
        codigo_produto: 'DELL001'
        // descricao, marca, data_ultima_entrada are optional
      };

      const produto = new Produto(produtoData);
      const savedProduct = await produto.save();

      expect(savedProduct.descricao).toBeUndefined();
      expect(savedProduct.marca).toBeUndefined();
      expect(savedProduct.data_ultima_entrada).toBeUndefined();
    });

    it('should set data_ultima_entrada when provided', async () => {
      const dataEntrada = new Date();
      const produtoData = {
        nome_produto: 'Notebook Dell',
        preco: 2500.00,
        custo: 2000.00,
        categoria: 'Eletrônicos',
        estoque: 10,
        estoque_min: 2,
        id_fornecedor: 1,
        codigo_produto: 'DELL001',
        data_ultima_entrada: dataEntrada
      };

      const produto = new Produto(produtoData);
      const savedProduct = await produto.save();

      expect(savedProduct.data_ultima_entrada).toEqual(dataEntrada);
    });
  });

  describe('Timestamps', () => {
    it('should have custom timestamp field names', async () => {
      const produtoData = {
        nome_produto: 'Notebook Dell',
        preco: 2500.00,
        custo: 2000.00,
        categoria: 'Eletrônicos',
        estoque: 10,
        estoque_min: 2,
        id_fornecedor: 1,
        codigo_produto: 'DELL001'
      };

      const produto = new Produto(produtoData);
      const savedProduct = await produto.save();

      expect(savedProduct.data_cadastro).toBeDefined();
      expect(savedProduct.data_ultima_atualizacao).toBeDefined();
      expect(savedProduct.createdAt).toBeUndefined();
      expect(savedProduct.updatedAt).toBeUndefined();
    });

    it('should update data_ultima_atualizacao when modified', async () => {
      const produtoData = {
        nome_produto: 'Notebook Dell',
        preco: 2500.00,
        custo: 2000.00,
        categoria: 'Eletrônicos',
        estoque: 10,
        estoque_min: 2,
        id_fornecedor: 1,
        codigo_produto: 'DELL001'
      };

      const produto = new Produto(produtoData);
      const savedProduct = await produto.save();
      const originalUpdateTime = savedProduct.data_ultima_atualizacao;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      savedProduct.preco = 2600.00;
      const updatedProduct = await savedProduct.save();

      expect(updatedProduct.data_ultima_atualizacao.getTime())
        .toBeGreaterThan(originalUpdateTime.getTime());
    });
  });

  describe('Indexes', () => {
    it('should have indexes on indexed fields', async () => {
      const indexes = await Produto.collection.getIndexes();
      const indexNames = Object.keys(indexes);
      
      expect(indexNames).toContain('nome_produto_1');
      expect(indexNames).toContain('marca_1');
      expect(indexNames).toContain('categoria_1');
      expect(indexNames).toContain('estoque_1');
      expect(indexNames).toContain('id_fornecedor_1');
      expect(indexNames).toContain('codigo_produto_1');
    });
  });
});
