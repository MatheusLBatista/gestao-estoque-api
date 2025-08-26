import commonSchemas from "../schemas/common.js";

const fornecedoresRoutes = {
    "/api/fornecedores": {
        get: {
            tags: ["Fornecedores"],
            summary: "Lista todos os fornecedores",
            description: `
            Lista todos os fornecedores cadastrados no sistema com suporte a paginação e filtros.
            
            **Funcionalidades:**
            - Paginação automática com mongoose-paginate-v2
            - Filtros por nome, CNPJ, email, status
            - Busca textual parcial (case-insensitive)
            - Ordenação por nome, data de cadastro
            - Filtros por estado/cidade
            - Controle de acesso por perfil
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                ...commonSchemas.PaginationParams,
                {
                    name: "nome_fornecedor",
                    in: "query",
                    description: "Filtrar por nome do fornecedor (busca parcial)",
                    schema: { type: "string", example: "Auto Peças" }
                },
                {
                    name: "cnpj",
                    in: "query",
                    description: "Filtrar por CNPJ (busca parcial)",
                    schema: { type: "string", example: "12.345.678" }
                },
                {
                    name: "email",
                    in: "query",
                    description: "Filtrar por email",
                    schema: { type: "string", example: "contato@autopecas.com" }
                },
                {
                    name: "status",
                    in: "query",
                    description: "Filtrar por status ativo",
                    schema: { type: "boolean", example: true }
                },
                {
                    name: "cidade",
                    in: "query",
                    description: "Filtrar por cidade",
                    schema: { type: "string", example: "São Paulo" }
                },
                {
                    name: "estado",
                    in: "query",
                    description: "Filtrar por estado (UF)",
                    schema: { type: "string", example: "SP" }
                },
                {
                    name: "ordenar_por",
                    in: "query",
                    description: "Campo de ordenação",
                    schema: { 
                        type: "string", 
                        enum: ["nome_fornecedor", "data_cadastro", "email"],
                        default: "nome_fornecedor",
                        example: "nome_fornecedor"
                    }
                }
            ],
            responses: {
                200: {
                    description: "Fornecedores listados com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/FornecedorListResponse"
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        },
        post: {
            tags: ["Fornecedores"],
            summary: "Cadastrar novo fornecedor",
            description: `
            Cadastra um novo fornecedor no sistema com validação completa.
            
            **Validações:**
            - Nome obrigatório (mínimo 3 caracteres)
            - CNPJ único e válido (formato XX.XXX.XXX/XXXX-XX)
            - Email válido e único
            - Telefone obrigatório
            - Pelo menos um endereço obrigatório
            - Validação de CEP se fornecido
            
            **Regras de Negócio:**
            - CNPJ deve ser único no sistema
            - Email deve ser único no sistema
            - Status padrão é ativo (true)
            - Pode ter múltiplos endereços
            - Data de cadastro é automática
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/FornecedorCreateRequest"
                        },
                        examples: {
                            "fornecedor_completo": {
                                summary: "Fornecedor com endereço completo",
                                value: {
                                    nome_fornecedor: "Auto Peças Sul Ltda",
                                    cnpj: "12.345.678/0001-90",
                                    telefone: "(11) 99999-9999",
                                    email: "contato@autopecassul.com",
                                    endereco: [
                                        {
                                            logradouro: "Rua das Peças, 123",
                                            bairro: "Centro",
                                            cidade: "São Paulo",
                                            estado: "SP",
                                            cep: "01234-567"
                                        }
                                    ]
                                }
                            },
                            "fornecedor_multiplos_enderecos": {
                                summary: "Fornecedor com múltiplos endereços",
                                value: {
                                    nome_fornecedor: "Distribuidora Nacional de Peças",
                                    cnpj: "23.456.789/0001-01",
                                    telefone: "(11) 88888-8888",
                                    email: "vendas@distribuidoranacional.com",
                                    endereco: [
                                        {
                                            logradouro: "Av. Paulista, 1000",
                                            bairro: "Bela Vista",
                                            cidade: "São Paulo",
                                            estado: "SP",
                                            cep: "01310-100"
                                        },
                                        {
                                            logradouro: "Rua das Flores, 500",
                                            bairro: "Centro",
                                            cidade: "Rio de Janeiro",
                                            estado: "RJ",
                                            cep: "20040-020"
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
                    description: "Fornecedor cadastrado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/FornecedorResponse"
                            }
                        }
                    }
                },
                409: {
                    description: "CNPJ ou email já cadastrados",
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
                                                    campo_duplicado: {
                                                        type: "string",
                                                        enum: ["cnpj", "email"],
                                                        example: "cnpj"
                                                    },
                                                    valor_duplicado: {
                                                        type: "string",
                                                        example: "12.345.678/0001-90"
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
    "/api/fornecedores/{id}": {
        get: {
            tags: ["Fornecedores"],
            summary: "Buscar fornecedor por ID",
            description: `
            Busca um fornecedor específico pelo seu ID único.
            
            **Retorna:**
            - Dados completos do fornecedor
            - Todos os endereços cadastrados
            - Status atual e datas de auditoria
            - Estatísticas de produtos fornecidos (se aplicável)
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do fornecedor",
                    schema: {
                        type: "string",
                        example: "60d5ecb54b24a12a5c8e4f1b"
                    }
                },
                {
                    name: "incluir_produtos",
                    in: "query",
                    description: "Incluir lista de produtos fornecidos",
                    schema: {
                        type: "boolean",
                        default: false,
                        example: true
                    }
                }
            ],
            responses: {
                200: {
                    description: "Fornecedor encontrado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/FornecedorResponse" },
                                    {
                                        type: "object",
                                        properties: {
                                            data: {
                                                type: "object",
                                                properties: {
                                                    produtos_fornecidos: {
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
                                                                codigo_produto: {
                                                                    type: "string",
                                                                    example: "PF001"
                                                                },
                                                                categoria: {
                                                                    type: "string",
                                                                    example: "Freios"
                                                                }
                                                            }
                                                        }
                                                    },
                                                    estatisticas: {
                                                        type: "object",
                                                        properties: {
                                                            total_produtos: {
                                                                type: "integer",
                                                                example: 25
                                                            },
                                                            valor_total_estoque: {
                                                                type: "number",
                                                                example: 15750.50
                                                            }
                                                        }
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
                404: {
                    description: "Fornecedor não encontrado",
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
            tags: ["Fornecedores"],
            summary: "Atualizar fornecedor completo",
            description: `
            Atualiza todos os dados de um fornecedor existente.
            
            **Validações:**
            - Fornecedor deve existir
            - CNPJ único (exceto o próprio fornecedor)
            - Email único (exceto o próprio fornecedor)
            - Pelo menos um endereço obrigatório
            - Campos obrigatórios não podem ser removidos
            
            **Importante:**
            - CNPJ não pode ser alterado após cadastro
            - Atualização substitui todos os endereços
            - Para adicionar endereços, use PATCH
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do fornecedor",
                    schema: {
                        type: "string",
                        example: "60d5ecb54b24a12a5c8e4f1b"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/FornecedorUpdateRequest"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Fornecedor atualizado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/FornecedorResponse"
                            }
                        }
                    }
                },
                404: {
                    description: "Fornecedor não encontrado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                409: {
                    description: "Email já existe em outro fornecedor",
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
            tags: ["Fornecedores"],
            summary: "Atualizar fornecedor parcialmente",
            description: `
            Atualiza campos específicos de um fornecedor existente.
            
            **Campos Atualizáveis:**
            - nome_fornecedor: Nome do fornecedor
            - telefone: Telefone de contato
            - email: Email (deve ser único)
            - status: Status ativo/inativo
            - endereco: Adicionar/remover endereços específicos
            
            **Funcionalidades:**
            - Atualização parcial de campos
            - Preservação dos campos não informados
            - Validação apenas dos campos enviados
            - Ideal para alterações pontuais
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do fornecedor",
                    schema: {
                        type: "string",
                        example: "60d5ecb54b24a12a5c8e4f1b"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/FornecedorUpdateRequest"
                        },
                        examples: {
                            "atualizar_contato": {
                                summary: "Atualizar apenas contato",
                                value: {
                                    telefone: "(11) 77777-7777",
                                    email: "novo.contato@autopecassul.com"
                                }
                            },
                            "desativar_fornecedor": {
                                summary: "Desativar fornecedor",
                                value: {
                                    status: false
                                }
                            },
                            "adicionar_endereco": {
                                summary: "Adicionar novo endereço",
                                value: {
                                    endereco: [
                                        {
                                            logradouro: "Rua Nova, 789",
                                            bairro: "Jardins",
                                            cidade: "São Paulo",
                                            estado: "SP",
                                            cep: "01234-789"
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Fornecedor atualizado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/FornecedorResponse"
                            }
                        }
                    }
                },
                404: {
                    description: "Fornecedor não encontrado",
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
            tags: ["Fornecedores"],
            summary: "Excluir fornecedor",
            description: `
            Remove um fornecedor do sistema.
            
            **Validações:**
            - Fornecedor deve existir
            - Verifica se não há produtos associados
            - Fornecedor com produtos ativos não pode ser excluído
            
            **Recomendação:**
            - Use PATCH para status=false para desativar
            - Exclusão física apenas se não houver dependências
            - Mantém integridade referencial
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID único do fornecedor",
                    schema: {
                        type: "string",
                        example: "60d5ecb54b24a12a5c8e4f1b"
                    }
                },
                {
                    name: "force",
                    in: "query",
                    description: "Forçar exclusão mesmo com produtos (move para fornecedor genérico)",
                    schema: {
                        type: "boolean",
                        default: false,
                        example: false
                    }
                }
            ],
            responses: {
                200: {
                    description: "Fornecedor excluído com sucesso",
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
                                        example: "Fornecedor excluído com sucesso"
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Fornecedor não encontrado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                409: {
                    description: "Fornecedor possui produtos associados",
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
                                                    produtos_associados: {
                                                        type: "integer",
                                                        example: 15
                                                    },
                                                    produtos_ativos: {
                                                        type: "integer",
                                                        example: 12
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
    "/api/fornecedores/buscar": {
        get: {
            tags: ["Fornecedores"],
            summary: "Busca avançada de fornecedores",
            description: `
            Busca fornecedores com múltiplos critérios e filtros avançados.
            
            **Funcionalidades:**
            - Busca textual em nome, email, telefone
            - Filtros por região (estado, cidade)
            - Ordenação múltipla
            - Agregações por estado
            - Estatísticas gerais
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                ...commonSchemas.PaginationParams,
                {
                    name: "q",
                    in: "query",
                    description: "Termo de busca (nome, email, telefone)",
                    schema: { type: "string", example: "auto peças" }
                },
                {
                    name: "estados",
                    in: "query",
                    description: "Lista de estados separados por vírgula",
                    schema: { type: "string", example: "SP,RJ,MG" }
                },
                {
                    name: "cidades",
                    in: "query",
                    description: "Lista de cidades separadas por vírgula",
                    schema: { type: "string", example: "São Paulo,Rio de Janeiro" }
                },
                {
                    name: "ordenar_por",
                    in: "query",
                    description: "Campo de ordenação",
                    schema: { 
                        type: "string", 
                        enum: ["nome_fornecedor", "email", "data_cadastro"],
                        example: "nome_fornecedor"
                    }
                },
                {
                    name: "incluir_inativos",
                    in: "query",
                    description: "Incluir fornecedores inativos",
                    schema: { type: "boolean", default: false, example: false }
                }
            ],
            responses: {
                200: {
                    description: "Resultados da busca",
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    { $ref: "#/components/schemas/FornecedorListResponse" },
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
                                                    por_estado: {
                                                        type: "object",
                                                        additionalProperties: {
                                                            type: "integer"
                                                        },
                                                        example: {
                                                            "SP": 15,
                                                            "RJ": 8,
                                                            "MG": 5
                                                        }
                                                    },
                                                    total_ativos: {
                                                        type: "integer",
                                                        example: 25
                                                    },
                                                    total_inativos: {
                                                        type: "integer",
                                                        example: 3
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
    "/api/fornecedores/validar-cnpj": {
        post: {
            tags: ["Fornecedores"],
            summary: "Validar CNPJ",
            description: `
            Valida se um CNPJ é válido e se já está cadastrado no sistema.
            
            **Validações:**
            - Formato do CNPJ
            - Dígitos verificadores
            - Unicidade no sistema
            - Consulta opcional na Receita Federal (se integração ativa)
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["cnpj"],
                            properties: {
                                cnpj: {
                                    type: "string",
                                    description: "CNPJ a ser validado",
                                    example: "12.345.678/0001-90"
                                },
                                consultar_receita: {
                                    type: "boolean",
                                    description: "Consultar dados na Receita Federal",
                                    default: false,
                                    example: true
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "CNPJ validado com sucesso",
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
                                        example: "CNPJ válido e disponível"
                                    },
                                    data: {
                                        type: "object",
                                        properties: {
                                            cnpj: {
                                                type: "string",
                                                example: "12.345.678/0001-90"
                                            },
                                            valido: {
                                                type: "boolean",
                                                example: true
                                            },
                                            disponivel: {
                                                type: "boolean",
                                                example: true
                                            },
                                            dados_receita: {
                                                type: "object",
                                                properties: {
                                                    razao_social: {
                                                        type: "string",
                                                        example: "Auto Peças Sul Ltda"
                                                    },
                                                    situacao: {
                                                        type: "string",
                                                        example: "ATIVA"
                                                    },
                                                    endereco: {
                                                        type: "object",
                                                        properties: {
                                                            logradouro: {
                                                                type: "string",
                                                                example: "Rua das Peças"
                                                            },
                                                            numero: {
                                                                type: "string",
                                                                example: "123"
                                                            },
                                                            bairro: {
                                                                type: "string",
                                                                example: "Centro"
                                                            },
                                                            cidade: {
                                                                type: "string",
                                                                example: "São Paulo"
                                                            },
                                                            uf: {
                                                                type: "string",
                                                                example: "SP"
                                                            },
                                                            cep: {
                                                                type: "string",
                                                                example: "01234-567"
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
                    }
                },
                409: {
                    description: "CNPJ já cadastrado",
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
                                                    cnpj_existente: {
                                                        type: "string",
                                                        example: "12.345.678/0001-90"
                                                    },
                                                    fornecedor_id: {
                                                        type: "string",
                                                        example: "60d5ecb54b24a12a5c8e4f1b"
                                                    },
                                                    nome_fornecedor: {
                                                        type: "string",
                                                        example: "Auto Peças Sul Ltda"
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

export default fornecedoresRoutes;
