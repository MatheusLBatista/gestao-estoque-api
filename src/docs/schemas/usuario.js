const usuarioSchemas = {
    // Schema base do usuário
    Usuario: {
        type: 'object',
        properties: {
            _id: {
                type: 'string',
                description: 'ID único do usuário',
                example: '60d5ecb54b24a12a5c8e4f1a'
            },
            nome_usuario: {
                type: 'string',
                description: 'Nome completo do usuário',
                example: 'João Silva'
            },
            email: {
                type: 'string',
                format: 'email',
                description: 'Email do usuário',
                example: 'joao.silva@empresa.com'
            },
            matricula: {
                type: 'string',
                description: 'Matrícula única do usuário',
                example: '12345'
            },
            perfil: {
                type: 'string',
                enum: ['administrador', 'gerente', 'estoquista'],
                description: 'Perfil de acesso do usuário',
                example: 'estoquista'
            },
            ativo: {
                type: 'boolean',
                description: 'Status ativo do usuário',
                example: true
            },
            senha_definida: {
                type: 'boolean',
                description: 'Indica se o usuário já definiu sua senha',
                example: true
            },
            online: {
                type: 'boolean',
                description: 'Status online do usuário',
                example: false
            },
            grupos: {
                type: 'array',
                items: {
                    type: 'string'
                },
                description: 'IDs dos grupos de permissão do usuário',
                example: ['60d5ecb54b24a12a5c8e4f1a']
            },
            permissoes: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        rota: {
                            type: 'string',
                            example: '/api/produtos'
                        },
                        dominio: {
                            type: 'string',
                            example: 'localhost'
                        },
                        metodos: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
                            },
                            example: ['GET', 'POST']
                        }
                    }
                },
                description: 'Permissões individuais do usuário'
            },
            data_cadastro: {
                type: 'string',
                format: 'date-time',
                description: 'Data de cadastro do usuário',
                example: '2024-01-15T10:30:00.000Z'
            },
            data_ultima_atualizacao: {
                type: 'string',
                format: 'date-time',
                description: 'Data da última atualização',
                example: '2024-01-15T10:30:00.000Z'
            }
        }
    },

    // Schema para criação de usuário
    UsuarioCreateRequest: {
        type: 'object',
        required: ['nome_usuario', 'email', 'matricula', 'senha'],
        properties: {
            nome_usuario: {
                type: 'string',
                description: 'Nome completo do usuário',
                example: 'João Silva',
                minLength: 2,
                maxLength: 100
            },
            email: {
                type: 'string',
                format: 'email',
                description: 'Email válido do usuário',
                example: 'joao.silva@empresa.com'
            },
            matricula: {
                type: 'string',
                description: 'Matrícula única do usuário',
                example: '12345',
                minLength: 1,
                maxLength: 20
            },
            senha: {
                type: 'string',
                format: 'password',
                description: 'Senha do usuário (mínimo 6 caracteres)',
                example: 'senhasegura123',
                minLength: 6
            },
            perfil: {
                type: 'string',
                enum: ['administrador', 'gerente', 'estoquista'],
                description: 'Perfil de acesso do usuário',
                example: 'estoquista',
                default: 'estoquista'
            },
            grupos: {
                type: 'array',
                items: {
                    type: 'string'
                },
                description: 'IDs dos grupos de permissão (opcional)',
                example: ['60d5ecb54b24a12a5c8e4f1a']
            },
            permissoes: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        rota: {
                            type: 'string',
                            example: '/api/produtos'
                        },
                        dominio: {
                            type: 'string',
                            example: 'localhost'
                        },
                        metodos: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
                            },
                            example: ['GET']
                        }
                    }
                },
                description: 'Permissões individuais (opcional)'
            }
        }
    },

    // Schema para criação sem senha
    UsuarioCreateSemSenhaRequest: {
        type: 'object',
        required: ['nome_usuario', 'email', 'matricula'],
        properties: {
            nome_usuario: {
                type: 'string',
                description: 'Nome completo do usuário',
                example: 'João Silva',
                minLength: 2,
                maxLength: 100
            },
            email: {
                type: 'string',
                format: 'email',
                description: 'Email válido do usuário',
                example: 'joao.silva@empresa.com'
            },
            matricula: {
                type: 'string',
                description: 'Matrícula única do usuário',
                example: '12345',
                minLength: 1,
                maxLength: 20
            },
            perfil: {
                type: 'string',
                enum: ['administrador', 'gerente', 'estoquista'],
                description: 'Perfil de acesso do usuário',
                example: 'estoquista',
                default: 'estoquista'
            },
            grupos: {
                type: 'array',
                items: {
                    type: 'string'
                },
                description: 'IDs dos grupos de permissão (opcional)',
                example: ['60d5ecb54b24a12a5c8e4f1a']
            }
        }
    },

    // Schema para atualização
    UsuarioUpdateRequest: {
        type: 'object',
        properties: {
            nome_usuario: {
                type: 'string',
                description: 'Nome completo do usuário',
                example: 'João Silva Santos',
                minLength: 2,
                maxLength: 100
            },
            email: {
                type: 'string',
                format: 'email',
                description: 'Email válido do usuário',
                example: 'joao.santos@empresa.com'
            },
            perfil: {
                type: 'string',
                enum: ['administrador', 'gerente', 'estoquista'],
                description: 'Perfil de acesso do usuário',
                example: 'gerente'
            },
            ativo: {
                type: 'boolean',
                description: 'Status ativo do usuário',
                example: true
            },
            grupos: {
                type: 'array',
                items: {
                    type: 'string'
                },
                description: 'IDs dos grupos de permissão',
                example: ['60d5ecb54b24a12a5c8e4f1a']
            }
        }
    },

    // Resposta com usuário criado
    UsuarioResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Usuário encontrado com sucesso'
            },
            data: {
                $ref: '#/components/schemas/Usuario'
            }
        }
    },

    // Resposta com lista paginada
    UsuarioListResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            data: {
                type: 'object',
                properties: {
                    docs: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Usuario'
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
                        example: 2
                    }
                }
            }
        }
    },

    // Resposta de criação sem senha
    UsuarioCreateSemSenhaResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Usuário cadastrado com sucesso'
            },
            data: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        example: '60d5ecb54b24a12a5c8e4f1a'
                    },
                    nome_usuario: {
                        type: 'string',
                        example: 'João Silva'
                    },
                    email: {
                        type: 'string',
                        example: 'joao.silva@empresa.com'
                    },
                    matricula: {
                        type: 'string',
                        example: '12345'
                    },
                    perfil: {
                        type: 'string',
                        example: 'estoquista'
                    },
                    ativo: {
                        type: 'boolean',
                        example: false,
                        description: 'Usuário fica inativo até definir senha'
                    },
                    senha_definida: {
                        type: 'boolean',
                        example: false
                    },
                    codigoSeguranca: {
                        type: 'string',
                        example: '123456',
                        description: 'Código para definir senha'
                    },
                    instrucoes: {
                        type: 'string',
                        example: 'O usuário deve usar este código na endpoint \'/auth/redefinir-senha/codigo\' para definir sua senha. Código válido por 24 horas.'
                    }
                }
            }
        }
    }
};

export default usuarioSchemas;
