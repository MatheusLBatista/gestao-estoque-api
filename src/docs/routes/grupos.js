import commonSchemas from "../schemas/common.js";

const gruposRoutes = {
    "/api/grupos": {
        get: {
            tags: ["Grupos"],
            summary: "Lista todos os grupos",
            description: `
            Lista todos os grupos cadastrados no sistema com suporte a paginação e filtros.
            
            **Funcionalidades:**
            - Paginação automática
            - Filtros por nome, status
            - Busca por texto
            - Ordenação customizável
            - Controle de permissões
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                ...commonSchemas.PaginationParams,
                {
                    name: "nome",
                    in: "query",
                    description: "Filtrar por nome do grupo (busca parcial)",
                    schema: { type: "string", example: "admin" }
                },
                {
                    name: "ativo",
                    in: "query",
                    description: "Filtrar por status",
                    schema: { type: "boolean", example: true }
                }
            ],
            responses: {
                200: {
                    description: "Lista de grupos retornada com sucesso",
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
                                                    grupos: {
                                                        type: "array",
                                                        items: { $ref: "#/components/schemas/Grupo" }
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
            tags: ["Grupos"],
            summary: "Criar novo grupo",
            description: `
            Cria um novo grupo no sistema com as permissões especificadas.
            
            **Regras de negócio:**
            - Nome do grupo deve ser único
            - Apenas administradores podem criar grupos
            - Permissões devem ser válidas
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/GrupoInput" }
                    }
                }
            },
            responses: {
                201: {
                    description: "Grupo criado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: { $ref: "#/components/schemas/Grupo" }
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
                409: { $ref: "#/components/responses/Conflict" },
                500: { $ref: "#/components/responses/InternalServerError" }
            }
        }
    },
    "/api/grupos/{id}": {
        get: {
            tags: ["Grupos"],
            summary: "Buscar grupo por ID",
            description: `
            Retorna os detalhes de um grupo específico pelo seu ID.
            
            **Informações retornadas:**
            - Dados básicos do grupo
            - Lista completa de permissões
            - Histórico de atualizações
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do grupo",
                    schema: { type: "string", example: "60f7b3b3b3b3b3b3b3b3b3b3" }
                }
            ],
            responses: {
                200: {
                    description: "Grupo encontrado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: { $ref: "#/components/schemas/Grupo" }
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
            tags: ["Grupos"],
            summary: "Atualizar grupo",
            description: `
            Atualiza as informações de um grupo existente.
            
            **Funcionalidades:**
            - Atualização parcial de campos
            - Validação de permissões
            - Log de auditoria automático
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do grupo",
                    schema: { type: "string", example: "60f7b3b3b3b3b3b3b3b3b3b3" }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/GrupoUpdate" }
                    }
                }
            },
            responses: {
                200: {
                    description: "Grupo atualizado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: { $ref: "#/components/schemas/Grupo" }
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
                409: { $ref: "#/components/responses/Conflict" },
                500: { $ref: "#/components/responses/InternalServerError" }
            }
        },
        delete: {
            tags: ["Grupos"],
            summary: "Excluir grupo",
            description: `
            Remove um grupo do sistema permanentemente.
            
            **Validações:**
            - Grupo não pode ter usuários associados
            - Apenas administradores podem excluir grupos
            - Operação irreversível
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do grupo",
                    schema: { type: "string", example: "60f7b3b3b3b3b3b3b3b3b3b3" }
                }
            ],
            responses: {
                204: { description: "Grupo excluído com sucesso" },
                400: { $ref: "#/components/responses/BadRequest" },
                401: { $ref: "#/components/responses/Unauthorized" },
                403: { $ref: "#/components/responses/Forbidden" },
                404: { $ref: "#/components/responses/NotFound" },
                409: { $ref: "#/components/responses/Conflict" },
                500: { $ref: "#/components/responses/InternalServerError" }
            }
        }
    },
    "/api/grupos/desativar/{id}": {
        patch: {
            tags: ["Grupos"],
            summary: "Desativar grupo",
            description: `
            Desativa um grupo sem removê-lo do sistema.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do grupo",
                    schema: { type: "string", example: "60f7b3b3b3b3b3b3b3b3b3b3" }
                }
            ],
            responses: {
                200: {
                    description: "Grupo desativado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: { $ref: "#/components/schemas/Grupo" }
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
    "/api/grupos/{id}/ativar": {
        patch: {
            tags: ["Grupos"],
            summary: "Ativar grupo",
            description: `
            Ativa um grupo previamente desativado.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do grupo",
                    schema: { type: "string", example: "60f7b3b3b3b3b3b3b3b3b3b3" }
                }
            ],
            responses: {
                200: {
                    description: "Grupo ativado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: { $ref: "#/components/schemas/Grupo" }
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
    "/api/grupos/{id}/permissoes": {
        post: {
            tags: ["Grupos"],
            summary: "Adicionar permissão ao grupo",
            description: `
            Adiciona uma nova permissão a um grupo específico.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do grupo",
                    schema: { type: "string", example: "60f7b3b3b3b3b3b3b3b3b3b3" }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["permissao"],
                            properties: {
                                permissao: {
                                    type: "string",
                                    description: "Nome da permissão",
                                    example: "ADMIN_PRODUTOS"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Permissão adicionada com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: { $ref: "#/components/schemas/Grupo" }
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
        delete: {
            tags: ["Grupos"],
            summary: "Remover permissão do grupo",
            description: `
            Remove uma permissão específica de um grupo.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do grupo",
                    schema: { type: "string", example: "60f7b3b3b3b3b3b3b3b3b3b3" }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["permissao"],
                            properties: {
                                permissao: {
                                    type: "string",
                                    description: "Nome da permissão",
                                    example: "ADMIN_PRODUTOS"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Permissão removida com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: { $ref: "#/components/schemas/Grupo" }
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
    }
};

export default gruposRoutes;
