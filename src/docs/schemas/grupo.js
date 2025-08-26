const grupoSchemas = {
    Grupo: {
        type: 'object',
        properties: {
            _id: { type: 'string', example: '60d5ecb54b24a12a5c8e4f1d' },
            nome: { type: 'string', example: 'Administradores' },
            descricao: { type: 'string', example: 'Grupo com acesso total ao sistema' },
            permissoes: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        rota: { type: 'string', example: '/api/usuarios' },
                        metodos: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['GET', 'POST', 'PUT', 'DELETE']
                        }
                    }
                }
            }
        }
    }
};

export default grupoSchemas;
