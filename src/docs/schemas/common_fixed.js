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
                                    example: 'email_invalido'
                                },
                                mensagem: {
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

    // Resposta com paginação
    PaginationResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Dados recuperados com sucesso'
            },
            data: {
                type: 'object',
                properties: {
                    items: {
                        type: 'array',
                        description: 'Lista de itens retornados',
                        items: {
                            type: 'object'
                        }
                    },
                    pagination: {
                        type: 'object',
                        properties: {
                            totalDocs: {
                                type: 'integer',
                                example: 150,
                                description: 'Total de documentos'
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
            }
        }
    },

    // Resposta de recurso não encontrado
    NotFoundResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: false
            },
            message: {
                type: 'string',
                example: 'Recurso não encontrado'
            },
            statusCode: {
                type: 'integer',
                example: 404
            }
        }
    },

    // Resposta de acesso negado
    UnauthorizedResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: false
            },
            message: {
                type: 'string',
                example: 'Token de acesso inválido ou expirado'
            },
            statusCode: {
                type: 'integer',
                example: 401
            }
        }
    },

    // Resposta de permissão negada
    ForbiddenResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: false
            },
            message: {
                type: 'string',
                example: 'Acesso negado. Permissões insuficientes'
            },
            statusCode: {
                type: 'integer',
                example: 403
            }
        }
    },

    // Parâmetros comuns de paginação
    PaginationParams: [
        {
            name: 'page',
            in: 'query',
            description: 'Número da página',
            schema: {
                type: 'integer',
                default: 1,
                minimum: 1
            }
        },
        {
            name: 'limit',
            in: 'query',
            description: 'Número de itens por página',
            schema: {
                type: 'integer',
                default: 10,
                minimum: 1,
                maximum: 100
            }
        },
        {
            name: 'sortBy',
            in: 'query',
            description: 'Campo para ordenação',
            schema: {
                type: 'string',
                example: 'nome'
            }
        },
        {
            name: 'sortOrder',
            in: 'query',
            description: 'Ordem de classificação',
            schema: {
                type: 'string',
                enum: ['asc', 'desc'],
                default: 'asc'
            }
        }
    ],

    // Respostas comuns reutilizáveis
    CommonResponses: {
        '400': {
            description: 'Dados de entrada inválidos',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/ValidationErrorResponse'
                    }
                }
            }
        },
        '401': {
            description: 'Token de acesso inválido ou ausente',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/UnauthorizedResponse'
                    }
                }
            }
        },
        '403': {
            description: 'Acesso negado - permissões insuficientes',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/ForbiddenResponse'
                    }
                }
            }
        },
        '404': {
            description: 'Recurso não encontrado',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/NotFoundResponse'
                    }
                }
            }
        },
        '409': {
            description: 'Conflito - recurso já existe',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/ErrorResponse'
                    }
                }
            }
        },
        '500': {
            description: 'Erro interno do servidor',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/ErrorResponse'
                    }
                }
            }
        }
    },

    // Schema para campos de auditoria
    AuditFields: {
        type: 'object',
        properties: {
            data_criacao: {
                type: 'string',
                format: 'date-time',
                description: 'Data de criação do registro',
                example: '2024-01-15T10:30:00.000Z'
            },
            data_ultima_atualizacao: {
                type: 'string',
                format: 'date-time',
                description: 'Data da última atualização',
                example: '2024-01-15T14:20:00.000Z'
            },
            usuario_criacao: {
                type: 'string',
                description: 'ID do usuário que criou o registro',
                example: '60d5ecb54b24a12a5c8e4f1a'
            },
            usuario_ultima_atualizacao: {
                type: 'string',
                description: 'ID do usuário que fez a última atualização',
                example: '60d5ecb54b24a12a5c8e4f1d'
            }
        }
    }
};

export default commonSchemas;
