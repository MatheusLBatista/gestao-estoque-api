import commonSchemas from "../schemas/common.js";

const usuariosRoutes = {
  "/usuarios": {
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
          schema: { type: "string", example: "joão" },
        },
        {
          name: "matricula",
          in: "query",
          description: "Filtrar por matrícula (busca parcial)",
          schema: { type: "string", example: "123" },
        },
        {
          name: "perfil",
          in: "query",
          description: "Filtrar por perfil",
          schema: {
            type: "string",
            enum: ["administrador", "gerente", "estoquista"],
            example: "estoquista",
          },
        },
        {
          name: "ativo",
          in: "query",
          description: "Filtrar por status ativo",
          schema: { type: "boolean", example: true },
        },
      ],
      responses: {
        200: {
          description: "Usuários listados com sucesso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UsuarioListResponse",
              },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
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
              $ref: "#/components/schemas/UsuarioCreateRequest",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Usuário cadastrado com sucesso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UsuarioResponse",
              },
            },
          },
        },
        409: {
          description: "Matrícula ou email já cadastrados",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: {
                    type: "string",
                    example: "Usuário com este email ou matrícula já existe",
                  },
                },
              },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
    },
  },

  "/usuarios/cadastrar-sem-senha": {
    post: {
      tags: ["Usuários"],
      summary: "Cadastrar usuário sem senha (Primeiro Acesso - Método Recomendado)",
      description: `
        **MÉTODO RECOMENDADO** para cadastrar novos usuários no sistema.
        
        Permite ao administrador cadastrar um usuário sem definir senha inicial.
        O usuário recebe um email de boas-vindas com link para definir sua própria senha.
        
        **Fluxo Completo:**
        1. Administrador cadastra usuário com dados básicos (sem senha)
        2. Sistema gera automaticamente:
           - Código de 6 dígitos (backup)
           - Token JWT único
           - Ambos válidos por 24 horas
        3. Usuário recebe **Email de Boas-Vindas** (tema verde 🎉):
           - Subject: "Bem-vindo(a) ao Sistema!"
           - Botão: "Ativar Minha Conta"
           - Link: \`/definir-senha/[token]\`
        4. Usuário clica no link e define senha
        5. Conta é **ativada automaticamente**
        6. Usuário recebe email de confirmação
        7. Usuário pode fazer login com matrícula + senha
        
      `,
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UsuarioCreateSemSenhaRequest",
            },
          },
        },
      },
      responses: {
        201: {
          description:
            "Usuário cadastrado com sucesso, código de segurança gerado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UsuarioCreateSemSenhaResponse",
              },
            },
          },
        },
        403: {
          description:
            "Acesso negado - apenas administradores podem cadastrar usuários",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        409: {
          description: "Matrícula ou email já cadastrados",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: {
                    type: "string",
                    example: "Usuário com este email ou matrícula já existe",
                  },
                },
              },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
    },
  },

  "/usuarios/{id}": {
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
          schema: { type: "string", example: "60d5ecb54b24a12a5c8e4f1a" },
        },
      ],
      responses: {
        200: {
          description: "Usuário encontrado com sucesso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UsuarioResponse" },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
    },
  },

  "/usuarios/{matricula}": {
    patch: {
      tags: ["Usuários"],
      summary: "Atualizar usuário por matrícula",
      description: "Atualiza os dados de um usuário existente usando sua matrícula.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "matricula",
          in: "path",
          required: true,
          description: "Matrícula do usuário",
          schema: { type: "string", example: "ADM0001" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UsuarioUpdateRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Usuário atualizado com sucesso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UsuarioResponse" },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
    },
    delete: {
      tags: ["Usuários"],
      summary: "Excluir usuário por matrícula",
      description: "Remove um usuário do sistema usando sua matrícula.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "matricula",
          in: "path",
          required: true,
          description: "Matrícula do usuário",
          schema: { type: "string", example: "ADM0001" },
        },
      ],
      responses: {
        200: {
          description: "Usuário excluído com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Usuário excluído com sucesso",
                  },
                },
              },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
    },
  },

  "/usuarios/busca/{matricula}": {
    get: {
      tags: ["Usuários"],
      summary: "Buscar usuário por matrícula",
      description: `
        Busca um usuário específico pela matrícula informada na URL.
        
        **Exemplo de uso:**
        \`GET /usuarios/busca/ADM0001\`
      `,
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "matricula",
          in: "path",
          required: true,
          description: "Matrícula do usuário",
          schema: { type: "string", example: "ADM0001" },
        },
      ],
      responses: {
        200: {
          description: "Usuário encontrado com sucesso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UsuarioResponse" },
            },
          },
        },
        404: {
          description: "Usuário não encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
    },
  },

  "/usuarios/desativar/{matricula}": {
    patch: {
      tags: ["Usuários"],
      summary: "Desativar usuário por matrícula",
      description: "Desativa um usuário sem removê-lo do sistema usando sua matrícula.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "matricula",
          in: "path",
          required: true,
          description: "Matrícula do usuário",
          schema: { type: "string", example: "ADM0001" },
        },
      ],
      responses: {
        200: {
          description: "Usuário desativado com sucesso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UsuarioResponse" },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
    },
  },

  "/usuarios/reativar/{matricula}": {
    patch: {
      tags: ["Usuários"],
      summary: "Reativar usuário por matrícula",
      description: "Reativa um usuário previamente desativado usando sua matrícula.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "matricula",
          in: "path",
          required: true,
          description: "Matrícula do usuário",
          schema: { type: "string", example: "ADM0001" },
        },
      ],
      responses: {
        200: {
          description: "Usuário reativado com sucesso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UsuarioResponse" },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
    },
  },

  "/usuarios/grupos/adicionar": {
    post: {
      tags: ["Usuários"],
      summary: "Adicionar usuário a um grupo",
      description: "Adiciona um usuário a um grupo específico.",
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
                  example: "60d5ecb54b24a12a5c8e4f1a",
                },
                grupo_id: {
                  type: "string",
                  description: "ID do grupo",
                  example: "60d5ecb54b24a12a5c8e4f1b",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Usuário adicionado ao grupo com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Usuário adicionado ao grupo com sucesso",
                  },
                },
              },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
    },
  },

  "/usuarios/grupos/remover": {
    post: {
      tags: ["Usuários"],
      summary: "Remover usuário de um grupo",
      description: "Remove um usuário de um grupo específico.",
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
                  example: "60d5ecb54b24a12a5c8e4f1a",
                },
                grupo_id: {
                  type: "string",
                  description: "ID do grupo",
                  example: "60d5ecb54b24a12a5c8e4f1b",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Usuário removido do grupo com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Usuário removido do grupo com sucesso",
                  },
                },
              },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
    },
  },

  "/usuarios/grupos/{userId}": {
    get: {
      tags: ["Usuários"],
      summary: "Listar grupos de um usuário",
      description: "Lista todos os grupos aos quais um usuário pertence.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          description: "ID do usuário",
          schema: { type: "string", example: "60d5ecb54b24a12a5c8e4f1a" },
        },
      ],
      responses: {
        200: {
          description: "Grupos do usuário listados com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      grupos: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Grupo" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
    },
    delete: {
      tags: ["Usuários"],
      summary: "Remover usuário de todos os grupos",
      description: "Remove um usuário de todos os grupos aos quais pertence.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          description: "ID do usuário",
          schema: { type: "string", example: "60d5ecb54b24a12a5c8e4f1a" },
        },
      ],
      responses: {
        200: {
          description: "Usuário removido de todos os grupos com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Usuário removido de todos os grupos com sucesso",
                  },
                },
              },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
    },
  },
  "/usuarios/{matricula}/foto-perfil": {
    post: {
      tags: ["Usuários"],
      summary: "Upload de foto de perfil",
      description: `
        Faz upload de uma foto de perfil para um usuário específico.
        
        **Validações:**
        - Matrícula do usuário deve existir
        - Apenas imagens são aceitas (JPEG, PNG, GIF, WEBP)
        - Tamanho máximo: 5MB
        - O arquivo anterior será substituído
        
        **Formatos aceitos:**
        - image/jpeg
        - image/png
      `,
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "matricula",
          in: "path",
          required: true,
          description: "Matrícula do usuário",
          schema: { type: "string", example: "12345" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["foto"],
              properties: {
                foto: {
                  type: "string",
                  format: "binary",
                  description: "Arquivo de imagem (JPEG, PNG, GIF ou WEBP, máx 5MB)",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Foto de perfil atualizada com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      _id: { type: "string", example: "60d5ecb54b24a12a5c8e4f1a" },
                      nome_usuario: { type: "string", example: "João Silva" },
                      email: { type: "string", example: "joao.silva@email.com" },
                      matricula: { type: "string", example: "12345" },
                      foto_perfil: {
                        type: "string",
                        example: "/uploads/profile-images/profile-12345-1733068800000-123456789.jpg",
                      },
                      perfil: { type: "string", example: "administrador" },
                      ativo: { type: "boolean", example: true },
                    },
                  },
                  message: {
                    type: "string",
                    example: "Foto de perfil atualizada com sucesso.",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Erro de validação - arquivo não enviado ou formato inválido",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  error: {
                    type: "object",
                    properties: {
                      statusCode: { type: "number", example: 400 },
                      errorType: { type: "string", example: "validationError" },
                      field: { type: "string", example: "foto" },
                      message: {
                        type: "string",
                        example: "Nenhuma imagem foi enviada.",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Usuário não encontrado",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  error: {
                    type: "object",
                    properties: {
                      statusCode: { type: "number", example: 404 },
                      errorType: { type: "string", example: "resourceNotFound" },
                      field: { type: "string", example: "usuario" },
                      message: {
                        type: "string",
                        example: "Usuário com matrícula 12345 não encontrado.",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        413: {
          description: "Arquivo muito grande (máximo 5MB)",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  error: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Tamanho do arquivo excede o limite de 5MB.",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        415: {
          description: "Formato de arquivo não suportado",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  error: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Formato de arquivo não suportado. Use apenas: JPEG, PNG, GIF ou WEBP",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ...commonSchemas.CommonResponses,
      },
    },
  },
};

export default usuariosRoutes;
