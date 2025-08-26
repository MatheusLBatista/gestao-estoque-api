import { beforeAll, afterAll, beforeEach, describe, expect, it } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Usuario from '../../src/models/Usuario.js';
import bcrypt from 'bcrypt';

describe('Usuario Model', () => {
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
    await Usuario.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid user with required fields', async () => {
      const userData = {
        nome_usuario: 'João Silva',
        email: 'joao@teste.com',
        matricula: '123456',
        perfil: 'estoquista'
      };

      const usuario = new Usuario(userData);
      const savedUser = await usuario.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.nome_usuario).toBe(userData.nome_usuario);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.matricula).toBe(userData.matricula);
      expect(savedUser.perfil).toBe(userData.perfil);
      expect(savedUser.ativo).toBe(true);
      expect(savedUser.senha_definida).toBe(false);
      expect(savedUser.online).toBe(false);
    });

    it('should fail to create user without required fields', async () => {
      const usuario = new Usuario({
        nome_usuario: 'João Silva'
        // missing email and matricula
      });

      await expect(usuario.save()).rejects.toThrow();
    });

    it('should validate email uniqueness', async () => {
      const userData1 = {
        nome_usuario: 'João Silva',
        email: 'joao@teste.com',
        matricula: '123456'
      };

      const userData2 = {
        nome_usuario: 'Maria Silva',
        email: 'joao@teste.com', // same email
        matricula: '654321'
      };

      await new Usuario(userData1).save();
      
      // Garantir que os índices únicos estão configurados
      await Usuario.collection.createIndex({ email: 1 }, { unique: true });
      
      const usuario2 = new Usuario(userData2);

      await expect(usuario2.save()).rejects.toThrow();
    });

    it('should validate matricula uniqueness', async () => {
      const userData1 = {
        nome_usuario: 'João Silva',
        email: 'joao@teste.com',
        matricula: '123456'
      };

      const userData2 = {
        nome_usuario: 'Maria Silva',
        email: 'maria@teste.com',
        matricula: '123456' // same matricula
      };

      await new Usuario(userData1).save();
      
      // Garantir que os índices únicos estão configurados
      await Usuario.collection.createIndex({ matricula: 1 }, { unique: true });
      
      const usuario2 = new Usuario(userData2);

      await expect(usuario2.save()).rejects.toThrow();
    });

    it('should validate perfil enum values', async () => {
      const userData = {
        nome_usuario: 'João Silva',
        email: 'joao@teste.com',
        matricula: '123456',
        perfil: 'invalid_perfil'
      };

      const usuario = new Usuario(userData);
      await expect(usuario.save()).rejects.toThrow();
    });
  });

  describe('Password Methods', () => {
    it('should verify password correctly', async () => {
      const plainPassword = 'senha123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      const userData = {
        nome_usuario: 'João Silva',
        email: 'joao@teste.com',
        matricula: '123456',
        senha: hashedPassword
      };

      const usuario = new Usuario(userData);
      const savedUser = await usuario.save();

      const isValid = await savedUser.verificarSenha(plainPassword);
      const isInvalid = await savedUser.verificarSenha('senhaerrada');

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Permissions', () => {
    it('should convert rota to lowercase before saving', async () => {
      const userData = {
        nome_usuario: 'João Silva',
        email: 'joao@teste.com',
        matricula: '123456',
        permissoes: [{
          rota: 'PRODUTOS',
          dominio: 'localhost',
          buscar: true,
          enviar: true
        }]
      };

      const usuario = new Usuario(userData);
      const savedUser = await usuario.save();

      expect(savedUser.permissoes[0].rota).toBe('produtos');
    });

    it('should prevent duplicate rota+dominio combinations', async () => {
      const userData = {
        nome_usuario: 'João Silva',
        email: 'joao@teste.com',
        matricula: '123456',
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

      const usuario = new Usuario(userData);
      await expect(usuario.save()).rejects.toThrow(/Permissões duplicadas encontradas/);
    });

    it('should allow same rota with different dominio', async () => {
      const userData = {
        nome_usuario: 'João Silva',
        email: 'joao@teste.com',
        matricula: '123456',
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

      const usuario = new Usuario(userData);
      const savedUser = await usuario.save();

      expect(savedUser.permissoes).toHaveLength(2);
      expect(savedUser.permissoes[0].dominio).toBe('localhost');
      expect(savedUser.permissoes[1].dominio).toBe('production');
    });
  });

  describe('Timestamps', () => {
    it('should have custom timestamp field names', async () => {
      const userData = {
        nome_usuario: 'João Silva',
        email: 'joao@teste.com',
        matricula: '123456'
      };

      const usuario = new Usuario(userData);
      const savedUser = await usuario.save();

      expect(savedUser.data_cadastro).toBeDefined();
      expect(savedUser.data_ultima_atualizacao).toBeDefined();
      expect(savedUser.createdAt).toBeUndefined();
      expect(savedUser.updatedAt).toBeUndefined();
    });
  });
});
