import commonSchemas from "../schemas/common.js";

const usuariosRoutes = {
    "/api/usuarios": {
        get: {
            tags: ["Usuários"],
            summary: "Lista todos os usuários",
            description: `
            Lista todos os usuários cadastrados no sistema com suporte a paginação e filtros.
            
            **Funcionalidades:**
            - Paginação automática
            - Filtros por perfil, status, nome
            - Busca por texto
            - Ordenação customizável
            - Controle de acesso por perfil
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                ...commonSchemas.PaginationParams,
                {
                    name: "nome_usuario",
                    in: "query",
                    description: "Filtrar por nome de usuário (busca parcial)",
                    schema: { type: "string", example: "joão" }
                },
                {
                    name: "matricula",
                    in: "query",
                    description: "Filtrar por matrícula (busca parcial)",
                    schema: { type: "string", example: "123" }
                },
                {
                    name: "perfil",
                    in: "query",
                    description: "Filtrar por perfil",
                    schema: { 
                        type: "string", 
                        enum: ["administrador", "gerente", "estoquista"], 
                        example: "estoquista" 
                    }
                },
                {
                    name: "ativo",
                    in: "query",
                    description: "Filtrar por status ativo",
                    schema: { type: "boolean", example: true }
                }
            ],
            responses: {
                200: {
                    description: "Usuários listados com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UsuarioListResponse"
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        },
        post: {
            tags: ["Usuários"],
            summary: "Cadastrar novo usuário",
            description: `
            Cadastra um novo usuário no sistema com senha.
            
            **Validações:**
            - Nome, email, matrícula e senha são obrigatórios
            - Email e matrícula devem ser únicos
            - Senha deve ter pelo menos 6 caracteres
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/UsuarioCreateRequest"
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Usuário cadastrado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UsuarioResponse"
                            }
                        }
                    }
                },
                409: {
                    description: "Matrícula ou email já cadastrados",
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
                                        example: "Usuário com este email ou matrícula já existe"
                                    }
                                }
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        }
    },

    "/api/usuarios/cadastrar-sem-senha": {
        post: {
            tags: ["Usuários"],
            summary: "Cadastrar usuário sem senha (gera código de segurança)",
            description: `
            Permite ao administrador cadastrar um usuário sem definir senha. 
            Um código de segurança será gerado para que o usuário defina sua própria senha.
            
            **Fluxo:**
            1. Administrador cadastra usuário com dados básicos
            2. Sistema gera código de 6 dígitos válido por 24 horas
            3. Usuário usa código no endpoint \`/auth/redefinir-senha/codigo\`
            4. Conta é ativada automaticamente após definir senha
            
            **Vantagens:**
            - Maior segurança (admin não conhece senhas)
            - Usuário define sua própria senha
            - Reutiliza sistema de recuperação existente
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/UsuarioCreateSemSenhaRequest"
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: "Usuário cadastrado com sucesso, código de segurança gerado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UsuarioCreateSemSenhaResponse"
                            }
                        }
                    }
                },
                403: {
                    description: "Acesso negado - apenas administradores podem cadastrar usuários",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },
                409: {
                    description: "Matrícula ou email já cadastrados",
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
                                        example: "Usuário com este email ou matrícula já existe"
                                    }
                                }
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        }
    },

    "/api/usuarios/{id}": {
        get: {
            tags: ["Usuários"],
            summary: "Buscar usuário por ID",
            description: "Retorna os dados de um usuário específico pelo seu ID.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do usuário",
                    schema: { type: "string", example: "60d5ecb54b24a12a5c8e4f1a" }
                }
            ],
            responses: {
                200: {
                    description: "Usuário encontrado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UsuarioResponse"
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        },
        put: {
            tags: ["Usuários"],
            summary: "Atualizar usuário",
            description: "Atualiza os dados de um usuário existente.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do usuário",
                    schema: { type: "string", example: "60d5ecb54b24a12a5c8e4f1a" }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/UsuarioUpdateRequest"
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Usuário atualizado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UsuarioResponse"
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        },
        delete: {
            tags: ["Usuários"],
            summary: "Excluir usuário",
            description: "Remove um usuário do sistema.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do usuário",
                    schema: { type: "string", example: "60d5ecb54b24a12a5c8e4f1a" }
                }
            ],
            responses: {
                200: {
                    description: "Usuário excluído com sucesso",
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
                                        example: "Usuário excluído com sucesso"
                                    }
                                }
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        }
    },
    "/api/usuarios/busca": {
        get: {
            tags: ["Usuários"],
            summary: "Buscar usuário por matrícula",
            description: `
            Busca um usuário específico pela matrícula.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "matricula",
                    in: "query",
                    required: true,
                    description: "Matrícula do usuário",
                    schema: { type: "string", example: "12345" }
                }
            ],
            responses: {
                200: {
                    description: "Usuário encontrado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UsuarioResponse"
                            }
                        }
                    }
                },
                404: {
                    description: "Usuário não encontrado",
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
    "/api/usuarios/desativar/{id}": {
        patch: {
            tags: ["Usuários"],
            summary: "Desativar usuário",
            description: `
            Desativa um usuário sem removê-lo do sistema.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do usuário",
                    schema: { type: "string", example: "60d5ecb54b24a12a5c8e4f1a" }
                }
            ],
            responses: {
                200: {
                    description: "Usuário desativado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UsuarioResponse"
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        }
    },
    "/api/usuarios/reativar/{id}": {
        patch: {
            tags: ["Usuários"],
            summary: "Reativar usuário",
            description: `
            Reativa um usuário previamente desativado.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "ID do usuário",
                    schema: { type: "string", example: "60d5ecb54b24a12a5c8e4f1a" }
                }
            ],
            responses: {
                200: {
                    description: "Usuário reativado com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UsuarioResponse"
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        }
    },
    "/api/usuarios/grupos/adicionar": {
        post: {
            tags: ["Usuários"],
            summary: "Adicionar usuário a um grupo",
            description: `
            Adiciona um usuário a um grupo específico.
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["usuario_id", "grupo_id"],
                            properties: {
                                usuario_id: {
                                    type: "string",
                                    description: "ID do usuário",
                                    example: "60d5ecb54b24a12a5c8e4f1a"
                                },
                                grupo_id: {
                                    type: "string",
                                    description: "ID do grupo",
                                    example: "60d5ecb54b24a12a5c8e4f1b"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Usuário adicionado ao grupo com sucesso",
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
                                        example: "Usuário adicionado ao grupo com sucesso"
                                    }
                                }
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        }
    },
    "/api/usuarios/grupos/remover": {
        post: {
            tags: ["Usuários"],
            summary: "Remover usuário de um grupo",
            description: `
            Remove um usuário de um grupo específico.
            `,
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["usuario_id", "grupo_id"],
                            properties: {
                                usuario_id: {
                                    type: "string",
                                    description: "ID do usuário",
                                    example: "60d5ecb54b24a12a5c8e4f1a"
                                },
                                grupo_id: {
                                    type: "string",
                                    description: "ID do grupo",
                                    example: "60d5ecb54b24a12a5c8e4f1b"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Usuário removido do grupo com sucesso",
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
                                        example: "Usuário removido do grupo com sucesso"
                                    }
                                }
                            }
                        }
                    }
                },
                ...commonSchemas.CommonResponses
            }
        }
    },
    "/api/usuarios/grupos/{userId}": {
        get: {
            tags: ["Usuários"],
            summary: "Listar grupos de um usuário",
            description: `
            Lista todos os grupos aos quais um usuário pertence.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "userId",
                    in: "path",
                    required: true,
                    description: "ID do usuário",
                    schema: { type: "string", example: "60d5ecb54b24a12a5c8e4f1a" }
                }
            ],
            responses: {
                200: {
                    description: "Grupos do usuário listados com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    success: {
                                        type: "boolean",
                                        example: true
                                    },
                                    data: {
                                        type: "object",
                                        properties: {
                                            grupos: {
                                                type: "array",
                                                items: { $ref: "#/components/schemas/Grupo" }
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
        },
        delete: {
            tags: ["Usuários"],
            summary: "Remover usuário de todos os grupos",
            description: `
            Remove um usuário de todos os grupos aos quais pertence.
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "userId",
                    in: "path",
                    required: true,
                    description: "ID do usuário",
                    schema: { type: "string", example: "60d5ecb54b24a12a5c8e4f1a" }
                }
            ],
            responses: {
                200: {
                    description: "Usuário removido de todos os grupos com sucesso",
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
                                        example: "Usuário removido de todos os grupos com sucesso"
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

export default usuariosRoutes;
