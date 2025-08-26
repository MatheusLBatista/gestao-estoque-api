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
                    name: "nome_fornecedor",
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
                    description: "Fornecedores listados com sucesso",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/FornecedoresList" }
                        }
                    }
                },
                401: { $ref: "#/components/responses/Unauthorized" },
                403: { $ref: "#/components/responses/Forbidden" },
                500: { $ref: "#/components/responses/InternalServerError" }
            }
        },
        post: {
            tags: ["Fornecedores"],
            summary: "Cadastra novo fornecedor",
            description: `
            Cadastra um novo fornecedor no sistema.
            
            **Funcionalidades:**
            - Validação de CNPJ único
            - Validação de dados obrigatórios
            - Formatação automática de dados
            - Registro automático de logs
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { "$ref": "#/components/schemas/FornecedorCreate" }
                    }
                }
            },
            responses: {
                201: {
                    description: "Fornecedor cadastrado com sucesso",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/FornecedorCreateResponse" }
                        }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                409: {
                    description: "CNPJ já cadastrado",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "CNPJ já está cadastrado no sistema"
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

    "/api/fornecedores/{id}": {
        get: {
            tags: ["Fornecedores"],
            summary: "Busca fornecedor por ID",
            description: "Retorna os dados de um fornecedor específico pelo seu ID.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do fornecedor",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e80" }
                }
            ],
            responses: {
                200: {
                    description: "Fornecedor encontrado com sucesso",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/FornecedorResponse" }
                        }
                    }
                },
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                500: commonResponses[500]()
            }
        },
        put: {
            tags: ["Fornecedores"],
            summary: "Atualiza fornecedor",
            description: `
            Atualiza os dados de um fornecedor existente.
            
            **Funcionalidades:**
            - Atualização de dados de contato
            - Validação de dados
            - Preservação do CNPJ original
            - Registro de logs de alteração
            
            **Nota:** O CNPJ não pode ser alterado após o cadastro.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do fornecedor",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e80" }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { "$ref": "#/components/schemas/FornecedorUpdate" }
                    }
                }
            },
            responses: {
                200: {
                    description: "Fornecedor atualizado com sucesso",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/FornecedorUpdateResponse" }
                        }
                    }
                },
                400: commonResponses[400](),
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                422: commonResponses[422](),
                500: commonResponses[500]()
            }
        },
        delete: {
            tags: ["Fornecedores"],
            summary: "Exclui fornecedor",
            description: `
            Exclui um fornecedor do sistema.
            
            **Funcionalidades:**
            - Verificação de produtos associados
            - Exclusão lógica se houver dependências
            - Exclusão física se não houver produtos
            - Registro de logs
            
            **Regra:** Fornecedores com produtos associados não podem ser excluídos.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do fornecedor",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e80" }
                }
            ],
            responses: {
                200: {
                    description: "Fornecedor excluído com sucesso",
                    content: {
                        "application/json": {
                            schema: { "$ref": "#/components/schemas/FornecedorDeleteResponse" }
                        }
                    }
                },
                401: commonResponses[401](),
                403: commonResponses[403](),
                404: commonResponses[404](),
                409: {
                    description: "Fornecedor possui produtos associados",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Fornecedor não pode ser excluído pois possui produtos associados"
                                    },
                                    produtosAssociados: {
                                        type: "integer",
                                        example: 5
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

    "/api/fornecedores/desativar/{id}": {
        patch: {
            tags: ["Fornecedores"],
            summary: "Desativa fornecedor",
            description: `
            Desativa um fornecedor do sistema (desativação lógica).
            
            **Funcionalidades:**
            - Marca fornecedor como inativo
            - Preserva histórico de atividades
            - Registra ação nos logs do sistema
            - Mantém integridade referencial
            
            **Permissões:** Apenas administradores podem desativar fornecedores.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do fornecedor a ser desativado",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e80" }
                }
            ],
            responses: {
                200: {
                    description: "Fornecedor desativado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Fornecedor desativado com sucesso"
                                    },
                                    fornecedor: {
                                        "$ref": "#/components/schemas/FornecedorResponse"
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

    "/api/fornecedores/reativar/{id}": {
        patch: {
            tags: ["Fornecedores"],
            summary: "Reativa fornecedor",
            description: `
            Reativa um fornecedor que estava desativado no sistema.
            
            **Funcionalidades:**
            - Marca fornecedor como ativo novamente
            - Permite novas operações comerciais
            - Registra ação nos logs do sistema
            - Reestabelece relacionamentos comerciais
            
            **Permissões:** Apenas administradores podem reativar fornecedores.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do fornecedor a ser reativado",
                    schema: { type: "string", example: "60d5ecb74f8e4b2b3c8d6e80" }
                }
            ],
            responses: {
                200: {
                    description: "Fornecedor reativado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Fornecedor reativado com sucesso"
                                    },
                                    fornecedor: {
                                        "$ref": "#/components/schemas/FornecedorResponse"
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

export default fornecedoresRoutes;
