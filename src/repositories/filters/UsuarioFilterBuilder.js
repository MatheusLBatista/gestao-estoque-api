import mongoose from "mongoose";
import Grupo from "../../models/Grupo.js";

class UsuarioFilterBuilder {
  constructor() {
    this.filtros = {};
  }

  /**
   * Filtra usuários por nome
   */
  comNome(nome) {
    if (nome && nome.trim() !== "") {
      this.filtros.nome_usuario = {
        $regex: this.escapeRegex(nome),
        $options: "i",
      };
    }
    return this;
  }

  /**
   * Filtro genérico por termo de busca (nome ou email ou matrícula)
   */
  comUsuario(usuario) {
    if (usuario && usuario.trim() !== "") {
      const termo = this.escapeRegex(usuario);
      this.filtros.$or = [
        { nome_usuario: { $regex: termo, $options: "i" } },
        { email: { $regex: termo, $options: "i" } },
        { matricula: { $regex: termo, $options: "i" } },
      ];
    }
    return this;
  }

  /**
   * Filtra usuários por matrícula
   */
  comMatricula(matricula) {
    if (matricula && matricula.trim() !== "") {
      this.filtros.matricula = {
        $regex: this.escapeRegex(matricula),
        $options: "i",
      };
    }
    return this;
  }

  /**
   * Filtra usuários por email
   */
  comEmail(email) {
    if (email && email.trim() !== "") {
      this.filtros.email = {
        $regex: this.escapeRegex(email),
        $options: "i",
      };
    }
    return this;
  }

  /**
   * Filtra usuários por perfil
   */
  comPerfil(perfil) {
    if (perfil && perfil.trim() !== "") {
      this.filtros.perfil = {
        $regex: this.escapeRegex(perfil),
        $options: "i",
      };
    }
    return this;
  }

  /**
   * Filtra usuários por cargo (mantido por compatibilidade)
   */
  comCargo(cargo) {
    if (cargo && cargo.trim() !== "") {
      this.filtros.cargo = {
        $regex: this.escapeRegex(cargo),
        $options: "i",
      };
    }
    return this;
  }

  /**
   * Filtra usuários por status ativo
   */
  comStatusAtivo(ativo) {
    if (ativo !== undefined && ativo !== "") {
      const status =
        typeof ativo === "string"
          ? ativo.toLowerCase() === "true"
          : Boolean(ativo);
      this.filtros.ativo = status;
    }
    return this;
  }

  /**
   * Filtra usuários por status online
   */
  comStatusOnline(online) {
    if (online !== undefined && online !== "") {
      const status =
        typeof online === "string"
          ? online.toLowerCase() === "true"
          : Boolean(online);
      this.filtros.online = status;
    }
    return this;
  }

  /**
   * Filtra usuários que têm senha definida
   */
  comSenhaDefinida(senhaDefinida) {
    if (senhaDefinida !== undefined && senhaDefinida !== "") {
      const status =
        typeof senhaDefinida === "string"
          ? senhaDefinida.toLowerCase() === "true"
          : Boolean(senhaDefinida);
      this.filtros.senha_definida = status;
    }
    return this;
  }

  /**
   * Filtra usuários por telefone
   */
  comTelefone(telefone) {
    if (telefone && telefone.trim() !== "") {
      this.filtros.telefone = {
        $regex: this.escapeRegex(telefone),
        $options: "i",
      };
    }
    return this;
  }

  /**
   * Filtra usuários por ID de grupo
   */
  async comGrupoId(grupoId) {
    if (grupoId && mongoose.Types.ObjectId.isValid(grupoId)) {
      const grupoExiste = await Grupo.findById(grupoId);
      if (grupoExiste) {
        this.filtros.grupos = { $in: [new mongoose.Types.ObjectId(grupoId)] };
      } else {
        // Filtro impossível se o grupo não existe
        this.filtros._id = { $exists: false };
      }
    }
    return this;
  }

  /**
   * Filtra usuários por nome do grupo
   */
  async comGrupoNome(nomeGrupo) {
    if (nomeGrupo && nomeGrupo.trim() !== "") {
      const grupos = await Grupo.find({
        nome: { $regex: this.escapeRegex(nomeGrupo), $options: "i" },
      });

      if (grupos.length > 0) {
        const grupoIds = grupos.map((g) => g._id);
        this.filtros.grupos = { $in: grupoIds };
      } else {
        // Filtro impossível se nenhum grupo for encontrado
        this.filtros._id = { $exists: false };
      }
    }
    return this;
  }

  /**
   * Filtra usuários por período de cadastro
   */
  comPeriodoCadastro(dataInicio, dataFim) {
    if (dataInicio && dataFim) {
      // Função auxiliar para converter "DD-MM-YYYY" em Date UTC
      const parseDate = (dateStr, isEndOfDay = false) => {
        const [dia, mes, ano] = dateStr.split("-").map(Number);
        if (isEndOfDay) {
          return new Date(Date.UTC(ano, mes - 1, dia, 23, 59, 59, 999));
        } else {
          return new Date(Date.UTC(ano, mes - 1, dia, 0, 0, 0, 0));
        }
      };

      const dataInicioObj = parseDate(dataInicio, false);
      const dataFimObj = parseDate(dataFim, true);

      if (!isNaN(dataInicioObj) && !isNaN(dataFimObj)) {
        this.filtros.data_cadastro = {
          $gte: dataInicioObj,
          $lte: dataFimObj,
        };
      }
    }
    return this;
  }

  /**
   * Filtra usuários cadastrados após uma data
   */
  comDataCadastroApos(data) {
    if (data) {
      const dataObj = new Date(data);
      if (!isNaN(dataObj)) {
        this.filtros.data_cadastro = {
          ...(this.filtros.data_cadastro || {}),
          $gte: dataObj,
        };
      }
    }
    return this;
  }

  /**
   * Filtra usuários cadastrados antes de uma data
   */
  comDataCadastroAntes(data) {
    if (data) {
      const dataObj = new Date(data);
      if (!isNaN(dataObj)) {
        this.filtros.data_cadastro = {
          ...(this.filtros.data_cadastro || {}),
          $lte: dataObj,
        };
      }
    }
    return this;
  }

  /**
   * Utilitário para escapar caracteres especiais em expressões regulares
   */
  escapeRegex(texto) {
    return texto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }

  /**
   * Constrói e retorna o objeto de filtros
   */
  build() {
    return this.filtros;
  }
}

export default UsuarioFilterBuilder;
