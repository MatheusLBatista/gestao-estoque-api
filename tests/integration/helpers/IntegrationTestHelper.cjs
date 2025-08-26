const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// App global para reutilização
let app = null;

function getApp() {
    if (!app) {
        // Usar a aplicação real em vez de mocks
        const appModule = require('../../../src/app-test.js');
        app = appModule.default;
    }
    return app;
}

class IntegrationTestHelper {
    constructor() {
        this.mongoServer = null;
        this.token = null;
        this.usuarioLogado = null;
        this.testUser = null;
        this.testFornecedor = null;
        this.testGrupo = null;
        this.testProduto = null;
        this.fornecedorCriado = null;
        this.grupoCriado = null;
        this.produtoCriado = null;
        this.movimentacaoCriada = null;
    }

    async setupDatabase() {
        try {
            if (!this.mongoServer) {
                this.mongoServer = await MongoMemoryServer.create();
                const mongoUri = this.mongoServer.getUri();
                
                // Fechar conexões existentes
                if (mongoose.connection.readyState !== 0) {
                    await mongoose.disconnect();
                }
                
                await mongoose.connect(mongoUri);
                
                // Executar seeds
                await this.runSeeds();
            }
        } catch (error) {
            console.error('❌ Erro ao configurar banco:', error);
            throw error;
        }
    }

    async runSeeds() {
        try {
            // Abordagem mais simples: executar as seeds através da API
            console.log('🌱 Executando seeds através de modelos...');
            
            await this.createDefaultRoutes();
            await this.createDefaultGroups();
            await this.createDefaultUsers();
            
        } catch (error) {
            console.error('❌ Erro ao executar seeds:', error);
            throw error;
        }
    }

    async createDefaultRoutes() {
        try {
            const mongoose = require('mongoose');
            
            // Definir schema inline para evitar import
            const rotaSchema = new mongoose.Schema({
                rota: { type: String, required: true },
                dominio: { type: String, required: true },
                ativo: { type: Boolean, default: true },
                buscar: { type: Boolean, default: false },
                enviar: { type: Boolean, default: false },
                substituir: { type: Boolean, default: false },
                modificar: { type: Boolean, default: false },
                excluir: { type: Boolean, default: false }
            });
            
            const Rota = mongoose.model('Rota', rotaSchema);
            
            const rotasExistentes = await Rota.countDocuments();
            if (rotasExistentes > 0) {
                console.log('ℹ️  Rotas já existem, pulando...');
                return;
            }
            
            const rotasPadrao = [
                { rota: 'produtos', dominio: 'localhost', ativo: true, buscar: true, enviar: true, substituir: true, modificar: true, excluir: true },
                { rota: 'fornecedores', dominio: 'localhost', ativo: true, buscar: true, enviar: true, substituir: true, modificar: true, excluir: true },
                { rota: 'usuarios', dominio: 'localhost', ativo: true, buscar: true, enviar: true, substituir: true, modificar: true, excluir: true },
                { rota: 'grupos', dominio: 'localhost', ativo: true, buscar: true, enviar: true, substituir: true, modificar: true, excluir: true },
                { rota: 'movimentacoes', dominio: 'localhost', ativo: true, buscar: true, enviar: true, substituir: true, modificar: true, excluir: true },
                { rota: 'auth', dominio: 'localhost', ativo: true, buscar: false, enviar: true, substituir: false, modificar: true, excluir: false },
                { rota: 'logs', dominio: 'localhost', ativo: true, buscar: true, enviar: false, substituir: false, modificar: false, excluir: false }
            ];
            
            await Rota.insertMany(rotasPadrao);
            console.log('✅ Rotas criadas com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao criar rotas:', error);
            throw error;
        }
    }

