const produtosRoutes = {
    "/api/produtos": {
        get: {
            tags: ["Produtos"],
            summary: "Lista todos os produtos",
            description: `
            Lista todos os produtos cadastrados no sistema com suporte a paginação e filtros.
            
            **Funcionalidades:**
            - Paginação automática
            - Filtros por categoria, fornecedor, status
            - Busca por nome ou código
            - Ordenação customizável
            - Controle de acesso por perfil
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
                    name: "nome",
                    in: "query",
                    description: "Filtrar por nome do produto (busca parcial)",
                    schema: { type: "string", example: "notebook" }
                },
                {
                    name: "codigo",
                    in: "query",
                    description: "Filtrar por código do produto",
                    schema: { type: "string", example: "NB001" }
                },
                {
                    name: "categoria",
                    in: "query",
                    description: "Filtrar por categoria",
                    schema: { type: "string", example: "Eletrônicos" }
                },
                {
                    name: "fornecedor",
                    in: "query",
                    description: "Filtrar por ID do fornecedor",
                    schema: { type: "string", example: "60d5ecb54b24a12a5c8e4f1b" }
                }
            ],
            responses: {
                200: {
                    description: "Lista de produtos retornada com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/PaginatedResponse"
                            }
                        }
                    }
                },
                401: {
                    description: "Token de acesso inválido",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                500: {
                    description: "Erro interno do servidor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                }
            }
        },
        post: {
            tags: ["Produtos"],
            summary: "Cadastrar novo produto",
            description: `
            Cadastra um novo produto no sistema.
            
            **Validações:**
            - Nome é obrigatório
            - Código deve ser único
            - Preço deve ser maior que zero
            - Fornecedor deve existir
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["nome", "codigo", "preco_unitario"],
                            properties: {
                                nome: {
                                    type: "string",
                                    description: "Nome do produto",
                                    example: "Notebook Dell Inspiron 15",
                                    minLength: 2,
                                    maxLength: 100
                                },
                                codigo: {
                                    type: "string",
                                    description: "Código único do produto",
                                    example: "NB001",
                                    minLength: 1,
                                    maxLength: 20
                                },
                                categoria: {
                                    type: "string",
                                    description: "Categoria do produto",
                                    example: "Eletrônicos"
                                },
                                descricao: {
                                    type: "string",
                                    description: "Descrição detalhada do produto",
                                    example: "Notebook Dell Inspiron 15 com 8GB RAM e 256GB SSD"
                                },
                                preco_unitario: {
                                    type: "number",
                                    minimum: 0.01,
                                    description: "Preço unitário do produto",
                                    example: 2500.00
                                },
                                quantidade_estoque: {
                                    type: "integer",
                                    minimum: 0,
                                    description: "Quantidade inicial em estoque",
                                    example: 15,
                                    default: 0
                                },
                                fornecedor: {
                                    type: "string",
                                    description: "ID do fornecedor",
                                    example: "60d5ecb54b24a12a5c8e4f1b"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Produto cadastrado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: {
                                        type: "boolean",
                                        example: true
                                    },
                                    message: {
                                        type: "string",
                                        example: "Produto cadastrado com sucesso"
                                    },
                                    data: {
                                        $ref: "#/components/schemas/Produto"
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "Dados de entrada inválidos",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ValidationErrorResponse"
                            }
                        }
                    }
                },
                401: {
                    description: "Token de acesso inválido",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                409: {
                    description: "Código do produto já existe",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: {
                                        type: "boolean",
                                        example: false
                                    },
                                    message: {
                                        type: "string",
                                        example: "Código de produto já existe"
                                    }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: "Erro interno do servidor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                }
            }
        }
    },

    "/api/produtos/{id}": {
        get: {
            tags: ["Produtos"],
            summary: "Buscar produto por ID",
            description: "Retorna os dados de um produto específico pelo seu ID.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do produto",
                    schema: { type: "string", example: "60d5ecb54b24a12a5c8e4f1a" }
                }
            ],
            responses: {
                200: {
                    description: "Produto encontrado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: {
                                        type: "boolean",
                                        example: true
                                    },
                                    data: {
                                        $ref: "#/components/schemas/Produto"
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Produto não encontrado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                500: {
                    description: "Erro interno do servidor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                }
            }
        },
        put: {
            tags: ["Produtos"],
            summary: "Atualizar produto",
            description: "Atualiza os dados de um produto existente.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do produto",
                    schema: { type: "string", example: "60d5ecb54b24a12a5c8e4f1a" }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                nome: {
                                    type: "string",
                                    example: "Notebook Dell Inspiron 15 - Atualizado"
                                },
                                categoria: {
                                    type: "string",
                                    example: "Eletrônicos"
                                },
                                descricao: {
                                    type: "string",
                                    example: "Notebook Dell Inspiron 15 com 16GB RAM e 512GB SSD"
                                },
                                preco_unitario: {
                                    type: "number",
                                    example: 2800.00
                                },
                                fornecedor: {
                                    type: "string",
                                    example: "60d5ecb54b24a12a5c8e4f1b"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Produto atualizado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: {
                                        type: "boolean",
                                        example: true
                                    },
                                    message: {
                                        type: "string",
                                        example: "Produto atualizado com sucesso"
                                    },
                                    data: {
                                        $ref: "#/components/schemas/Produto"
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "Dados inválidos",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ValidationErrorResponse"
                            }
                        }
                    }
                },
                404: {
                    description: "Produto não encontrado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                500: {
                    description: "Erro interno do servidor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                }
            }
        },
        delete: {
            tags: ["Produtos"],
            summary: "Excluir produto",
            description: "Remove um produto do sistema.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do produto",
                    schema: { type: "string", example: "60d5ecb54b24a12a5c8e4f1a" }
                }
            ],
            responses: {
                200: {
                    description: "Produto excluído com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: {
                                        type: "boolean",
                                        example: true
                                    },
                                    message: {
                                        type: "string",
                                        example: "Produto excluído com sucesso"
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Produto não encontrado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                500: {
                    description: "Erro interno do servidor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                }
            }
        }
    },
    "/api/produtos/desativar/{id}": {
        patch: {
            tags: ["Produtos"],
            summary: "Desativar produto",
            description: `
            Desativa um produto sem removê-lo do sistema.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do produto",
                    schema: { type: "string", example: "60d5ecb54b24a12a5c8e4f1a" }
                }
            ],
            responses: {
                200: {
                    description: "Produto desativado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: {
                                        type: "boolean",
                                        example: true
                                    },
                                    message: {
                                        type: "string",
                                        example: "Produto desativado com sucesso"
                                    },
                                    data: {
                                        $ref: "#/components/schemas/Produto"
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Produto não encontrado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                500: {
                    description: "Erro interno do servidor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                }
            }
        }
    },
    "/api/produtos/reativar/{id}": {
        patch: {
            tags: ["Produtos"],
            summary: "Reativar produto",
            description: `
            Reativa um produto previamente desativado.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do produto",
                    schema: { type: "string", example: "60d5ecb54b24a12a5c8e4f1a" }
                }
            ],
            responses: {
                200: {
                    description: "Produto reativado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: {
                                        type: "boolean",
                                        example: true
                                    },
                                    message: {
                                        type: "string",
                                        example: "Produto reativado com sucesso"
                                    },
                                    data: {
                                        $ref: "#/components/schemas/Produto"
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Produto não encontrado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                500: {
                    description: "Erro interno do servidor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                }
            }
        }
    }
};

export default produtosRoutes;
