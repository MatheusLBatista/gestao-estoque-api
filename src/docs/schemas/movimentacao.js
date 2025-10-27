const movimentacaoSchemas = {
  // Schema principal da movimentação
  Movimentacao: {
    type: "object",
    properties: {
      _id: {
        type: "string",
        description: "ID único da movimentação",
        example: "68dc2e998a45b02c6d047cb0",
      },
      tipo: {
        type: "string",
        enum: ["entrada", "saida"],
        description: "Tipo da movimentação",
        example: "saida",
      },
      destino: {
        type: "string",
        description: "Destino da movimentação",
        example: "Venda",
      },
      id_usuario: {
        type: "object",
        description: "Usuário responsável pela movimentação",
        properties: {
          _id: {
            type: "string",
            description: "ID do usuário",
            example: "68dc2e978a45b02c6d047c00",
          },
          nome_usuario: {
            type: "string",
            description: "Nome do usuário",
            example: "Heloísa Moreira",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email do usuário",
            example: "usuario6@sistema.com",
          },
        },
      },
      status: {
        type: "boolean",
        description: "Status da movimentação",
        example: true,
      },
      observacoes: {
        type: "string",
        description: "Observações da movimentação",
        example: "Movimentação de saída - Seed 7 (Sem NF)",
      },
      produtos: {
        type: "array",
        description: "Lista de produtos da movimentação",
        items: {
          type: "object",
          properties: {
            codigo_produto: {
              type: "string",
              description: "Código do produto",
              example: "DIS-8749 16",
            },
            quantidade_produtos: {
              type: "integer",
              description: "Quantidade movimentada",
              example: 4,
            },
            preco: {
              type: "number",
              format: "double",
              description: "Preço unitário do produto (para saídas)",
              example: 4927.35,
            },
            custo: {
              type: "number",
              format: "double",
              description: "Custo unitário do produto (para entradas)",
              example: 1760.42,
            },
            _id: {
              type: "object",
              description: "Produto referenciado completo",
              properties: {
                _id: {
                  type: "string",
                  description: "ID do produto",
                  example: "68dc2e998a45b02c6d047c7b",
                },
                nome_produto: {
                  type: "string",
                  description: "Nome do produto",
                  example: "Licenciado Aço Queijo 16",
                },
                estoque: {
                  type: "integer",
                  description: "Quantidade atual em estoque",
                  example: 81,
                },
                id: {
                  type: "string",
                  description: "ID do produto (alias)",
                  example: "68dc2e998a45b02c6d047c7b",
                },
              },
            },
          },
        },
      },
      totalProdutos: {
        type: "integer",
        description: "Total de produtos na movimentação",
        example: 4,
      },
      totalCusto: {
        type: "number",
        format: "double",
        description: "Valor total dos custos (presente apenas em entradas)",
        example: 35208.46,
      },
      totalPreco: {
        type: "number",
        format: "double",
        description: "Valor total dos preços (presente apenas em saídas)",
        example: 19709.4,
      },
      nota_fiscal: {
        type: "object",
        description: "Dados da nota fiscal (quando aplicável)",
        properties: {
          numero: {
            type: "string",
            description: "Número da nota fiscal",
            example: "000348325",
          },
          serie: {
            type: "string",
            description: "Série da nota fiscal",
            example: "2",
          },
          chave: {
            type: "string",
            description: "Chave de acesso da nota fiscal",
            example: "352007142001660001875500200003483251234567890",
          },
          data_emissao: {
            type: "string",
            format: "date-time",
            description: "Data de emissão da nota fiscal",
            example: "2025-09-04T19:25:13.520Z",
          },
        },
      },
      id: {
        type: "string",
        description: "ID da movimentação (alias)",
        example: "68dc2e998a45b02c6d047cb0",
      },
      data_cadastro: {
        type: "string",
        format: "date-time",
        description: "Data de criação da movimentação",
        example: "2025-09-30T19:25:13.549Z",
      },
      data_ultima_atualizacao: {
        type: "string",
        format: "date-time",
        description: "Data da última atualização",
        example: "2025-09-30T19:25:13.549Z",
      },
    },
  },

  // Schema para criação de movimentação
  MovimentacaoCreateRequest: {
    type: "object",
    required: ["tipo", "produtos"],
    properties: {
      tipo: {
        type: "string",
        enum: ["entrada", "saida"],
        description: "Tipo da movimentação",
        example: "entrada",
      },
      destino: {
        type: "string",
        description: "Destino da movimentação",
        example: "Estoque",
      },
      observacoes: {
        type: "string",
        description: "Observações sobre a movimentação",
        example: "Movimentação de entrada - Compra fornecedor",
      },
      nota_fiscal: {
        type: "object",
        description: "Dados da nota fiscal (opcional)",
        properties: {
          numero: {
            type: "string",
            description: "Número da nota fiscal",
            example: "000348325",
          },
          serie: {
            type: "string",
            description: "Série da nota fiscal",
            example: "2",
          },
          chave: {
            type: "string",
            description: "Chave de acesso da nota fiscal",
            example: "352007142001660001875500200003483251234567890",
          },
          data_emissao: {
            type: "string",
            format: "date-time",
            description: "Data de emissão da nota fiscal",
            example: "2025-09-04T19:25:13.520Z",
          },
        },
      },
      produtos: {
        type: "array",
        description: "Lista de produtos da movimentação",
        minItems: 1,
        items: {
          type: "object",
          required: ["_id", "quantidade_produtos"],
          properties: {
            _id: {
              type: "string",
              description: "ID do produto",
              example: "68dc2e998a45b02c6d047c91",
            },
            codigo_produto: {
              type: "string",
              description: "Código do produto (opcional, para validação)",
              example: "DIS-2892 38",
            },
            quantidade_produtos: {
              type: "integer",
              minimum: 1,
              description: "Quantidade de produtos",
              example: 20,
            },
            custo: {
              type: "number",
              format: "double",
              description: "Custo unitário (obrigatório para entradas)",
              example: 1760.42,
            },
            preco: {
              type: "number",
              format: "double",
              description: "Preço unitário (obrigatório para saídas)",
              example: 4927.35,
            },
          },
        },
      },
    },
  },

  // Schema para resposta única de movimentação
  MovimentacaoResponse: {
    type: "object",
    properties: {
      error: {
        type: "boolean",
        example: false,
      },
      code: {
        type: "integer",
        example: 201,
      },
      message: {
        type: "string",
        example: "Movimentação registrada com sucesso.",
      },
      data: {
        $ref: "#/components/schemas/Movimentacao",
      },
      errors: {
        type: "array",
        example: [],
      },
    },
    example: {
      error: false,
      code: 201,
      message: "Movimentação registrada com sucesso.",
      data: {
        _id: "68dc2e998a45b02c6d047cb0",
        tipo: "saida",
        destino: "Venda",
        id_usuario: {
          _id: "68dc2e978a45b02c6d047c00",
          nome_usuario: "Heloísa Moreira",
          email: "usuario6@sistema.com",
        },
        status: true,
        observacoes: "Movimentação de saída - Seed 7 (Sem NF)",
        produtos: [
          {
            codigo_produto: "DIS-8749 16",
            quantidade_produtos: 4,
            preco: 4927.35,
            _id: {
              _id: "68dc2e998a45b02c6d047c7b",
              nome_produto: "Licenciado Aço Queijo 16",
              estoque: 81,
              id: "68dc2e998a45b02c6d047c7b",
            },
          },
        ],
        data_cadastro: "2025-09-30T19:25:13.549Z",
        data_ultima_atualizacao: "2025-09-30T19:25:13.549Z",
        totalProdutos: 4,
        totalPreco: 19709.4,
        id: "68dc2e998a45b02c6d047cb0",
      },
      errors: [],
    },
  },

  // Schema para resposta de lista de movimentações
  MovimentacaoListResponse: {
    type: "object",
    properties: {
      error: {
        type: "boolean",
        example: false,
      },
      code: {
        type: "integer",
        example: 200,
      },
      message: {
        type: "string",
        example: "Movimentações listadas com sucesso.",
      },
      data: {
        type: "object",
        properties: {
          docs: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Movimentacao",
            },
          },
          totalDocs: {
            type: "integer",
            description: "Total de documentos encontrados",
            example: 150,
          },
          limit: {
            type: "integer",
            description: "Limite de documentos por página",
            example: 10,
          },
          totalPages: {
            type: "integer",
            description: "Total de páginas",
            example: 15,
          },
          page: {
            type: "integer",
            description: "Página atual",
            example: 1,
          },
          pagingCounter: {
            type: "integer",
            description: "Contador de paginação",
            example: 1,
          },
          hasPrevPage: {
            type: "boolean",
            description: "Indica se há página anterior",
            example: false,
          },
          hasNextPage: {
            type: "boolean",
            description: "Indica se há próxima página",
            example: true,
          },
          prevPage: {
            type: "integer",
            nullable: true,
            description: "Número da página anterior",
            example: null,
          },
          nextPage: {
            type: "integer",
            nullable: true,
            description: "Número da próxima página",
            example: 2,
          },
          estatisticas: {
            type: "object",
            description: "Estatísticas das movimentações",
            properties: {
              total_entradas: {
                type: "integer",
                description: "Total de movimentações de entrada",
                example: 85,
              },
              total_saidas: {
                type: "integer",
                description: "Total de movimentações de saída",
                example: 65,
              },
              valor_total_entradas: {
                type: "number",
                format: "double",
                description: "Valor total das entradas",
                example: 125420.75,
              },
              valor_total_saidas: {
                type: "number",
                format: "double",
                description: "Valor total das saídas",
                example: 89650.5,
              },
              lucro_total: {
                type: "number",
                format: "double",
                description: "Lucro total (saídas - entradas)",
                example: 35770.25,
              },
            },
          },
        },
      },
      errors: {
        type: "array",
        example: [],
      },
    },
  },
};

export default movimentacaoSchemas;
