const logsSchemas = {
    // Schema de sessão de logs
    LogSession: {
        type: "object",
        properties: {
            inicioSessao: {
                type: "string",
                format: "date-time",
                description: "Data e hora de início da sessão",
                example: "2025-07-07T17:54:20.708Z"
            },
            usuario: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "ID do usuário",
                        example: "686c08cb0deaf53dca07ea68"
                    },
                    matricula: {
                        type: "string",
                        description: "Matrícula do usuário",
                        example: "ADM0001"
                    },
                    nome: {
                        type: "string",
                        description: "Nome do usuário",
                        example: "Administrador"
                    },
                    perfil: {
                        type: "string",
                        enum: ["administrador", "gerente", "estoquista"],
                        description: "Perfil do usuário",
                        example: "administrador"
                    }
                }
            },
            informacaoSistema: {
                type: "object",
                properties: {
                    ip: {
                        type: "string",
                        description: "Endereço IP do cliente",
                        example: "192.168.1.100"
                    },
                    sistemaOperacional: {
                        type: "string",
                        description: "Sistema operacional identificado",
                        example: "Windows 10/11"
                    },
                    navegador: {
                        type: "string",
                        description: "Navegador identificado",
                        example: "Chrome"
                    },
                    userAgent: {
                        type: "string",
                        description: "User-Agent completo",
                        example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    }
                }
            },
            eventos: {
                type: "array",
                description: "Lista de eventos da sessão",
                items: {
                    $ref: "#/components/schemas/LogEvent"
                }
            }
        }
    },

    // Schema de evento de log
    LogEvent: {
        type: "object",
        properties: {
            timestamp: {
                type: "string",
                format: "date-time",
                description: "Data e hora do evento",
                example: "2025-07-07T17:54:20.709Z"
            },
            tipo: {
                type: "string",
                description: "Tipo do evento",
                enum: [
                    "LOGIN", "LOGOUT", "CRIAR_PRODUTO", "ATUALIZAR_PRODUTO", "DELETAR_PRODUTO",
                    "CRIAR_FORNECEDOR", "ATUALIZAR_FORNECEDOR", "DELETAR_FORNECEDOR",
                    "CRIAR_MOVIMENTACAO", "ATUALIZAR_MOVIMENTACAO", "DELETAR_MOVIMENTACAO",
                    "CRIAR_USUARIO", "ATUALIZAR_USUARIO", "DELETAR_USUARIO",
                    "ERRO_SISTEMA", "ACESSO_NEGADO", "TENTATIVA_LOGIN_FALHADA"
                ],
                example: "LOGIN"
            },
            ip: {
                type: "string",
                description: "IP do cliente",
                example: "192.168.1.100"
            },
            userAgent: {
                type: "string",
                description: "User-Agent do cliente",
                example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            sistemaOperacional: {
                type: "string",
                description: "Sistema operacional",
                example: "Windows 10/11"
            },
            navegador: {
                type: "string",
                description: "Navegador",
                example: "Chrome"
            },
            metodo: {
                type: "string",
                description: "Método HTTP",
                enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
                example: "POST"
            },
            rota: {
                type: "string",
                description: "Rota acessada",
                example: "/auth/login"
            },
            dados: {
                type: "object",
                description: "Dados específicos do evento",
                properties: {
                    tipo: {
                        type: "string",
                        description: "Subtipo do evento",
                        example: "login_sucesso"
                    },
                    matricula: {
                        type: "string",
                        description: "Matrícula relacionada ao evento",
                        example: "ADM0001"
                    },
                    id_recurso: {
                        type: "string",
                        description: "ID do recurso manipulado",
                        example: "60d5ecb54b24a12a5c8e4f1a"
                    },
                    erro: {
                        type: "string",
                        description: "Detalhes do erro (se aplicável)",
                        example: "Usuário não encontrado"
                    }
                }
            }
        }
    },

    // Schema para resposta de busca de logs
    LogSearchResponse: {
        allOf: [
            {
                $ref: "#/components/schemas/SuccessResponse"
            },
            {
                type: "object",
                properties: {
                    data: {
                        type: "object",
                        properties: {
                            logs: {
                                type: "array",
                                items: {
                                    $ref: "#/components/schemas/LogSession"
                                }
                            },
                            pagination: {
                                $ref: "#/components/schemas/PaginationResponse/properties/data/properties/pagination"
                            },
                            estatisticas: {
                                type: "object",
                                properties: {
                                    totalEventos: {
                                        type: "integer",
                                        description: "Total de eventos encontrados",
                                        example: 150
                                    },
                                    eventosPorTipo: {
                                        type: "object",
                                        additionalProperties: {
                                            type: "integer"
                                        },
                                        example: {
                                            "LOGIN": 45,
                                            "LOGOUT": 40,
                                            "CRIAR_PRODUTO": 25,
                                            "ATUALIZAR_PRODUTO": 15
                                        }
                                    },
                                    usuariosMaisAtivos: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                usuario: {
                                                    type: "string",
                                                    example: "João Silva"
                                                },
                                                totalEventos: {
                                                    type: "integer",
                                                    example: 30
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]
    },

    // Schema para filtros de logs
    LogFilters: {
        type: "object",
        properties: {
            usuario_id: {
                type: "string",
                description: "Filtrar por ID do usuário",
                example: "686c08cb0deaf53dca07ea68"
            },
            matricula: {
                type: "string",
                description: "Filtrar por matrícula",
                example: "ADM0001"
            },
            tipo_evento: {
                type: "string",
                description: "Filtrar por tipo de evento",
                enum: [
                    "LOGIN", "LOGOUT", "CRIAR_PRODUTO", "ATUALIZAR_PRODUTO", "DELETAR_PRODUTO",
                    "CRIAR_FORNECEDOR", "ATUALIZAR_FORNECEDOR", "DELETAR_FORNECEDOR",
                    "CRIAR_MOVIMENTACAO", "ATUALIZAR_MOVIMENTACAO", "DELETAR_MOVIMENTACAO",
                    "CRIAR_USUARIO", "ATUALIZAR_USUARIO", "DELETAR_USUARIO",
                    "ERRO_SISTEMA", "ACESSO_NEGADO", "TENTATIVA_LOGIN_FALHADA"
                ],
                example: "LOGIN"
            },
            ip: {
                type: "string",
                description: "Filtrar por endereço IP",
                example: "192.168.1.100"
            },
            data_inicio: {
                type: "string",
                format: "date",
                description: "Data de início do período",
                example: "2025-07-01"
            },
            data_fim: {
                type: "string",
                format: "date",
                description: "Data de fim do período",
                example: "2025-07-31"
            },
            rota: {
                type: "string",
                description: "Filtrar por rota acessada",
                example: "/api/produtos"
            },
            metodo: {
                type: "string",
                description: "Filtrar por método HTTP",
                enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
                example: "POST"
            }
        }
    }
};

export default logsSchemas;
