import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import dotenv from "dotenv";

// Importar todas as definições de rotas
import authRoutes from "./routes/auth.js";
import usuariosRoutes from "./routes/usuarios.js";
import produtosRoutes from "./routes/produtos.js";
import fornecedoresRoutes from "./routes/fornecedores.js";
import movimentacoesRoutes from "./routes/movimentacoes.js";
import gruposRoutes from "./routes/grupos.js";
import logsRoutes from "./routes/logs.js";

// Importar schemas
import commonSchemas from "./schemas/common.js";
import usuarioSchemas from "./schemas/usuario.js";
import produtoSchemas from "./schemas/produto.js";
import fornecedorSchemas from "./schemas/fornecedor.js";
import movimentacaoSchemas from "./schemas/movimentacao.js";
import authSchemas from "./schemas/auth.js";
import grupoSchemas from "./schemas/grupo.js";
import logsSchemas from "./schemas/logs.js";

dotenv.config();

class SwaggerConfig {
    constructor() {
        this.swaggerDefinition = {
            openapi: '3.0.0',
            info: {
                title: 'Sistema de Gestão de Estoque API',
                version: '1.0.0',
                description: `
                    ## Sistema de Gestão de Estoque
                    
                    API completa para gerenciamento de estoque, produtos, fornecedores e usuários.
                    
                    ### Funcionalidades Principais:
                    - **Autenticação**: Sistema JWT com refresh tokens
                    - **Usuários**: Gestão completa com perfis e permissões
                    - **Produtos**: Controle de estoque e categorização
                    - **Fornecedores**: Cadastro e relacionamento com produtos
                    - **Movimentações**: Entrada e saída de produtos
                    - **Auditoria**: Logs completos de todas as operações
                    
                    ### Segurança:
                    - Autenticação via JWT Bearer Token
                    - Controle de acesso baseado em perfis
                    - Logs de auditoria para operações críticas
                    - Validação rigorosa de dados de entrada
                    
                    ### Como usar:
                    1. Faça login em \`/auth/login\` para obter o token
                    2. Use o token no header: \`Authorization: Bearer <token>\`
                    3. Consulte os endpoints disponíveis abaixo
                `,
                contact: {
                    name: "Equipe de Desenvolvimento",
                    email: "dev@empresa.com"
                }
            },
            servers: [
                {
                    url: process.env.SYSTEM_URL || `http://localhost:${process.env.APP_PORT || 5011}`,
                    description: 'Servidor da API'
                }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                        description: 'Token JWT obtido através do endpoint de login'
                    }
                },
                schemas: {
                    ...commonSchemas,
                    ...usuarioSchemas,
                    ...produtoSchemas,
                    ...fornecedorSchemas,
                    ...movimentacaoSchemas,
                    ...authSchemas,
                    ...grupoSchemas,
                    ...logsSchemas
                }
            },
            paths: {
                ...authRoutes,
                ...usuariosRoutes,
                ...produtosRoutes,
                ...fornecedoresRoutes,
                ...movimentacoesRoutes,
                ...gruposRoutes,
                ...logsRoutes
            },
            tags: [
                {
                    name: 'Autenticação',
                    description: 'Endpoints para login, logout e gerenciamento de tokens'
                },
                {
                    name: 'Usuários',
                    description: 'Gestão de usuários, perfis e permissões'
                },
                {
                    name: 'Produtos',
                    description: 'Cadastro e gerenciamento de produtos'
                },
                {
                    name: 'Fornecedores',
                    description: 'Cadastro e gerenciamento de fornecedores'
                },
                {
                    name: 'Movimentações',
                    description: 'Controle de entrada e saída de produtos'
                },
                {
                    name: 'Grupos',
                    description: 'Gestão de grupos e permissões'
                },
                {
                    name: 'Logs',
                    description: 'Auditoria e logs do sistema'
                }
            ]
        };
    }

    getSwaggerSpec() {
        return this.swaggerDefinition;
    }

    setupSwagger(app) {
        const swaggerSpec = this.getSwaggerSpec();
        
        // Servir arquivos do Swagger UI
        app.use('/api-docs', swaggerUI.serve);
        app.get('/api-docs', swaggerUI.setup(swaggerSpec, {
            customCss: `
                .swagger-ui .topbar { display: none; }
                .swagger-ui .info .title { color: #2c3e50; }
                .swagger-ui .scheme-container { 
                    background: #f8f9fa; 
                    border: 1px solid #dee2e6; 
                    border-radius: 0.375rem; 
                    padding: 1rem; 
                    margin: 1rem 0; 
                }
            `,
            customSiteTitle: "Sistema de Gestão de Estoque - API Documentation",
            customfavIcon: "/favicon.ico"
        }));

        // Endpoint para obter spec JSON
        app.get('/api-docs.json', (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });

        console.log('📚 Swagger configurado em: /api-docs');
        console.log('📄 Spec JSON disponível em: /api-docs.json');
    }
}

export default SwaggerConfig;
