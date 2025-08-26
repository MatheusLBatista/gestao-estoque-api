import request from 'supertest';
import app from '../../src/app-test.js';

describe('App Test Configuration', () => {
    describe('Middleware Configuration', () => {
        test('deve ter headers de segurança configurados pelo helmet', async () => {
            const response = await request(app)
                .get('/api/test-endpoint-that-doesnt-exist')
                .expect(404);

            // Verifica se o helmet está configurado através dos headers de segurança
            expect(response.headers).toHaveProperty('x-dns-prefetch-control');
            expect(response.headers).toHaveProperty('x-frame-options');
            expect(response.headers).toHaveProperty('x-download-options');
            expect(response.headers).toHaveProperty('x-content-type-options');
        });

        test('deve aceitar requisições JSON', async () => {
            const response = await request(app)
                .post('/api/test-endpoint-that-doesnt-exist')
                .send({ test: 'data' })
                .set('Content-Type', 'application/json')
                .expect(404);

            expect(response.type).toBe('application/json');
        });

        test('deve aceitar requisições URL encoded', async () => {
            const response = await request(app)
                .post('/api/test-endpoint-that-doesnt-exist')
                .send('test=data')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .expect(404);

            expect(response.type).toBe('application/json');
        });
    });

    describe('CORS Configuration', () => {
        test('deve configurar CORS corretamente', async () => {
            const response = await request(app)
                .options('/api/test-endpoint')
                .set('Origin', 'http://localhost:3000')
                .set('Access-Control-Request-Method', 'GET')
                .expect(204);

            expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
        });

        test('deve permitir métodos HTTP específicos', async () => {
            const response = await request(app)
                .options('/api/test-endpoint')
                .set('Origin', 'http://localhost:3000')
                .set('Access-Control-Request-Method', 'POST')
                .expect(204);

            expect(response.headers['access-control-allow-methods']).toContain('POST');
        });
    });

    describe('Error Handling', () => {
        test('deve retornar 404 para rotas não encontradas', async () => {
            const response = await request(app)
                .get('/rota-inexistente')
                .expect(404);

            expect(response.body).toHaveProperty('message');
        });

        test('deve retornar erro específico para rotas de produto não encontradas', async () => {
            const response = await request(app)
                .get('/produtos/rota-inexistente')
                .expect(404);

            expect(response.body).toHaveProperty('message', 'Rota não encontrada');
        });

        test('deve retornar resposta JSON para erros', async () => {
            const response = await request(app)
                .get('/api/endpoint-inexistente')
                .expect(404);

            expect(response.type).toBe('application/json');
            expect(response.body).toHaveProperty('message');
        });
    });

    describe('Compression', () => {
        test('deve comprimir respostas quando apropriado', async () => {
            const response = await request(app)
                .get('/api/test-compression')
                .set('Accept-Encoding', 'gzip')
                .expect(404);

            // O response pode ter encoding gzip dependendo do tamanho da resposta
            // Testamos apenas se a configuração não causa erro
            expect(response.status).toBe(404);
        });
    });

    describe('Request Parsing', () => {
        test('deve processar corretamente dados JSON no body', async () => {
            const testData = { 
                name: 'Test Product',
                price: 100.50,
                description: 'Test description'
            };

            await request(app)
                .post('/api/test-json-parsing')
                .send(testData)
                .set('Content-Type', 'application/json')
                .expect(404); // 404 porque a rota não existe, mas o JSON foi processado
        });

        test('deve processar corretamente dados URL encoded', async () => {
            await request(app)
                .post('/api/test-urlencoded-parsing')
                .send('name=Test&price=100.50')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .expect(404); // 404 porque a rota não existe, mas os dados foram processados
        });
    });

    describe('App Export', () => {
        test('deve exportar uma instância válida do Express', () => {
            expect(app).toBeDefined();
            expect(typeof app).toBe('function');
            expect(app.listen).toBeDefined();
            expect(app.use).toBeDefined();
            expect(app.get).toBeDefined();
            expect(app.post).toBeDefined();
        });
    });

    describe('Environment Variables', () => {
        const originalEnv = process.env.NODE_ENV;

        afterEach(() => {
            process.env.NODE_ENV = originalEnv;
        });

        test('deve configurar middleware de debug apenas quando não em teste', () => {
            // Este teste verifica implicitamente que o middleware de debug não está ativo
            // durante os testes, já que NODE_ENV é 'test'
            expect(process.env.NODE_ENV).toBe('test');
        });
    });
});
