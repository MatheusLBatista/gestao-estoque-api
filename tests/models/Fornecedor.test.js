import { beforeAll, afterAll, beforeEach, describe, expect, it } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Fornecedor from '../../src/models/Fornecedor.js';

describe('Fornecedor Model', () => {
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
    await Fornecedor.deleteMany({});
    // Ensure indexes are created
    await Fornecedor.ensureIndexes();
  });

  describe('Schema Validation', () => {
    it('should create a valid fornecedor with required fields', async () => {
      const fornecedorData = {
        nome_fornecedor: 'Fornecedor Teste LTDA',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 99999-9999',
        email: 'contato@fornecedor.com',
        endereco: [{
          logradouro: 'Rua das Flores, 123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-567'
        }]
      };

      const fornecedor = new Fornecedor(fornecedorData);
      const savedFornecedor = await fornecedor.save();

      expect(savedFornecedor._id).toBeDefined();
      expect(savedFornecedor.nome_fornecedor).toBe(fornecedorData.nome_fornecedor);
      expect(savedFornecedor.cnpj).toBe(fornecedorData.cnpj);
      expect(savedFornecedor.telefone).toBe(fornecedorData.telefone);
      expect(savedFornecedor.email).toBe(fornecedorData.email);
      expect(savedFornecedor.status).toBe(true); // default value
      expect(savedFornecedor.endereco).toHaveLength(1);
      expect(savedFornecedor.endereco[0].logradouro).toBe(fornecedorData.endereco[0].logradouro);
    });

    it('should fail to create fornecedor without required fields', async () => {
      const fornecedor = new Fornecedor({
        nome_fornecedor: 'Fornecedor Teste'
        // missing required fields
      });

      await expect(fornecedor.save()).rejects.toThrow();
    });

    it('should require all endereco fields when endereco is provided', async () => {
      const fornecedorData = {
        nome_fornecedor: 'Fornecedor Teste LTDA',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 99999-9999',
        email: 'contato@fornecedor.com',
        endereco: [{
          logradouro: 'Rua das Flores, 123',
          bairro: 'Centro',
          cidade: 'São Paulo'
          // missing estado and cep
        }]
      };

      const fornecedor = new Fornecedor(fornecedorData);
      await expect(fornecedor.save()).rejects.toThrow();
    });

    it('should set default status to true', async () => {
      const fornecedorData = {
        nome_fornecedor: 'Fornecedor Teste LTDA',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 99999-9999',
        email: 'contato@fornecedor.com',
        endereco: [{
          logradouro: 'Rua das Flores, 123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-567'
        }]
      };

      const fornecedor = new Fornecedor(fornecedorData);
      const savedFornecedor = await fornecedor.save();

      expect(savedFornecedor.status).toBe(true);
    });

    it('should allow setting custom status', async () => {
      const fornecedorData = {
        nome_fornecedor: 'Fornecedor Teste LTDA',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 99999-9999',
        email: 'contato@fornecedor.com',
        status: false,
        endereco: [{
          logradouro: 'Rua das Flores, 123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-567'
        }]
      };

      const fornecedor = new Fornecedor(fornecedorData);
      const savedFornecedor = await fornecedor.save();

      expect(savedFornecedor.status).toBe(false);
    });

    it('should allow multiple enderecos', async () => {
      const fornecedorData = {
        nome_fornecedor: 'Fornecedor Teste LTDA',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 99999-9999',
        email: 'contato@fornecedor.com',
        endereco: [
          {
            logradouro: 'Rua das Flores, 123',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01234-567'
          },
          {
            logradouro: 'Av. Paulista, 456',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01310-100'
          }
        ]
      };

      const fornecedor = new Fornecedor(fornecedorData);
      const savedFornecedor = await fornecedor.save();

      expect(savedFornecedor.endereco).toHaveLength(2);
      expect(savedFornecedor.endereco[0].logradouro).toBe('Rua das Flores, 123');
      expect(savedFornecedor.endereco[1].logradouro).toBe('Av. Paulista, 456');
    });

    it('should allow fornecedor without endereco', async () => {
      const fornecedorData = {
        nome_fornecedor: 'Fornecedor Teste LTDA',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 99999-9999',
        email: 'contato@fornecedor.com'
      };

      const fornecedor = new Fornecedor(fornecedorData);
      const savedFornecedor = await fornecedor.save();

      expect(savedFornecedor.endereco).toHaveLength(0);
    });
  });

  describe('Timestamps', () => {
    it('should have custom timestamp field names', async () => {
      const fornecedorData = {
        nome_fornecedor: 'Fornecedor Teste LTDA',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 99999-9999',
        email: 'contato@fornecedor.com'
      };

      const fornecedor = new Fornecedor(fornecedorData);
      const savedFornecedor = await fornecedor.save();

      expect(savedFornecedor.data_cadastro).toBeDefined();
      expect(savedFornecedor.data_ultima_atualizacao).toBeDefined();
      expect(savedFornecedor.createdAt).toBeUndefined();
      expect(savedFornecedor.updatedAt).toBeUndefined();
    });

    it('should update data_ultima_atualizacao when modified', async () => {
      const fornecedorData = {
        nome_fornecedor: 'Fornecedor Teste LTDA',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 99999-9999',
        email: 'contato@fornecedor.com'
      };

      const fornecedor = new Fornecedor(fornecedorData);
      const savedFornecedor = await fornecedor.save();
      const originalUpdateTime = savedFornecedor.data_ultima_atualizacao;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      savedFornecedor.telefone = '(11) 88888-8888';
      const updatedFornecedor = await savedFornecedor.save();

      expect(updatedFornecedor.data_ultima_atualizacao.getTime())
        .toBeGreaterThan(originalUpdateTime.getTime());
    });
  });

  describe('Indexes', () => {
    it('should have indexes on indexed fields', async () => {
      const indexes = await Fornecedor.collection.getIndexes();
      const indexNames = Object.keys(indexes);
      
      expect(indexNames).toContain('nome_fornecedor_1');
      expect(indexNames).toContain('cnpj_1');
    });
  });

  describe('Endereco Validation', () => {
    it('should validate all endereco required fields', async () => {
      const enderecoFields = ['logradouro', 'bairro', 'cidade', 'estado', 'cep'];
      
      for (const field of enderecoFields) {
        const endereco = {
          logradouro: 'Rua das Flores, 123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-567'
        };
        
        delete endereco[field]; // Remove one required field
        
        const fornecedorData = {
          nome_fornecedor: 'Fornecedor Teste LTDA',
          cnpj: '12.345.678/0001-90',
          telefone: '(11) 99999-9999',
          email: 'contato@fornecedor.com',
          endereco: [endereco]
        };

        const fornecedor = new Fornecedor(fornecedorData);
        await expect(fornecedor.save()).rejects.toThrow();
      }
    });
  });
});
