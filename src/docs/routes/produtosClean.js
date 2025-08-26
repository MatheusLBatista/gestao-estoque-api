const produtosRoutesClean = {
    "/api/produtos": {
        get: {
            tags: ["Produtos"],
            summary: "Listar produtos",
            security: [{ bearerAuth: [] }],
            responses: {
                200: { description: "Lista de produtos retornada com sucesso" }
            }
        }
    }
};

export default produtosRoutesClean;
