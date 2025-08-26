import { beforeAll, afterAll, beforeEach, describe, expect, it } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Grupo from '../../src/models/Grupo.js';

describe('Grupo Model', () => {
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
    await Grupo.deleteMany({});
    // Ensure indexes are created
    await Grupo.ensureIndexes();
  });

  describe('Schema Validation', () => {
    it('should create a valid grupo with required fields', async () => {
      const grupoData = {
        nome: 'Administradores',
        descricao: 'Grupo com permissões administrativas'
      };

      const grupo = new Grupo(grupoData);
      const savedGrupo = await grupo.save();

      expect(savedGrupo._id).toBeDefined();
      expect(savedGrupo.nome).toBe(grupoData.nome);
      expect(savedGrupo.descricao).toBe(grupoData.descricao);
      expect(savedGrupo.ativo).toBe(true); // default value
      expect(savedGrupo.permissoes).toHaveLength(0);
    });

    it('should fail to create grupo without required fields', async () => {
      const grupo = new Grupo({
        nome: 'Administradores'
        // missing descricao
      });

      await expect(grupo.save()).rejects.toThrow();
    });

    it('should validate nome uniqueness', async () => {
      const grupoData1 = {
        nome: 'Administradores',
        descricao: 'Grupo administrativo'
      };

      const grupoData2 = {
        nome: 'Administradores', // same name
        descricao: 'Outro grupo administrativo'
      };

      await new Grupo(grupoData1).save();
      const grupo2 = new Grupo(grupoData2);

      await expect(grupo2.save()).rejects.toThrow();
    });

    it('should trim nome field', async () => {
      const grupoData = {
        nome: '  Administradores  ',
        descricao: 'Grupo administrativo'
      };

      const grupo = new Grupo(grupoData);
      const savedGrupo = await grupo.save();

      expect(savedGrupo.nome).toBe('Administradores');
    });

    it('should set default ativo to true', async () => {
      const grupoData = {
        nome: 'Administradores',
        descricao: 'Grupo administrativo'
      };

      const grupo = new Grupo(grupoData);
      const savedGrupo = await grupo.save();

      expect(savedGrupo.ativo).toBe(true);
    });

    it('should allow setting custom ativo value', async () => {
      const grupoData = {
        nome: 'Administradores',
        descricao: 'Grupo administrativo',
        ativo: false
      };

      const grupo = new Grupo(grupoData);
      const savedGrupo = await grupo.save();

      expect(savedGrupo.ativo).toBe(false);
    });
  });

  describe('Permissions', () => {
    it('should convert rota to lowercase before saving', async () => {
      const grupoData = {
        nome: 'Administradores',
        descricao: 'Grupo administrativo',
        permissoes: [{
          rota: 'PRODUTOS',
          dominio: 'localhost',
          buscar: true,
          enviar: true
        }]
      };

      const grupo = new Grupo(grupoData);
      const savedGrupo = await grupo.save();

      expect(savedGrupo.permissoes[0].rota).toBe('produtos');
    });

    it('should prevent duplicate rota+dominio combinations', async () => {
      const grupoData = {
        nome: 'Administradores',
        descricao: 'Grupo administrativo',
        permissoes: [
          {
            rota: 'produtos',
            dominio: 'localhost',
            buscar: true
          },
          {
            rota: 'produtos',
            dominio: 'localhost', // duplicate combination
            enviar: true
          }
        ]
      };

      const grupo = new Grupo(grupoData);
      await expect(grupo.save()).rejects.toThrow(/Permissões duplicadas encontradas/);
    });

    it('should allow same rota with different dominio', async () => {
      const grupoData = {
        nome: 'Administradores',
        descricao: 'Grupo administrativo',
        permissoes: [
          {
            rota: 'produtos',
            dominio: 'localhost',
            buscar: true
          },
          {
            rota: 'produtos',
            dominio: 'production', // different domain
            enviar: true
          }
        ]
      };

      const grupo = new Grupo(grupoData);
      const savedGrupo = await grupo.save();

      expect(savedGrupo.permissoes).toHaveLength(2);
      expect(savedGrupo.permissoes[0].dominio).toBe('localhost');
      expect(savedGrupo.permissoes[1].dominio).toBe('production');
    });

    it('should set default values for permission fields', async () => {
      const grupoData = {
        nome: 'Administradores',
        descricao: 'Grupo administrativo',
        permissoes: [{
          rota: 'produtos'
        }]
      };

      const grupo = new Grupo(grupoData);
      const savedGrupo = await grupo.save();

      const permissao = savedGrupo.permissoes[0];
      expect(permissao.dominio).toBe('localhost');
      expect(permissao.ativo).toBe(true);
      expect(permissao.buscar).toBe(false);
      expect(permissao.enviar).toBe(false);
      expect(permissao.substituir).toBe(false);
      expect(permissao.modificar).toBe(false);
      expect(permissao.excluir).toBe(false);
    });

    it('should allow setting custom permission values', async () => {
      const grupoData = {
        nome: 'Administradores',
        descricao: 'Grupo administrativo',
        permissoes: [{
          rota: 'produtos',
          dominio: 'api.teste.com',
          ativo: false,
          buscar: true,
          enviar: true,
          substituir: true,
          modificar: true,
          excluir: true
        }]
      };

      const grupo = new Grupo(grupoData);
      const savedGrupo = await grupo.save();

      const permissao = savedGrupo.permissoes[0];
      expect(permissao.dominio).toBe('api.teste.com');
      expect(permissao.ativo).toBe(false);
      expect(permissao.buscar).toBe(true);
      expect(permissao.enviar).toBe(true);
      expect(permissao.substituir).toBe(true);
      expect(permissao.modificar).toBe(true);
      expect(permissao.excluir).toBe(true);
    });

    it('should trim rota field', async () => {
      const grupoData = {
        nome: 'Administradores',
        descricao: 'Grupo administrativo',
        permissoes: [{
          rota: '  produtos  ',
          buscar: true
        }]
      };

      const grupo = new Grupo(grupoData);
      const savedGrupo = await grupo.save();

      expect(savedGrupo.permissoes[0].rota).toBe('produtos');
    });

    it('should require rota field in permissions', async () => {
      const grupoData = {
        nome: 'Administradores',
        descricao: 'Grupo administrativo',
        permissoes: [{
          buscar: true
          // missing rota
        }]
      };

      const grupo = new Grupo(grupoData);
      await expect(grupo.save()).rejects.toThrow();
    });

    it('should allow multiple permissions with different rotas', async () => {
      const grupoData = {
        nome: 'Administradores',
        descricao: 'Grupo administrativo',
        permissoes: [
          {
            rota: 'produtos',
            buscar: true,
            enviar: true
          },
          {
            rota: 'usuarios',
            buscar: true,
            modificar: true
          },
          {
            rota: 'fornecedores',
            buscar: true,
            excluir: true
          }
        ]
      };

      const grupo = new Grupo(grupoData);
      const savedGrupo = await grupo.save();

      expect(savedGrupo.permissoes).toHaveLength(3);
      expect(savedGrupo.permissoes[0].rota).toBe('produtos');
      expect(savedGrupo.permissoes[1].rota).toBe('usuarios');
      expect(savedGrupo.permissoes[2].rota).toBe('fornecedores');
    });
  });

  describe('Timestamps', () => {
    it('should have custom timestamp field names', async () => {
      const grupoData = {
        nome: 'Administradores',
        descricao: 'Grupo administrativo'
      };

      const grupo = new Grupo(grupoData);
      const savedGrupo = await grupo.save();

      expect(savedGrupo.data_criacao).toBeDefined();
      expect(savedGrupo.data_atualizacao).toBeDefined();
      expect(savedGrupo.createdAt).toBeUndefined();
      expect(savedGrupo.updatedAt).toBeUndefined();
    });

    it('should update data_atualizacao when modified', async () => {
      const grupoData = {
        nome: 'Administradores',
        descricao: 'Grupo administrativo'
      };

      const grupo = new Grupo(grupoData);
      const savedGrupo = await grupo.save();
      const originalUpdateTime = savedGrupo.data_atualizacao;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      savedGrupo.descricao = 'Descrição atualizada';
      const updatedGrupo = await savedGrupo.save();

      expect(updatedGrupo.data_atualizacao.getTime())
        .toBeGreaterThan(originalUpdateTime.getTime());
    });
  });

  describe('Indexes', () => {
    it('should have indexes on indexed fields', async () => {
      const indexes = await Grupo.collection.getIndexes();
      const indexNames = Object.keys(indexes);
      
      expect(indexNames).toContain('nome_1');
    });
  });
});
