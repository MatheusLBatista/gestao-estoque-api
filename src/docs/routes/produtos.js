import commonSchemas from "../schemas/common.js";

const produtosRoutes = {
  "/produtos": {
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
          description:
            "Filtrar por nome do produto (busca parcial, case-insensitive)",
          schema: { type: "string" },
        },
        {
          name: "categoria",
          in: "query",
          description: "Filtrar por categoria: A, B ou C",
          schema: { type: "string" },
        },
        {
          name: "codigo_produto",
          in: "query",
          description: "Filtrar por código do produto",
          schema: { type: "string" },
        },
        {
          name: "id_fornecedor",
          in: "query",
          description: "Filtrar por ID do fornecedor",
          schema: { type: "string" },
        },
        {
          name: "nome_fornecedor",
          in: "query",
          description: "Filtrar por nome do fornecedor",
          schema: { type: "string" },
        },
        {
          name: "estoque_baixo",
          in: "query",
          description: "Filtrar produtos com estoque abaixo do mínimo",
          schema: { type: "boolean" },
        },

        {
          name: "estoque_minimo",
          in: "query",
          description: "Estoque mínimo",
          schema: { type: "number" },
        },
        {
          name: "estoque_maximo",
          in: "query",
          description: "Estoque máximo",
          schema: { type: "number" },
        },
        {
          name: "preco_minimo",
          in: "query",
          description: "Preço mínimo",
          schema: { type: "number" },
        },
        {
          name: "preco_maximo",
          in: "query",
          description: "Preço máximo",
          schema: { type: "number" },
        },
      ],
      responses: {
        200: {
          description: "Produtos listados com sucesso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProdutoListResponse",
              },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
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
              $ref: "#/components/schemas/ProdutoCreateRequest",
            },
            examples: {
              produto_completo: {
                summary: "Produto com todos os campos",
                value: {
                  nome_produto: "Pastilha de Freio Dianteira",
                  descricao:
                    "Pastilha de freio dianteira para veículos sedans, compatível com Civic, Corolla",
                  preco: 89.9,
                  marca: "Bosch",
                  custo: 45.0,
                  categoria: "Freios",
                  estoque: 25,
                  estoque_min: 5,
                  id_fornecedor: 123,
                  codigo_produto: "PF001",
                },
              },
              produto_basico: {
                summary: "Produto com campos obrigatórios",
                value: {
                  nome_produto: "Filtro de Óleo",
                  preco: 25.9,
                  custo: 12.0,
                  categoria: "Filtros",
                  estoque: 50,
                  estoque_min: 10,
                  id_fornecedor: 123,
                  codigo_produto: "FO001",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Produto cadastrado com sucesso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProdutoResponse",
              },
            },
          },
        },
        409: {
          description: "Produto já cadastrado (nome ou código duplicado)",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
    },
  },
  "/produtos/{id}": {
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
            example: "60d5ecb54b24a12a5c8e4f1a",
          },
        },
      ],
      responses: {
        200: {
          description: "Produto encontrado com sucesso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProdutoResponse",
              },
            },
          },
        },
        404: {
          description: "Produto não encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
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
            example: "60d5ecb54b24a12a5c8e4f1a",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ProdutoUpdateRequest",
            },
            examples: {
              atualizar_preco: {
                summary: "Atualizar apenas preço",
                value: {
                  preco: 95.9,
                },
              },
              atualizar_estoque: {
                summary: "Atualizar estoque e estoque mínimo",
                value: {
                  estoque: 30,
                  estoque_min: 8,
                },
              },
              desativar_produto: {
                summary: "Desativar produto",
                value: {
                  status: false,
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Produto atualizado com sucesso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProdutoResponse",
              },
            },
          },
        },
        404: {
          description: "Produto não encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
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
            example: "60d5ecb54b24a12a5c8e4f1a",
          },
        },
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
                    example: true,
                  },
                  message: {
                    type: "string",
                    example: "Produto excluído com sucesso",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Produto não encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        409: {
          description: "Produto não pode ser excluído (possui movimentações)",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
    },
  },
};

export default produtosRoutes;
