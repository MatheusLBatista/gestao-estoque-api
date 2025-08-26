import rotaSchemas from "../schemas/rotasSchema.js";
import authSchemas from "../schemas/authSchema.js";
import commonResponses from "../schemas/swaggerCommonResponses.js";
import { generateParameters } from "./utils/generateParameters.js"; // ajuste o caminho conforme necessário

const rotasRoutes = {
    "/rotas": {
        get: {
            tags: ["Rotas"],
            summary: "Lista todas as rotas",
            description:
                "Coloque aqui uma descrição mais detalhada do que esse endpoint faz, regras de negócio, permissões, etc.",
            security: [{ bearerAuth: [] }],
            // Gerando os parâmetros a partir do JSON Schema recursivamente
            parameters: generateParameters(rotaSchemas.RotaFiltro),
            responses: {
                200: commonResponses[200]("#/components/schemas/RotaListagem"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        post: {
            tags: ["Rotas"],
            summary: "Cria uma nova rota",
            description:
                "Coloque aqui uma descrição mais detalhada do que esse endpoint faz, regras de negócio, permissões, etc.",
            security: [{ bearerAuth: [] }],
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RotaPost"
                        }
                    }
                }
            },
            responses: {
                201: commonResponses[201]("#/components/schemas/RotaDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    },
    "/rotas/{id}": { // endpoint ajustado para manter o padrão plural
        get: {
            tags: ["Rotas"],
            summary: "Obtém detalhes de uma rota",
            description:
                "Coloque aqui uma descrição mais detalhada do que esse endpoint faz, regras de negócio, permissões, etc.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "integer"
                    }
                }
            ],
            responses: {
                200: commonResponses[200]("#/components/schemas/RotaDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        patch: {
            tags: ["Rotas"],
            summary: "Atualiza uma rota",
            description:
                "Coloque aqui uma descrição mais detalhada do que esse endpoint faz, regras de negócio, permissões, etc.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "integer"
                    }
                }
            ],
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RotaPutPatch"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/RotaDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        put: {
            tags: ["Rotas"],
            summary: "Atualiza uma rota",
            description:
                "Coloque aqui uma descrição mais detalhada do que esse endpoint faz, regras de negócio, permissões, etc.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "integer"
                    }
                }
            ],
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RotaPutPatch"
                        }
                    }
                }
            },
            responses: {
                200: commonResponses[200]("#/components/schemas/RotaDetalhes"),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        },
        delete: {
            tags: ["Rotas"],
            summary: "Deleta uma rota",
            description:
                "Coloque aqui uma descrição mais detalhada do que esse endpoint faz, regras de negócio, permissões, etc.",
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: {
                        type: "integer"
                    }
                }
            ],
            responses: {
                200: commonResponses[200](),
                400: commonResponses[400](),
                401: commonResponses[401](),
                404: commonResponses[404](),
                498: commonResponses[498](),
                500: commonResponses[500]()
            }
        }
    }
};

export default rotasRoutes;
