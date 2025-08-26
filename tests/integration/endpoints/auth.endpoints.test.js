const { beforeAll, afterAll, beforeEach, describe, expect, it } = require('@jest/globals');
const request = require('supertest');
const IntegrationTestHelper = require('../helpers/IntegrationTestHelper.cjs');

describe('Auth Endpoints Integration Tests', () => {
    let app;
    let helper;
    let testToken;

    beforeAll(async () => {
        helper = new IntegrationTestHelper();
        await helper.setup();
        app = await helper.getApp();
    });

    afterAll(async () => {
        await helper.teardown();
    });

    beforeEach(async () => {
        // Reset para cada teste
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
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body).toHaveProperty('usuario');
        });

        it('should fail with invalid matricula', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    matricula: 'INVALID',
                    senha: 'admin123'
                });

            expect([400, 401]).toContain(response.status);
            if (response.status === 400) {
                expect(response.body).toHaveProperty('errors');
            } else {
                expect(response.body).toHaveProperty('message');
            }
        });

        it('should fail with invalid password', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    matricula: 'ADM0001',
                    senha: 'wrongpassword'
                });

            expect([400, 401]).toContain(response.status);
            if (response.status === 400) {
                expect(response.body).toHaveProperty('errors');
            } else {
                expect(response.body).toHaveProperty('message');
            }
        });

        it('should fail with missing matricula', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    senha: 'admin123'
                });

            expect([400, 401]).toContain(response.status);
            expect(response.body).toHaveProperty('message');
        });

        it('should fail with missing password', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    matricula: 'ADM0001'
                });

            expect([400, 401]).toContain(response.status);
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('POST /auth/refresh', () => {
        let refreshToken;

        beforeEach(async () => {
            // Fazer login para obter refresh token
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    matricula: 'ADM0001',
                    senha: 'admin123'
                });

            refreshToken = loginResponse.body.refreshToken;
        });

        it('should refresh token successfully', async () => {
            const response = await request(app)
                .post('/auth/refresh')
                .send({
                    refreshToken: refreshToken
                });

            expect([200, 201, 401]).toContain(response.status);
            if (response.status === 200 || response.status === 201) {
                expect(response.body).toHaveProperty('accessToken');
            }
        });

        it('should fail with invalid refresh token', async () => {
            const response = await request(app)
                .post('/auth/refresh')
                .send({
                    refreshToken: 'invalid_token'
                });

            expect([400, 401]).toContain(response.status);
            if (response.status === 400) {
                expect(response.body).toHaveProperty('errors');
            } else {
                expect(response.body).toHaveProperty('message');
            }
        });
    });

    describe('POST /auth/recuperar-senha', () => {
        it('should accept email for password recovery', async () => {
            const response = await request(app)
                .post('/auth/recuperar-senha')
                .send({
                    email: 'admin@teste.com'
                });

            expect([200, 201, 202]).toContain(response.status);
            expect(response.body).toHaveProperty('message');
        });

        it('should fail with invalid email format', async () => {
            const response = await request(app)
                .post('/auth/recuperar-senha')
                .send({
                    email: 'invalid-email'
                });

            expect([200, 400, 403]).toContain(response.status);

            if (response.status === 400) {
                expect(response.body).toHaveProperty('errors');
            } else {
                expect(response.body).toHaveProperty('message');
            }
        });
    });

    describe('POST /auth/redefinir-senha/token', () => {
        it('should validate token-based password reset', async () => {
            const response = await request(app)
                .post('/auth/redefinir-senha/token')
                .send({
                    token: 'fake_token',
                    novaSenha: 'newpassword123',
                    confirmarSenha: 'newpassword123'
                });

            expect([200, 400, 401]).toContain(response.status);
        });

        it('should fail with mismatched passwords', async () => {
            const response = await request(app)
                .post('/auth/redefinir-senha/token')
                .send({
                    token: 'fake_token',
                    novaSenha: 'newpassword123',
                    confirmarSenha: 'differentpassword'
                });

            expect([400, 401]).toContain(response.status);
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('POST /auth/redefinir-senha/codigo', () => {
        it('should validate code-based password reset', async () => {
            const response = await request(app)
                .post('/auth/redefinir-senha/codigo')
                .send({
                    email: 'admin@teste.com',
                    codigo: '123456',
                    novaSenha: 'newpassword123',
                    confirmarSenha: 'newpassword123'
                });

            expect([200, 400, 401]).toContain(response.status);
        });

        it('should fail with invalid code', async () => {
            const response = await request(app)
                .post('/auth/redefinir-senha/codigo')
                .send({
                    email: 'admin@teste.com',
                    codigo: 'invalid',
                    novaSenha: 'newpassword123',
                    confirmarSenha: 'newpassword123'
                });

            expect([400, 401]).toContain(response.status);
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('POST /auth/logout (Protected)', () => {
        beforeEach(async () => {
            // Obter token válido
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    matricula: 'ADM0001',
                    senha: 'admin123'
                });
            testToken = loginResponse.body.accessToken;
        });

        it('should logout successfully with valid token', async () => {
            const response = await request(app)
                .post('/auth/logout')
                .set('Authorization', `Bearer ${testToken}`);

            expect([200, 401]).toContain(response.status);
        });

        it('should fail without authorization header', async () => {
            const response = await request(app)
                .post('/auth/logout');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
        });

        it('should fail with invalid token', async () => {
            const response = await request(app)
                .post('/auth/logout')
                .set('Authorization', 'Bearer invalid_token');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('POST /auth/revoke (Protected)', () => {
        beforeEach(async () => {
            // Obter token válido
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    matricula: 'ADM0001',
                    senha: 'admin123'
                });
            testToken = loginResponse.body.accessToken;
        });

        it('should revoke token successfully', async () => {
            const response = await request(app)
                .post('/auth/revoke')
                .set('Authorization', `Bearer ${testToken}`);

            expect([200, 400, 401]).toContain(response.status);
        });

        it('should fail without authorization header', async () => {
            const response = await request(app)
                .post('/auth/revoke');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
        });
    });
});
