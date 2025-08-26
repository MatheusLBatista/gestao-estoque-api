const fornecedoresSchemas = {
    // Schema básico do fornecedor
    Fornecedor: {
        type: "object",
        properties: {
            _id: {
                type: "string",
                description: "ID único do fornecedor",
                example: "60d5ecb74f8e4b2b3c8d6e80"
            },
            nome_fornecedor: {
                type: "string",
                description: "Nome do fornecedor",
                example: "Auto Peças Sul"
            },
            cnpj: {
                type: "string",
                description: "CNPJ do fornecedor",
                example: "12.345.678/0001-90"
            },
            telefone: {
                type: "string",
                description: "Telefone do fornecedor",
                example: "(11) 99999-9999"
            },
            email: {
                type: "string",
                format: "email",
                description: "Email do fornecedor",
                example: "contato@autopecassul.com"
            },
            endereco: {
                type: "string",
                description: "Endereço do fornecedor",
                example: "Rua das Peças, 123, São Paulo, SP"
            },
            ativo: {
                type: "boolean",
                description: "Status do fornecedor",
                example: true
            },
            createdAt: {
                type: "string",
                format: "date-time",
                description: "Data de criação",
                example: "2024-01-15T10:30:00.000Z"
            },
            updatedAt: {
                type: "string",
                format: "date-time",
                description: "Data da última atualização",
                example: "2024-01-15T15:45:00.000Z"
            }
        }
    },

    // Schema para criação de fornecedor
    FornecedorCreate: {
        type: "object",
        properties: {
            nome_fornecedor: {
                type: "string",
                description: "Nome do fornecedor",
                example: "Auto Peças Sul",
                minLength: 3,
                maxLength: 100
            },
            cnpj: {
                type: "string",
                description: "CNPJ do fornecedor (único)",
                example: "12.345.678/0001-90",
                pattern: "^\\d{2}\\.\\d{3}\\.\\d{3}\\/\\d{4}\\-\\d{2}$"
            },
            telefone: {
                type: "string",
                description: "Telefone do fornecedor",
                example: "(11) 99999-9999"
            },
            email: {
                type: "string",
                format: "email",
                description: "Email do fornecedor",
                example: "contato@autopecassul.com"
            },
            endereco: {
                type: "string",
                description: "Endereço completo do fornecedor",
                example: "Rua das Peças, 123, São Paulo, SP"
            }
        },
        required: ["nome_fornecedor", "cnpj", "telefone", "email", "endereco"]
    },

    // Schema para atualização de fornecedor
    FornecedorUpdate: {
        type: "object",
        properties: {
            nome_fornecedor: {
                type: "string",
                description: "Nome do fornecedor",
                example: "Auto Peças Sul Ltda",
                minLength: 3,
                maxLength: 100
            },
            telefone: {
                type: "string",
                description: "Telefone do fornecedor",
                example: "(11) 88888-8888"
            },
            email: {
                type: "string",
                format: "email",
                description: "Email do fornecedor",
                example: "novoemail@autopecassul.com"
            },
            endereco: {
                type: "string",
                description: "Endereço completo do fornecedor",
                example: "Rua das Peças, 456, São Paulo, SP"
            }
        }
    },

    // Schema para lista de fornecedores
    FornecedoresList: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Fornecedores listados com sucesso"
            },
            fornecedores: {
                type: "array",
                items: {
                    "$ref": "#/components/schemas/Fornecedor"
                }
            },
            total: {
                type: "integer",
                description: "Total de fornecedores encontrados",
                example: 25
            },
            page: {
                type: "integer",
                description: "Página atual",
                example: 1
            },
            limit: {
                type: "integer",
                description: "Limite de itens por página",
                example: 10
            }
        }
    },

    // Schema para resposta de fornecedor único
    FornecedorResponse: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Fornecedor encontrado com sucesso"
            },
            fornecedor: {
                "$ref": "#/components/schemas/Fornecedor"
            }
        }
    },

    // Schema para resposta de criação de fornecedor
    FornecedorCreateResponse: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Fornecedor cadastrado com sucesso"
            },
            fornecedor: {
                "$ref": "#/components/schemas/Fornecedor"
            }
        }
    },

    // Schema para resposta de atualização de fornecedor
    FornecedorUpdateResponse: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Fornecedor atualizado com sucesso"
            },
            fornecedor: {
                "$ref": "#/components/schemas/Fornecedor"
            }
        }
    },

    // Schema para resposta de exclusão de fornecedor
    FornecedorDeleteResponse: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Fornecedor excluído com sucesso"
            }
        }
    }
};

export default fornecedoresSchemas;
