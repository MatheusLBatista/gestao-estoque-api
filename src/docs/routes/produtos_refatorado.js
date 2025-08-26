import commonSchemas from "../schemas/common.js";

const produtosRoutes = {
    "/api/produtos": {
        get: {
            tags: ["Produtos"],
            summary: "Lista todos os produtos",
            description: `
            Lista todos os produtos cadastrados no sistema com suporte a paginação e filtros avançados.
            
            **Funcionalidades:**
            - Paginação automática com mongoose-paginate-v2
            - Filtros por nome, categoria, fornecedor, status
            - Busca textual parcial
            - Ordenação customizável
            - Filtro por estoque baixo
            - Controle de acesso por perfil de usuário
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                ...commonSchemas.PaginationParams,
                {
                    name: "nome_produto",
                    in: "query",
                    description: "Filtrar por nome do produto (busca parcial, case-insensitive)",
                    schema: { type: "string", example: "pastilha" }
                },
                {
                    name: "categoria",
                    in: "query", 
                    description: "Filtrar por categoria",
                    schema: { type: "string", example: "Freios" }
                },
                {
                    name: "marca",
                    in: "query",
                    description: "Filtrar por marca",
                    schema: { type: "string", example: "Bosch" }
                },
                {
                    name: "codigo_produto",
                    in: "query",
                    description: "Filtrar por código do produto",
                    schema: { type: "string", example: "PF001" }
                },
                {
                    name: "id_fornecedor",
                    in: "query",
                    description: "Filtrar por ID do fornecedor",
                    schema: { type: "integer", example: 123 }
                },
                {
                    name: "status",
                    in: "query",
                    description: "Filtrar por status ativo",
                    schema: { type: "boolean", example: true }
                },
                {
                    name: "estoque_baixo",
                    in: "query",
                    description: "Filtrar produtos com estoque abaixo do mínimo",
                    schema: { type: "boolean", example: true }
                },
                {
                    name: "preco_min",
                    in: "query",
                    description: "Preço mínimo",
                    schema: { type: "number", example: 50.00 }
                },
                {
                    name: "preco_max",
                    in: "query",
                    description: "Preço máximo",
                    schema: { type: "number", example: 200.00 }
                }
            ],
            responses: {
                200: {
                    description: "Produtos listados com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ProdutoListResponse"
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        },
        post: {
            tags: ["Produtos"],
            summary: "Cadastrar novo produto",
            description: `
            Cadastra um novo produto no sistema com validação completa.
            
            **Validações:**
            - Nome e código únicos no sistema
            - Todos os campos obrigatórios preenchidos
            - Preços e quantidades não negativos
            - Fornecedor deve existir (validação por ID)
            - Código do produto deve ser único
            
            **Regras de Negócio:**
            - Estoque inicial pode ser zero
            - Status padrão é ativo (true)
            - Data de cadastro é automática
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ProdutoCreateRequest"
                        },
                        examples: {
                            "produto_completo": {
                                summary: "Produto com todos os campos",
                                value: {
                                    nome_produto: "Pastilha de Freio Dianteira",
                                    descricao: "Pastilha de freio dianteira para veículos sedans, compatível com Civic, Corolla",
                                    preco: 89.90,
                                    marca: "Bosch",
                                    custo: 45.00,
                                    categoria: "Freios",
                                    estoque: 25,
                                    estoque_min: 5,
                                    id_fornecedor: 123,
                                    codigo_produto: "PF001"
                                }
                            },
                            "produto_basico": {
                                summary: "Produto com campos obrigatórios",
                                value: {
                                    nome_produto: "Filtro de Óleo",
                                    preco: 25.90,
                                    custo: 12.00,
                                    categoria: "Filtros",
                                    estoque: 50,
                                    estoque_min: 10,
                                    id_fornecedor: 123,
                                    codigo_produto: "FO001"
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
                                $ref: "#/components/schemas/ProdutoResponse"
                            }
                        }
                    }
                },
                409: {
                    description: "Produto já cadastrado (nome ou código duplicado)",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        }
    },
    "/api/produtos/{id}": {
        get: {
            tags: ["Produtos"],
            summary: "Buscar produto por ID",
            description: `
            Busca um produto específico pelo seu ID único.
            
            **Retorna:**
            - Dados completos do produto
            - Informações do estoque atual
            - Dados do fornecedor associado
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do produto",
                    schema: {
                        type: "string",
                        example: "60d5ecb54b24a12a5c8e4f1a"
                    }
                }
            ],
            responses: {
                200: {
                    description: "Produto encontrado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ProdutoResponse"
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
                ...commonSchemas.CommonResponses
            }
        },
        put: {
            tags: ["Produtos"],
            summary: "Atualizar produto completo",
            description: `
            Atualiza todos os dados de um produto existente.
            
            **Validações:**
            - Produto deve existir
            - Nome e código únicos (exceto o próprio produto)
            - Campos obrigatórios não podem ser removidos
            - Preços e quantidades não negativos
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do produto",
                    schema: {
                        type: "string",
                        example: "60d5ecb54b24a12a5c8e4f1a"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ProdutoCreateRequest"
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
                                $ref: "#/components/schemas/ProdutoResponse"
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
                409: {
                    description: "Nome ou código já existe em outro produto",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        },
        patch: {
            tags: ["Produtos"],
            summary: "Atualizar produto parcialmente",
            description: `
            Atualiza campos específicos de um produto existente.
            
            **Funcionalidades:**
            - Atualização parcial de campos
            - Validação apenas dos campos enviados
            - Preservação dos campos não informados
            - Ideal para atualizações de estoque, preços, status
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do produto",
                    schema: {
                        type: "string",
                        example: "60d5ecb54b24a12a5c8e4f1a"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/ProdutoUpdateRequest"
                        },
                        examples: {
                            "atualizar_preco": {
                                summary: "Atualizar apenas preço",
                                value: {
                                    preco: 95.90
                                }
                            },
                            "atualizar_estoque": {
                                summary: "Atualizar estoque e estoque mínimo",
                                value: {
                                    estoque: 30,
                                    estoque_min: 8
                                }
                            },
                            "desativar_produto": {
                                summary: "Desativar produto",
                                value: {
                                    status: false
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
                                $ref: "#/components/schemas/ProdutoResponse"
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
                ...commonSchemas.CommonResponses
            }
        },
        delete: {
            tags: ["Produtos"],
            summary: "Excluir produto",
            description: `
            Remove um produto do sistema.
            
            **Validações:**
            - Produto deve existir
            - Verifica se não há movimentações ativas
            - Produto com estoque > 0 requer confirmação
            
            **Importante:**
            - Exclusão é física (remove do banco)
            - Para manter histórico, use PATCH para status=false
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do produto",
                    schema: {
                        type: "string",
                        example: "60d5ecb54b24a12a5c8e4f1a"
                    }
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
                409: {
                    description: "Produto não pode ser excluído (possui movimentações)",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        }
    },
    "/api/produtos/estoque-baixo": {
        get: {
            tags: ["Produtos"],
            summary: "Listar produtos com estoque baixo",
            description: `
            Lista produtos onde o estoque atual está abaixo ou igual ao estoque mínimo.
            
            **Funcionalidades:**
            - Filtro automático por estoque <= estoque_min
            - Ordenação por criticidade (menor estoque primeiro)
            - Suporte a paginação
            - Ideal para alertas e reposição
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                ...commonSchemas.PaginationParams
            ],
            responses: {
                200: {
                    description: "Produtos com estoque baixo listados",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ProdutoListResponse"
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        }
    },
    "/api/produtos/buscar": {
        get: {
            tags: ["Produtos"],
            summary: "Busca avançada de produtos",
            description: `
            Busca produtos com múltiplos critérios e filtros avançados.
            
            **Funcionalidades:**
            - Busca textual em múltiplos campos
            - Filtros combinados
            - Ordenação múltipla
            - Agregações e estatísticas
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                ...commonSchemas.PaginationParams,
                {
                    name: "q",
                    in: "query",
                    description: "Termo de busca (nome, código, descrição)",
                    schema: { type: "string", example: "freio bosch" }
                },
                {
                    name: "categorias",
                    in: "query",
                    description: "Lista de categorias separadas por vírgula",
                    schema: { type: "string", example: "Freios,Filtros,Suspensão" }
                },
                {
                    name: "ordenar_por",
                    in: "query",
                    description: "Campo de ordenação",
                    schema: { 
                        type: "string", 
                        enum: ["nome_produto", "preco", "estoque", "categoria", "data_cadastro"],
                        example: "preco"
                    }
                },
                {
                    name: "ordem",
                    in: "query",
                    description: "Direção da ordenação",
                    schema: { 
                        type: "string", 
                        enum: ["asc", "desc"],
                        example: "asc"
                    }
                }
            ],
            responses: {
                200: {
                    description: "Resultados da busca",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/ProdutoListResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            filtros_aplicados: {
                                                type: "object",
                                                description: "Resumo dos filtros aplicados"
                                            },
                                            estatisticas: {
                                                type: "object",
                                                properties: {
                                                    valor_total_estoque: {
                                                        type: "number",
                                                        example: 15750.50
                                                    },
                                                    categorias_encontradas: {
                                                        type: "integer",
                                                        example: 5
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
                ...commonSchemas.CommonResponses
            }
        }
    }
};

export default produtosRoutes;
