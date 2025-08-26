const movimentacaoSchemas = {
    // Schema para produto dentro da movimentação
    ProdutoMovimentacao: {
        type: 'object',
        properties: {
            produto_ref: {
                type: 'string',
                description: 'Referência ObjectId do produto',
                example: '60d5ecb54b24a12a5c8e4f1a'
            },
            id_produto: {
                type: 'number',
                description: 'ID numérico do produto',
                example: 1001
            },
            codigo_produto: {
                type: 'string',
                description: 'Código do produto',
                example: 'PF001'
            },
            nome_produto: {
                type: 'string',
                description: 'Nome do produto',
                example: 'Pastilha de Freio Dianteira'
            },
            quantidade_produtos: {
                type: 'number',
                description: 'Quantidade movimentada',
                example: 10,
                minimum: 1
            },
            preco: {
                type: 'number',
                description: 'Preço unitário do produto',
                example: 89.90,
                minimum: 0
            },
            custo: {
                type: 'number',
                description: 'Custo unitário do produto',
                example: 45.00,
                minimum: 0
            },
            id_fornecedor: {
                type: 'number',
                description: 'ID do fornecedor',
                example: 123
            },
            nome_fornecedor: {
                type: 'string',
                description: 'Nome do fornecedor',
                example: 'Auto Peças Sul Ltda'
            }
        }
    },

    // Schema principal da movimentação
    Movimentacao: {
        type: 'object',
        properties: {
            _id: {
                type: 'string',
                description: 'ID único da movimentação',
                example: '60d5ecb54b24a12a5c8e4f1c'
            },
            tipo: {
                type: 'string',
                enum: ['entrada', 'saida'],
                description: 'Tipo da movimentação',
                example: 'entrada'
            },
            destino: {
                type: 'string',
                description: 'Destino da movimentação',
                example: 'Estoque Principal'
            },
            data_movimentacao: {
                type: 'string',
                format: 'date-time',
                description: 'Data e hora da movimentação',
                example: '2024-01-15T10:30:00.000Z'
            },
            id_usuario: {
                type: 'string',
                description: 'ID do usuário responsável',
                example: '60d5ecb54b24a12a5c8e4f1d'
            },
            nome_usuario: {
                type: 'string',
                description: 'Nome do usuário responsável',
                example: 'João Silva'
            },
            status: {
                type: 'boolean',
                description: 'Status da movimentação',
                example: true
            },
            produtos: {
                type: 'array',
                description: 'Lista de produtos da movimentação',
                items: {
                    $ref: '#/components/schemas/ProdutoMovimentacao'
                }
            },
            data_cadastro: {
                type: 'string',
                format: 'date-time',
                description: 'Data de criação da movimentação',
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

    // Schema para criação de movimentação
    MovimentacaoCreateRequest: {
        type: 'object',
        required: ['tipo', 'destino', 'nome_usuario', 'produtos'],
        properties: {
            tipo: {
                type: 'string',
                enum: ['entrada', 'saida'],
                description: 'Tipo da movimentação'
            },
            destino: {
                type: 'string',
                description: 'Destino da movimentação',
                minLength: 3
            },
            data_movimentacao: {
                type: 'string',
                format: 'date-time',
                description: 'Data e hora da movimentação (opcional, padrão: agora)'
            },
            id_produto: {
                type: 'string',
                description: 'ID de referência do produto principal'
            },
            nome_usuario: {
                type: 'string',
                description: 'Nome do usuário responsável'
            },
            produtos: {
                type: 'array',
                description: 'Lista de produtos da movimentação',
                minItems: 1,
                items: {
                    type: 'object',
                    required: ['produto_ref', 'id_produto', 'codigo_produto', 'nome_produto', 'quantidade_produtos', 'preco', 'custo', 'id_fornecedor', 'nome_fornecedor'],
                    properties: {
                        produto_ref: {
                            type: 'string',
                            description: 'Referência ObjectId do produto'
                        },
                        id_produto: {
                            type: 'number',
                            description: 'ID numérico do produto'
                        },
                        codigo_produto: {
                            type: 'string',
                            description: 'Código do produto'
                        },
                        nome_produto: {
                            type: 'string',
                            description: 'Nome do produto'
                        },
                        quantidade_produtos: {
                            type: 'number',
                            description: 'Quantidade movimentada',
                            minimum: 1
                        },
                        preco: {
                            type: 'number',
                            description: 'Preço unitário do produto',
                            minimum: 0
                        },
                        custo: {
                            type: 'number',
                            description: 'Custo unitário do produto',
                            minimum: 0
                        },
                        id_fornecedor: {
                            type: 'number',
                            description: 'ID do fornecedor'
                        },
                        nome_fornecedor: {
                            type: 'string',
                            description: 'Nome do fornecedor'
                        }
                    }
                }
            }
        },
        example: {
            "tipo": "entrada",
            "destino": "Depósito Central",
            "data_movimentacao": "2025-06-14T01:23:07.364Z",
            "id_produto": "64b6f9e5a4b7c2d1f8a12345",
            "nome_usuario": "João da Silva",
            "produtos": [
                {
                    "produto_ref": "6872773c8c0ec82fae6bf6da",
                    "id_produto": 1,
                    "codigo_produto": "DIS-6267",
                    "nome_produto": "Ergonômico Algodão Cadeira",
                    "quantidade_produtos": 10,
                    "preco": 5499.99,
                    "custo": 3849.993,
                    "id_fornecedor": 187,
                    "nome_fornecedor": "Distribuidora Central Ltda"
                }
            ]
        }
    },

    // Schema para atualização de movimentação
    MovimentacaoUpdateRequest: {
        type: 'object',
        properties: {
            tipo: {
                type: 'string',
                enum: ['entrada', 'saida'],
                description: 'Tipo da movimentação',
                example: 'entrada'
            },
            destino: {
                type: 'string',
                description: 'Destino da movimentação',
                example: 'Estoque Principal',
                minLength: 3
            },
            data_movimentacao: {
                type: 'string',
                format: 'date-time',
                description: 'Data e hora da movimentação',
                example: '2024-01-15T10:30:00.000Z'
            },
            produtos: {
                type: 'array',
                description: 'Lista de produtos da movimentação',
                minItems: 1,
                items: {
                    type: 'object',
                    required: ['produto_ref', 'id_produto', 'codigo_produto', 'nome_produto', 'quantidade_produtos', 'preco', 'custo'],
                    properties: {
                        produto_ref: {
                            type: 'string',
                            description: 'Referência ObjectId do produto',
                            example: '60d5ecb54b24a12a5c8e4f1a'
                        },
                        id_produto: {
                            type: 'number',
                            description: 'ID numérico do produto',
                            example: 1001
                        },
                        codigo_produto: {
                            type: 'string',
                            description: 'Código do produto',
                            example: 'PF001'
                        },
                        nome_produto: {
                            type: 'string',
                            description: 'Nome do produto',
                            example: 'Pastilha de Freio Dianteira'
                        },
                        quantidade_produtos: {
                            type: 'number',
                            description: 'Quantidade movimentada',
                            example: 10,
                            minimum: 1
                        },
                        preco: {
                            type: 'number',
                            description: 'Preço unitário do produto',
                            example: 89.90,
                            minimum: 0
                        },
                        custo: {
                            type: 'number',
                            description: 'Custo unitário do produto',
                            example: 45.00,
                            minimum: 0
                        },
                        id_fornecedor: {
                            type: 'number',
                            description: 'ID do fornecedor',
                            example: 123
                        },
                        nome_fornecedor: {
                            type: 'string',
                            description: 'Nome do fornecedor',
                            example: 'Auto Peças Sul Ltda'
                        }
                    }
                }
            }
        }
    },

    // Schema para resposta de movimentação única
    MovimentacaoResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Movimentação encontrada com sucesso'
            },
            data: {
                $ref: '#/components/schemas/Movimentacao'
            }
        }
    },

    // Schema para resposta de lista de movimentações
    MovimentacaoListResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Movimentações listadas com sucesso'
            },
            data: {
                type: 'object',
                properties: {
                    docs: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Movimentacao'
                        }
                    },
                    totalDocs: {
                        type: 'integer',
                        example: 200
                    },
                    limit: {
                        type: 'integer',
                        example: 10
                    },
                    totalPages: {
                        type: 'integer',
                        example: 20
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

export default movimentacaoSchemas;
