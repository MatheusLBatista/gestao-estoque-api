const logsSchemas = {
    // Schema básico do log
    LogEntry: {
        type: "object",
        properties: {
            sessionId: {
                type: "string",
                description: "ID da sessão",
                example: "session_123456"
            },
            userId: {
                type: "string",
                description: "ID do usuário",
                example: "60d5ecb74f8e4b2b3c8d6e7f"
            },
            action: {
                type: "string",
                description: "Ação realizada",
                example: "LOGIN"
            },
            details: {
                type: "object",
                description: "Detalhes da ação",
                properties: {
                    ip: {
                        type: "string",
                        example: "192.168.1.100"
                    },
                    userAgent: {
                        type: "string",
                        example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    },
                    os: {
                        type: "string",
                        example: "Windows 10"
                    },
                    method: {
                        type: "string",
                        example: "POST"
                    },
                    endpoint: {
                        type: "string",
                        example: "/auth/login"
                    }
                }
            },
            timestamp: {
                type: "string",
                format: "date-time",
                description: "Data e hora da ação",
                example: "2024-01-15T10:30:00.000Z"
            },
            critical: {
                type: "boolean",
                description: "Indica se é um evento crítico",
                example: false
            }
        }
    },

    // Schema para usuário online
    UsuarioOnline: {
        type: "object",
        properties: {
            id: {
                type: "string",
                description: "ID do usuário",
                example: "60d5ecb74f8e4b2b3c8d6e7f"
            },
            nome_usuario: {
                type: "string",
                description: "Nome do usuário",
                example: "João Silva"
            },
            matricula: {
                type: "string",
                description: "Matrícula do usuário",
                example: "USR001"
            },
            perfil: {
                type: "string",
                description: "Perfil do usuário",
                example: "funcionario"
            },
            sessionId: {
                type: "string",
                description: "ID da sessão ativa",
                example: "session_123456"
            },
            loginTime: {
                type: "string",
                format: "date-time",
                description: "Horário do login",
                example: "2024-01-15T08:30:00.000Z"
            },
            lastActivity: {
                type: "string",
                format: "date-time",
                description: "Última atividade",
                example: "2024-01-15T10:30:00.000Z"
            }
        }
    },

    // Schema para lista de usuários online
    UsuariosOnlineList: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Usuários online listados com sucesso"
            },
            usuariosOnline: {
                type: "array",
                items: {
                    "$ref": "#/components/schemas/UsuarioOnline"
                }
            },
            total: {
                type: "integer",
                description: "Total de usuários online",
                example: 5
            }
        }
    },

    // Schema para lista de logs do usuário
    UserLogsList: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Logs do usuário recuperados com sucesso"
            },
            logs: {
                type: "array",
                items: {
                    "$ref": "#/components/schemas/LogEntry"
                }
            },
            total: {
                type: "integer",
                description: "Total de logs encontrados",
                example: 50
            }
        }
    },

    // Schema para estatísticas de logs
    LogStatistics: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Estatísticas de logs recuperadas com sucesso"
            },
            estatisticas: {
                type: "object",
                properties: {
                    totalUsuarios: {
                        type: "integer",
                        description: "Total de usuários únicos",
                        example: 25
                    },
                    usuariosOnline: {
                        type: "integer",
                        description: "Usuários atualmente online",
                        example: 5
                    },
                    totalSessoes: {
                        type: "integer",
                        description: "Total de sessões criadas",
                        example: 150
                    },
                    sessoesAtivasHoje: {
                        type: "integer",
                        description: "Sessões ativas hoje",
                        example: 8
                    },
                    acoesUltimasHoras: {
                        type: "object",
                        properties: {
                            "1h": {
                                type: "integer",
                                example: 25
                            },
                            "6h": {
                                type: "integer",
                                example: 120
                            },
                            "24h": {
                                type: "integer",
                                example: 350
                            }
                        }
                    },
                    acoesPorTipo: {
                        type: "object",
                        properties: {
                            LOGIN: {
                                type: "integer",
                                example: 45
                            },
                            LOGOUT: {
                                type: "integer",
                                example: 42
                            },
                            CADASTRO_PRODUTO: {
                                type: "integer",
                                example: 15
                            },
                            CONSULTA_PRODUTO: {
                                type: "integer",
                                example: 89
                            }
                        }
                    }
                }
            }
        }
    },

    // Schema para eventos críticos
    EventosCriticosList: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Eventos críticos recuperados com sucesso"
            },
            eventosCriticos: {
                type: "array",
                items: {
                    "$ref": "#/components/schemas/LogEntry"
                }
            },
            total: {
                type: "integer",
                description: "Total de eventos críticos",
                example: 3
            }
        }
    },

    // Schema para busca de eventos
    EventSearchResults: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Eventos encontrados com sucesso"
            },
            eventos: {
                type: "array",
                items: {
                    "$ref": "#/components/schemas/LogEntry"
                }
            },
            total: {
                type: "integer",
                description: "Total de eventos encontrados",
                example: 25
            },
            filtros: {
                type: "object",
                description: "Filtros aplicados na busca",
                properties: {
                    action: {
                        type: "string",
                        example: "LOGIN"
                    },
                    startDate: {
                        type: "string",
                        format: "date",
                        example: "2024-01-01"
                    },
                    endDate: {
                        type: "string",
                        format: "date",
                        example: "2024-01-31"
                    },
                    userId: {
                        type: "string",
                        example: "60d5ecb74f8e4b2b3c8d6e7f"
                    }
                }
            }
        }
    }
};

export default logsSchemas;
