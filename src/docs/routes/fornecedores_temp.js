import commonSchemas from "../schemas/common.js";

const fornecedoresRoutes = {
    "/api/fornecedores": {
        get: {
            tags: ["Fornecedores"],
            summary: "Lista todos os fornecedores",
            description: `
            Lista todos os fornecedores cadastrados no sistema com suporte a paginação e filtros.
            
            **Funcionalidades:**
            - Paginação automática
            - Filtros por status, nome, CNPJ
            - Busca por texto
            - Ordenação customizável
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                ...commonSchemas.PaginationParams,
                {
                    name: "nome",
                    in: "query",
                    description: "Filtrar por nome do fornecedor",
                    schema: { type: "string", example: "Auto Peças Sul" }
                },
                {
                    name: "cnpj",
                    in: "query",
                    description: "Filtrar por CNPJ",
                    schema: { type: "string", example: "12.345.678/0001-90" }
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
                    description: "Lista de fornecedores retornada com sucesso",
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
                                                    fornecedores: {
                                                        type: "array",
                                                        items: { $ref: "#/components/schemas/Fornecedor" }
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
            tags: ["Fornecedores"],
            summary: "Cadastrar novo fornecedor",
            description: `
            Cadastra um novo fornecedor no sistema.
            
            **Funcionalidades:**
            - Validação de CNPJ único
            - Validação de dados obrigatórios
            - Registro automático de logs
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/FornecedorInput" }
                    }
                }
            },
            responses: {
                201: {
                    description: "Fornecedor criado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: { $ref: "#/components/schemas/Fornecedor" }
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
    "/api/fornecedores/{id}": {
        get: {
            tags: ["Fornecedores"],
            summary: "Buscar fornecedor por ID",
            description: `
            Retorna os detalhes de um fornecedor específico pelo seu ID.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do fornecedor",
                    schema: { type: "string" }
                }
            ],
            responses: {
                200: {
                    description: "Fornecedor encontrado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: { $ref: "#/components/schemas/Fornecedor" }
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
        put: {
            tags: ["Fornecedores"],
            summary: "Atualizar fornecedor",
            description: `
            Atualiza as informações de um fornecedor existente.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do fornecedor",
                    schema: { type: "string" }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/FornecedorInput" }
                    }
                }
            },
            responses: {
                200: {
                    description: "Fornecedor atualizado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: { $ref: "#/components/schemas/Fornecedor" }
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
            tags: ["Fornecedores"],
            summary: "Excluir fornecedor",
            description: `
            Remove um fornecedor do sistema permanentemente.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do fornecedor",
                    schema: { type: "string" }
                }
            ],
            responses: {
                204: { description: "Fornecedor excluído com sucesso" },
                400: { $ref: "#/components/responses/BadRequest" },
                401: { $ref: "#/components/responses/Unauthorized" },
                403: { $ref: "#/components/responses/Forbidden" },
                404: { $ref: "#/components/responses/NotFound" },
                500: { $ref: "#/components/responses/InternalServerError" }
            }
        }
    },
    "/api/fornecedores/desativar/{id}": {
        patch: {
            tags: ["Fornecedores"],
            summary: "Desativar fornecedor",
            description: `
            Desativa um fornecedor sem removê-lo do sistema.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do fornecedor",
                    schema: { type: "string" }
                }
            ],
            responses: {
                200: {
                    description: "Fornecedor desativado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: { $ref: "#/components/schemas/Fornecedor" }
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
    "/api/fornecedores/reativar/{id}": {
        patch: {
            tags: ["Fornecedores"],
            summary: "Reativar fornecedor",
            description: `
            Reativa um fornecedor previamente desativado.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do fornecedor",
                    schema: { type: "string" }
                }
            ],
            responses: {
                200: {
                    description: "Fornecedor reativado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/SuccessResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: { $ref: "#/components/schemas/Fornecedor" }
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

export default fornecedoresRoutes;
