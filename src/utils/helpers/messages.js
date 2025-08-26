// src/utils/helpers/messages.js

const messages = {
    // Mensagens Informativas
    info: {
        welcome: "Bem-vindo à nossa aplicação!",
        userLoggedIn: (username) => `Usuário ${username} logado com sucesso.`,
    },

    // Mensagens de Sucesso
    success: {
        default: "Operação concluída com sucesso.",
    },

    // Mensagens de aviso de atorização
    authorized:{
        default: "autorizado",
    },

    // Mensagens de Erro
    error: {
        default: "Ocorreu um erro ao processar a solicitação.",
        serverError: "Erro interno do servidor. Tente novamente mais tarde.",
        validationError: "Erro de validação. Verifique os dados fornecidos e tente novamente.",
        invalidRequest: "Requisição inválida. Verifique os parâmetros fornecidos.",
        unauthorizedAccess: "Acesso não autorizado. Faça login para continuar.",
        invalidURL: "URL inválida. Verifique a URL fornecida.",
        unsupportedOperation: "Operação não suportada neste contexto.",
        dataParsingError: "Erro ao analisar os dados recebidos.",
        externalServiceError: "Erro ao se comunicar com um serviço externo.",
        invalidApiKey: "Chave de API inválida.",
        operationCanceled: "Operação cancelada pelo usuário.",
        internalServerError: (resource) => `Erro interno no servidor ao processar ${resource}.`,
        unauthorized: (resource) => `Erro de autorização: ${resource}.`,
        resourceConflict: (resource,  conflictField) => `Conflito de recurso em ${resource} contém ${conflictField}.`,
        pageIsNotAvailable: (page) => `A página ${page} não está disponível.`,
        pageNotContainsData: (page) => `A página ${page} não contém dados.`,
        duplicateEntry: (fieldName) => `Já existe um registro com o dado informado no(s) campo(s) ${fieldName}.`,
        resourceInUse: (fieldName) => `Recurso em uso em ${fieldName}.`,
        authenticationError: (fieldName) => `Erro de autenticação em ${fieldName}.`,
        permissionError: (fieldName) => `Erro de permissão em ${fieldName}.`,
        resourceNotFound: (field) => `${field} não encontrado(a).`,
    },

    // Mensagens de Validação
    validation: {
        generic: {
            fieldIsRequired: (fieldName) => `O campo ${fieldName} é obrigatório.`,
            fieldIsRepeated: (fieldName) => `O campo ${fieldName} informado já está cadastrado.`,
            invalidInputFormat: (fieldName) => `Formato de entrada inválido para o campo ${fieldName}.`,
            invalid: (fieldName) => `Valor informado em ${fieldName} é inválido.`,
            notFound: (fieldName) => `Valor informado para o campo ${fieldName} não foi encontrado.`,
            mustBeOneOf: (fieldName, values) => `O campo ${fieldName} deve ser um dos seguintes valores: ${values.join(", ")}.`,
            resourceCreated: (fieldName) => `${fieldName} criado(a) com sucesso.`,
            resourceUpdated: (fieldName) => `${fieldName} atualizado(a) com sucesso.`,
            resourceDeleted: (fieldName) => `${fieldName} excluído(a) com sucesso.`,
            resourceAlreadyExists: (fieldName) => `${fieldName} já existe.`,
        },
        reference: {
            resourceWithReference: (resource, reference) => `${resource} com referência em ${reference}. Exclusão impedida.`,
        },
        custom: {
            invalidCPF: { message: "CPF inválido. Verifique o formato e tente novamente." },
            invalidCNPJ: { message: "CNPJ inválido. Verifique o formato e tente novamente." },
            invalidCEP: { message: "CEP inválido. Verifique o formato e tente novamente." },
            invalidPhoneNumber: { message: "Número de telefone inválido. Verifique o formato e tente novamente." },
            invalidMail: { message: "Email no formato inválido." },
            invalidYear: { message: "Ano inválido. Verifique o formato e tente novamente." },
            invalidDate: { message: "Data inválida. Verifique o formato e tente novamente." },
            invalidKilometerInitial: { message: "Quilometragem inicial inválida." },
            invalidKilometer: { message: "Quilometragem inválida." },
            invalidDatePast: { message: "Data do início deve ser uma data atual ou futura." },
            invalidDateFuture: { message: "A data de conclusão deve ser maior do que a data de início!" },
            invalidDateCurrent: { message: "Data do início deve ser uma data atual ou passada." },
            invalidDateMonths: { message: "A data final da vigência não pode ser um período maior que 12 meses após a data de início da vigência." },
            invalidDataNascimento: { message: "Data de nascimento deve ser uma data passada e maior que 18 anos." },
            invalidDataAdmissao: { message: "Data de admissão deve ser uma data atual ou passada." },
            invalidYearSemester: { message: "Ano/semestre. Verifique o formato e tente novamente." },
            invalidYearStartSemester: { message: "Data do início do semestre deve ser menor que a data fim de semestre." },
        },
    },

    // Mensagens de Autenticação
    auth: {
        authenticationFailed: "Falha na autenticação. Credenciais inválidas.",
        userNotFound: (userId) => `Usuário com ID ${userId} não encontrado.`,
        invalidPermission: "Permissão insuficiente para executar a operação.",
        duplicateEntry: (fieldName) => `Já existe um registro com o mesmo ${fieldName}.`,
        accountLocked: "Conta bloqueada. Entre em contato com o suporte.",
        invalidToken: "Token inválido. Faça login novamente.",
        timeoutError: "Tempo de espera excedido. Tente novamente mais tarde.",
        databaseConnectionError: "Erro de conexão com o banco de dados. Tente novamente mais tarde.",
        emailAlreadyExists: (email) => `O endereço de email ${email} já está em uso.`,
        invalidCredentials: "Credenciais inválidas. Verifique seu usuário e senha.",
    },
};

export default messages;
