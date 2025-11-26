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
            summary: "Solicitar recuperação de senha ou reenvio de link de primeiro acesso",
            description: `
            Inicia o processo de recuperação de senha ou reenvia link de primeiro acesso.
            
            **Funcionalidades:**
            - Diferencia automaticamente entre primeiro acesso e recuperação
            - Envia email de boas-vindas (verde) para usuários sem senha definida
            - Envia email de recuperação (vermelho) para usuários com senha existente
            - Não revela se o email existe no sistema (segurança)
            - Link válido por 24 horas (primeiro acesso) ou 1 hora (recuperação)
            
            **Segurança:**
            - Sempre retorna mensagem de sucesso, independente do email existir
            - Não expõe enumeração de usuários
            - Token único gerado com expiração
            
            **URLs geradas:**
            - Primeiro acesso: \`/definir-senha/[token]\`
            - Recuperação: \`/redefinir-senha/[token]\`
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
                    description: "Mensagem genérica de sucesso (não revela se email existe)",
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
                                        example: "Se existe uma conta com este email, você receberá instruções para redefinir sua senha."
                                    },
                                    codigo: {
                                        type: "string",
                                        example: "ABC123",
                                        description: "Código de 6 dígitos (apenas em desenvolvimento)"
                                    },
                                    token: {
                                        type: "string",
                                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                        description: "Token JWT (apenas em desenvolvimento)"
                                    },
                                    isPrimeiroAcesso: {
                                        type: "boolean",
                                        example: true,
                                        description: "Indica se é primeiro acesso (apenas em desenvolvimento)"
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
            summary: "Redefinir senha usando código de 6 dígitos (alternativa ao token)",
            description: `
            Redefine senha (recuperação) ou define pela primeira vez usando código de 6 dígitos.
            
            **Casos de uso:**
            1. **Primeiro Acesso**: Usuário recebe código ao ser cadastrado
               - Código válido por 24 horas
               - Ativa conta automaticamente após definir senha
               - Mensagem: "Senha definida com sucesso! Sua conta está ativa..."
            
            2. **Recuperação**: Usuário esqueceu senha e recebe novo código
               - Código válido por 1 hora
               - Atualiza senha existente
               - Mensagem: "Senha atualizada com sucesso! Você já pode fazer login..."
            
            **Validações:**
            - Código mínimo de 4 caracteres
            - Senha mínima de 6 caracteres
            - Código não expirado
            - Código só pode ser usado uma vez
            
            **Segurança:**
            - Código alfanumérico case-insensitive
            - Limpa todos os dados de recuperação após uso
            - Email de confirmação enviado automaticamente
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
                                            { example: "Senha atualizada com sucesso! Você já pode fazer login com sua nova senha." }
                                        ],
                                        description: "Mensagem varia conforme seja primeira definição ou recuperação"
                                    },
                                    isPrimeiroAcesso: {
                                        type: "boolean",
                                        example: true,
                                        description: "Indica se foi primeiro acesso (true) ou recuperação (false)"
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "Validação falhou",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "Código é obrigatório" },
                                            { example: "Senha é obrigatória" },
                                            { example: "Código inválido" },
                                            { example: "A senha deve ter no mínimo 6 caracteres" }
                                        ]
                                    }
                                }
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
                                    success: { type: "boolean", example: false },
                                    message: {
                                        type: "string",
                                        example: "Código expirado. Solicite um novo código de recuperação."
                                    }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: "Código inválido ou não encontrado",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: {
                                        type: "string",
                                        example: "Código inválido ou expirado"
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

    "/redefinir-senha/token": {
        post: {
            tags: ["Autenticação"],
            summary: "Redefinir senha ou definir senha de primeiro acesso usando token",
            description: `
            Redefine senha (recuperação) ou define senha pela primeira vez usando token JWT.
            
            **Casos de uso:**
            1. **Primeiro Acesso**: Usuário clica no link do email de boas-vindas
               - URL: \`/definir-senha/[token]\`
               - Ativa conta automaticamente
               - Mensagem: "Senha definida com sucesso! Sua conta está ativa..."
            
            2. **Recuperação**: Usuário esqueceu senha e clica no link do email
               - URL: \`/redefinir-senha/[token]\`
               - Atualiza senha existente
               - Mensagem: "Senha redefinida com sucesso! Você já pode fazer login..."
            
            **Validações:**
            - Token deve ser válido e não expirado
            - Senha mínima de 6 caracteres
            - Token só pode ser usado uma vez
            
            **Parâmetros:**
            - Token via query string: \`?token=eyJhbGci...\`
            - Senha no body
            `,
            parameters: [
                {
                    name: "token",
                    in: "query",
                    required: true,
                    description: "Token JWT de recuperação/primeiro acesso",
                    schema: {
                        type: "string",
                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["senha"],
                            properties: {
                                senha: {
                                    type: "string",
                                    format: "password",
                                    minLength: 6,
                                    example: "MinhaS3nh@Segura",
                                    description: "Nova senha (mínimo 6 caracteres)"
                                }
                            }
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
                                            { example: "Senha redefinida com sucesso! Você já pode fazer login com sua nova senha." }
                                        ],
                                        description: "Mensagem varia se é primeiro acesso ou recuperação"
                                    },
                                    isPrimeiroAcesso: {
                                        type: "boolean",
                                        example: true,
                                        description: "Indica se foi primeiro acesso (true) ou recuperação (false)"
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "Validação falhou",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: { type: "boolean", example: false },
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "Token é obrigatório" },
                                            { example: "Senha é obrigatória" },
                                            { example: "A senha deve ter no mínimo 6 caracteres" }
                                        ]
                                    }
                                }
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
                                    success: { type: "boolean", example: false },
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "Token inválido ou expirado" },
                                            { example: "Token expirado. Solicite um novo link de recuperação." }
                                        ]
                                    }
                                }
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
                                    success: { type: "boolean", example: false },
                                    message: { type: "string", example: "Usuário não encontrado" }
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

    "/revoke": {
        post: {
            tags: ["Autenticação"],
            summary: "Revogar tokens de acesso e refresh",
            description: `
            Revoga o access token e o refresh token do usuário, encerrando a sessão atual.
            
            **Importante:**
            - O access token deve ser enviado no header \`Authorization: Bearer <token>\`
            - Usuários devem ter definido sua senha
            - Conta deve estar ativa
            - Tokens são armazenados para controle de sessão
            `,
            security: [
                { bearerAuth: [] }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RevokeRequest"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Tokens revogados com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/RevokeResponse"
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
    }
};

export default authRoutes;
