const commonSchemas = {
    // Respostas de sucesso padronizadas
    SuccessResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true,
                description: 'Indica se a operação foi bem-sucedida'
            },
            message: {
                type: 'string',
                example: 'Operação realizada com sucesso',
                description: 'Mensagem descritiva do resultado'
            },
            data: {
                type: 'object',
                description: 'Dados retornados pela operação'
            }
        }
    },

    // Respostas de erro padronizadas
    ErrorResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: false,
                description: 'Indica que a operação falhou'
            },
            message: {
                type: 'string',
                example: 'Erro ao processar solicitação',
                description: 'Mensagem de erro principal'
            },
            error: {
                type: 'string',
                example: 'ValidationError',
                description: 'Tipo do erro'
            },
            details: {
                type: 'object',
                description: 'Detalhes específicos do erro',
                properties: {
                    campo: {
                        type: 'string',
                        example: 'email',
                        description: 'Campo que causou o erro'
                    },
                    valor: {
                        type: 'string',
                        example: 'email-invalido',
                        description: 'Valor que causou o erro'
                    },
                    codigo: {
                        type: 'string',
                        example: 'DUPLICATE_KEY',
                        description: 'Código específico do erro'
                    }
                }
            },
            timestamp: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-15T10:30:00.000Z',
                description: 'Timestamp do erro'
            }
        }
    },

    // Resposta de erro de validação
    ValidationErrorResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: false
            },
            message: {
                type: 'string',
                example: 'Dados de entrada inválidos'
            },
            error: {
                type: 'string',
                example: 'ValidationError'
            },
            details: {
                type: 'object',
                properties: {
                    campos_invalidos: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                campo: {
                                    type: 'string',
                                    example: 'email'
                                },
                                valor: {
                                    type: 'string',
                                    example: 'email-invalido'
                                },
                                erro: {
                                    type: 'string',
                                    example: 'Formato de email inválido'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // Respostas paginadas padronizadas
    PaginatedResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Dados listados com sucesso'
            },
            data: {
                type: 'object',
                properties: {
                    docs: {
                        type: 'array',
                        items: {
                            type: 'object'
                        },
                        description: 'Array com os documentos da página atual'
                    },
                    totalDocs: {
                        type: 'integer',
                        example: 150,
                        description: 'Total de documentos na coleção'
                    },
                    limit: {
                        type: 'integer',
                        example: 10,
                        description: 'Limite de itens por página'
                    },
                    totalPages: {
                        type: 'integer',
                        example: 15,
                        description: 'Total de páginas'
                    },
                    page: {
                        type: 'integer',
                        example: 1,
                        description: 'Página atual'
                    },
                    pagingCounter: {
                        type: 'integer',
                        example: 1,
                        description: 'Contador de paginação'
                    },
                    hasPrevPage: {
                        type: 'boolean',
                        example: false,
                        description: 'Indica se há página anterior'
                    },
                    hasNextPage: {
                        type: 'boolean',
                        example: true,
                        description: 'Indica se há próxima página'
                    },
                    prevPage: {
                        type: 'integer',
                        nullable: true,
                        example: null,
                        description: 'Número da página anterior'
                    },
                    nextPage: {
                        type: 'integer',
                        nullable: true,
                        example: 2,
                        description: 'Número da próxima página'
                    }
                }
            }
        }
    },

    // Parâmetros de paginação reutilizáveis
    PaginationParams: [
        {
            name: "page",
            in: "query",
            description: "Número da página (começando em 1)",
            schema: { 
                type: "integer", 
                default: 1, 
                minimum: 1,
                example: 1
            }
        },
        {
            name: "limit",
            in: "query", 
            description: "Itens por página",
            schema: { 
                type: "integer", 
                default: 10, 
                minimum: 1, 
                maximum: 100,
                example: 10
            }
        },
        {
            name: "sort",
            in: "query",
            description: "Campo de ordenação",
            schema: { 
                type: "string",
                example: "data_cadastro"
            }
        },
        {
            name: "order",
            in: "query",
            description: "Direção da ordenação",
            schema: { 
                type: "string", 
                enum: ["asc", "desc"],
                default: "desc",
                example: "desc"
            }
        }
    ],

    // Respostas HTTP comuns reutilizáveis
    CommonResponses: {
        400: {
            description: "Requisição inválida - dados de entrada incorretos",
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/ValidationErrorResponse"
                    }
                }
            }
        },
        401: {
            description: "Não autorizado - token inválido ou expirado",
            content: {
                "application/json": {
                    schema: {
                        allOf: [
                            { $ref: "#/components/schemas/ErrorResponse" },
                            {
                                type: "object",
                                properties: {
                                    error: {
                                        type: "string",
                                        example: "UnauthorizedError"
                                    },
                                    message: {
                                        type: "string",
                                        example: "Token de acesso inválido ou expirado"
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        },
        403: {
            description: "Acesso negado - permissões insuficientes",
            content: {
                "application/json": {
                    schema: {
                        allOf: [
                            { $ref: "#/components/schemas/ErrorResponse" },
                            {
                                type: "object",
                                properties: {
                                    error: {
                                        type: "string",
                                        example: "ForbiddenError"
                                    },
                                    message: {
                                        type: "string",
                                        example: "Permissões insuficientes para esta operação"
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        },
        404: {
            description: "Recurso não encontrado",
            content: {
                "application/json": {
                    schema: {
                        allOf: [
                            { $ref: "#/components/schemas/ErrorResponse" },
                            {
                                type: "object",
                                properties: {
                                    error: {
                                        type: "string",
                                        example: "NotFoundError"
                                    },
                                    message: {
                                        type: "string",
                                        example: "Recurso não encontrado"
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        },
        409: {
            description: "Conflito - recurso já existe ou viola regras de negócio",
            content: {
                "application/json": {
                    schema: {
                        allOf: [
                            { $ref: "#/components/schemas/ErrorResponse" },
                            {
                                type: "object",
                                properties: {
                                    error: {
                                        type: "string",
                                        example: "ConflictError"
                                    },
                                    message: {
                                        type: "string",
                                        example: "Recurso já existe ou viola regras de negócio"
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        },
        422: {
            description: "Entidade não processável - dados válidos mas regras de negócio violadas",
            content: {
                "application/json": {
                    schema: {
                        allOf: [
                            { $ref: "#/components/schemas/ErrorResponse" },
                            {
                                type: "object",
                                properties: {
                                    error: {
                                        type: "string",
                                        example: "BusinessRuleViolation"
                                    },
                                    message: {
                                        type: "string",
                                        example: "Operação viola regras de negócio"
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        },
        500: {
            description: "Erro interno do servidor",
            content: {
                "application/json": {
                    schema: {
                        allOf: [
                            { $ref: "#/components/schemas/ErrorResponse" },
                            {
                                type: "object",
                                properties: {
                                    error: {
                                        type: "string",
                                        example: "InternalServerError"
                                    },
                                    message: {
                                        type: "string",
                                        example: "Erro interno do servidor"
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }
    }
};

export default commonSchemas;
