import commonSchemas from "../schemas/common.js";

const dashboardRoutes = {
    "/categorias": {
        get: {
            tags: ["Dashboard"],
            summary: "Obter resumo das categorias de produtos",
            description: `
            Retorna um resumo estatístico com a contagem de produtos em cada categoria.
            
            **Funcionalidades:**
            - Contagem total de produtos por categoria (A, B, C)
            - Descrição das faixas de preço de cada categoria
            - Dados agregados para dashboard e relatórios
            - Filtro automático por produtos ativos
            
            **Categorias:**
            - **A**: Alta (R$ 1.001,00 - R$ 10.000,00)
            - **B**: Média (R$ 500,00 - R$ 1.000,00)  
            - **C**: Baixa (R$ 0,00 - R$ 499,00)
            `,
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Resumo das categorias retornado com sucesso",
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
                                        type: "object",
                                        properties: {
                                            categoria_A: {
                                                type: "object",
                                                properties: {
                                                    count: {
                                                        type: "integer",
                                                        example: 15,
                                                        description: "Quantidade de produtos na categoria A"
                                                    },
                                                    descricao: {
                                                        type: "string",
                                                        example: "Alta (R$ 1.001,00 - R$ 10.000,00)",
                                                        description: "Descrição da faixa de preço"
                                                    }
                                                }
                                            },
                                            categoria_B: {
                                                type: "object",
                                                properties: {
                                                    count: {
                                                        type: "integer",
                                                        example: 23,
                                                        description: "Quantidade de produtos na categoria B"
                                                    },
                                                    descricao: {
                                                        type: "string",
                                                        example: "Média (R$ 500,00 - R$ 1.000,00)",
                                                        description: "Descrição da faixa de preço"
                                                    }
                                                }
                                            },
                                            categoria_C: {
                                                type: "object",
                                                properties: {
                                                    count: {
                                                        type: "integer",
                                                        example: 42,
                                                        description: "Quantidade de produtos na categoria C"
                                                    },
                                                    descricao: {
                                                        type: "string",
                                                        example: "Baixa (R$ 0,00 - R$ 499,00)",
                                                        description: "Descrição da faixa de preço"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        }
    },
    "/categorias/categoria-a": {
        get: {
            tags: ["Dashboard"],
            summary: "Obter todos os produtos da categoria A",
            description: `
            Retorna todos os produtos ativos da categoria A (preço entre R$ 1.001,00 - R$ 10.000,00).
            
            **Funcionalidades:**
            - Lista completa de produtos da categoria A
            - Dados enriquecidos com nome do fornecedor
            - Filtro automático por produtos ativos
            - Informações de estoque e preços
            - Ideal para dashboards e análises de produtos premium
            
            **Categoria A:**
            - Faixa de preço: R$ 1.001,00 - R$ 10.000,00
            - Produtos de alto valor agregado
            - Geralmente itens premium ou de alta performance
            `,
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Lista de produtos da categoria A retornada com sucesso",
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
                                        type: "object",
                                        properties: {
                                            categoria: {
                                                type: "string",
                                                example: "A",
                                                description: "Código da categoria"
                                            },
                                            descricao: {
                                                type: "string",
                                                example: "Alta (R$ 1.001,00 - R$ 10.000,00)",
                                                description: "Descrição da faixa de preço"
                                            },
                                            total: {
                                                type: "integer",
                                                example: 15,
                                                description: "Total de produtos encontrados"
                                            },
                                            produtos: {
                                                type: "array",
                                                items: {
                                                    $ref: "#/components/schemas/Produto"
                                                },
                                                description: "Lista de produtos da categoria A"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Nenhum produto encontrado na categoria A",
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
    "/categorias/categoria-b": {
        get: {
            tags: ["Dashboard"],
            summary: "Obter todos os produtos da categoria B",
            description: `
            Retorna todos os produtos ativos da categoria B (preço entre R$ 500,00 - R$ 1.000,00).
            
            **Funcionalidades:**
            - Lista completa de produtos da categoria B
            - Dados enriquecidos com nome do fornecedor
            - Filtro automático por produtos ativos
            - Informações de estoque e preços
            - Ideal para análises de produtos de valor médio
            
            **Categoria B:**
            - Faixa de preço: R$ 500,00 - R$ 1.000,00
            - Produtos de valor intermediário
            - Equilíbrio entre custo e qualidade
            `,
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Lista de produtos da categoria B retornada com sucesso",
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
                                        type: "object",
                                        properties: {
                                            categoria: {
                                                type: "string",
                                                example: "B",
                                                description: "Código da categoria"
                                            },
                                            descricao: {
                                                type: "string",
                                                example: "Média (R$ 500,00 - R$ 1.000,00)",
                                                description: "Descrição da faixa de preço"
                                            },
                                            total: {
                                                type: "integer",
                                                example: 23,
                                                description: "Total de produtos encontrados"
                                            },
                                            produtos: {
                                                type: "array",
                                                items: {
                                                    $ref: "#/components/schemas/Produto"
                                                },
                                                description: "Lista de produtos da categoria B"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Nenhum produto encontrado na categoria B",
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
    "/categorias/categoria-c": {
        get: {
            tags: ["Dashboard"],
            summary: "Obter todos os produtos da categoria C",
            description: `
            Retorna todos os produtos ativos da categoria C (preço entre R$ 0,00 - R$ 499,00).
            
            **Funcionalidades:**
            - Lista completa de produtos da categoria C
            - Dados enriquecidos com nome do fornecedor
            - Filtro automático por produtos ativos
            - Informações de estoque e preços
            - Ideal para análises de produtos de entrada/básicos
            
            **Categoria C:**
            - Faixa de preço: R$ 0,00 - R$ 499,00
            - Produtos de menor valor
            - Itens básicos e acessórios de entrada
            `,
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Lista de produtos da categoria C retornada com sucesso",
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
                                        type: "object",
                                        properties: {
                                            categoria: {
                                                type: "string",
                                                example: "C",
                                                description: "Código da categoria"
                                            },
                                            descricao: {
                                                type: "string",
                                                example: "Baixa (R$ 0,00 - R$ 499,00)",
                                                description: "Descrição da faixa de preço"
                                            },
                                            total: {
                                                type: "integer",
                                                example: 42,
                                                description: "Total de produtos encontrados"
                                            },
                                            produtos: {
                                                type: "array",
                                                items: {
                                                    $ref: "#/components/schemas/Produto"
                                                },
                                                description: "Lista de produtos da categoria C"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Nenhum produto encontrado na categoria C",
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
    }
};

export default dashboardRoutes;
