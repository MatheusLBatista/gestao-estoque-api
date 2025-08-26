import messages from '../../../src/utils/helpers/messages.js';

describe('messages', () => {
  describe('info messages', () => {
    it('should return welcome message', () => {
      expect(messages.info.welcome).toBe("Bem-vindo à nossa aplicação!");
    });

    it('should return user logged in message with username', () => {
      const username = 'testuser';
      expect(messages.info.userLoggedIn(username)).toBe(`Usuário ${username} logado com sucesso.`);
    });
  });

  describe('success messages', () => {
    it('should return default success message', () => {
      expect(messages.success.default).toBe("Operação concluída com sucesso.");
    });
  });

  describe('authorized messages', () => {
    it('should return default authorized message', () => {
      expect(messages.authorized.default).toBe("autorizado");
    });
  });

  describe('error messages', () => {
    it('should return default error message', () => {
      expect(messages.error.default).toBe("Ocorreu um erro ao processar a solicitação.");
    });

    it('should return server error message', () => {
      expect(messages.error.serverError).toBe("Erro interno do servidor. Tente novamente mais tarde.");
    });

    it('should return validation error message', () => {
      expect(messages.error.validationError).toBe("Erro de validação. Verifique os dados fornecidos e tente novamente.");
    });

    it('should return internal server error message with resource', () => {
      const resource = 'produto';
      expect(messages.error.internalServerError(resource)).toBe(`Erro interno no servidor ao processar ${resource}.`);
    });

    it('should return unauthorized message with resource', () => {
      const resource = 'usuário';
      expect(messages.error.unauthorized(resource)).toBe(`Erro de autorização: ${resource}.`);
    });

    it('should return resource conflict message', () => {
      const resource = 'produto';
      const conflictField = 'nome';
      expect(messages.error.resourceConflict(resource, conflictField)).toBe(`Conflito de recurso em ${resource} contém ${conflictField}.`);
    });

    it('should return page not available message', () => {
      const page = 'relatórios';
      expect(messages.error.pageIsNotAvailable(page)).toBe(`A página ${page} não está disponível.`);
    });

    it('should return page not contains data message', () => {
      const page = 'produtos';
      expect(messages.error.pageNotContainsData(page)).toBe(`A página ${page} não contém dados.`);
    });

    it('should return duplicate entry message', () => {
      const fieldName = 'email';
      expect(messages.error.duplicateEntry(fieldName)).toBe(`Já existe um registro com o dado informado no(s) campo(s) ${fieldName}.`);
    });

    it('should return resource in use message', () => {
      const fieldName = 'categoria';
      expect(messages.error.resourceInUse(fieldName)).toBe(`Recurso em uso em ${fieldName}.`);
    });

    it('should return authentication error message', () => {
      const fieldName = 'token';
      expect(messages.error.authenticationError(fieldName)).toBe(`Erro de autenticação em ${fieldName}.`);
    });

    it('should return permission error message', () => {
      const fieldName = 'usuário';
      expect(messages.error.permissionError(fieldName)).toBe(`Erro de permissão em ${fieldName}.`);
    });

    it('should return resource not found message', () => {
      const field = 'Produto';
      expect(messages.error.resourceNotFound(field)).toBe(`${field} não encontrado(a).`);
    });
  });

  describe('validation messages', () => {
    describe('generic validation', () => {
      it('should return field is required message', () => {
        const fieldName = 'nome';
        expect(messages.validation.generic.fieldIsRequired(fieldName)).toBe(`O campo ${fieldName} é obrigatório.`);
      });

      it('should return field is repeated message', () => {
        const fieldName = 'email';
        expect(messages.validation.generic.fieldIsRepeated(fieldName)).toBe(`O campo ${fieldName} informado já está cadastrado.`);
      });

      it('should return invalid input format message', () => {
        const fieldName = 'telefone';
        expect(messages.validation.generic.invalidInputFormat(fieldName)).toBe(`Formato de entrada inválido para o campo ${fieldName}.`);
      });

      it('should return invalid message', () => {
        const fieldName = 'idade';
        expect(messages.validation.generic.invalid(fieldName)).toBe(`Valor informado em ${fieldName} é inválido.`);
      });

      it('should return not found message', () => {
        const fieldName = 'categoria';
        expect(messages.validation.generic.notFound(fieldName)).toBe(`Valor informado para o campo ${fieldName} não foi encontrado.`);
      });

      it('should return must be one of message', () => {
        const fieldName = 'status';
        const values = ['ativo', 'inativo', 'pendente'];
        expect(messages.validation.generic.mustBeOneOf(fieldName, values)).toBe(`O campo ${fieldName} deve ser um dos seguintes valores: ${values.join(", ")}.`);
      });

      it('should return resource created message', () => {
        const fieldName = 'Produto';
        expect(messages.validation.generic.resourceCreated(fieldName)).toBe(`${fieldName} criado(a) com sucesso.`);
      });

      it('should return resource updated message', () => {
        const fieldName = 'Usuário';
        expect(messages.validation.generic.resourceUpdated(fieldName)).toBe(`${fieldName} atualizado(a) com sucesso.`);
      });

      it('should return resource deleted message', () => {
        const fieldName = 'Fornecedor';
        expect(messages.validation.generic.resourceDeleted(fieldName)).toBe(`${fieldName} excluído(a) com sucesso.`);
      });

      it('should return resource already exists message', () => {
        const fieldName = 'Categoria';
        expect(messages.validation.generic.resourceAlreadyExists(fieldName)).toBe(`${fieldName} já existe.`);
      });
    });

    describe('reference validation', () => {
      it('should return resource with reference message', () => {
        const resource = 'Categoria';
        const reference = 'produtos';
        expect(messages.validation.reference.resourceWithReference(resource, reference)).toBe(`${resource} com referência em ${reference}. Exclusão impedida.`);
      });
    });

    describe('custom validation', () => {
      it('should return invalid CPF message', () => {
        expect(messages.validation.custom.invalidCPF.message).toBe("CPF inválido. Verifique o formato e tente novamente.");
      });

      it('should return invalid CNPJ message', () => {
        expect(messages.validation.custom.invalidCNPJ.message).toBe("CNPJ inválido. Verifique o formato e tente novamente.");
      });

      it('should return invalid CEP message', () => {
        expect(messages.validation.custom.invalidCEP.message).toBe("CEP inválido. Verifique o formato e tente novamente.");
      });

      it('should return invalid phone number message', () => {
        expect(messages.validation.custom.invalidPhoneNumber.message).toBe("Número de telefone inválido. Verifique o formato e tente novamente.");
      });

      it('should return invalid mail message', () => {
        expect(messages.validation.custom.invalidMail.message).toBe("Email no formato inválido.");
      });

      it('should return invalid year message', () => {
        expect(messages.validation.custom.invalidYear.message).toBe("Ano inválido. Verifique o formato e tente novamente.");
      });

      it('should return invalid date message', () => {
        expect(messages.validation.custom.invalidDate.message).toBe("Data inválida. Verifique o formato e tente novamente.");
      });

      it('should return invalid data nascimento message', () => {
        expect(messages.validation.custom.invalidDataNascimento.message).toBe("Data de nascimento deve ser uma data passada e maior que 18 anos.");
      });

      it('should return invalid data admissao message', () => {
        expect(messages.validation.custom.invalidDataAdmissao.message).toBe("Data de admissão deve ser uma data atual ou passada.");
      });
    });
  });

  describe('auth messages', () => {
    it('should return authentication failed message', () => {
      expect(messages.auth.authenticationFailed).toBe("Falha na autenticação. Credenciais inválidas.");
    });

    it('should return user not found message with userId', () => {
      const userId = '123456';
      expect(messages.auth.userNotFound(userId)).toBe(`Usuário com ID ${userId} não encontrado.`);
    });

    it('should return invalid permission message', () => {
      expect(messages.auth.invalidPermission).toBe("Permissão insuficiente para executar a operação.");
    });

    it('should return duplicate entry message with fieldName', () => {
      const fieldName = 'email';
      expect(messages.auth.duplicateEntry(fieldName)).toBe(`Já existe um registro com o mesmo ${fieldName}.`);
    });

    it('should return account locked message', () => {
      expect(messages.auth.accountLocked).toBe("Conta bloqueada. Entre em contato com o suporte.");
    });

    it('should return invalid token message', () => {
      expect(messages.auth.invalidToken).toBe("Token inválido. Faça login novamente.");
    });

    it('should return timeout error message', () => {
      expect(messages.auth.timeoutError).toBe("Tempo de espera excedido. Tente novamente mais tarde.");
    });

    it('should return database connection error message', () => {
      expect(messages.auth.databaseConnectionError).toBe("Erro de conexão com o banco de dados. Tente novamente mais tarde.");
    });

    it('should return email already exists message with email', () => {
      const email = 'test@example.com';
      expect(messages.auth.emailAlreadyExists(email)).toBe(`O endereço de email ${email} já está em uso.`);
    });

    it('should return invalid credentials message', () => {
      expect(messages.auth.invalidCredentials).toBe("Credenciais inválidas. Verifique seu usuário e senha.");
    });
  });
});
