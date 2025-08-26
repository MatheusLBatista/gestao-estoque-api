const logsRoutes = {
  '/api/logs': {
    get: {
      tags: ['Logs'],
      summary: 'Buscar logs do sistema',
      description: 'Endpoint para buscar logs de auditoria e atividades do sistema com filtros opcionais. Permite rastreamento de ações de usuários, alterações no sistema e monitoramento de atividades.',
      security: [
        {
          BearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'page',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Número da página para paginação dos resultados'
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
          },
          description: 'Quantidade de logs por página (máximo 100)'
        },
        {
          name: 'nivel',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['INFO', 'WARNING', 'ERROR', 'DEBUG']
          },
          description: 'Filtrar por nível do log'
        },
        {
          name: 'usuario_id',
          in: 'query',
          required: false,
          schema: {
            type: 'string'
          },
          description: 'Filtrar logs por ID do usuário'
        },
        {
          name: 'modulo',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['AUTH', 'PRODUTOS', 'FORNECEDORES', 'USUARIOS', 'MOVIMENTACOES', 'SISTEMA']
          },
          description: 'Filtrar por módulo do sistema'
        },
        {
          name: 'acao',
          in: 'query',
          required: false,
          schema: {
            type: 'string'
          },
          description: 'Filtrar por tipo de ação realizada'
        },
        {
          name: 'data_inicio',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de início para filtro por período (formato: YYYY-MM-DD)'
        },
        {
          name: 'data_fim',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de fim para filtro por período (formato: YYYY-MM-DD)'
        },
        {
          name: 'search',
          in: 'query',
          required: false,
          schema: {
            type: 'string'
          },
          description: 'Busca textual na mensagem do log'
        }
      ],
      responses: {
        '200': {
          description: 'Lista de logs retornada com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LogsListResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/logs/{id}': {
    get: {
      tags: ['Logs'],
      summary: 'Buscar log específico',
      description: 'Endpoint para buscar detalhes de um log específico por ID. Retorna informações completas sobre uma entrada de log específica.',
      security: [
        {
          BearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'ID único do log'
        }
      ],
      responses: {
        '200': {
          description: 'Detalhes do log retornados com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LogDetailsResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '404': {
          $ref: '#/components/responses/NotFound'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/logs/auditoria': {
    get: {
      tags: ['Logs'],
      summary: 'Buscar logs de auditoria',
      description: 'Endpoint especializado para buscar logs de auditoria do sistema, incluindo alterações de dados críticos, acessos administrativos e operações sensíveis.',
      security: [
        {
          BearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'page',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Número da página para paginação'
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
          },
          description: 'Quantidade de logs por página'
        },
        {
          name: 'usuario_id',
          in: 'query',
          required: false,
          schema: {
            type: 'string'
          },
          description: 'Filtrar por ID do usuário que executou a ação'
        },
        {
          name: 'tabela',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['produtos', 'fornecedores', 'usuarios', 'movimentacoes']
          },
          description: 'Filtrar por tabela afetada'
        },
        {
          name: 'operacao',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['CREATE', 'UPDATE', 'DELETE']
          },
          description: 'Filtrar por tipo de operação'
        },
        {
          name: 'data_inicio',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de início para filtro por período'
        },
        {
          name: 'data_fim',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de fim para filtro por período'
        }
      ],
      responses: {
        '200': {
          description: 'Logs de auditoria retornados com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AuditLogsResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/logs/sistema': {
    get: {
      tags: ['Logs'],
      summary: 'Buscar logs de sistema',
      description: 'Endpoint para buscar logs relacionados ao funcionamento do sistema, incluindo erros, warnings e informações de debug.',
      security: [
        {
          BearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'page',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Número da página para paginação'
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
          },
          description: 'Quantidade de logs por página'
        },
        {
          name: 'nivel',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['INFO', 'WARNING', 'ERROR', 'DEBUG']
          },
          description: 'Filtrar por nível de severidade'
        },
        {
          name: 'componente',
          in: 'query',
          required: false,
          schema: {
            type: 'string'
          },
          description: 'Filtrar por componente do sistema'
        },
        {
          name: 'data_inicio',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de início para filtro por período'
        },
        {
          name: 'data_fim',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de fim para filtro por período'
        }
      ],
      responses: {
        '200': {
          description: 'Logs de sistema retornados com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SystemLogsResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/logs/estatisticas': {
    get: {
      tags: ['Logs'],
      summary: 'Obter estatísticas de logs',
      description: 'Endpoint para obter estatísticas e métricas dos logs do sistema, incluindo contadores por tipo, usuário, módulo e período.',
      security: [
        {
          BearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'periodo',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['hoje', 'semana', 'mes', 'trimestre', 'ano', 'customizado'],
            default: 'mes'
          },
          description: 'Período para geração das estatísticas'
        },
        {
          name: 'data_inicio',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de início (obrigatório se período = customizado)'
        },
        {
          name: 'data_fim',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de fim (obrigatório se período = customizado)'
        },
        {
          name: 'agrupar_por',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['usuario', 'modulo', 'nivel', 'dia', 'hora']
          },
          description: 'Critério de agrupamento para estatísticas detalhadas'
        }
      ],
      responses: {
        '200': {
          description: 'Estatísticas de logs retornadas com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LogStatsResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/logs/exportar': {
    post: {
      tags: ['Logs'],
      summary: 'Exportar logs',
      description: 'Endpoint para exportar logs do sistema em diferentes formatos (CSV, JSON, PDF). Permite aplicar filtros específicos e gerar relatórios personalizados.',
      security: [
        {
          BearerAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ExportLogsRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Arquivo de exportação gerado com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ExportLogsResponse'
              }
            },
            'text/csv': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            },
            'application/pdf': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '422': {
          $ref: '#/components/responses/ValidationError'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/logs/limpeza': {
    delete: {
      tags: ['Logs'],
      summary: 'Limpeza de logs antigos',
      description: 'Endpoint administrativo para limpeza de logs antigos do sistema. Remove logs baseado em critérios de idade e tipo. **Ação irreversível - use com cautela.**',
      security: [
        {
          BearerAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CleanupLogsRequest'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Limpeza de logs executada com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CleanupLogsResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '422': {
          $ref: '#/components/responses/ValidationError'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/logs/online-users': {
    get: {
      tags: ['Logs'],
      summary: 'Listar usuários online',
      description: 'Endpoint para listar usuários atualmente online no sistema. **Apenas administradores** podem acessar esta funcionalidade.',
      security: [
        {
          BearerAuth: []
        }
      ],
      responses: {
        '200': {
          description: 'Lista de usuários online retornada com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Usuários online recuperados com sucesso'
                  },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: '60d5ecb74f8e4b2b3c8d6e7f'
                        },
                        nome: {
                          type: 'string',
                          example: 'João Silva'
                        },
                        matricula: {
                          type: 'string',
                          example: 'USR001'
                        },
                        ultimoAcesso: {
                          type: 'string',
                          format: 'date-time',
                          example: '2024-01-15T10:30:00.000Z'
                        }
                      }
                    }
                  },
                  total: {
                    type: 'integer',
                    example: 3
                  },
                  timestamp: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-15T10:30:00.000Z'
                  }
                }
              }
            }
          }
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          description: 'Acesso negado - Apenas administradores',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Acesso negado. Apenas administradores podem ver usuários online'
                  },
                  type: {
                    type: 'string',
                    example: 'permissionError'
                  }
                }
              }
            }
          }
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/logs/usuario/{userId}': {
    get: {
      tags: ['Logs'],
      summary: 'Obter logs de usuário específico',
      description: 'Endpoint para obter logs de um usuário específico. Permite rastrear atividades de um usuário particular.',
      security: [
        {
          BearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'userId',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'ID do usuário para buscar logs'
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 50
          },
          description: 'Quantidade de logs a retornar (máximo 100)'
        }
      ],
      responses: {
        '200': {
          description: 'Logs do usuário retornados com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserLogsResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '404': {
          description: 'Usuário não encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Usuário não encontrado'
                  }
                }
              }
            }
          }
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/logs/search': {
    get: {
      tags: ['Logs'],
      summary: 'Buscar eventos específicos',
      description: 'Endpoint para buscar eventos específicos no sistema com filtros avançados. **Apenas administradores** podem acessar esta funcionalidade.',
      security: [
        {
          BearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'eventType',
          in: 'query',
          required: false,
          schema: {
            type: 'string'
          },
          description: 'Tipo de evento a buscar'
        },
        {
          name: 'startDate',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de início para busca'
        },
        {
          name: 'endDate',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de fim para busca'
        },
        {
          name: 'userId',
          in: 'query',
          required: false,
          schema: {
            type: 'string'
          },
          description: 'ID do usuário para filtrar eventos'
        }
      ],
      responses: {
        '200': {
          description: 'Eventos encontrados com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/EventSearchResponse'
              }
            }
          }
        },
        '400': {
          $ref: '#/components/responses/BadRequest'
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/logs/statistics': {
    get: {
      tags: ['Logs'],
      summary: 'Obter estatísticas detalhadas de logs',
      description: 'Endpoint para obter estatísticas detalhadas e métricas do sistema de logs. **Apenas administradores** podem acessar esta funcionalidade.',
      security: [
        {
          BearerAuth: []
        }
      ],
      responses: {
        '200': {
          description: 'Estatísticas de logs retornadas com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LogStatisticsResponse'
              }
            }
          }
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/logs/critical': {
    get: {
      tags: ['Logs'],
      summary: 'Obter eventos críticos',
      description: 'Endpoint para obter eventos críticos do sistema que requerem atenção especial. **Apenas administradores** podem acessar esta funcionalidade.',
      security: [
        {
          BearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
          },
          description: 'Quantidade de eventos críticos a retornar'
        },
        {
          name: 'startDate',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          },
          description: 'Data de início para busca de eventos críticos'
        }
      ],
      responses: {
        '200': {
          description: 'Eventos críticos retornados com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CriticalEventsResponse'
              }
            }
          }
        },
        '401': {
          $ref: '#/components/responses/Unauthorized'
        },
        '403': {
          $ref: '#/components/responses/Forbidden'
        },
        '500': {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  }
};

export default logsRoutes;
