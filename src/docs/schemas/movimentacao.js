const movimentacaoSchemas = {
  // Schema para produto dentro da movimentação
  //TODO: revisar se é necessário
  ProdutoMovimentacao: {
    type: "object",
    properties: {
      produto_ref: {
        type: "string",
        description: "Referência ObjectId do produto",
        example: "60d5ecb54b24a12a5c8e4f1a",
      },
      id_produto: {
        type: "number",
        description: "ID numérico do produto",
        example: 1001,
      },
      codigo_produto: {
        type: "string",
        description: "Código do produto",
        example: "PF001",
      },
      nome_produto: {
        type: "string",
        description: "Nome do produto",
        example: "Pastilha de Freio Dianteira",
      },
      quantidade_produtos: {
        type: "number",
        description: "Quantidade movimentada",
        example: 10,
        minimum: 1,
      },
      preco: {
        type: "number",
        description: "Preço unitário do produto",
        example: 89.9,
        minimum: 0,
      },
      custo: {
        type: "number",
        description: "Custo unitário do produto",
        example: 45.0,
        minimum: 0,
      },
      id_fornecedor: {
        type: "number",
        description: "ID do fornecedor",
        example: 123,
      },
      nome_fornecedor: {
        type: "string",
        description: "Nome do fornecedor",
        example: "Auto Peças Sul Ltda",
      },
    },
  },

  // Schema principal da movimentação
  Movimentacao: {
    type: "object",
    properties: {
      _id: {
        type: "string",
        description: "ID único da movimentação",
        example: "68c9f7a5db05196e9900218a",
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
      data_movimentacao: {
        type: "string",
        format: "date-time",
        description: "Data e hora da movimentação",
        example: "2025-09-16T23:49:57.046Z",
      },
      id_usuario: {
        type: "object",
        description: "Usuário responsável pela movimentação",
        properties: {
          _id: {
            type: "string",
            description: "ID do usuário",
            example: "68c9f7a2db05196e990020e3",
          },
          nome_usuario: {
            type: "string",
            description: "Nome do usuário",
            example: "Administrador Master",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email do usuário",
            example: "admin@sistema.com",
          },
        },
      },
      status: {
        type: "boolean",
        description: "Status da movimentação",
        example: true,
      },
      produtos: {
        type: "array",
        description: "Lista de produtos da movimentação",
        items: {
          type: "object",
          properties: {
            produto_ref: {
              type: "object",
              description: "Produto referenciado",
              properties: {
                _id: {
                  type: "string",
                  description: "ID do produto",
                  example: "68c9f7a4db05196e99002155",
                },
                nome_produto: {
                  type: "string",
                  description: "Nome do produto",
                  example: "Impressionante Algodão Luvas 1",
                },
                estoque: {
                  type: "integer",
                  description: "Quantidade em estoque",
                  example: 46,
                },
              },
            },
            codigo_produto: {
              type: "string",
              description: "Código do produto",
              example: "DIS-6410 1",
            },
            quantidade_produtos: {
              type: "integer",
              description: "Quantidade movimentada",
              example: 10,
            },
            preco: {
              type: "number",
              format: "double",
              description: "Preço unitário do produto",
              example: 8989.49,
            },
            custo: {
              type: "number",
              format: "double",
              description: "Custo total do produto",
              example: 6292.64,
            },
            _id: {
              type: "string",
              description: "ID do item na movimentação",
              example: "68c9f7a5db05196e9900218b",
            },
          },
        },
      },
      data_cadastro: {
        type: "string",
        format: "date-time",
        description: "Data de criação da movimentação",
        example: "2025-09-16T23:49:57.053Z",
      },
      data_ultima_atualizacao: {
        type: "string",
        format: "date-time",
        description: "Data da última atualização",
        example: "2025-09-16T23:49:57.053Z",
      },
    },
  },

  // Schema para criação de movimentação
  MovimentacaoCreateRequest: {
    type: "object",
    properties: {
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
      produtos: {
        type: "array",
        description: "Lista de produtos da movimentação",
        items: {
          type: "object",
          properties: {
                produto_ref: {
                type: "object",
                description: "Produto referenciado",
                example: "68c9f7a4db05196e99002155",
                },
                codigo_produto: {
                type: "string",
                description: "Código do produto",
                example: "DIS-6410 1",
                },
                quantidade_produtos: {
                type: "integer",
                description: "Quantidade movimentada",
                example: 10,
                },
                preco: {
                type: "number",
                format: "double",
                description: "Preço unitário do produto",
                example: 8989.49,
                },
                custo: {
                type: "number",
                format: "double",
                description: "Custo total do produto",
                example: 6292.64,
              }
            },
          },
        },
      },
    },

  // Schema para atualização de movimentação
  MovimentacaoUpdateRequest: {
    type: "object",
    properties: {
      destino: {
        type: "string",
        description: "Destino da movimentação",
        example: "Estoque Principal",
        minLength: 3,
      },
      produtos: {
        type: "array",
        description: "Lista de produtos da movimentação",
        minItems: 1,
        items: {
          type: "object",
          required: [
            "produto_ref",
            "id_produto",
            "codigo_produto",
            "nome_produto",
            "quantidade_produtos",
            "preco",
            "custo",
          ],
          properties: {
            produto_ref: {
              type: "string",
              description: "Referência ObjectId do produto",
              example: "60d5ecb54b24a12a5c8e4f1a",
            },
            id_produto: {
              type: "number",
              description: "ID numérico do produto",
              example: 1001,
            },
            codigo_produto: {
              type: "string",
              description: "Código do produto",
              example: "PF001",
            },
            nome_produto: {
              type: "string",
              description: "Nome do produto",
              example: "Pastilha de Freio Dianteira",
            },
            quantidade_produtos: {
              type: "number",
              description: "Quantidade movimentada",
              example: 10,
              minimum: 1,
            },
            preco: {
              type: "number",
              description: "Preço unitário do produto",
              example: 89.9,
              minimum: 0,
            },
            custo: {
              type: "number",
              description: "Custo unitário do produto",
              example: 45.0,
              minimum: 0,
            },
            id_fornecedor: {
              type: "number",
              description: "ID do fornecedor",
              example: 123,
            },
            nome_fornecedor: {
              type: "string",
              description: "Nome do fornecedor",
              example: "Auto Peças Sul Ltda",
            },
          },
        },
      },
    },
  },

  // Schema para resposta de movimentação única
  MovimentacaoResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Movimentação encontrada com sucesso",
      },
      data: {
        $ref: "#/components/schemas/Movimentacao",
      },
    },
  },

  // Schema para resposta de lista de movimentações
  MovimentacaoListResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Movimentações listadas com sucesso",
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
            example: 200,
          },
          limit: {
            type: "integer",
            example: 10,
          },
          totalPages: {
            type: "integer",
            example: 20,
          },
          page: {
            type: "integer",
            example: 1,
          },
          pagingCounter: {
            type: "integer",
            example: 1,
          },
          hasPrevPage: {
            type: "boolean",
            example: false,
          },
          hasNextPage: {
            type: "boolean",
            example: true,
          },
          prevPage: {
            type: "integer",
            nullable: true,
            example: null,
          },
          nextPage: {
            type: "integer",
            nullable: true,
            example: 2,
          },
        },
      },
    },
  },
};

export default movimentacaoSchemas;
