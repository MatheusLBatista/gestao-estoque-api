import UsuarioRepository from "../repositories/usuarioRepository.js";
import mongoose from "mongoose";
import { CustomError, HttpStatusCodes } from "../utils/helpers/index.js";
import bcrypt from "bcrypt";

class UsuarioService {
  constructor() {
    this.repository = new UsuarioRepository();
    // Mapeamento de perfil para nome de grupo (deve corresponder aos nomes no banco)
    this.perfilParaGrupo = {
      administrador: "Administradores",
      gerente: "Gerentes",
      estoquista: "Estoquistas",
    };
  }

  /**
   * Obtém o ID do grupo baseado no perfil do usuário
   * @param {String} perfil - Perfil do usuário (administrador, gerente, estoquista)
   * @returns {String|null} - ID do grupo ou null
   */
  async obterGrupoPorPerfil(perfil) {
    try {
      const nomeGrupo = this.perfilParaGrupo[perfil.toLowerCase()];
      if (!nomeGrupo) {
        console.warn(`⚠️  Perfil "${perfil}" não tem grupo associado`);
        return null;
      }

      const Grupo = mongoose.model("grupos");
      const grupo = await Grupo.findOne({ nome: nomeGrupo, ativo: true });

      if (!grupo) {
        console.warn(
          `⚠️  Grupo "${nomeGrupo}" não encontrado para perfil "${perfil}"`
        );
        return null;
      }

      console.log(
        `✅ Perfil "${perfil}" → Grupo "${nomeGrupo}" (${grupo._id})`
      );
      return grupo._id.toString();
    } catch (error) {
      console.error(`❌ Erro ao buscar grupo para perfil "${perfil}":`, error);
      return null;
    }
  }

  async listarUsuarios(req) {
    console.log("Estou no listarUsuarios em UsuarioService");
    const data = await this.repository.listarUsuarios(req);
    console.log("Estou retornando os dados em UsuarioService");
    return data;
  }

  async cadastrarUsuario(dadosUsuario) {
    console.log("Estou no cadastrarUsuario em UsuarioService");

    if (!dadosUsuario.data_cadastro) {
      dadosUsuario.data_cadastro = new Date();
    }

    dadosUsuario.data_ultima_atualizacao = new Date();

    if (dadosUsuario.matricula) {
      await this.repository.validarMatricula(dadosUsuario.matricula);
    }

    if (dadosUsuario.email) {
      await this.repository.validarEmail(dadosUsuario.email);
    }

    if (
      dadosUsuario.perfil &&
      (!dadosUsuario.grupos || dadosUsuario.grupos.length === 0)
    ) {
      const grupoId = await this.obterGrupoPorPerfil(dadosUsuario.perfil);
      if (grupoId) {
        dadosUsuario.grupos = [grupoId];
        console.log(
          `✅ Usuário será adicionado automaticamente ao grupo do perfil "${dadosUsuario.perfil}"`
        );
      } else {
        console.warn(
          `⚠️  Nenhum grupo encontrado para perfil "${dadosUsuario.perfil}". Usuário será criado sem grupo associado.`
        );
        console.warn(`💡 Execute 'npm run seed' para criar os grupos padrão.`);
      }
    }

    if (dadosUsuario.grupos && dadosUsuario.grupos.length > 0) {
      await this.validarGrupos(dadosUsuario.grupos);
    }

    if (dadosUsuario.permissoes && dadosUsuario.permissoes.length > 0) {
      await this.validarPermissoes(dadosUsuario.permissoes);
    }

    const data = await this.criarUsuario(dadosUsuario);
    return data;
  }

