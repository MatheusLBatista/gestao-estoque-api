import authPaths from "../routes/auth.js";
import produtosPaths from "../routes/produtos.js";
import fornecedoresPaths from "../routes/fornecedores.js";
import usuariosPaths from "../routes/usuarios.js";
import movimentacoesPaths from "../routes/movimentacoes.js";
import logsPaths from "../routes/logs.js";

import authSchemas from "../schemas/authSchema.js";
import produtosSchemas from "../schemas/produtosSchema.js";
import fornecedoresSchemas from "../schemas/fornecedoresSchema.js";
import usuariosSchemas from "../schemas/usuariosSchema.js";
import movimentacoesSchemas from "../schemas/movimentacoesSchema.js";
import logsSchemas from "../schemas/logsSchema.js";

// Função para definir as URLs do servidor dependendo do ambiente
const getServersInCorrectOrder = () => {
    const devUrl = { url: process.env.SWAGGER_DEV_URL || "http://localhost:5011" };
    const prodUrl = { url: process.env.SWAGGER_PROD_URL || "https://gestao-estoque.com" };

    if (process.env.NODE_ENV === "production") return [prodUrl, devUrl];
    else return [devUrl, prodUrl];
};

// Função para obter as opções do Swagger
const getSwaggerOptions = () => {
    return {
        swaggerDefinition: {
            openapi: "3.0.0",
            info: {
                title: "API Sistema de Gestão de Estoque Automotivo",
                version: "1.0.0",
                description: `
                # Sistema de Gestão de Estoque Automotivo

                Esta API REST foi desenvolvida para gerenciar o estoque de uma empresa do setor automotivo, 
                permitindo controle completo de produtos, fornecedores, usuários, movimentações e logs do sistema.

                ## Recursos Principais
                - **Autenticação JWT**: Sistema seguro com tokens de acesso e refresh
                - **Gestão de Produtos**: CRUD completo com controle de estoque
                - **Gestão de Fornecedores**: Cadastro e manutenção de fornecedores
                - **Controle de Usuários**: Sistema de permissões e perfis
                - **Movimentações**: Histórico completo de entradas e saídas
                - **Sistema de Logs**: Auditoria completa de ações do sistema

                ## Autenticação
                É necessário autenticar com token JWT antes de utilizar a maioria das rotas. 
                Faça login na rota \`/auth/login\` com matrícula e senha válidos.
                
                O sistema conta com:
                - **Access Token**: Válido por 15 minutos
                - **Refresh Token**: Válido por 7 dias
                - **Logout**: Invalidação segura de tokens
                - **Sistema de Logs**: Registro de todas as ações

                ## Permissões
                - **Administrador**: Acesso completo ao sistema
                - **Funcionário**: Acesso limitado conforme configuração

                Para mais informações, consulte a documentação técnica do projeto.
                `,
                contact: {
                    name: "Equipe de Desenvolvimento",
                    email: "dev@gestao-estoque.com",
                },
            },
            servers: getServersInCorrectOrder(),
            tags: [
                {
                    name: "Autenticação",
                    description: "Rotas para autenticação e autorização (login, logout, refresh token)"
                },
                {
                    name: "Produtos",
                    description: "Gestão de produtos automotivos (CRUD, estoque baixo, busca)"
                },
                {
                    name: "Fornecedores", 
                    description: "Gestão de fornecedores (CRUD, busca por CNPJ/nome)"
                },
                {
                    name: "Usuários",
                    description: "Gestão de usuários do sistema (CRUD, controle de permissões)"
                },
                {
                    name: "Movimentações",
                    description: "Controle de movimentações de estoque (entradas, saídas, histórico)"
                },
                {
                    name: "Logs",
                    description: "Sistema de logs e auditoria (usuários online, eventos, estatísticas)"
                }
            ],
            paths: {
                ...authPaths,
                ...produtosPaths,
                ...fornecedoresPaths,
                ...usuariosPaths,
                ...movimentacoesPaths,
                ...logsPaths
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    }
                },
                schemas: {
                    ...authSchemas,
                    ...produtosSchemas,
                    ...fornecedoresSchemas,
                    ...usuariosSchemas,
                    ...movimentacoesSchemas,
                    ...logsSchemas
                }
            },
            security: [{
                bearerAuth: []
            }]
        },
        apis: ["./src/routes/*.js"]
    };
};

export default getSwaggerOptions;
