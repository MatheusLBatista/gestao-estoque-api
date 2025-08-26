const authSchemas = {
    // Request schemas
    LoginRequest: {
        type: 'object',
        required: ['matricula', 'senha'],
        properties: {
            matricula: {
                type: 'string',
                description: 'Matrícula do usuário',
                example: 'ADM0001',
                minLength: 1
            },
            senha: {
                type: 'string',
                format: 'password',
                description: 'Senha do usuário',
                example: 'Admin@123',
                minLength: 6
            }
        }
    },

    RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
            refreshToken: {
                type: 'string',
                description: 'Token de refresh válido',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
        }
    },

    RecuperarSenhaRequest: {
        type: 'object',
        required: ['email'],
        properties: {
            email: {
                type: 'string',
                format: 'email',
                description: 'Email do usuário para recuperação',
                example: 'usuario@empresa.com'
            }
        }
    },

    RedefinirSenhaTokenRequest: {
        type: 'object',
        required: ['token', 'senha'],
        properties: {
            token: {
                type: 'string',
                description: 'Token de recuperação recebido por email',
                example: 'abc123def456'
            },
            senha: {
                type: 'string',
                format: 'password',
                description: 'Nova senha',
                example: 'novasenhasegura123',
                minLength: 6
            }
        }
    },

    RedefinirSenhaCodigoRequest: {
        type: 'object',
        required: ['codigo', 'senha'],
        properties: {
            codigo: {
                type: 'string',
                description: 'Código de recuperação de 6 dígitos',
                example: '123456',
                pattern: '^[0-9]{6}$'
            },
            senha: {
                type: 'string',
                format: 'password',
                description: 'Nova senha',
                example: 'novasenhasegura123',
                minLength: 6
            }
        }
    },

    // Response schemas
    LoginResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Login realizado com sucesso'
            },
            data: {
                type: 'object',
                properties: {
                    usuario: {
                        type: 'object',
                        properties: {
                            id: {
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
                                enum: ['administrador', 'gerente', 'estoquista'],
                                example: 'estoquista'
                            }
                        }
                    },
                    accessToken: {
                        type: 'string',
                        description: 'Token JWT de acesso',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    },
                    refreshToken: {
                        type: 'string',
                        description: 'Token de refresh para renovar acesso',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    }
                }
            }
        }
    },

    RefreshTokenResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Token renovado com sucesso'
            },
            data: {
                type: 'object',
                properties: {
                    accessToken: {
                        type: 'string',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    }
                }
            }
        }
    },

    RecuperarSenhaResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Código de recuperação enviado para o email'
            }
        }
    },

    RedefinirSenhaResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Senha redefinida com sucesso'
            }
        }
    },

    LogoutResponse: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Logout realizado com sucesso'
            }
        }
    }
};

export default authSchemas;
