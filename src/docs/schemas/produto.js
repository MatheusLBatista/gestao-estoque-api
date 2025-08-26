const produtoSchemas = {
    // Schema básico do produto alinhado com o model
    Produto: {
        type: 'object',
        properties: {
            _id: {
                type: 'string',
                description: 'ID único do produto',
                example: '60d5ecb54b24a12a5c8e4f1a'
            },
            nome_produto: {
                type: 'string',
                description: 'Nome do produto',
                example: 'Pastilha de Freio Dianteira',
                maxLength: 255
            },
            descricao: {
                type: 'string',
                description: 'Descrição detalhada do produto',
                example: 'Pastilha de freio dianteira para veículos sedans',
                maxLength: 1000
            },
            preco: {
                type: 'number',
                description: 'Preço de venda do produto',
                example: 89.90,
                minimum: 0
            },
            marca: {
                type: 'string',
                description: 'Marca do produto',
                example: 'Bosch',
                maxLength: 100
            },
            custo: {
                type: 'number',
                description: 'Custo do produto',
                example: 45.00,
                minimum: 0
            },
            categoria: {
                type: 'string',
                description: 'Categoria do produto',
                example: 'Freios',
                maxLength: 100
            },
            estoque: {
                type: 'number',
                description: 'Quantidade atual em estoque',
                example: 25,
                minimum: 0
            },
            estoque_min: {
                type: 'number',
                description: 'Estoque mínimo para alertas',
                example: 5,
                minimum: 0
            },
            data_ultima_entrada: {
                type: 'string',
                format: 'date-time',
                description: 'Data da última entrada no estoque',
                example: '2024-01-15T10:30:00.000Z'
            },
            status: {
                type: 'boolean',
                description: 'Status ativo do produto',
                example: true
            },
            id_fornecedor: {
                type: 'number',
                description: 'ID numérico do fornecedor',
                example: 123
            },
            codigo_produto: {
                type: 'string',
                description: 'Código único do produto',
                example: 'PF001',
                maxLength: 50
            },
            data_cadastro: {
                type: 'string',
                format: 'date-time',
                description: 'Data de criação do produto',
                example: '2024-01-15T10:30:00.000Z'
            },
            data_ultima_atualizacao: {
                type: 'string',
                format: 'date-time',
                description: 'Data da última atualização',
                example: '2024-01-15T15:45:00.000Z'
            }
        }
    },

    // Schema para criação de produto
    ProdutoCreateRequest: {
        type: 'object',
        required: ['nome_produto', 'preco', 'custo', 'categoria', 'estoque', 'estoque_min', 'id_fornecedor', 'codigo_produto'],
        properties: {
            nome_produto: {
                type: 'string',
                description: 'Nome do produto',
                example: 'Pastilha de Freio Dianteira',
                minLength: 3,
                maxLength: 255
            },
            descricao: {
                type: 'string',
                description: 'Descrição detalhada do produto',
                example: 'Pastilha de freio dianteira para veículos sedans',
                maxLength: 1000
            },
            preco: {
                type: 'number',
                description: 'Preço de venda do produto',
                example: 89.90,
                minimum: 0.01
            },
            marca: {
                type: 'string',
                description: 'Marca do produto',
                example: 'Bosch',
                maxLength: 100
            },
            custo: {
                type: 'number',
                description: 'Custo do produto',
                example: 45.00,
                minimum: 0
            },
            categoria: {
                type: 'string',
                description: 'Categoria do produto',
                example: 'Freios',
                minLength: 2,
                maxLength: 100
            },
            estoque: {
                type: 'number',
                description: 'Quantidade inicial em estoque',
                example: 25,
                minimum: 0
            },
            estoque_min: {
                type: 'number',
                description: 'Estoque mínimo para alertas',
                example: 5,
                minimum: 0
            },
            id_fornecedor: {
                type: 'number',
                description: 'ID numérico do fornecedor',
                example: 123
            },
            codigo_produto: {
                type: 'string',
                description: 'Código único do produto',
                example: 'PF001',
                minLength: 2,
                maxLength: 50
            }
        }
    },

    // Schema para atualização de produto
    ProdutoUpdateRequest: {
        type: 'object',
        properties: {
            nome_produto: {
                type: 'string',
                description: 'Nome do produto',
                example: 'Pastilha de Freio Dianteira Melhorada',
                minLength: 3,
                maxLength: 255
            },
            descricao: {
                type: 'string',
                description: 'Descrição detalhada do produto',
                example: 'Pastilha de freio dianteira melhorada para veículos sedans',
                maxLength: 1000
            },
            preco: {
                type: 'number',
                description: 'Preço de venda do produto',
                example: 95.90,
                minimum: 0.01
            },
            marca: {
                type: 'string',
                description: 'Marca do produto',
                example: 'Bosch',
                maxLength: 100
            },
            custo: {
                type: 'number',
                description: 'Custo do produto',
                example: 48.00,
                minimum: 0
            },
            categoria: {
                type: 'string',
                description: 'Categoria do produto',
                example: 'Freios',
                minLength: 2,
                maxLength: 100
            },
            estoque: {
                type: 'number',
                description: 'Quantidade em estoque',
                example: 30,
                minimum: 0
            },
            estoque_min: {
                type: 'number',
                description: 'Estoque mínimo para alertas',
                example: 8,
                minimum: 0
            },
            status: {
                type: 'boolean',
                description: 'Status ativo do produto',
                example: true
            }
        }
    },

    // Schema para resposta de produto único
    ProdutoResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Produto encontrado com sucesso'
            },
            data: {
                $ref: '#/components/schemas/Produto'
            }
        }
    },

    // Schema para resposta de lista de produtos
    ProdutoListResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Produtos listados com sucesso'
            },
            data: {
                type: 'object',
                properties: {
                    docs: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Produto'
                        }
                    },
                    totalDocs: {
                        type: 'integer',
                        example: 150
                    },
                    limit: {
                        type: 'integer',
                        example: 10
                    },
                    totalPages: {
                        type: 'integer',
                        example: 15
                    },
                    page: {
                        type: 'integer',
                        example: 1
                    },
                    pagingCounter: {
                        type: 'integer',
                        example: 1
                    },
                    hasPrevPage: {
                        type: 'boolean',
                        example: false
                    },
                    hasNextPage: {
                        type: 'boolean',
                        example: true
                    },
                    prevPage: {
                        type: 'integer',
                        nullable: true,
                        example: null
                    },
                    nextPage: {
                        type: 'integer',
                        nullable: true,
                        example: 2
                    }
                }
            }
        }
    }
};

export default produtoSchemas;