  async atualizarUsuario(matricula, dadosAtualizacao) {
    console.log(
      "Atualizando usuário por matrícula:",
      matricula,
      dadosAtualizacao
    );

    if (
      !matricula ||
      typeof matricula !== "string" ||
      matricula.trim() === ""
    ) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "matricula",
        details: [],
        customMessage: "Matrícula do usuário é obrigatória e deve ser válida.",
      });
    }

    // ✨ Se o perfil foi alterado, atualizar o grupo automaticamente
    if (dadosAtualizacao.perfil) {
      const usuarioAtual = await this.repository.buscarPorMatricula(matricula);

      // Se o perfil mudou ou não tem grupos, atribuir grupo baseado no novo perfil
      if (
        usuarioAtual &&
        (usuarioAtual.perfil !== dadosAtualizacao.perfil ||
          !usuarioAtual.grupos ||
          usuarioAtual.grupos.length === 0)
      ) {
        const grupoId = await this.obterGrupoPorPerfil(dadosAtualizacao.perfil);
        if (grupoId) {
          dadosAtualizacao.grupos = [grupoId];
          console.log(
            `✅ Grupo atualizado automaticamente para perfil "${dadosAtualizacao.perfil}"`
          );
        }
      }
    }

    dadosAtualizacao.data_ultima_atualizacao = new Date();
    const usuarioAtualizado = await this.repository.atualizarUsuario(
      matricula,
      dadosAtualizacao
    );
    return usuarioAtualizado;
  }

  async buscarUsuarioPorID(id) {
    console.log("Estou no buscarUsuarioPorID em UsuarioService");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "id",
        details: [],
        customMessage: "ID do usuário inválido.",
      });
    }

    const data = await this.repository.buscarPorId(id);

    if (!data) {
      throw new CustomError({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        errorType: "resourceNotFound",
        field: "Usuario",
        details: [],
        customMessage: "Usuário não encontrado.",
      });
    }

    return data;
  }

  async buscarUsuarioPorMatricula(matricula) {
    console.log("Estou no buscarUsuarioPorMatricula em UsuarioService");

    if (!matricula || matricula.trim() === "") {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "matricula",
        details: [],
        customMessage: "Matrícula válida é obrigatória para busca.",
      });
    }

    const usuario = await this.repository.buscarPorMatricula(matricula);

    if (!usuario) {
      throw new CustomError({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        errorType: "resourceNotFound",
        field: "Usuario",
        details: [],
        customMessage: "Usuário não encontrado com a matrícula informada.",
      });
    }

    return usuario;
  }

  async deletarUsuario(matricula) {
    console.log("Estou no deletarUsuario em UsuarioService");

    if (!matricula) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "matricula",
        details: [],
        customMessage: "Matrícula do usuário é obrigatória.",
      });
    }

    const data = await this.repository.deletarUsuario(matricula);
    return data;
  }

  async desativarUsuario(matricula) {
    console.log("Estou no desativarUsuario em UsuarioService");

    if (
      !matricula ||
      typeof matricula !== "string" ||
      matricula.trim() === ""
    ) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "matricula",
        details: [],
        customMessage: "Matrícula do usuário é obrigatória e deve ser válida.",
      });
    }

    const data = await this.repository.desativarUsuario(matricula);
    return data;
  }

  async reativarUsuario(matricula) {
    console.log("Estou no reativarUsuario em UsuarioService");

    if (
      !matricula ||
      typeof matricula !== "string" ||
      matricula.trim() === ""
    ) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "matricula",
        details: [],
        customMessage: "Matrícula do usuário é obrigatória e deve ser válida.",
      });
    }

    const data = await this.repository.reativarUsuario(matricula);
    return data;
  }

  async verificarEmailExistente(email) {
    const usuario = await this.repository.buscarPorEmail(email);
    return usuario !== null;
  }

  async criarUsuario(dadosUsuario) {
    // Se há senha e não está hash, faça o hash
    if (dadosUsuario.senha && !dadosUsuario.senha.startsWith("$2")) {
      dadosUsuario.senha = await bcrypt.hash(dadosUsuario.senha, 10);
    }

    // Se não há senha, define que a senha não foi definida
    if (!dadosUsuario.senha) {
      dadosUsuario.senha_definida = false;
    } else {
      dadosUsuario.senha_definida = true;
    }

    return await this.repository.criarUsuario(dadosUsuario);
  }

  async revoke(token) {
    if (!token) {
      throw new CustomError({
        statusCode: 400,
        customMessage: "Token não fornecido",
        errorType: "validationError",
      });
    }
    await this.repository.adicionarTokenRevogado(token);

    return true;
  }

  /**
   * Adiciona um usuário a um grupo
   * @param {String} usuarioId - ID do usuário
   * @param {String} grupoId - ID do grupo
   * @returns {Object} - Usuário atualizado
   */
  async adicionarUsuarioAoGrupo(usuarioId, grupoId) {
    const usuario = await this.repository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new CustomError({
        statusCode: 404,
        errorType: "resourceNotFound",
        field: "usuario",
        details: [],
        customMessage: "Usuário não encontrado",
      });
    }

    // Verificar se o grupo existe
    const Grupo = mongoose.model("grupos");
    const grupo = await Grupo.findById(grupoId);
    if (!grupo) {
      throw new CustomError({
        statusCode: 404,
        errorType: "resourceNotFound",
        field: "grupo",
        details: [],
        customMessage: "Grupo não encontrado",
      });
    }

    // Verificar se o usuário já está no grupo
    if (usuario.grupos && usuario.grupos.includes(grupoId)) {
      throw new CustomError({
        statusCode: 400,
        errorType: "validationError",
        field: "grupo",
        details: [],
        customMessage: "Usuário já pertence a este grupo",
      });
    }

    // Adicionar o grupo ao usuário
    const gruposAtualizados = usuario.grupos
      ? [...usuario.grupos, grupoId]
      : [grupoId];

    return await this.repository.atualizarUsuario(usuario.matricula, {
      grupos: gruposAtualizados,
    });
  }

  /**
   * Remove um usuário de um grupo
   * @param {String} usuarioId - ID do usuário
   * @param {String} grupoId - ID do grupo
   * @returns {Object} - Usuário atualizado
   */
  async removerUsuarioDoGrupo(usuarioId, grupoId) {
    const usuario = await this.repository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new CustomError({
        statusCode: 404,
        errorType: "resourceNotFound",
        field: "usuario",
        details: [],
        customMessage: "Usuário não encontrado",
      });
    }

    // Verificar se o usuário está no grupo
    if (!usuario.grupos || !usuario.grupos.includes(grupoId)) {
      throw new CustomError({
        statusCode: 400,
        errorType: "validationError",
        field: "grupo",
        details: [],
        customMessage: "Usuário não pertence a este grupo",
      });
    }

    // Remover o grupo do usuário
    const gruposAtualizados = usuario.grupos.filter(
      (g) => g.toString() !== grupoId
    );

    return await this.repository.atualizarUsuario(usuario.matricula, {
      grupos: gruposAtualizados,
    });
  }

  /**
   * Adiciona uma permissão individual a um usuário
   * @param {String} usuarioId - ID do usuário
   * @param {Object} permissao - Dados da permissão
   * @returns {Object} - Usuário atualizado
   */
  async adicionarPermissaoAoUsuario(usuarioId, permissao) {
    const usuario = await this.repository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new CustomError({
        statusCode: 404,
        errorType: "resourceNotFound",
        field: "usuario",
        details: [],
        customMessage: "Usuário não encontrado",
      });
    }

    // Verificar se a permissão já existe
    const permissaoExiste =
      usuario.permissoes &&
      usuario.permissoes.some(
        (p) =>
          p.rota === permissao.rota.toLowerCase() &&
          p.dominio === (permissao.dominio || "localhost")
      );

    if (permissaoExiste) {
      throw new CustomError({
        statusCode: 400,
        errorType: "validationError",
        field: "permissao",
        details: [],
        customMessage: "Esta permissão já existe para o usuário",
      });
    }

    // Adicionar a permissão
    const permissoesAtualizadas = usuario.permissoes
      ? [...usuario.permissoes]
      : [];
    permissoesAtualizadas.push({
      ...permissao,
      rota: permissao.rota.toLowerCase(),
    });

    return await this.repository.atualizarUsuario(usuario.matricula, {
      permissoes: permissoesAtualizadas,
    });
  }

  /**
   * Remove uma permissão individual de um usuário
   * @param {String} usuarioId - ID do usuário
   * @param {String} rota - Nome da rota
   * @param {String} dominio - Domínio da aplicação
   * @returns {Object} - Usuário atualizado
   */
  async removerPermissaoDoUsuario(usuarioId, rota, dominio = "localhost") {
    const usuario = await this.repository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new CustomError({
        statusCode: 404,
        errorType: "resourceNotFound",
        field: "usuario",
        details: [],
        customMessage: "Usuário não encontrado",
      });
    }

    // Filtrar as permissões removendo a especificada
    const permissoesAtualizadas = usuario.permissoes
      ? usuario.permissoes.filter(
          (p) => !(p.rota === rota.toLowerCase() && p.dominio === dominio)
        )
      : [];

    if (permissoesAtualizadas.length === (usuario.permissoes?.length || 0)) {
      throw new CustomError({
        statusCode: 404,
        errorType: "resourceNotFound",
        field: "permissao",
        details: [],
        customMessage: "Permissão não encontrada para este usuário",
      });
    }

    return await this.repository.atualizarUsuario(usuario.matricula, {
      permissoes: permissoesAtualizadas,
    });
  }

  /**
   * Obtém todas as permissões efetivas de um usuário (grupos + individuais)
   * @param {String} usuarioId - ID do usuário
   * @returns {Object} - Permissões do usuário
   */
  async obterPermissoesUsuario(usuarioId) {
    const PermissionService = (await import("./PermissionService.js")).default;
    const permissionService = new PermissionService();

    return await permissionService.getUserPermissions(usuarioId);
  }

  /**
   * Valida se os grupos fornecidos existem e estão ativos
   * @param {Array} gruposIds - Array de IDs dos grupos
   */
  async validarGrupos(gruposIds) {
    const Grupo = mongoose.model("grupos");

    for (const grupoId of gruposIds) {
      if (!mongoose.Types.ObjectId.isValid(grupoId)) {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: "validationError",
          field: "grupos",
          details: [],
          customMessage: `ID do grupo inválido: ${grupoId}`,
        });
      }

      const grupo = await Grupo.findById(grupoId);
      if (!grupo) {
        throw new CustomError({
          statusCode: HttpStatusCodes.NOT_FOUND.code,
          errorType: "resourceNotFound",
          field: "grupo",
          details: [],
          customMessage: `Grupo não encontrado: ${grupoId}`,
        });
      }

      if (!grupo.ativo) {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: "validationError",
          field: "grupos",
          details: [],
          customMessage: `Grupo está inativo: ${grupo.nome}`,
        });
      }
    }
  }

  /**
   * Valida se as permissões individuais são válidas
   * @param {Array} permissoes - Array de permissões
   */
  async validarPermissoes(permissoes) {
    const Rota = mongoose.model("rotas");

    for (const permissao of permissoes) {
      // Verificar se a rota existe no sistema
      const rota = await Rota.findOne({
        rota: permissao.rota.toLowerCase(),
        dominio: permissao.dominio || "localhost",
      });

      if (!rota) {
        throw new CustomError({
          statusCode: HttpStatusCodes.NOT_FOUND.code,
          errorType: "resourceNotFound",
          field: "permissao.rota",
          details: [],
          customMessage: `Rota não encontrada no sistema: ${permissao.rota}`,
        });
      }

      if (!rota.ativo) {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: "validationError",
          field: "permissao.rota",
          details: [],
          customMessage: `Rota está inativa: ${permissao.rota}`,
        });
      }
    }

    // Verificar duplicatas na própria lista
    const combinacoes = permissoes.map(
      (p) => `${p.rota}_${p.dominio || "localhost"}`
    );
    const setCombinacoes = new Set(combinacoes);

    if (combinacoes.length !== setCombinacoes.size) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "permissoes",
        details: [],
        customMessage: "Permissões duplicadas encontradas na lista",
      });
    }
  }

  /**
   * Atualiza a foto de perfil do usuário
   */
  async atualizarFotoPerfil(matricula, fotoUrl) {
    console.log("Estou no atualizarFotoPerfil em UsuarioService");
    console.log(` Atualizando foto para matrícula: ${matricula}`);
    console.log(`Nova URL da foto: ${fotoUrl}`);

    const usuario = await this.repository.buscarPorMatricula(matricula);

    if (!usuario) {
      throw new CustomError({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        errorType: "resourceNotFound",
        field: "usuario",
        details: [],
        customMessage: `Usuário com matrícula ${matricula} não encontrado.`,
      });
    }

    console.log(` Foto anterior: ${usuario.foto_perfil}`);
    
    // Atualiza a foto de perfil
    usuario.foto_perfil = fotoUrl;
    await usuario.save();

    console.log(` Foto atualizada com sucesso: ${usuario.foto_perfil}`);

    return usuario;
  }
}

export default UsuarioService;
