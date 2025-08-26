// tests/integration/comprehensive.integration.test.js

// import IntegrationTestHelper from './IntegrationTestHelper.cjs';

describe.skip('Comprehensive Integration Tests', () => {
    let helper;
    let userToken;
    let testUser;

    beforeAll(async () => {
        helper = new IntegrationTestHelper();
        await helper.beforeAll();
        
        // Create test user and get token
        const authResponse = await helper.authenticateTestUser();
        userToken = authResponse.access_token;
        testUser = authResponse.user;
    });

    afterAll(async () => {
        await helper.afterAll();
    });

    beforeEach(async () => {
        await helper.beforeEach();
    });

    describe('Workflow: Complete Product Management', () => {
        let grupoId;
        let fornecedorId;
        let produtoId;

        it('should create a complete workflow: grupo -> fornecedor -> produto -> movimentacao', async () => {
            // 1. Create Grupo
            const grupoResponse = await helper.request()
                .post('/api/grupos')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    nome: 'Grupo Workflow Test',
                    descricao: 'Grupo para teste de workflow'
                });
            
            expect(grupoResponse.status).toBe(201);
            grupoId = grupoResponse.body.data.id;

            // 2. Create Fornecedor
            const fornecedorResponse = await helper.request()
                .post('/api/fornecedores')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    nome: 'Fornecedor Workflow Test',
                    cnpj: '12345678000199',
                    email: 'fornecedor@workflow.com',
                    telefone: '11999999999'
                });
            
            expect(fornecedorResponse.status).toBe(201);
            fornecedorId = fornecedorResponse.body.data.id;

            // 3. Create Produto
            const produtoResponse = await helper.request()
                .post('/api/produtos')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    nome: 'Produto Workflow Test',
                    descricao: 'Produto para teste de workflow',
                    preco: 29.99,
                    quantidade_estoque: 100,
                    grupo_id: grupoId,
                    fornecedor_id: fornecedorId
                });
            
            expect(produtoResponse.status).toBe(201);
            produtoId = produtoResponse.body.data.id;

            // 4. Create Movimentacao
            const movimentacaoResponse = await helper.request()
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    produto_id: produtoId,
                    tipo_movimentacao: 'entrada',
                    quantidade: 50,
                    observacoes: 'Movimentação do workflow test'
                });
            
            expect(movimentacaoResponse.status).toBe(201);
            expect(movimentacaoResponse.body.data.produto_id).toBe(produtoId);
        });

        it('should handle produto stock after movimentacao', async () => {
            const produtoResponse = await helper.request()
                .get(`/api/produtos/${produtoId}`)
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(produtoResponse.status).toBe(200);
            expect(produtoResponse.body.data.quantidade_estoque).toBe(150); // 100 + 50
        });

        it('should list all entities created in workflow', async () => {
            // List Grupos
            const gruposResponse = await helper.request()
                .get('/api/grupos')
                .set('Authorization', `Bearer ${userToken}`);
            expect(gruposResponse.status).toBe(200);
            
            // List Fornecedores
            const fornecedoresResponse = await helper.request()
                .get('/api/fornecedores')
                .set('Authorization', `Bearer ${userToken}`);
            expect(fornecedoresResponse.status).toBe(200);
            
            // List Produtos
            const produtosResponse = await helper.request()
                .get('/api/produtos')
                .set('Authorization', `Bearer ${userToken}`);
            expect(produtosResponse.status).toBe(200);
            
            // List Movimentacoes
            const movimentacoesResponse = await helper.request()
                .get('/api/movimentacoes')
                .set('Authorization', `Bearer ${userToken}`);
            expect(movimentacoesResponse.status).toBe(200);
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle invalid grupo creation', async () => {
            const response = await helper.request()
                .post('/api/grupos')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    nome: '', // Invalid empty name
                    descricao: 'Test grupo'
                });
            
            expect(response.status).toBe(400);
        });

        it('should handle invalid produto creation', async () => {
            const response = await helper.request()
                .post('/api/produtos')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    nome: 'Test Product',
                    preco: -10, // Invalid negative price
                    quantidade_estoque: 'invalid' // Invalid quantity
                });
            
            expect(response.status).toBe(400);
        });

        it('should handle unauthorized access', async () => {
            const response = await helper.request()
                .get('/api/produtos')
                .set('Authorization', 'Bearer invalid_token');
            
            expect(response.status).toBe(401);
        });

        it('should handle not found resources', async () => {
            const response = await helper.request()
                .get('/api/produtos/999999')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(404);
        });
    });

    describe('Search and Filter Integration', () => {
        it('should search produtos by name', async () => {
            const response = await helper.request()
                .get('/api/produtos?search=workflow')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should filter produtos by grupo', async () => {
            const response = await helper.request()
                .get('/api/produtos?grupo_id=1')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should filter movimentacoes by date', async () => {
            const response = await helper.request()
                .get('/api/movimentacoes?data_inicio=2024-01-01&data_fim=2024-12-31')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('Pagination Integration', () => {
        it('should handle pagination for produtos', async () => {
            const response = await helper.request()
                .get('/api/produtos?page=1&limit=10')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.pagination).toBeDefined();
            expect(response.body.pagination.currentPage).toBe(1);
            expect(response.body.pagination.limit).toBe(10);
        });

        it('should handle pagination for fornecedores', async () => {
            const response = await helper.request()
                .get('/api/fornecedores?page=2&limit=5')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.pagination).toBeDefined();
        });
    });

    describe('Update Operations Integration', () => {
        let testProdutoId;

        beforeAll(async () => {
            // Create a test produto for updates
            const response = await helper.request()
                .post('/api/produtos')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    nome: 'Produto para Update',
                    descricao: 'Descrição original',
                    preco: 19.99,
                    quantidade_estoque: 50
                });
            testProdutoId = response.body.data.id;
        });

        it('should update produto successfully', async () => {
            const response = await helper.request()
                .put(`/api/produtos/${testProdutoId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    nome: 'Produto Atualizado',
                    descricao: 'Descrição atualizada',
                    preco: 39.99
                });
            
            expect(response.status).toBe(200);
            expect(response.body.data.nome).toBe('Produto Atualizado');
            expect(response.body.data.preco).toBe(39.99);
        });

        it('should verify produto was updated', async () => {
            const response = await helper.request()
                .get(`/api/produtos/${testProdutoId}`)
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.data.nome).toBe('Produto Atualizado');
        });
    });

    describe('Delete Operations Integration', () => {
        let testGrupoId;

        beforeAll(async () => {
            // Create a test grupo for deletion
            const response = await helper.request()
                .post('/api/grupos')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    nome: 'Grupo para Deletar',
                    descricao: 'Grupo que será deletado'
                });
            testGrupoId = response.body.data.id;
        });

        it('should delete grupo successfully', async () => {
            const response = await helper.request()
                .delete(`/api/grupos/${testGrupoId}`)
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(200);
        });

        it('should verify grupo was deleted', async () => {
            const response = await helper.request()
                .get(`/api/grupos/${testGrupoId}`)
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(404);
        });
    });
});
