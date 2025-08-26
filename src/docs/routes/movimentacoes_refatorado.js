import commonSchemas from "../schemas/common.js";

const movimentacoesRoutes = {
    "/api/movimentacoes": {
        get: {
            tags: ["Movimentações"],
            summary: "Lista todas as movimentações",
            description: `
            Lista todas as movimentações de estoque com suporte completo a paginação e filtros avançados.
            
            **Funcionalidades Principais:**
            - Paginação automática com mongoose-paginate-v2
            - Filtros por tipo, produto, usuário, período
            - Ordenação por data (mais recentes primeiro)
            - Cálculos automáticos de valores totais
            - Busca por código de produto
            - Filtros de valor mínimo/máximo
            
            **Tipos de Movimentação:**
            - **entrada**: Adição ao estoque (compras, devoluções)
            - **saida**: Remoção do estoque (vendas, transferências)
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                ...commonSchemas.PaginationParams,
                {
                    name: "tipo",
                    in: "query",
                    description: "Filtrar por tipo de movimentação",
                    schema: { 
                        type: "string", 
                        enum: ["entrada", "saida"],
                        example: "entrada"
                    }
                },
                {
                    name: "produto_id",
                    in: "query",
                    description: "Filtrar por ID do produto (ObjectId)",
                    schema: { 
                        type: "string", 
                        example: "60d5ecb54b24a12a5c8e4f1a"
                    }
                },
                {
                    name: "codigo_produto",
                    in: "query",
                    description: "Filtrar por código do produto",
                    schema: { 
                        type: "string", 
                        example: "PF001"
                    }
                },
                {
                    name: "usuario_id",
                    in: "query",
                    description: "Filtrar por ID do usuário responsável",
                    schema: { 
                        type: "string", 
                        example: "60d5ecb54b24a12a5c8e4f1d"
                    }
                },
                {
                    name: "nome_usuario",
                    in: "query",
                    description: "Filtrar por nome do usuário",
                    schema: { 
                        type: "string", 
                        example: "João Silva"
                    }
                },
                {
                    name: "data_inicio",
                    in: "query",
                    description: "Data de início do período (YYYY-MM-DD)",
                    schema: { 
                        type: "string", 
                        format: "date", 
                        example: "2024-01-01"
                    }
                },
                {
                    name: "data_fim",
                    in: "query",
                    description: "Data de fim do período (YYYY-MM-DD)",
                    schema: { 
                        type: "string", 
                        format: "date", 
                        example: "2024-01-31"
                    }
                },
                {
                    name: "destino",
                    in: "query",
                    description: "Filtrar por destino da movimentação",
                    schema: { 
                        type: "string", 
                        example: "Estoque Principal"
                    }
                },
                {
                    name: "valor_min",
                    in: "query",
                    description: "Valor total mínimo da movimentação",
                    schema: { 
                        type: "number", 
                        example: 100.00
                    }
                },
                {
                    name: "valor_max",
                    in: "query",
                    description: "Valor total máximo da movimentação",
                    schema: { 
                        type: "number", 
                        example: 1000.00
                    }
                }
            ],
            responses: {
                200: {
                    description: "Movimentações listadas com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/MovimentacaoListResponse"
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        },
        post: {
            tags: ["Movimentações"],
            summary: "Cadastrar nova movimentação",
            description: `
            Cadastra uma nova movimentação de estoque com validação completa e atualização automática do estoque.
            
            **Funcionalidades:**
            - Validação de dados obrigatórios via Zod Schema
            - Atualização automática do estoque dos produtos
            - Cálculo automático do valor total da movimentação
            - Verificação de estoque disponível para saídas
            - Registro automático de logs de auditoria
            - Controle de usuário responsável pela movimentação
            
            **Regras de Negócio:**
            - **ENTRADA**: Adiciona produtos ao estoque atual
            - **SAÍDA**: Remove produtos do estoque (verifica disponibilidade)
            - Produtos devem existir no sistema
            - Quantidades devem ser positivas
            - Usuário responsável é obtido do token JWT
            
            **Validações de Estoque:**
            - Para saídas: verifica se há estoque suficiente
            - Bloqueia saída se quantidade solicitada > estoque atual
            - Para entradas: não há limite de quantidade
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/MovimentacaoCreateRequest"
                        },
                        examples: {
                            "entrada_simples": {
                                summary: "Movimentação de entrada simples",
                                value: {
                                    tipo: "entrada",
                                    destino: "Estoque Principal",
                                    nome_usuario: "João Silva",
                                    produtos: [
                                        {
                                            produto_ref: "60d5ecb54b24a12a5c8e4f1a",
                                            id_produto: 1001,
                                            codigo_produto: "PF001",
                                            nome_produto: "Pastilha de Freio Dianteira",
                                            quantidade_produtos: 10,
                                            preco: 89.90,
                                            custo: 45.00,
                                            id_fornecedor: 123,
                                            nome_fornecedor: "Auto Peças Sul Ltda"
                                        }
                                    ]
                                }
                            },
                            "saida_multiplos_produtos": {
                                summary: "Saída com múltiplos produtos",
                                value: {
                                    tipo: "saida",
                                    destino: "Venda - Cliente ABC",
                                    nome_usuario: "Maria Santos",
                                    produtos: [
                                        {
                                            produto_ref: "60d5ecb54b24a12a5c8e4f1a",
                                            id_produto: 1001,
                                            codigo_produto: "PF001",
                                            nome_produto: "Pastilha de Freio Dianteira",
                                            quantidade_produtos: 2,
                                            preco: 89.90,
                                            custo: 45.00,
                                            id_fornecedor: 123,
                                            nome_fornecedor: "Auto Peças Sul Ltda"
                                        },
                                        {
                                            produto_ref: "60d5ecb54b24a12a5c8e4f1b",
                                            id_produto: 1002,
                                            codigo_produto: "FO001",
                                            nome_produto: "Filtro de Óleo",
                                            quantidade_produtos: 1,
                                            preco: 25.90,
                                            custo: 12.00,
                                            id_fornecedor: 124,
                                            nome_fornecedor: "Filtros Brasil Ltda"
                                        }
                                    ]
                                }
                            },
                            "entrada_com_data": {
                                summary: "Entrada com data específica",
                                value: {
                                    tipo: "entrada",
                                    destino: "Estoque Principal",
                                    data_movimentacao: "2024-01-15T10:30:00.000Z",
                                    nome_usuario: "João Silva",
                                    produtos: [
                                        {
                                            produto_ref: "60d5ecb54b24a12a5c8e4f1a",
                                            id_produto: 1001,
                                            codigo_produto: "PF001",
                                            nome_produto: "Pastilha de Freio Dianteira",
                                            quantidade_produtos: 50,
                                            preco: 89.90,
                                            custo: 45.00,
                                            id_fornecedor: 123,
                                            nome_fornecedor: "Auto Peças Sul Ltda"
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Movimentação criada com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/MovimentacaoResponse"
                            }
                        }
                    }
                },
                400: {
                    description: "Dados inválidos ou estoque insuficiente",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/ErrorResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            details: {
                                                type: "object",
                                                properties: {
                                                    tipo_erro: {
                                                        type: "string",
                                                        enum: ["validationError", "businessRuleViolation"],
                                                        example: "businessRuleViolation"
                                                    },
                                                    produto_afetado: {
                                                        type: "string",
                                                        example: "PF001"
                                                    },
                                                    estoque_disponivel: {
                                                        type: "number",
                                                        example: 5
                                                    },
                                                    quantidade_solicitada: {
                                                        type: "number",
                                                        example: 10
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
    },
    "/api/movimentacoes/{id}": {
        get: {
            tags: ["Movimentações"],
            summary: "Buscar movimentação por ID",
            description: `
            Busca uma movimentação específica pelo seu ID único.
            
            **Retorna:**
            - Dados completos da movimentação
            - Lista detalhada de produtos movimentados
            - Informações do usuário responsável
            - Valores calculados e totais
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único da movimentação",
                    schema: {
                        type: "string",
                        example: "60d5ecb54b24a12a5c8e4f1c"
                    }
                }
            ],
            responses: {
                200: {
                    description: "Movimentação encontrada com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/MovimentacaoResponse"
                            }
                        }
                    }
                },
                404: {
                    description: "Movimentação não encontrada",
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
            tags: ["Movimentações"],
            summary: "Atualizar movimentação completa",
            description: `
            Atualiza uma movimentação existente com reversão e reaplicação das alterações de estoque.
            
            **Processo de Atualização:**
            1. Reverte as alterações de estoque da movimentação original
            2. Valida os novos dados
            3. Aplica as novas alterações de estoque
            4. Atualiza a movimentação no banco
            
            **Importante:**
            - Reversão automática do estoque anterior
            - Validação de estoque para as novas quantidades
            - Mantém histórico de alterações
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único da movimentação",
                    schema: {
                        type: "string",
                        example: "60d5ecb54b24a12a5c8e4f1c"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/MovimentacaoCreateRequest"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Movimentação atualizada com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/MovimentacaoResponse"
                            }
                        }
                    }
                },
                404: {
                    description: "Movimentação não encontrada",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                400: {
                    description: "Dados inválidos ou estoque insuficiente",
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
            tags: ["Movimentações"],
            summary: "Atualizar movimentação parcialmente",
            description: `
            Atualiza campos específicos de uma movimentação existente.
            
            **Campos Atualizáveis:**
            - destino: Apenas o destino da movimentação
            - data_movimentacao: Data da movimentação
            - Produtos: Lista completa de produtos (com reversão de estoque)
            
            **Limitações:**
            - Tipo (entrada/saida) não pode ser alterado
            - Usuário responsável não pode ser alterado
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único da movimentação",
                    schema: {
                        type: "string",
                        example: "60d5ecb54b24a12a5c8e4f1c"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/MovimentacaoUpdateRequest"
                        },
                        examples: {
                            "atualizar_destino": {
                                summary: "Atualizar apenas destino",
                                value: {
                                    destino: "Estoque Filial Centro"
                                }
                            },
                            "atualizar_data": {
                                summary: "Atualizar data da movimentação",
                                value: {
                                    data_movimentacao: "2024-01-20T14:30:00.000Z"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Movimentação atualizada com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/MovimentacaoResponse"
                            }
                        }
                    }
                },
                404: {
                    description: "Movimentação não encontrada",
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
            tags: ["Movimentações"],
            summary: "Cancelar/Excluir movimentação",
            description: `
            Cancela uma movimentação e reverte automaticamente as alterações de estoque.
            
            **Processo de Cancelamento:**
            1. Verifica se a movimentação existe
            2. Reverte as alterações de estoque:
               - ENTRADA: Remove a quantidade do estoque
               - SAÍDA: Devolve a quantidade ao estoque
            3. Marca a movimentação como cancelada (status = false)
            4. Registra log de cancelamento
            
            **Importante:**
            - Reversão automática do estoque
            - Movimentação é mantida para histórico
            - Apenas marca como inativa (soft delete)
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único da movimentação",
                    schema: {
                        type: "string",
                        example: "60d5ecb54b24a12a5c8e4f1c"
                    }
                }
            ],
            responses: {
                200: {
                    description: "Movimentação cancelada com sucesso",
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
                                        example: "Movimentação cancelada e estoque revertido com sucesso"
                                    },
                                    data: {
                                        type: "object",
                                        properties: {
                                            movimentacao_id: {
                                                type: "string",
                                                example: "60d5ecb54b24a12a5c8e4f1c"
                                            },
                                            estoque_revertido: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        produto_id: {
                                                            type: "string",
                                                            example: "60d5ecb54b24a12a5c8e4f1a"
                                                        },
                                                        quantidade_revertida: {
                                                            type: "number",
                                                            example: 10
                                                        },
                                                        estoque_atual: {
                                                            type: "number",
                                                            example: 35
                                                        }
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
                404: {
                    description: "Movimentação não encontrada",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                409: {
                    description: "Movimentação já foi cancelada",
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
    "/api/movimentacoes/relatorio": {
        get: {
            tags: ["Movimentações"],
            summary: "Relatório de movimentações",
            description: `
            Gera relatório detalhado de movimentações com agregações e estatísticas.
            
            **Funcionalidades:**
            - Agregações por período, tipo, produto, usuário
            - Cálculos de valores totais, médias, quantidade de movimentações
            - Comparativos entre períodos
            - Produtos mais movimentados
            - Usuários mais ativos
            
            **Tipos de Relatório:**
            - Resumo geral
            - Por período específico
            - Por tipo de movimentação
            - Por produto
            - Por usuário
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "tipo_relatorio",
                    in: "query",
                    description: "Tipo de relatório a gerar",
                    schema: {
                        type: "string",
                        enum: ["geral", "periodo", "produto", "usuario", "comparativo"],
                        default: "geral",
                        example: "periodo"
                    }
                },
                {
                    name: "data_inicio",
                    in: "query",
                    description: "Data de início para o relatório (YYYY-MM-DD)",
                    schema: {
                        type: "string",
                        format: "date",
                        example: "2024-01-01"
                    }
                },
                {
                    name: "data_fim",
                    in: "query",
                    description: "Data de fim para o relatório (YYYY-MM-DD)",
                    schema: {
                        type: "string",
                        format: "date",
                        example: "2024-01-31"
                    }
                },
                {
                    name: "agrupar_por",
                    in: "query",
                    description: "Campo para agrupamento",
                    schema: {
                        type: "string",
                        enum: ["dia", "semana", "mes", "produto", "usuario", "tipo"],
                        example: "mes"
                    }
                }
            ],
            responses: {
                200: {
                    description: "Relatório gerado com sucesso",
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
                                        example: "Relatório gerado com sucesso"
                                    },
                                    data: {
                                        type: "object",
                                        properties: {
                                            periodo: {
                                                type: "object",
                                                properties: {
                                                    inicio: {
                                                        type: "string",
                                                        format: "date",
                                                        example: "2024-01-01"
                                                    },
                                                    fim: {
                                                        type: "string",
                                                        format: "date",
                                                        example: "2024-01-31"
                                                    }
                                                }
                                            },
                                            resumo: {
                                                type: "object",
                                                properties: {
                                                    total_movimentacoes: {
                                                        type: "integer",
                                                        example: 150
                                                    },
                                                    total_entradas: {
                                                        type: "integer",
                                                        example: 75
                                                    },
                                                    total_saidas: {
                                                        type: "integer",
                                                        example: 75
                                                    },
                                                    valor_total_entradas: {
                                                        type: "number",
                                                        example: 25750.50
                                                    },
                                                    valor_total_saidas: {
                                                        type: "number",
                                                        example: 18950.75
                                                    },
                                                    produtos_distintos: {
                                                        type: "integer",
                                                        example: 45
                                                    },
                                                    usuarios_ativos: {
                                                        type: "integer",
                                                        example: 8
                                                    }
                                                }
                                            },
                                            detalhamento: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        agrupamento: {
                                                            type: "string",
                                                            example: "2024-01"
                                                        },
                                                        quantidade_movimentacoes: {
                                                            type: "integer",
                                                            example: 25
                                                        },
                                                        valor_total: {
                                                            type: "number",
                                                            example: 5750.25
                                                        },
                                                        entradas: {
                                                            type: "integer",
                                                            example: 15
                                                        },
                                                        saidas: {
                                                            type: "integer",
                                                            example: 10
                                                        }
                                                    }
                                                }
                                            },
                                            produtos_mais_movimentados: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        produto_id: {
                                                            type: "string",
                                                            example: "60d5ecb54b24a12a5c8e4f1a"
                                                        },
                                                        nome_produto: {
                                                            type: "string",
                                                            example: "Pastilha de Freio Dianteira"
                                                        },
                                                        total_movimentacoes: {
                                                            type: "integer",
                                                            example: 15
                                                        },
                                                        quantidade_total: {
                                                            type: "number",
                                                            example: 150
                                                        }
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
    }
};

export default movimentacoesRoutes;
