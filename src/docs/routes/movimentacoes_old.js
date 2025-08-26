import commonSchemas from "../schemas/common.js";

const movimentacoesRoutes = {
    "/api/movimentacoes": {
        get: {
            tags: ["Movimentações"],
            summary: "Lista todas as movimentações",
            description: `
            Lista todas as movimentações de estoque com suporte a paginação e filtros.
            
            **Funcionalidades:**
            - Paginação automática
            - Filtros por tipo, produto, usuário, período
            - Ordenação por data (mais recentes primeiro)
            - Cálculos de valores totais
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "page",
                    in: "query",
                    description: "Número da página",
                    schema: { type: "integer", default: 1, minimum: 1 }
                },
                {
                    name: "limit",
                    in: "query",
                    description: "Itens por página",
                    schema: { type: "integer", default: 10, minimum: 1, maximum: 100 }
                },
                {
                    name: "tipo",
                    in: "query",
                    description: "Filtrar por tipo de movimentação",
                    schema: { type: "string", enum: ["ENTRADA", "SAIDA"], example: "ENTRADA" }
                },
                {
                    name: "dataInicio",
                    in: "query",
                    description: "Data de início do período (YYYY-MM-DD)",
                    schema: { type: "string", format: "date", example: "2024-01-01" }
                },
                {
                    name: "dataFim",
                    in: "query",
                    description: "Data de fim do período (YYYY-MM-DD)",
                    schema: { type: "string", format: "date", example: "2024-01-31" }
                }
            ],
            responses: {
                200: {
                    description: "Movimentações listadas com sucesso",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/MovimentacoesList" }
                        }
                    }
                },
                401: commonResponses[401](),
                403: commonResponses[403](),
                500: commonResponses[500]()
            }
        },
        post: {
            tags: ["Movimentações"],
            summary: "Cadastra nova movimentação",
            description: `
            Cadastra uma nova movimentação de estoque (entrada ou saída).
            
            **Funcionalidades:**
            - Validação de dados obrigatórios
            - Atualização automática do estoque
            - Cálculo automático do valor total
            - Verificação de estoque para saídas
            - Registro automático de logs
            
            **Regras de Negócio:**
            - Para SAÍDA: verificar se há estoque suficiente
            - Para ENTRADA: adicionar ao estoque atual
            - Usuário da movimentação é o autenticado
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { "$ref": "#/components/schemas/MovimentacaoCreate" }
                    }
                }
            },
            responses: {
                201: {
                    description: "Movimentação cadastrada com sucesso",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/MovimentacaoCreateResponse" }
                        }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                409: {
                    description: "Estoque insuficiente para saída",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Estoque insuficiente. Disponível: 5, Solicitado: 10"
                                    },
                                    estoqueDisponivel: {
                                        type: "integer",
                                        example: 5
                                    },
                                    quantidadeSolicitada: {
                                        type: "integer",
                                        example: 10
                                    }
                                }
                            }
                        }
                    }
                },
                422: commonResponses[422](),
                500: commonResponses[500]()
            }
        }
    },

    "/api/movimentacoes/{id}": {
        get: {
            tags: ["Movimentações"],
            summary: "Busca movimentação por ID",
            description: "Retorna os dados de uma movimentação específica pelo seu ID.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID da movimentação",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e90" }
                }
            ],
            responses: {
                200: {
                    description: "Movimentação encontrada com sucesso",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/MovimentacaoResponse" }
                        }
                    }
                },
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        },
        patch: {
            tags: ["Movimentações"],
            summary: "Atualiza movimentação",
            description: `
            Atualiza uma movimentação existente (apenas observações).
            
            **Funcionalidades:**
            - Atualização apenas de observações
            - Não permite alterar valores ou quantidades
            - Preservação do histórico
            - Registro de logs de alteração
            
            **Regra:** Apenas observações podem ser alteradas após criação.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID da movimentação",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e90" }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { "$ref": "#/components/schemas/MovimentacaoUpdate" }
                    }
                }
            },
            responses: {
                200: commonResponses[200](),
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                422: commonResponses[422](),
                500: commonResponses[500]()
            }
        },
        delete: {
            tags: ["Movimentações"],
            summary: "Exclui movimentação",
            description: `
            Exclui uma movimentação e reverte o estoque.
            
            **Funcionalidades:**
            - Reversão automática do estoque
            - Exclusão lógica da movimentação
            - Verificação de permissões
            - Registro de logs
            
            **Regras:**
            - Apenas administradores podem excluir
            - Movimentações antigas podem ter restrições
            - Estoque é automaticamente revertido
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID da movimentação",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e90" }
                }
            ],
            responses: {
                200: commonResponses[200](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                409: {
                    description: "Movimentação não pode ser excluída",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Movimentações com mais de 30 dias não podem ser excluídas"
                                    }
                                }
                            }
                        }
                    }
                },
                500: commonResponses[500]()
            }
        }
    },

    "/api/movimentacoes/busca": {
        get: {
            tags: ["Movimentações"],
            summary: "Busca movimentações por critérios",
            description: `
            Busca movimentações usando diferentes critérios de pesquisa.
            
            **Funcionalidades:**
            - Busca por nome do produto
            - Busca por código do produto
            - Busca por tipo de movimentação
            - Busca por observações
            - Combinação de filtros
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "produto",
                    in: "query",
                    description: "Buscar por nome do produto",
                    schema: { type: "string", example: "pastilha" }
                },
                {
                    name: "codigo",
                    in: "query",
                    description: "Buscar por código do produto",
                    schema: { type: "string", example: "PF001" }
                },
                {
                    name: "tipo",
                    in: "query",
                    description: "Filtrar por tipo",
                    schema: { type: "string", enum: ["ENTRADA", "SAIDA"], example: "ENTRADA" }
                },
                {
                    name: "observacoes",
                    in: "query",
                    description: "Buscar nas observações",
                    schema: { type: "string", example: "reposição" }
                }
            ],
            responses: {
                200: {
                    description: "Movimentações encontradas",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/MovimentacoesList" }
                        }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                500: commonResponses[500]()
            }
        }
    },

    "/api/movimentacoes/filtro": {
        get: {
            tags: ["Movimentações"],
            summary: "Filtro avançado de movimentações",
            description: `
            Aplica filtros avançados nas movimentações com múltiplos critérios.
            
            **Funcionalidades:**
            - Filtros combinados
            - Período específico
            - Produtos específicos
            - Usuários específicos
            - Valores mínimos/máximos
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "dataInicio",
                    in: "query",
                    description: "Data de início",
                    schema: { type: "string", format: "date", example: "2024-01-01" }
                },
                {
                    name: "dataFim",
                    in: "query",
                    description: "Data de fim",
                    schema: { type: "string", format: "date", example: "2024-01-31" }
                },
                {
                    name: "tipo",
                    in: "query",
                    description: "Tipo de movimentação",
                    schema: { type: "string", enum: ["ENTRADA", "SAIDA"] }
                },
                {
                    name: "produtoId",
                    in: "query",
                    description: "ID do produto",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e7f" }
                },
                {
                    name: "usuarioId",
                    in: "query",
                    description: "ID do usuário",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e7f" }
                },
                {
                    name: "valorMinimo",
                    in: "query",
                    description: "Valor total mínimo",
                    schema: { type: "number", example: 100.00 }
                },
                {
                    name: "valorMaximo",
                    in: "query",
                    description: "Valor total máximo",
                    schema: { type: "number", example: 1000.00 }
                }
            ],
            responses: {
                200: {
                    description: "Movimentações filtradas",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/MovimentacoesList" }
                        }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                500: commonResponses[500]()
            }
        }
    },

    "/api/movimentacoes/desativar/{id}": {
        patch: {
            tags: ["Movimentações"],
            summary: "Desativa movimentação",
            description: `
            Desativa uma movimentação do sistema (desativação lógica).
            
            **Funcionalidades:**
            - Marca movimentação como inativa
            - Preserva histórico de movimentações
            - Registra ação nos logs do sistema
            - Mantém integridade referencial
            - Não afeta o estoque atual
            
            **Regras de Negócio:**
            - Movimentação mantém-se no histórico
            - Apenas status é alterado para inativo
            - Logs de auditoria são registrados
            
            **Permissões:** Apenas administradores podem desativar movimentações.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID da movimentação a ser desativada",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e90" }
                }
            ],
            responses: {
                200: {
                    description: "Movimentação desativada com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Movimentação desativada com sucesso"
                                    },
                                    movimentacao: {
                                        "$ref": "#/components/schemas/MovimentacaoResponse"
                                    }
                                }
                            }
                        }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        }
    },

    "/api/movimentacoes/reativar/{id}": {
        patch: {
            tags: ["Movimentações"],
            summary: "Reativa movimentação",
            description: `
            Reativa uma movimentação que estava desativada no sistema.
            
            **Funcionalidades:**
            - Marca movimentação como ativa novamente
            - Permite nova visualização nos relatórios
            - Registra ação nos logs do sistema
            - Reestabelece movimentação no histórico ativo
            - Não afeta o estoque atual
            
            **Regras de Negócio:**
            - Movimentação volta a aparecer em listagens ativas
            - Histórico é mantido integralmente
            - Logs de auditoria são registrados
            
            **Permissões:** Apenas administradores podem reativar movimentações.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID da movimentação a ser reativada",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e90" }
                }
            ],
            responses: {
                200: {
                    description: "Movimentação reativada com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Movimentação reativada com sucesso"
                                    },
                                    movimentacao: {
                                        "$ref": "#/components/schemas/MovimentacaoResponse"
                                    }
                                }
                            }
                        }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        }
    }
};

export default movimentacoesRoutes;