    async createDefaultGroups() {
        try {
            const mongoose = require('mongoose');
            
            const grupoSchema = new mongoose.Schema({
                nome: { type: String, required: true, unique: true },
                descricao: { type: String },
                ativo: { type: Boolean, default: true },
                permissoes: [
                    {
                        rota: { 
                            type: String, 
                            required: true,
                            index: true,
                            trim: true,
                            lowercase: true
                        },
                        dominio: { 
                            type: String,
                            default: 'localhost'
                        },
                        ativo: { 
                            type: Boolean, 
                            default: true 
                        },
                        buscar: { 
                            type: Boolean, 
                            default: false 
                        },
                        enviar: { 
                            type: Boolean, 
                            default: false 
                        },
                        substituir: { 
                            type: Boolean, 
                            default: false 
                        },
                        modificar: { 
                            type: Boolean, 
                            default: false 
                        },
                        excluir: { 
                            type: Boolean, 
                            default: false 
                        },
                    }
                ],
                data_criacao: { type: Date, default: Date.now },
                data_atualizacao: { type: Date, default: Date.now }
            });
            
            const Grupo = mongoose.model('Grupo', grupoSchema);
            
            const gruposExistentes = await Grupo.countDocuments();
            if (gruposExistentes > 0) {
                console.log('ℹ️  Grupos já existem, pulando...');
                return;
            }
            
            // Criar permissões completas para o grupo admin
            const adminPermissions = [
                { rota: 'produtos', dominio: 'localhost', ativo: true, buscar: true, enviar: true, substituir: true, modificar: true, excluir: true },
                { rota: 'fornecedores', dominio: 'localhost', ativo: true, buscar: true, enviar: true, substituir: true, modificar: true, excluir: true },
                { rota: 'usuarios', dominio: 'localhost', ativo: true, buscar: true, enviar: true, substituir: true, modificar: true, excluir: true },
                { rota: 'grupos', dominio: 'localhost', ativo: true, buscar: true, enviar: true, substituir: true, modificar: true, excluir: true },
                { rota: 'movimentacoes', dominio: 'localhost', ativo: true, buscar: true, enviar: true, substituir: true, modificar: true, excluir: true },
                { rota: 'auth', dominio: 'localhost', ativo: true, buscar: false, enviar: true, substituir: false, modificar: true, excluir: false },
                { rota: 'logs', dominio: 'localhost', ativo: true, buscar: true, enviar: false, substituir: false, modificar: false, excluir: false }
            ];
            
            const grupos = [
                { 
                    nome: 'admin', 
                    descricao: 'Administradores do sistema', 
                    ativo: true,
                    permissoes: adminPermissions
                },
                { nome: 'vendedor', descricao: 'Vendedores', ativo: true, permissoes: [] },
                { nome: 'estoquista', descricao: 'Responsáveis pelo estoque', ativo: true, permissoes: [] },
                { nome: 'auditor', descricao: 'Auditores do sistema', ativo: true, permissoes: [] }
            ];
            
            await Grupo.insertMany(grupos);
            console.log('✅ Grupos criados com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao criar grupos:', error);
            throw error;
        }
    }

    async createDefaultUsers() {
        try {
            const mongoose = require('mongoose');
            const bcrypt = require('bcrypt');
            
            const usuarioSchema = new mongoose.Schema({
                nome_usuario: { type: String, required: true },
                email: { type: String, required: true, unique: true },
                matricula: { type: String, required: true, unique: true },
                senha: { type: String, required: false, select: false },
                senha_definida: { type: Boolean, default: false },
                telefone: String,
                ativo: { type: Boolean, default: true },
                grupos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'grupos' }],
                permissoes: [
                    {
                        rota: { 
                            type: String, 
                            required: true,
                            index: true,
                            trim: true,
                            lowercase: true
                        },
                        dominio: { 
                            type: String,
                            default: 'localhost'
                        },
                        ativo: { 
                            type: Boolean, 
                            default: true 
                        },
                        buscar: { 
                            type: Boolean, 
                            default: false 
                        },
                        enviar: { 
                            type: Boolean, 
                            default: false 
                        },
                        substituir: { 
                            type: Boolean, 
                            default: false 
                        },
                        modificar: { 
                            type: Boolean, 
                            default: false 
                        },
                        excluir: { 
                            type: Boolean, 
                            default: false 
                        },
                    }
                ],
                data_criacao: { type: Date, default: Date.now },
                data_atualizacao: { type: Date, default: Date.now }
            });
            
            const Usuario = mongoose.model('Usuario', usuarioSchema);
            const Grupo = mongoose.model('Grupo');
            
            const usuariosExistentes = await Usuario.countDocuments();
            if (usuariosExistentes > 0) {
                console.log('ℹ️  Usuários já existem, pulando...');
                return;
            }
            
            const grupoAdmin = await Grupo.findOne({ nome: 'admin' });
            if (!grupoAdmin) {
                throw new Error('Grupo admin não encontrado');
            }
            
            const senhaHash = await bcrypt.hash('admin123', 10);
            
