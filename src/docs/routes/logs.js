import commonSchemas from "../schemas/common.js";

const logsRoutes = {
    "/api/logs": {
        get: {
            tags: ["Logs"],
            summary: "Buscar logs de auditoria do sistema",
            description: `
            Endpoint para buscar logs de auditoria e atividades do sistema com filtros avançados.
            
            **Funcionalidades principais:**
            - Busca de logs por usuário, evento ou período
            - Filtros por IP, rota, método HTTP
            - Estatísticas de atividades
            - Rastreamento completo de auditoria
            - Monitoramento de segurança
            
            **Tipos de eventos rastreados:**
            - Autenticação (LOGIN, LOGOUT, falhas)
            - Operações CRUD em produtos, fornecedores, movimentações
            - Gerenciamento de usuários e grupos
            - Erros de sistema e acessos negados
            
            **Informações capturadas:**
            - Dados do usuário (ID, matrícula, nome, perfil)
            - Informações de sistema (IP, navegador, SO)
            - Detalhes da requisição (método, rota, timestamp)
            - Dados específicos do evento
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                ...commonSchemas.PaginationParams,
                {
                    name: "usuario_id",
                    in: "query",
                    description: "Filtrar por ID do usuário",
                    schema: { 
                        type: "string",
                        example: "686c08cb0deaf53dca07ea68"
                    }
                },
                {
                    name: "matricula",
                    in: "query",
                    description: "Filtrar por matrícula do usuário",
                    schema: { 
                        type: "string",
                        example: "ADM0001"
                    }
                },
                {
                    name: "tipo_evento",
                    in: "query",
                    description: "Filtrar por tipo de evento",
                    schema: { 
                        type: "string",
                        enum: [
                            "LOGIN", "LOGOUT", "CRIAR_PRODUTO", "ATUALIZAR_PRODUTO", "DELETAR_PRODUTO",
                            "CRIAR_FORNECEDOR", "ATUALIZAR_FORNECEDOR", "DELETAR_FORNECEDOR",
                            "CRIAR_MOVIMENTACAO", "ATUALIZAR_MOVIMENTACAO", "DELETAR_MOVIMENTACAO",
                            "CRIAR_USUARIO", "ATUALIZAR_USUARIO", "DELETAR_USUARIO",
                            "ERRO_SISTEMA", "ACESSO_NEGADO", "TENTATIVA_LOGIN_FALHADA"
                        ],
                        example: "LOGIN"
                    }
                },
                {
                    name: "ip",
                    in: "query",
                    description: "Filtrar por endereço IP",
                    schema: { 
                        type: "string",
                        example: "192.168.1.100"
                    }
                },
                {
                    name: "data_inicio",
                    in: "query",
                    description: "Data de início do período (formato: YYYY-MM-DD)",
                    schema: { 
                        type: "string",
                        format: "date",
                        example: "2025-07-01"
                    }
                },
                {
                    name: "data_fim",
                    in: "query",
                    description: "Data de fim do período (formato: YYYY-MM-DD)",
                    schema: { 
                        type: "string",
                        format: "date",
                        example: "2025-07-31"
                    }
                },
                {
                    name: "rota",
                    in: "query",
                    description: "Filtrar por rota acessada",
                    schema: { 
                        type: "string",
                        example: "/api/produtos"
                    }
                },
                {
                    name: "metodo",
                    in: "query",
                    description: "Filtrar por método HTTP",
                    schema: { 
                        type: "string",
                        enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
                        example: "POST"
                    }
                },
                {
                    name: "incluir_estatisticas",
                    in: "query",
                    description: "Incluir estatísticas no resultado",
                    schema: { 
                        type: "boolean",
                        default: false,
                        example: true
                    }
                }
            ],
            responses: {
                200: {
                    description: "Logs recuperados com sucesso",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/LogSearchResponse"
                            },
                            examples: {
                                logs_simples: {
                                    summary: "Busca simples de logs",
                                    value: {
                                        success: true,
                                        message: "Logs recuperados com sucesso",
                                        data: {
                                            logs: [
                                                {
                                                    inicioSessao: "2025-07-07T17:54:20.708Z",
                                                    usuario: {
                                                        id: "686c08cb0deaf53dca07ea68",
                                                        matricula: "ADM0001",
                                                        nome: "Administrador",
                                                        perfil: "administrador"
                                                    },
                                                    informacaoSistema: {
                                                        ip: "192.168.1.100",
                                                        sistemaOperacional: "Windows 10/11",
                                                        navegador: "Chrome",
                                                        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                                                    },
                                                    eventos: [
                                                        {
                                                            timestamp: "2025-07-07T17:54:20.709Z",
                                                            tipo: "LOGIN",
                                                            ip: "192.168.1.100",
                                                            metodo: "POST",
                                                            rota: "/auth/login",
                                                            dados: {
                                                                tipo: "login_sucesso",
                                                                matricula: "ADM0001"
                                                            }
                                                        }
                                                    ]
                                                }
                                            ],
                                            pagination: {
                                                totalDocs: 25,
                                                limit: 10,
                                                totalPages: 3,
                                                page: 1,
                                                hasNextPage: true,
                                                hasPrevPage: false
                                            }
                                        }
                                    }
                                },
                                logs_com_estatisticas: {
                                    summary: "Logs com estatísticas",
                                    value: {
                                        success: true,
                                        message: "Logs recuperados com sucesso",
                                        data: {
                                            logs: [],
                                            pagination: {
                                                totalDocs: 150,
                                                limit: 10,
                                                totalPages: 15,
                                                page: 1,
                                                hasNextPage: true,
                                                hasPrevPage: false
                                            },
                                            estatisticas: {
                                                totalEventos: 150,
                                                eventosPorTipo: {
                                                    "LOGIN": 45,
                                                    "LOGOUT": 40,
                                                    "CRIAR_PRODUTO": 25,
                                                    "ATUALIZAR_PRODUTO": 15,
                                                    "CRIAR_MOVIMENTACAO": 20,
                                                    "ERRO_SISTEMA": 5
                                                },
                                                usuariosMaisAtivos: [
                                                    {
                                                        usuario: "João Silva",
                                                        totalEventos: 30
                                                    },
                                                    {
                                                        usuario: "Maria Santos",
                                                        totalEventos: 25
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: "Parâmetros de entrada inválidos",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ValidationErrorResponse"
                            },
                            examples: {
                                data_invalida: {
                                    summary: "Formato de data inválido",
                                    value: {
                                        success: false,
                                        message: "Dados de entrada inválidos",
                                        error: "ValidationError",
                                        details: {
                                            campos_invalidos: [
                                                {
                                                    campo: "data_inicio",
                                                    valor: "2025-13-45",
                                                    mensagem: "Formato de data inválido. Use YYYY-MM-DD"
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: "Token de acesso inválido ou ausente",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UnauthorizedResponse"
                            }
                        }
                    }
                },
                403: {
                    description: "Acesso negado - usuário sem permissão para visualizar logs",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ForbiddenResponse"
                            },
                            examples: {
                                acesso_negado: {
                                    summary: "Usuário sem permissão",
                                    value: {
                                        success: false,
                                        message: "Acesso negado. Apenas administradores podem visualizar logs do sistema",
                                        statusCode: 403
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

    "/api/logs/export": {
        get: {
            tags: ["Logs"],
            summary: "Exportar logs para arquivo",
            description: `
            Gera um arquivo de exportação dos logs de auditoria para download.
            
            **Formatos suportados:**
            - JSON: Dados estruturados completos
            - CSV: Tabela simplificada para análise
            - TXT: Log em formato texto legível
            
            **Funcionalidades:**
            - Aplicação dos mesmos filtros da busca
            - Compressão automática para grandes volumes
            - Metadados de exportação incluídos
            `,
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "formato",
                    in: "query",
                    required: true,
                    description: "Formato do arquivo de exportação",
                    schema: {
                        type: "string",
                        enum: ["json", "csv", "txt"],
                        example: "json"
                    }
                },
                {
                    name: "usuario_id",
                    in: "query",
                    description: "Filtrar por ID do usuário",
                    schema: { 
                        type: "string",
                        example: "686c08cb0deaf53dca07ea68"
                    }
                },
                {
                    name: "data_inicio",
                    in: "query",
                    description: "Data de início do período",
                    schema: { 
                        type: "string",
                        format: "date",
                        example: "2025-07-01"
                    }
                },
                {
                    name: "data_fim",
                    in: "query",
                    description: "Data de fim do período",
                    schema: { 
                        type: "string",
                        format: "date",
                        example: "2025-07-31"
                    }
                }
            ],
            responses: {
                200: {
                    description: "Arquivo de logs gerado com sucesso",
                    content: {
                        "application/octet-stream": {
                            schema: {
                                type: "string",
                                format: "binary"
                            }
                        },
                        "application/json": {
                            schema: {
                                type: "object"
                            }
                        },
                        "text/csv": {
                            schema: {
                                type: "string"
                            }
                        },
                        "text/plain": {
                            schema: {
                                type: "string"
                            }
                        }
                    },
                    headers: {
                        "Content-Disposition": {
                            description: "Nome do arquivo para download",
                            schema: {
                                type: "string",
                                example: "attachment; filename=\"logs_2025-07-07.json\""
                            }
                        }
                    }
                },
                400: {
                    description: "Parâmetros inválidos",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ValidationErrorResponse"
                            }
                        }
                    }
                },
                401: {
                    description: "Token de acesso inválido",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UnauthorizedResponse"
                            }
                        }
                    }
                },
                403: {
                    description: "Acesso negado",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ForbiddenResponse"
                            }
                        }
                    }
                },
                500: {
                    description: "Erro ao gerar arquivo",
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

export default logsRoutes;
