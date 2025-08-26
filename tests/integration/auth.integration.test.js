const { beforeAll, afterAll, beforeEach, describe, expect, it } = require('@jest/globals');
const request = require('supertest');
const IntegrationTestHelper = require('./helpers/IntegrationTestHelper.cjs');

describe('Auth Integration Tests', () => {
    let app;
    let helper;

    beforeAll(async () => {
        helper = new IntegrationTestHelper();
        await helper.setup();
        app = await helper.getApp();
    });

    afterAll(async () => {
        await helper.teardown();
    });

    beforeEach(async () => {
        // await helper.cleanDatabase(); // Removido temporariamente para evitar interferência
    });

    describe('POST /auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    matricula: 'ADM0001',
                    senha: 'admin123'
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Login realizado com sucesso');
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.usuario).toBeDefined();
            expect(response.body.usuario.matricula).toBe('ADM0001');
        });

        it('should fail with invalid matricula', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    matricula: 'INVALID001',
                    senha: 'admin123'
                });

            helper.expectErrorResponse(response, 401);
        });

        it('should fail with invalid password', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    matricula: 'ADM0001',
                    senha: 'senhaerrada'
                });

            helper.expectErrorResponse(response, 401);
        });

        it('should fail with missing credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({});

            helper.expectErrorResponse(response, 400);
        });

        it('should fail with inactive user', async () => {
            // Criar usuário inativo para teste
            const mongoose = require('mongoose');
            const Usuario = mongoose.model('Usuario');
            
            const usuarioInativo = await Usuario.create({
                nome_usuario: 'Usuario Inativo',
                email: 'inativo@teste.com',
                matricula: 'INATIVO001',
                senha: await require('bcrypt').hash('123456', 10),
                senha_definida: true,
                ativo: false,
                id_grupo: await helper.obterGrupoId()
            });

            const response = await request(app)
                .post('/auth/login')
                .send({
                    matricula: 'INATIVO001',
                    senha: '123456'
                });

            helper.expectErrorResponse(response, 401);
            
            // Limpeza
            await Usuario.findByIdAndDelete(usuarioInativo._id);
        });
    });

    describe('POST /auth/logout', () => {
        it('should logout successfully with valid token', async () => {
            const token = await helper.getAdminToken();

            const response = await request(app)
                .post('/auth/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Logout realizado com sucesso');
        });

        it('should fail without token', async () => {
            const response = await request(app)
                .post('/auth/logout');

            helper.expectErrorResponse(response, 401);
        });

        it('should fail with invalid token', async () => {
            const response = await request(app)
                .post('/auth/logout')
                .set('Authorization', 'Bearer invalid-token');

            helper.expectErrorResponse(response, 401);
        });
    });

    describe('POST /auth/refresh', () => {
        it('should fail with invalid refresh token', async () => {
            const response = await request(app)
                .post('/auth/refresh')
                .send({ refreshToken: 'invalid-refresh-token' });

            helper.expectErrorResponse(response, 401);
        });

        it('should fail without refresh token', async () => {
            const response = await request(app)
                .post('/auth/refresh')
                .send({});

            helper.expectErrorResponse(response, 400);
        });
    });

    describe('POST /auth/recuperar-senha', () => {
        it('should fail with missing email', async () => {
            const response = await request(app)
                .post('/auth/recuperar-senha')
                .send({});

            helper.expectErrorResponse(response, 400);
        });
    });
});
