const produtosSchemas = {
    // Schema básico do produto
    Produto: {
        type: "object",
        properties: {
            _id: {
                type: "string",
                description: "ID único do produto",
                example: "60d5ecb74f8e4b2b3c8d6e7f"
            },
            nome: {
                type: "string",
                description: "Nome do produto",
                example: "Pastilha de Freio Dianteira"
            },
            categoria: {
                type: "string",
                description: "Categoria do produto",
                example: "Freios"
            },
            codigo: {
                type: "string",
                description: "Código único do produto",
                example: "PF001"
            },
            preco: {
                type: "number",
                description: "Preço unitário do produto",
                example: 89.90
            },
            quantidade: {
                type: "integer",
                description: "Quantidade em estoque",
                example: 25
            },
            estoqueMinimo: {
                type: "integer",
                description: "Estoque mínimo para alertas",
                example: 5
            },
            ativo: {
                type: "boolean",
                description: "Status do produto",
                example: true
            },
            fornecedor: {
                "$ref": "#/components/schemas/FornecedorBasico"
            },
            createdAt: {
                type: "string",
                format: "date-time",
                description: "Data de criação",
                example: "2024-01-15T10:30:00.000Z"
            },
            updatedAt: {
                type: "string",
                format: "date-time",
                description: "Data da última atualização",
                example: "2024-01-15T15:45:00.000Z"
            }
        }
    },

    // Schema para criação de produto
    ProdutoCreate: {
        type: "object",
        properties: {
            nome: {
                type: "string",
                description: "Nome do produto",
                example: "Pastilha de Freio Dianteira",
                minLength: 3,
                maxLength: 100
            },
            categoria: {
                type: "string",
                description: "Categoria do produto",
                example: "Freios"
            },
            codigo: {
                type: "string",
                description: "Código único do produto",
                example: "PF001"
            },
            preco: {
                type: "number",
                description: "Preço unitário do produto",
                example: 89.90,
                minimum: 0
            },
            quantidade: {
                type: "integer",
                description: "Quantidade inicial em estoque",
                example: 25,
                minimum: 0
            },
            estoqueMinimo: {
                type: "integer",
                description: "Estoque mínimo para alertas",
                example: 5,
                minimum: 0
            },
            fornecedorId: {
                type: "string",
                description: "ID do fornecedor",
                example: "60d5ecb74f8e4b2b3c8d6e80"
            }
        },
        required: ["nome", "categoria", "codigo", "preco", "quantidade", "estoqueMinimo", "fornecedorId"]
    },

    // Schema para atualização de produto
    ProdutoUpdate: {
        type: "object",
        properties: {
            nome: {
                type: "string",
                description: "Nome do produto",
                example: "Pastilha de Freio Dianteira Melhorada",
                minLength: 3,
                maxLength: 100
            },
            categoria: {
                type: "string",
                description: "Categoria do produto",
                example: "Freios"
            },
            preco: {
                type: "number",
                description: "Preço unitário do produto",
                example: 95.90,
                minimum: 0
            },
            estoqueMinimo: {
                type: "integer",
                description: "Estoque mínimo para alertas",
                example: 10,
                minimum: 0
            },
            fornecedorId: {
                type: "string",
                description: "ID do fornecedor",
                example: "60d5ecb74f8e4b2b3c8d6e80"
            }
        }
    },

    // Schema para lista paginada de produtos
    ProdutosList: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Produtos listados com sucesso"
            },
            produtos: {
                type: "array",
                items: {
                    "$ref": "#/components/schemas/Produto"
                }
            },
            total: {
                type: "integer",
                description: "Total de produtos encontrados",
                example: 150
            },
            page: {
                type: "integer",
                description: "Página atual",
                example: 1
            },
            limit: {
                type: "integer",
                description: "Limite de itens por página",
                example: 10
            },
            totalPages: {
                type: "integer",
                description: "Total de páginas",
                example: 15
            }
        }
    },

    // Schema para produtos com estoque baixo
    ProdutosEstoqueBaixo: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Produtos com estoque baixo listados com sucesso"
            },
            produtos: {
                type: "array",
                items: {
                    "$ref": "#/components/schemas/Produto"
                }
            },
            total: {
                type: "integer",
                description: "Total de produtos com estoque baixo",
                example: 5
            }
        }
    },

    // Schema para resposta de produto único
    ProdutoResponse: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Produto encontrado com sucesso"
            },
            produto: {
                "$ref": "#/components/schemas/Produto"
            }
        }
    },

    // Schema para resposta de criação de produto
    ProdutoCreateResponse: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Produto cadastrado com sucesso"
            },
            produto: {
                "$ref": "#/components/schemas/Produto"
            }
        }
    },

    // Schema básico do fornecedor para uso em produtos
    FornecedorBasico: {
        type: "object",
        properties: {
            _id: {
                type: "string",
                description: "ID do fornecedor",
                example: "60d5ecb74f8e4b2b3c8d6e80"
            },
            nome_fornecedor: {
                type: "string",
                description: "Nome do fornecedor",
                example: "Auto Peças Sul"
            },
            cnpj: {
                type: "string",
                description: "CNPJ do fornecedor",
                example: "12.345.678/0001-90"
            }
        }
    }
};

export default produtosSchemas;
