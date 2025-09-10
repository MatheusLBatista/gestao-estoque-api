const authRoutes = {
    "/login": {
        post: {
            tags: ["Autenticação"],
            summary: "Realizar login no sistema",
            description: `
            Autentica um usuário no sistema usando matrícula e senha.
            
            **Retorna:**
            - Token JWT de acesso (válido por 1 hora)
            - Token de refresh (válido por 7 dias)
            - Dados básicos do usuário
            
            **Importante:**
            - Usuários devem ter definido sua senha
            - Conta deve estar ativa
            - Tokens são armazenados para controle de sessão
            `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/LoginRequest"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Login realizado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/LoginResponse"
                            }
                        }
                    }
                },
                400: {
                    description: "Dados de entrada inválidos",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ValidationErrorResponse"
                            }
                        }
                    }
                },
                401: {
                    description: "Credenciais inválidas ou usuário sem senha definida",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: {
                                        type: "boolean",
                                        example: false
                                    },
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "Matrícula ou senha incorretos" },
                                            { example: "Usuário ainda não definiu sua senha. Use o código de segurança fornecido para definir sua senha." },
                                            { example: "Usuário inativo" }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: "Erro interno do servidor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                }
            }
        }
    },

    "/logout": {
        post: {
            tags: ["Autenticação"],
            summary: "Realizar logout no sistema",
            description: `
            Realiza o logout de um usuário no sistema.

            **Importante:**
            - O access token deve ser enviado no header \`Authorization: Bearer <token>\`
            - Usuários devem ter definido sua senha
            - Conta deve estar ativa
            - Tokens são armazenados para controle de sessão
            `,
            security: [
                { bearerAuth: [] }
            ],
            responses: {
                200: {
                    description: "Logout realizado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/LogoutResponse"
                            }
                        }
                    }
                },
                401: {
                    description: "Token inválido ou expirado",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: {
                                        type: "boolean",
                                        example: false
                                    },
                                    message: {
                                        type: "string",
                                        example: "Token inválido ou expirado"
                                    }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: "Erro interno do servidor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                }
            }
        }
    },

    "/refresh": {
        post: {
            tags: ["Autenticação"],
            summary: "Obter novo access token usando refresh token",
            description: `
            Gera um novo token de acesso (access token) usando um token de refresh válido.
            
            **Importante:**
            - O novo access token é válido por 1 hora
            - O refresh token permanece válido por 7 dias
            - O refresh token não é alterado nesta operação
            `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RefreshTokenRequest"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Novo access token gerado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/RefreshTokenResponse"
                            }
                        }
                    }
                },
                400: {
                    description: "Dados de entrada inválidos",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ValidationErrorResponse"
                            }
                        }
                    }
                },
                401: {
                    description: "Refresh token inválido ou expirado",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: {
                                        type: "boolean",
                                        example: false
                                    },
                                    message: {
                                        type: "string",
                                        example: "Refresh token inválido ou expirado"
                                    }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: "Erro interno do servidor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                }
            }
        }
    },

    "/recuperar-senha": {
        post: {
            tags: ["Autenticação"],
            summary: "Solicitar recuperação de senha",
            description: `
            Inicia o processo de recuperação de senha para um usuário.
            Um e-mail será enviado com instruções para redefinir a senha.
            `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RecuperarSenhaRequest"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "E-mail de recuperação enviado com sucesso",
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
                                        example: "Instruções de recuperação de senha enviadas para seu e-mail."
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "Dados de entrada inválidos",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ValidationErrorResponse"
                            }
                        }
                    }
                },
                404: {
                    description: "Usuário não encontrado",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: {
                                        type: "boolean",
                                        example: false
                                    },
                                    message: {
                                        type: "string",
                                        example: "Usuário não encontrado"
                                    }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: "Erro interno do servidor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                }
            }
        }
    },

    "/redefinir-senha/codigo": {
        post: {
            tags: ["Autenticação"],
            summary: "Redefinir senha usando código de 6 dígitos",
            description: `
            Redefine a senha do usuário usando um código de 6 dígitos.
            
            **Casos de uso:**
            1. **Recuperação de senha**: Usuário esqueceu senha e recebeu código
            2. **Primeira definição**: Usuário cadastrado sem senha usa código para definir
            
            **Comportamento:**
            - Código válido por 24 horas
            - Ativa conta automaticamente se for primeira definição
            - Limpa dados de recuperação após uso
            - Mensagem diferente para primeira definição vs recuperação
            `,
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RedefinirSenhaCodigoRequest"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Senha definida/redefinida com sucesso",
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
                                        oneOf: [
                                            { example: "Senha definida com sucesso! Sua conta está ativa e você já pode fazer login." },
                                            { example: "Senha atualizada com sucesso" }
                                        ],
                                        description: "Mensagem varia conforme seja primeira definição ou recuperação"
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "Código ou senha não fornecidos ou inválidos",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ValidationErrorResponse"
                            }
                        }
                    }
                },
                401: {
                    description: "Código expirado",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: {
                                        type: "boolean",
                                        example: false
                                    },
                                    message: {
                                        type: "string",
                                        example: "Código de recuperação expirado"
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Código inválido",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: {
                                        type: "boolean",
                                        example: false
                                    },
                                    message: {
                                        type: "string",
                                        example: "Código de recuperação inválido"
                                    }
                                }
                            }
                        }
                    }
                },
                500: {
                    description: "Erro interno do servidor",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                }
            }
        }
    }
};

export default authRoutes;
