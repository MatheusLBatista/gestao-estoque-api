const movimentacoesSchemas = {
    // Schema básico da movimentação
    Movimentacao: {
        type: "object",
        properties: {
            _id: {
                type: "string",
                description: "ID único da movimentação",
                example: "60d5ecb74f8e4b2b3c8d6e90"
            },
            produto: {
                "$ref": "#/components/schemas/ProdutoBasico"
            },
            tipo: {
                type: "string",
                enum: ["ENTRADA", "SAIDA"],
                description: "Tipo da movimentação",
                example: "ENTRADA"
            },
            quantidade: {
                type: "integer",
                description: "Quantidade movimentada",
                example: 10,
                minimum: 1
            },
            valorUnitario: {
                type: "number",
                description: "Valor unitário na movimentação",
                example: 89.90,
                minimum: 0
            },
            valorTotal: {
                type: "number",
                description: "Valor total da movimentação",
                example: 899.00
            },
            observacoes: {
                type: "string",
                description: "Observações sobre a movimentação",
                example: "Reposição de estoque mensal"
            },
            usuario: {
                "$ref": "#/components/schemas/UsuarioBasico"
            },
            ativo: {
                type: "boolean",
                description: "Status da movimentação",
                example: true
            },
            createdAt: {
                type: "string",
                format: "date-time",
                description: "Data da movimentação",
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

    // Schema para criação de movimentação
    MovimentacaoCreate: {
        type: "object",
        properties: {
            produtoId: {
                type: "string",
                description: "ID do produto",
                example: "60d5ecb74f8e4b2b3c8d6e7f"
            },
            tipo: {
                type: "string",
                enum: ["ENTRADA", "SAIDA"],
                description: "Tipo da movimentação",
                example: "ENTRADA"
            },
            quantidade: {
                type: "integer",
                description: "Quantidade a ser movimentada",
                example: 10,
                minimum: 1
            },
            valorUnitario: {
                type: "number",
                description: "Valor unitário na movimentação",
                example: 89.90,
                minimum: 0
            },
            observacoes: {
                type: "string",
                description: "Observações sobre a movimentação",
                example: "Reposição de estoque mensal",
                maxLength: 500
            }
        },
        required: ["produtoId", "tipo", "quantidade", "valorUnitario"]
    },

    // Schema para atualização de movimentação
    MovimentacaoUpdate: {
        type: "object",
        properties: {
            observacoes: {
                type: "string",
                description: "Observações sobre a movimentação",
                example: "Reposição de estoque - corrigido",
                maxLength: 500
            }
        }
    },

    // Schema para lista de movimentações
    MovimentacoesList: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Movimentações listadas com sucesso"
            },
            movimentacoes: {
                type: "array",
                items: {
                    "$ref": "#/components/schemas/Movimentacao"
                }
            },
            total: {
                type: "integer",
                description: "Total de movimentações encontradas",
                example: 200
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
                example: 20
            }
        }
    },

    // Schema para resposta de movimentação única
    MovimentacaoResponse: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Movimentação encontrada com sucesso"
            },
            movimentacao: {
                "$ref": "#/components/schemas/Movimentacao"
            }
        }
    },

    // Schema para resposta de criação de movimentação
    MovimentacaoCreateResponse: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Movimentação cadastrada com sucesso"
            },
            movimentacao: {
                "$ref": "#/components/schemas/Movimentacao"
            }
        }
    },

    // Schema básico do produto para movimentações
    ProdutoBasico: {
        type: "object",
        properties: {
            _id: {
                type: "string",
                description: "ID do produto",
                example: "60d5ecb74f8e4b2b3c8d6e7f"
            },
            nome: {
                type: "string",
                description: "Nome do produto",
                example: "Pastilha de Freio Dianteira"
            },
            codigo: {
                type: "string",
                description: "Código do produto",
                example: "PF001"
            },
            categoria: {
                type: "string",
                description: "Categoria do produto",
                example: "Freios"
            }
        }
    },

    // Schema para filtros de movimentação
    MovimentacaoFiltros: {
        type: "object",
        properties: {
            dataInicio: {
                type: "string",
                format: "date",
                description: "Data de início do filtro",
                example: "2024-01-01"
            },
            dataFim: {
                type: "string",
                format: "date",
                description: "Data de fim do filtro",
                example: "2024-01-31"
            },
            tipo: {
                type: "string",
                enum: ["ENTRADA", "SAIDA"],
                description: "Tipo da movimentação",
                example: "ENTRADA"
            },
            produtoId: {
                type: "string",
                description: "ID do produto",
                example: "60d5ecb74f8e4b2b3c8d6e7f"
            },
            usuarioId: {
                type: "string",
                description: "ID do usuário que fez a movimentação",
                example: "60d5ecb74f8e4b2b3c8d6e7f"
            }
        }
    }
};

export default movimentacoesSchemas;
