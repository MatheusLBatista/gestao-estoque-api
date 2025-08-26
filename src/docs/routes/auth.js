const authRoutes = {
    "/auth/login": {
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

    "/auth/redefinir-senha/codigo": {
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
