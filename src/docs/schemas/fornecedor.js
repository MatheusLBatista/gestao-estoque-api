const fornecedorSchemas = {
    // Schema básico do fornecedor alinhado com o model
    Fornecedor: {
        type: 'object',
        properties: {
            _id: {
                type: 'string',
                description: 'ID único do fornecedor',
                example: '60d5ecb54b24a12a5c8e4f1b'
            },
            nome_fornecedor: {
                type: 'string',
                description: 'Nome do fornecedor',
                example: 'Auto Peças Sul Ltda',
                maxLength: 255
            },
            cnpj: {
                type: 'string',
                description: 'CNPJ do fornecedor',
                example: '12.345.678/0001-90',
                pattern: '^\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}-\\d{2}$'
            },
            telefone: {
                type: 'string',
                description: 'Telefone do fornecedor',
                example: '(11) 99999-9999'
            },
            email: {
                type: 'string',
                format: 'email',
                description: 'Email do fornecedor',
                example: 'contato@autopecassul.com'
            },
            status: {
                type: 'boolean',
                description: 'Status ativo do fornecedor',
                example: true
            },
            endereco: {
                type: 'array',
                description: 'Endereços do fornecedor',
                items: {
                    type: 'object',
                    properties: {
                        logradouro: {
                            type: 'string',
                            description: 'Logradouro',
                            example: 'Rua das Peças, 123'
                        },
                        bairro: {
                            type: 'string',
                            description: 'Bairro',
                            example: 'Centro'
                        },
                        cidade: {
                            type: 'string',
                            description: 'Cidade',
                            example: 'São Paulo'
                        },
                        estado: {
                            type: 'string',
                            description: 'Estado',
                            example: 'SP'
                        },
                        cep: {
                            type: 'string',
                            description: 'CEP',
                            example: '01234-567'
                        }
                    }
                }
            },
            data_cadastro: {
                type: 'string',
                format: 'date-time',
                description: 'Data de criação do fornecedor',
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

    // Schema para criação de fornecedor
    FornecedorCreateRequest: {
        type: 'object',
        required: ['nome_fornecedor', 'cnpj', 'telefone', 'email', 'endereco'],
        properties: {
            nome_fornecedor: {
                type: 'string',
                description: 'Nome do fornecedor',
                example: 'Auto Peças Sul Ltda',
                minLength: 3,
                maxLength: 255
            },
            cnpj: {
                type: 'string',
                description: 'CNPJ do fornecedor',
                example: '12.345.678/0001-90',
                pattern: '^\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}-\\d{2}$'
            },
            telefone: {
                type: 'string',
                description: 'Telefone do fornecedor',
                example: '(11) 99999-9999'
            },
            email: {
                type: 'string',
                format: 'email',
                description: 'Email do fornecedor',
                example: 'contato@autopecassul.com'
            },
            endereco: {
                type: 'array',
                description: 'Endereços do fornecedor',
                minItems: 1,
                items: {
                    type: 'object',
                    required: ['logradouro', 'bairro', 'cidade', 'estado', 'cep'],
                    properties: {
                        logradouro: {
                            type: 'string',
                            description: 'Logradouro',
                            example: 'Rua das Peças, 123'
                        },
                        bairro: {
                            type: 'string',
                            description: 'Bairro',
                            example: 'Centro'
                        },
                        cidade: {
                            type: 'string',
                            description: 'Cidade',
                            example: 'São Paulo'
                        },
                        estado: {
                            type: 'string',
                            description: 'Estado',
                            example: 'SP'
                        },
                        cep: {
                            type: 'string',
                            description: 'CEP',
                            example: '01234-567'
                        }
                    }
                }
            }
        }
    },

    // Schema para atualização de fornecedor
    FornecedorUpdateRequest: {
        type: 'object',
        properties: {
            nome_fornecedor: {
                type: 'string',
                description: 'Nome do fornecedor',
                example: 'Auto Peças Sul Ltda',
                minLength: 3,
                maxLength: 255
            },
            telefone: {
                type: 'string',
                description: 'Telefone do fornecedor',
                example: '(11) 88888-8888'
            },
            email: {
                type: 'string',
                format: 'email',
                description: 'Email do fornecedor',
                example: 'novoemail@autopecassul.com'
            },
            status: {
                type: 'boolean',
                description: 'Status ativo do fornecedor',
                example: true
            },
            endereco: {
                type: 'array',
                description: 'Endereços do fornecedor',
                items: {
                    type: 'object',
                    required: ['logradouro', 'bairro', 'cidade', 'estado', 'cep'],
                    properties: {
                        logradouro: {
                            type: 'string',
                            description: 'Logradouro',
                            example: 'Rua das Peças, 456'
                        },
                        bairro: {
                            type: 'string',
                            description: 'Bairro',
                            example: 'Centro'
                        },
                        cidade: {
                            type: 'string',
                            description: 'Cidade',
                            example: 'São Paulo'
                        },
                        estado: {
                            type: 'string',
                            description: 'Estado',
                            example: 'SP'
                        },
                        cep: {
                            type: 'string',
                            description: 'CEP',
                            example: '01234-567'
                        }
                    }
                }
            }
        }
    },

    // Schema para resposta de fornecedor único
    FornecedorResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Fornecedor encontrado com sucesso'
            },
            data: {
                $ref: '#/components/schemas/Fornecedor'
            }
        }
    },

    // Schema para resposta de lista de fornecedores
    FornecedorListResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Fornecedores listados com sucesso'
            },
            data: {
                type: 'object',
                properties: {
                    docs: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Fornecedor'
                        }
                    },
                    totalDocs: {
                        type: 'integer',
                        example: 25
                    },
                    limit: {
                        type: 'integer',
                        example: 10
                    },
                    totalPages: {
                        type: 'integer',
                        example: 3
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

export default fornecedorSchemas;
