import mongoose from 'mongoose';
import Usuario from '../../models/Usuario';
import { MongoMemoryServer } from 'mongodb-memory-server';
import e from 'express';

let mongoServer;

// Configuração antes de todos os testes
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
        // Opções de conexão não são necessárias no Mongoose 6+
    });
});

// Limpeza após todos os testes
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Limpeza após cada teste para garantir isolamento
afterEach(async () => {
    jest.clearAllMocks();
    await Usuario.deleteMany({});
});

describe('Modelo de Usuário', () => {
    it('deve criar um usuário com dados válidos', async () => {
        const userData = {
            nome_usuario: 'Test User',
            matricula: '1234567',
            senha: 'password',
            email: 'testuser@example.com',
            perfil: 'administrador',
            ativo: true,
            accesstoken: 'access-token',
            refreshtoken: 'refresh-token',
        }

        const user = new Usuario(userData);
        await user.save();

        const savedUser = await Usuario.findById(user._id).select('-senha +accesstoken +refreshtoken');
        expect(savedUser.nome_usuario).toBe(userData.nome_usuario);
        expect(savedUser.matricula).toBe(userData.matricula);
        expect(savedUser.senha).toBeUndefined(); // Verifica se a senha não está presente
        expect(savedUser.email).toBe(userData.email);
        expect(savedUser.perfil).toBe(userData.perfil);
        expect(savedUser.ativo).toBe(userData.ativo);
        expect(savedUser.accesstoken).toBe(userData.accesstoken);
        expect(savedUser.refreshtoken).toBe(userData.refreshtoken);
    });

    it('deve falhar ao criar um usuário sem nome', async () => {
        const userData = {
            matricula: '1234567',
            senha: 'password',
            email: 'testuser@example.com',
            perfil: 'administrador',
            ativo: true,
            accesstoken: 'access-token',
            refreshtoken: 'refresh-token',
        };

        const user = new Usuario(userData);
        await expect(user.save()).rejects.toThrowErrorMatchingSnapshot();
    });

    it('deve falhar ao criar um usuário sem matrícula', async () => {
        const userData = {
            nome_usuario: 'Test User',
            senha: 'password',
            email: 'testuser@example.com',
            perfil: 'administrador',
            ativo: true,
            accesstoken: 'access-token',
            refreshtoken: 'refresh-token',
        };

        const user = new Usuario(userData);
        await expect(user.save()).rejects.toThrowErrorMatchingSnapshot();
    })
})