            const usuarios = [
                {
                    nome_usuario: 'Administrador',
                    email: 'admin@sistema.com',
                    matricula: 'ADM0001',
                    senha: senhaHash,
                    senha_definida: true,
                    telefone: '(11) 99999-9999',
                    ativo: true,
                    grupos: [grupoAdmin._id]
                },
                {
                    nome_usuario: 'Usuario Teste',
                    email: 'teste@sistema.com',
                    matricula: 'USR0001',
                    senha: senhaHash,
                    senha_definida: true,
                    telefone: '(11) 88888-8888',
                    ativo: true,
                    grupos: [grupoAdmin._id]
                }
            ];
            
            const usuariosCriados = await Usuario.insertMany(usuarios);
            
            // Armazenar o usuário de teste para uso nos tests
            this.testUser = usuariosCriados[1]; // Segundo usuário (Usuario Teste)
            
            console.log('✅ Usuários criados com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao criar usuários:', error);
            throw error;
        }
    }

    async teardownDatabase() {
        try {
            // Fechar todas as conexões do mongoose
            if (mongoose.connection.readyState !== 0) {
                await mongoose.connection.close();
                await mongoose.disconnect();
            }
            
            // Parar o servidor MongoDB em memória
            if (this.mongoServer) {
                await this.mongoServer.stop();
                this.mongoServer = null;
            }
            
            // Limpar cache de models do mongoose
            mongoose.models = {};
            mongoose.modelSchemas = {};
            
            // Forçar garbage collection se possível
            if (global.gc) {
                global.gc();
            }
        } catch (error) {
            console.error('❌ Erro no teardown:', error);
            throw error;
        }
    }

    async cleanDatabase() {
        try {
            if (mongoose.connection.readyState === 1) {
                const collections = ['movimentacaos', 'produtos', 'fornecedors'];
                
                for (const collection of collections) {
                    try {
                        await mongoose.connection.db.collection(collection).deleteMany({});
                    } catch (error) {
                        // Ignora erro se collection não existe
                    }
                }
            }
        } catch (error) {
            console.error('❌ Erro ao limpar banco:', error);
        }
    }

    async login(matricula = 'ADM0001', senha = 'admin123') {
        try {
            const app = getApp();
            
            const response = await request(app)
                .post('/auth/login')
                .send({ matricula, senha });

            if (response.status !== 200) {
                console.error('❌ Erro no login:', response.body);
                throw new Error(`Login falhou: ${response.body?.message || 'Erro desconhecido'}`);
            }

            if (!response.body?.accessToken) {
                console.error('❌ Token não encontrado na resposta:', response.body);
                throw new Error('Token não encontrado na resposta');
            }

            this.token = response.body.accessToken;
            this.usuarioLogado = response.body.user;
            
            return response.body;
        } catch (error) {
            console.error('❌ Erro no método login:', error);
            throw error;
        }
    }

    async criarUsuario(dadosUsuario = {}) {
        try {
            if (!this.token) {
                await this.login();
            }

            const app = getApp();
            const dados = {
                nome_usuario: 'Usuário Teste',
                email: 'teste@teste.com',
                matricula: 'TST' + Date.now().toString().slice(-4),
                telefone: '(11) 99999-9999',
                ativo: true,
                id_grupo: this.grupoCriado?._id || await this.obterGrupoId(),
                ...dadosUsuario
            };

            const response = await request(app)
                .post('/api/usuarios')
                .set('Authorization', `Bearer ${this.token}`)
                .send(dados);

            if (response.status !== 201) {
                console.error('❌ Erro ao criar usuário:', response.body);
                throw new Error(`Falha ao criar usuário: ${response.body?.message || 'Erro desconhecido'}`);
            }

            return response.body.data;
        } catch (error) {
            console.error('❌ Erro no método criarUsuario:', error);
            throw error;
        }
    }

    async criarFornecedor(dadosFornecedor = {}) {
        try {
            if (!this.token) {
                await this.login();
            }

            const app = getApp();
            const dados = {
                nome_fornecedor: 'Fornecedor Teste',
                cnpj: '12345678000199',
                email: 'fornecedor@teste.com',
                telefone: '(11) 99999-9999',
                endereco: [{
                    logradouro: 'Rua Teste, 123',
                    bairro: 'Bairro Teste',
                    cidade: 'São Paulo',
                    estado: 'SP',
                    cep: '01234-567'
                }],
                status: true,
                ...dadosFornecedor
            };

            const response = await request(app)
                .post('/api/fornecedores')
                .set('Authorization', `Bearer ${this.token}`)
                .send(dados);

            if (response.status !== 201) {
                console.error('❌ Erro ao criar fornecedor:', response.body);
                throw new Error(`Falha ao criar fornecedor: ${response.body?.message || 'Erro desconhecido'}`);
            }

            this.fornecedorCriado = response.body.data;
            return response.body.data;
        } catch (error) {
            console.error('❌ Erro no método criarFornecedor:', error);
            throw error;
        }
    }

    async criarGrupo(dadosGrupo = {}) {
        try {
            if (!this.token) {
                await this.login();
            }

            const app = getApp();
            const dados = {
                nome: 'Grupo Teste',
                descricao: 'Descrição do grupo teste',
                ativo: true,
                ...dadosGrupo
            };

            const response = await request(app)
                .post('/api/grupos')
                .set('Authorization', `Bearer ${this.token}`)
                .send(dados);

            if (response.status !== 201) {
                console.error('❌ Erro ao criar grupo:', response.body);
                throw new Error(`Falha ao criar grupo: ${response.body?.message || 'Erro desconhecido'}`);
            }

            this.grupoCriado = response.body.data;
            return response.body.data;
        } catch (error) {
            console.error('❌ Erro no método criarGrupo:', error);
            throw error;
        }
    }

    async criarProduto(dadosProduto = {}) {
        try {
            if (!this.token) {
                await this.login();
            }

            if (!this.fornecedorCriado) {
                await this.criarFornecedor();
            }

            const app = getApp();
            const dados = {
                nome_produto: 'Produto Teste',
                descricao: 'Descrição do produto teste',
                preco: 100.00,
                custo: 50.00,
                categoria: 'Categoria Teste',
                estoque: 0,
                estoque_min: 5,
                id_fornecedor: this.fornecedorCriado._id,
                codigo_produto: 'PROD' + Date.now().toString().slice(-6),
                status: true,
                ...dadosProduto
            };

            const response = await request(app)
                .post('/api/produtos')
                .set('Authorization', `Bearer ${this.token}`)
                .send(dados);

            if (response.status !== 201) {
                console.error('❌ Erro ao criar produto:', response.body);
                throw new Error(`Falha ao criar produto: ${response.body?.message || 'Erro desconhecido'}`);
            }

            this.produtoCriado = response.body.data;
            return response.body.data;
        } catch (error) {
            console.error('❌ Erro no método criarProduto:', error);
            throw error;
        }
    }

    async criarMovimentacao(dadosMovimentacao = {}) {
        try {
            if (!this.token) {
                await this.login();
            }

            if (!this.produtoCriado) {
                await this.criarProduto();
            }

            const app = getApp();
            const dados = {
                produto_id: this.produtoCriado._id,
                tipo: 'entrada',
                quantidade: 10,
                destino: 'Estoque Principal',
                observacoes: 'Movimentação de teste',
                ...dadosMovimentacao
            };

            const response = await request(app)
                .post('/api/movimentacoes')
                .set('Authorization', `Bearer ${this.token}`)
                .send(dados);

            if (response.status !== 201) {
                console.error('❌ Erro ao criar movimentação:', response.body);
                throw new Error(`Falha ao criar movimentação: ${response.body?.message || 'Erro desconhecido'}`);
            }

            this.movimentacaoCriada = response.body.data;
            return response.body.data;
        } catch (error) {
            console.error('❌ Erro no método criarMovimentacao:', error);
            throw error;
        }
    }

    async obterGrupoId() {
        try {
            const mongoose = require('mongoose');
            const Grupo = mongoose.model('Grupo');
            const grupo = await Grupo.findOne({ nome: 'admin' });
            return grupo ? grupo._id : null;
        } catch (error) {
            console.error('❌ Erro ao obter grupo:', error);
            return null;
        }
    }

    getAuthHeader() {
        return { Authorization: `Bearer ${this.token}` };
    }

    getApp() {
        return getApp();
    }

    expectErrorResponse(response, expectedStatusCode) {
        expect(response.status).toBe(expectedStatusCode);
        expect(response.body).toBeDefined();
        
        // Verificar se tem estrutura de erro (CommonResponse) ou erro simples
        if (response.body.error !== undefined) {
            expect(response.body.error).toBe(true);
            expect(response.body.code).toBe(expectedStatusCode);
        }
        expect(response.body.message).toBeDefined();
    }

    expectSuccessResponse(response, expectedStatusCode = 200) {
        expect(response.status).toBe(expectedStatusCode);
        expect(response.body).toBeDefined();
        
        // Verificar se tem estrutura CommonResponse ou resposta simples
        if (response.body.error !== undefined) {
            expect(response.body.error).toBe(false);
            expect(response.body.code).toBe(expectedStatusCode);
            expect(response.body.data).toBeDefined();
        } else {
            // Resposta direta sem wrapper CommonResponse
            expect(response.body.message).toBeDefined();
        }
    }

    expectValidResponse(response, expectedStatusCode = 200) {
        expect(response.status).toBe(expectedStatusCode);
        expect(response.body).toBeDefined();
        
        // Verificar se tem estrutura CommonResponse ou resposta simples
        if (response.body.error !== undefined) {
            expect(response.body.error).toBe(false);
            expect(response.body.code).toBe(expectedStatusCode);
        } else {
            expect(response.body.message).toBeDefined();
        }
    }

    expectPaginatedResponse(response, expectedStatusCode = 200) {
        this.expectSuccessResponse(response, expectedStatusCode);
        expect(response.body.data.docs).toBeDefined();
        expect(Array.isArray(response.body.data.docs)).toBe(true);
        expect(response.body.data.totalDocs).toBeDefined();
        expect(response.body.data.page).toBeDefined();
        expect(response.body.data.totalPages).toBeDefined();
    }

    async getAdminToken() {
        if (!this.token) {
            await this.login();
        }
        return this.token;
    }

    // Aliases para compatibilidade com testes existentes
    async setup() {
        return this.setupDatabase();
    }

    async teardown() {
        return this.teardownDatabase();
    }

    async clean() {
        return this.cleanDatabase();
    }

    // Métodos para criar entidades de teste
    async createTestUser(token) {
        if (!this.testUser) {
            // Se o testUser ainda não existe, criar um novo
            const userData = {
                nome_usuario: 'Usuario Teste',
                email: 'teste@sistema.com',
                matricula: 'USR0001',
                senha: 'teste123',
                telefone: '(11) 88888-8888'
            };
            
            const response = await request(getApp())
                .post('/api/usuarios')
                .set('Authorization', `Bearer ${token}`)
                .send(userData);
                
            this.testUser = response.body.data;
        }
        return this.testUser;
    }

    async createTestFornecedor(token) {
        if (!this.testFornecedor) {
            const fornecedorData = {
                nome_fornecedor: 'Fornecedor Teste',
                cnpj: '12.345.678/0001-90',
                email: 'fornecedor@teste.com',
                telefone: '(11) 99999-9999',
                endereco: [{
                    logradouro: 'Rua Teste, 123',
                    bairro: 'Centro',
                    cidade: 'São Paulo',
                    estado: 'SP',
                    cep: '01234-567'
                }],
                status: true
            };
            
            const response = await request(getApp())
                .post('/api/fornecedores')
                .set('Authorization', `Bearer ${token}`)
                .send(fornecedorData);
                
            this.testFornecedor = response.body.data;
        }
        return this.testFornecedor;
    }

    async createTestGrupo(token) {
        if (!this.testGrupo) {
            const grupoData = {
                nome: 'Grupo Teste',
                descricao: 'Grupo criado para testes',
                ativo: true
            };
            
            const response = await request(getApp())
                .post('/api/grupos')
                .set('Authorization', `Bearer ${token}`)
                .send(grupoData);
                
            this.testGrupo = response.body.data;
        }
        return this.testGrupo;
    }

    async createTestProduto(token) {
        if (!this.testProduto) {
            const fornecedor = await this.createTestFornecedor(token);
            
            const produtoData = {
                nome_produto: 'Produto Teste',
                descricao: 'Produto criado para testes',
                preco: 99.99,
                custo: 50.00,
                estoque: 100,
                estoque_min: 10,
                categoria: 'Categoria Teste',
                id_fornecedor: fornecedor._id || fornecedor.id || 1,
                codigo_produto: 'PROD-TEST-HELPER'
            };
            
            const response = await request(getApp())
                .post('/api/produtos')
                .set('Authorization', `Bearer ${token}`)
                .send(produtoData);
                
            this.testProduto = response.body.data;
        }
        return this.testProduto;
    }
}

module.exports = IntegrationTestHelper;
