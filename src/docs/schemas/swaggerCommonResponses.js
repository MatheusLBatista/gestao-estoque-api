// Respostas comuns para uso em toda a documentação Swagger

const commonResponses = {
    200: (schema) => ({
        description: "Operação realizada com sucesso",
        content: {
            "application/json": {
                schema: schema ? { "$ref": schema } : {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Operação realizada com sucesso"
                        },
                        data: {
                            type: "object",
                            description: "Dados da resposta"
                        }
                    }
                }
            }
        }
    }),
    
    201: (schema) => ({
        description: "Recurso criado com sucesso",
        content: {
            "application/json": {
                schema: schema ? { "$ref": schema } : {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Recurso criado com sucesso"
                        },
                        data: {
                            type: "object",
                            description: "Dados do recurso criado"
                        }
                    }
                }
            }
        }
    }),

    400: () => ({
        description: "Requisição inválida",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Dados inválidos fornecidos"
                        },
                        type: {
                            type: "string",
                            example: "validationError"
                        }
                    }
                }
            }
        }
    }),

    401: () => ({
        description: "Não autorizado - Token inválido ou ausente",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Token de acesso inválido ou ausente"
                        },
                        type: {
                            type: "string",
                            example: "authenticationError"
                        }
                    }
                }
            }
        }
    }),

    403: () => ({
        description: "Acesso negado - Permissões insuficientes",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Acesso negado. Permissões insuficientes"
                        },
                        type: {
                            type: "string",
                            example: "permissionError"
                        }
                    }
                }
            }
        }
    }),

    404: () => ({
        description: "Recurso não encontrado",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Recurso não encontrado"
                        },
                        type: {
                            type: "string",
                            example: "resourceNotFound"
                        }
                    }
                }
            }
        }
    }),

    422: () => ({
        description: "Erro de validação",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Erro de validação nos dados fornecidos"
                        },
                        type: {
                            type: "string",
                            example: "validationError"
                        }
                    }
                }
            }
        }
    }),

    500: () => ({
        description: "Erro interno do servidor",
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            example: "Erro interno do servidor"
                        },
                        type: {
                            type: "string",
                            example: "internalError"
                        }
                    }
                }
            }
        }
    })
};

export default commonResponses;
