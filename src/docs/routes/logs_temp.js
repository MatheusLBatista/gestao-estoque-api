import commonSchemas from "../schemas/common.js";

const logsRoutes = {
    "/api/logs": {
        get: {
            tags: ["Logs"],
            summary: "Buscar logs do sistema",
            description: `
            Endpoint para buscar logs de auditoria e atividades do sistema com filtros opcionais.
            
            **Funcionalidades:**
            - Logs de auditoria completos
            - Filtros por usuário, evento, período
            - Rastreamento de ações críticas
            - Monitoramento de atividades
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                ...commonSchemas.PaginationParams,
                {
                    name: "usuario_id",
                    in: "query",
                    description: "Filtrar por usuário",
                    schema: { type: "string" }
                },
                {
                    name: "evento",
                    in: "query",
                    description: "Filtrar por tipo de evento",
                    schema: { type: "string" }
                },
                {
                    name: "nivel",
                    in: "query",
                    description: "Filtrar por nível do log",
                    schema: { 
                        type: "string", 
                        enum: ["INFO", "WARNING", "ERROR", "CRITICAL"] 
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
                    description: "Lista de logs retornada com sucesso",
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
                                                    logs: {
                                                        type: "array",
                                                        items: { $ref: "#/components/schemas/Log" }
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
        }
    },
    "/api/logs/online-users": {
        get: {
            tags: ["Logs"],
            summary: "Usuários online",
            description: `
            Lista usuários atualmente online no sistema.
            
            **Restrições:**
            - Apenas administradores podem acessar
            - Mostra usuários com sessões ativas
            `,
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Lista de usuários online retornada com sucesso",
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
                                                    usuarios_online: {
                                                        type: "array",
                                                        items: {
                                                            type: "object",
                                                            properties: {
                                                                usuario_id: { type: "string" },
                                                                nome: { type: "string" },
                                                                ultima_atividade: { type: "string", format: "date-time" }
                                                            }
                                                        }
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
                401: { $ref: "#/components/responses/Unauthorized" },
                403: { $ref: "#/components/responses/Forbidden" },
                500: { $ref: "#/components/responses/InternalServerError" }
            }
        }
    },
    "/api/logs/usuario/{userId}": {
        get: {
            tags: ["Logs"],
            summary: "Obter logs de um usuário específico",
            description: `
            Retorna logs de atividades de um usuário específico.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "userId",
                    in: "path",
                    required: true,
                    description: "ID do usuário",
                    schema: { type: "string" }
                },
                ...commonSchemas.PaginationParams
            ],
            responses: {
                200: {
                    description: "Logs do usuário retornados com sucesso",
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
                                                    logs: {
                                                        type: "array",
                                                        items: { $ref: "#/components/schemas/Log" }
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
                404: { $ref: "#/components/responses/NotFound" },
                500: { $ref: "#/components/responses/InternalServerError" }
            }
        }
    },
    "/api/logs/atividade-recente": {
        get: {
            tags: ["Logs"],
            summary: "Atividade recente do sistema",
            description: `
            Retorna as atividades mais recentes do sistema.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "limite",
                    in: "query",
                    description: "Número máximo de registros",
                    schema: { type: "integer", default: 20, maximum: 100 }
                }
            ],
            responses: {
                200: {
                    description: "Atividades recentes retornadas com sucesso",
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
                                                    atividades: {
                                                        type: "array",
                                                        items: { $ref: "#/components/schemas/Log" }
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
                401: { $ref: "#/components/responses/Unauthorized" },
                403: { $ref: "#/components/responses/Forbidden" },
                500: { $ref: "#/components/responses/InternalServerError" }
            }
        }
    },
    "/api/logs/estatisticas": {
        get: {
            tags: ["Logs"],
            summary: "Estatísticas dos logs",
            description: `
            Retorna estatísticas e métricas dos logs do sistema.
            `,
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Estatísticas dos logs retornadas com sucesso",
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
                                                    total_logs: { type: "integer" },
                                                    logs_por_nivel: {
                                                        type: "object",
                                                        properties: {
                                                            INFO: { type: "integer" },
                                                            WARNING: { type: "integer" },
                                                            ERROR: { type: "integer" },
                                                            CRITICAL: { type: "integer" }
                                                        }
                                                    },
                                                    usuarios_ativos_hoje: { type: "integer" },
                                                    eventos_mais_frequentes: {
                                                        type: "array",
                                                        items: {
                                                            type: "object",
                                                            properties: {
                                                                evento: { type: "string" },
                                                                count: { type: "integer" }
                                                            }
                                                        }
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
                401: { $ref: "#/components/responses/Unauthorized" },
                403: { $ref: "#/components/responses/Forbidden" },
                500: { $ref: "#/components/responses/InternalServerError" }
            }
        }
    }
};

export default logsRoutes;
