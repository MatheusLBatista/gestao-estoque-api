import UsuarioService from "../services/usuarioService.js";
import EmailService from "../services/EmailService.js";
import {
  CommonResponse,
  CustomError,
  HttpStatusCodes,
} from "../utils/helpers/index.js";
import {
  UsuarioSchema,
  UsuarioUpdateSchema,
} from "../utils/validators/schemas/zod/UsuarioSchema.js";
import {
  UsuarioQuerySchema,
  UsuarioIdSchema,
  UsuarioMatriculaSchema,
} from "../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js";
import LogMiddleware from "../middlewares/LogMiddleware.js";

class UsuarioController {
  constructor() {
    this.service = new UsuarioService();
  }

  // Função utilitária para validação com erro customizado
  validateId(id, fieldName = "id", action = "processar") {
    if (!id) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: fieldName,
        details: [],
        customMessage: `ID do usuário é obrigatório para ${action}.`,
      });
    }

    UsuarioIdSchema.parse(id);
  }

  async listarUsuarios(req, res) {
    console.log("Estou no listarUsuarios em UsuarioController");

    const { id } = req.params || {};
    if (id) {
      UsuarioIdSchema.parse(id);
    }

    const query = req.query || {};
    if (Object.keys(query).length !== 0) {
      await UsuarioQuerySchema.parseAsync(query);
    }

    const data = await this.service.listarUsuarios(req);

    // Verificar se a lista está vazia
    if (data.docs && data.docs.length === 0) {
      return CommonResponse.error(
        res,
        404,
        "resourceNotFound",
        "Usuario",
        [],
        "Nenhum usuário encontrado com os critérios informados."
      );
    }


    async atualizarUsuario(req, res) {
        console.log('Estou no atualizarUsuario em UsuarioController');

        const { matricula } = req.params;
        if (!matricula) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'matricula',
                details: [],
                customMessage: 'Matrícula do usuário é obrigatória.'
            });
        }

        // UsuarioIdSchema.parse(matricula);

        const dadosAtualizacao = req.body;
        if (Object.keys(dadosAtualizacao).length === 0) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'body',
                details: [],
                customMessage: 'Nenhum dado fornecido para atualização.'
            });
        }

        await UsuarioUpdateSchema.parseAsync(dadosAtualizacao);
        const usuarioAtualizado = await this.service.atualizarUsuario(matricula, dadosAtualizacao);
        return CommonResponse.success(res, usuarioAtualizado, 200, 'Usuário atualizado com sucesso.');
    }

    async deletarUsuario(req, res) {
        console.log('Estou no deletarUsuario em UsuarioController');

        const { matricula } = req.params; 
        if (!matricula) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'matricula',
                details: [],
                customMessage: 'Matrícula do usuário é obrigatória.'
            });
        }

        const data = await this.service.deletarUsuario(matricula);
        return CommonResponse.success(res, data, 200, 'Usuário excluído com sucesso.');
    }

    async desativarUsuario(req, res) {
        console.log('Estou no desativarUsuario em UsuarioController');

        const { matricula } = req.params || {};
        if (!matricula) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'matricula',
                details: [],
                customMessage: 'Matrícula do usuário é obrigatória.'
            });
        }

        const data = await this.service.desativarUsuario(matricula);
        return CommonResponse.success(res, data, 200, 'Usuario desativado com sucesso.');
    }

    async reativarUsuario(req, res) {
        console.log('Estou no reativarUsuario em UsuarioController');

        const { matricula } = req.params || {};
        if (!matricula) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'matricula',
                details: [],
                customMessage: 'Matrícula do usuário é obrigatória.'
            });
        }

        const data = await this.service.reativarUsuario(matricula);
        return CommonResponse.success(res, data, 200, 'Usuario reativado com sucesso.');
    }

    const data = await this.service.deletarUsuario(matricula);
    return CommonResponse.success(
      res,
      data,
      200,
      "Usuário excluído com sucesso."
    );
  }

  async desativarUsuario(req, res) {
    console.log("Estou no desativarUsusario em UsuarioController");

    const { id } = req.params || {};
    this.validateId(id, "id", "desativar");

    const data = await this.service.desativarUsuario(id);
    return CommonResponse.success(
      res,
      data,
      200,
      "Usuario desativado com sucesso."
    );
  }

  async reativarUsuario(req, res) {
    console.log("Estou no reativarUsusario em UsuarioController");

    const { id } = req.params || {};
    this.validateId(id, "id", "reativar");

    const data = await this.service.reativarUsuario(id);
    return CommonResponse.success(
      res,
      data,
      200,
      "Usuario reativado com sucesso."
    );
  }

  async criarComSenha(req, res) {
    const { nome, email, senha, perfil } = req.body;

    // Validar dados
    if (!nome || !email || !senha) {
      return res.status(400).json({
        message: "Nome, email e senha são obrigatórios",
        type: "validationError",
      });
    }

    // Verificar se o email já existe
    const emailExiste = await this.service.verificarEmailExistente(email);
    if (emailExiste) {
      return res.status(400).json({
        message: "Este email já está em uso",
        type: "validationError",
      });
    }

    // Criar usuário
    const usuario = await this.service.criarUsuario({
      nome,
      email,
      senha,
      perfil: perfil || "estoquista", // Perfil padrão se não for especificado
      ativo: true,
    });

    // Remover a senha do objeto de resposta
    const usuarioSemSenha = {
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      ativo: usuario.ativo,
    };

    return res.status(201).json({
      message: "Usuário criado com sucesso",
      usuario: usuarioSemSenha,
    });
  }

  /**
   * Adiciona usuário a um grupo
   */
  async adicionarUsuarioAoGrupo(req, res) {
    console.log("Estou no adicionarUsuarioAoGrupo em UsuarioController");

    const { usuarioId, grupoId } = req.body;

    if (!usuarioId || !grupoId) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "body",
        details: [],
        customMessage: "ID do usuário e ID do grupo são obrigatórios.",
      });
    }

    const data = await this.service.adicionarUsuarioAoGrupo(usuarioId, grupoId);

    // Registra evento crítico
    LogMiddleware.logCriticalEvent(
      req.userId,
      "USUARIO_ADICIONADO_GRUPO",
      {
        usuario_id: usuarioId,
        grupo_id: grupoId,
        adicionado_por: req.userMatricula,
      },
      req
    );

    return CommonResponse.success(
      res,
      data,
      200,
      "Usuário adicionado ao grupo com sucesso."
    );
  }

  /**
   * Remove usuário de um grupo
   */
  async removerUsuarioDoGrupo(req, res) {
    console.log("Estou no removerUsuarioDoGrupo em UsuarioController");

    const { usuarioId, grupoId } = req.body;

    if (!usuarioId || !grupoId) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "body",
        details: [],
        customMessage: "ID do usuário e ID do grupo são obrigatórios.",
      });
    }

    const data = await this.service.removerUsuarioDoGrupo(usuarioId, grupoId);

    // Registra evento crítico
    LogMiddleware.logCriticalEvent(
      req.userId,
      "USUARIO_REMOVIDO_GRUPO",
      {
        usuario_id: usuarioId,
        grupo_id: grupoId,
        removido_por: req.userMatricula,
      },
      req
    );

    return CommonResponse.success(
      res,
      data,
      200,
      "Usuário removido do grupo com sucesso."
    );
  }

  /**
   * Adiciona permissão individual a um usuário
   */
  async adicionarPermissaoAoUsuario(req, res) {
    console.log("Estou no adicionarPermissaoAoUsuario em UsuarioController");

    const { id } = req.params;
    const permissao = req.body;

    if (!id) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "id",
        details: [],
        customMessage: "ID do usuário é obrigatório.",
      });
    }

    const data = await this.service.adicionarPermissaoAoUsuario(id, permissao);

    // Registra evento crítico
    LogMiddleware.logCriticalEvent(
      req.userId,
      "PERMISSAO_INDIVIDUAL_ADICIONADA",
      {
        usuario_id: id,
        permissao_adicionada: {
          rota: permissao.rota,
          dominio: permissao.dominio,
        },
        adicionado_por: req.userMatricula,
      },
      req
    );

    return CommonResponse.success(
      res,
      data,
      200,
      "Permissão adicionada ao usuário com sucesso."
    );
  }

  /**
   * Remove permissão individual de um usuário
   */
  async removerPermissaoDoUsuario(req, res) {
    console.log("Estou no removerPermissaoDoUsuario em UsuarioController");

    const { id } = req.params;
    const { rota, dominio } = req.body;

    if (!id) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "id",
        details: [],
        customMessage: "ID do usuário é obrigatório.",
      });
    }

    if (!rota) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "rota",
        details: [],
        customMessage: "Nome da rota é obrigatório.",
      });
    }

    const data = await this.service.removerPermissaoDoUsuario(
      id,
      rota,
      dominio
    );

    // Registra evento crítico
    LogMiddleware.logCriticalEvent(
      req.userId,
      "PERMISSAO_INDIVIDUAL_REMOVIDA",
      {
        usuario_id: id,
        permissao_removida: {
          rota: rota,
          dominio: dominio || "localhost",
        },
        removido_por: req.userMatricula,
      },
      req
    );

    return CommonResponse.success(
      res,
      data,
      200,
      "Permissão removida do usuário com sucesso."
    );
  }

  /**
   * Obtém permissões efetivas de um usuário
   */
  async obterPermissoesUsuario(req, res) {
    console.log("Estou no obterPermissoesUsuario em UsuarioController");

    const { id } = req.params;

    if (!id) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "id",
        details: [],
        customMessage: "ID do usuário é obrigatório.",
      });
    }

    const data = await this.service.obterPermissoesUsuario(id);

    return CommonResponse.success(
      res,
      data,
      200,
      "Permissões do usuário obtidas com sucesso."
    );
  }
}

export default UsuarioController;
