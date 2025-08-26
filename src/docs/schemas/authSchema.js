import commonResponses from "./swaggerCommonResponses.js";

const authSchemas = {
    // Schema para requisição de login
    LoginRequest: {
        type: "object",
        properties: {
            matricula: {
                type: "string",
                description: "Matrícula do usuário",
                example: "ADM001"
            },
            senha: {
                type: "string",
                description: "Senha do usuário",
                example: "123456"
            }
        },
        required: ["matricula", "senha"]
    },

    // Schema para resposta de login
    LoginResponse: {
        type: "object",
        properties: {
            message: {
                type: "string",
                example: "Login realizado com sucesso"
            },
            token: {
                type: "string",
                description: "Token JWT de acesso",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            },
            refreshToken: {
                type: "string",
                description: "Token para renovação",
                example: "refresh_token_here..."
            },
            usuario: {
                "$ref": "#/components/schemas/UsuarioBasico"
            }
        }
    },

    // Schema para requisição de refresh token
    RefreshTokenRequest: {
        type: "object",
        properties: {
            refreshToken: {
                type: "string",
                description: "Token de refresh válido",
                example: "refresh_token_here..."
            }
        },
        required: ["refreshToken"]
    },

    // Schema para solicitação de recuperação de senha
    RecuperacaoSenhaRequest: {
        type: "object",
        properties: {
            matricula: {
                type: "string",
                description: "Matrícula do usuário",
                example: "USR001"
            }
        },
        required: ["matricula"]
    },

    // Schema básico do usuário para respostas de auth
    UsuarioBasico: {
        type: "object",
        properties: {
            id: {
                type: "string",
                description: "ID único do usuário",
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
                enum: ["administrador", "funcionario"],
                description: "Perfil do usuário",
                example: "funcionario"
            },
            ativo: {
                type: "boolean",
                description: "Status do usuário",
                example: true
            },
            online: {
                type: "boolean",
                description: "Status de conexão",
                example: true
            }
        }
    }
};

export default authSchemas;
