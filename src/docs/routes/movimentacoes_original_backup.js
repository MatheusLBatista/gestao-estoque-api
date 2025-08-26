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
                ...commonSchemas.PaginationParams,
                {
                    name: "produto_id",
                    in: "query",
                    description: "Filtrar por produto",
                    schema: { type: "string" }
                },
                {
                    name: "tipo_movimentacao",
                    in: "query",
                    description: "Filtrar por tipo de movimentação",
                    schema: { 
                        type: "string", 
                        enum: ["ENTRADA", "SAIDA", "AJUSTE", "TRANSFERENCIA"] 
                    }
                },
                {
                    name: "data_inicio",
                    in: "query",
                    description: "Data de início do período",
                    schema: { type: "string", format: "date" }
                },
                {
                    name: "data_fim",
                    in: "query",
                    description: "Data de fim do período",
                    schema: { type: "string", format: "date" }
                }
            ],
            responses: {
                200: {
                    description: "Lista de movimentações retornada com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: {
                                                type: "object",
                                                properties: {
                                                    movimentacoes: {
                                                        type: "array",
                                                        items: { $ref: "#/components/schemas/Movimentacao" }
                                                    },
                                                    pagination: { $ref: "#/components/schemas/PaginationInfo" }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                400: { $ref: "#/components/responses/BadRequest" },
                401: { $ref: "#/components/responses/Unauthorized" },
                403: { $ref: "#/components/responses/Forbidden" },
                500: { $ref: "#/components/responses/InternalServerError" }
            }
        },
        post: {
            tags: ["Movimentações"],
            summary: "Cadastrar nova movimentação",
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
                        schema: { $ref: "#/components/schemas/MovimentacaoInput" }
                    }
                }
            },
            responses: {
                201: {
                    description: "Movimentação criada com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: { $ref: "#/components/schemas/Movimentacao" }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                400: { $ref: "#/components/responses/BadRequest" },
                401: { $ref: "#/components/responses/Unauthorized" },
                403: { $ref: "#/components/responses/Forbidden" },
                422: { $ref: "#/components/responses/UnprocessableEntity" },
                500: { $ref: "#/components/responses/InternalServerError" }
            }
        }
    },
    "/api/movimentacoes/busca": {
        get: {
            tags: ["Movimentações"],
            summary: "Buscar movimentações",
            description: `
            Busca movimentações com critérios específicos.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "termo",
                    in: "query",
                    description: "Termo de busca",
                    schema: { type: "string" }
                }
            ],
            responses: {
                200: {
                    description: "Resultados da busca retornados com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: {
                                                type: "object",
                                                properties: {
                                                    movimentacoes: {
                                                        type: "array",
                                                        items: { $ref: "#/components/schemas/Movimentacao" }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                400: { $ref: "#/components/responses/BadRequest" },
                401: { $ref: "#/components/responses/Unauthorized" },
                403: { $ref: "#/components/responses/Forbidden" },
                500: { $ref: "#/components/responses/InternalServerError" }
            }
        }
    },
    "/api/movimentacoes/filtro": {
        get: {
            tags: ["Movimentações"],
            summary: "Filtrar movimentações com critérios avançados",
            description: `
            Filtrar movimentações com múltiplos critérios avançados.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "produto_id",
                    in: "query",
                    description: "ID do produto",
                    schema: { type: "string" }
                },
                {
                    name: "tipo_movimentacao",
                    in: "query",
                    description: "Tipo da movimentação",
                    schema: { 
                        type: "string", 
                        enum: ["ENTRADA", "SAIDA", "AJUSTE", "TRANSFERENCIA"] 
                    }
                },
                {
                    name: "status",
                    in: "query",
                    description: "Status da movimentação",
                    schema: { 
                        type: "string", 
                        enum: ["PENDENTE", "CONFIRMADA", "CANCELADA"] 
                    }
                },
                {
                    name: "valor_min",
                    in: "query",
                    description: "Valor mínimo",
                    schema: { type: "number" }
                },
                {
                    name: "valor_max",
                    in: "query",
                    description: "Valor máximo",
                    schema: { type: "number" }
                },
                {
                    name: "data_inicio",
                    in: "query",
                    description: "Data de início do período",
                    schema: { type: "string", format: "date" }
                },
                {
                    name: "data_fim",
                    in: "query",
                    description: "Data de fim do período",
                    schema: { type: "string", format: "date" }
                }
            ],
            responses: {
                200: {
                    description: "Movimentações filtradas com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: {
                                                type: "object",
                                                properties: {
                                                    movimentacoes: {
                                                        type: "array",
                                                        items: { $ref: "#/components/schemas/Movimentacao" }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                400: { $ref: "#/components/responses/BadRequest" },
                401: { $ref: "#/components/responses/Unauthorized" },
                403: { $ref: "#/components/responses/Forbidden" },
                500: { $ref: "#/components/responses/InternalServerError" }
            }
        }
    },
    "/api/movimentacoes/{id}": {
        get: {
            tags: ["Movimentações"],
            summary: "Buscar movimentação por ID",
            description: `
            Retorna os detalhes de uma movimentação específica pelo seu ID.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único da movimentação",
                    schema: { type: "string" }
                }
            ],
            responses: {
                200: {
                    description: "Movimentação encontrada com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: { $ref: "#/components/schemas/Movimentacao" }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                400: { $ref: "#/components/responses/BadRequest" },
                401: { $ref: "#/components/responses/Unauthorized" },
                403: { $ref: "#/components/responses/Forbidden" },
                404: { $ref: "#/components/responses/NotFound" },
                500: { $ref: "#/components/responses/InternalServerError" }
            }
        },
        patch: {
            tags: ["Movimentações"],
            summary: "Atualizar movimentação",
            description: `
            Atualiza as informações de uma movimentação existente.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único da movimentação",
                    schema: { type: "string" }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/MovimentacaoUpdate" }
                    }
                }
            },
            responses: {
                200: {
                    description: "Movimentação atualizada com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: { $ref: "#/components/schemas/Movimentacao" }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                400: { $ref: "#/components/responses/BadRequest" },
                401: { $ref: "#/components/responses/Unauthorized" },
                403: { $ref: "#/components/responses/Forbidden" },
                404: { $ref: "#/components/responses/NotFound" },
                422: { $ref: "#/components/responses/UnprocessableEntity" },
                500: { $ref: "#/components/responses/InternalServerError" }
            }
        }
    }
};

export default movimentacoesRoutes;
