import mongoose from "mongoose";
import Usuario from "../../models/Usuario.js";
import Produto from "../../models/Produto.js";

import usuarioRepository from "../usuarioRepository.js";
import produtoRepository from "../produtoRepository.js";

class MovimentacaoFilterBuilder {
  constructor() {
    this.filtros = {};
    this.usuarioModel = new Usuario();
    this.produtoModel = new Produto();

    this.usuarioRepository = new usuarioRepository();
    this.produtoRepository = new produtoRepository();
  }

  /**
   * Filtra movimentações por tipo (entrada ou saída)
   */
  comTipo(tipo) {
    if (tipo && ["entrada", "saida"].includes(tipo)) {
      this.filtros.tipo = tipo;
    }
    return this;
  }

  /**
   * Filtra movimentações por destino
   */
  comDestino(destino) {
    if (destino && destino.trim() !== "") {
      this.filtros.destino = {
        $regex: this.escapeRegex(destino),
        $options: "i",
      };
    }
    return this;
  }

  /**
   * Filtra movimentações por período
   */
  comPeriodo(data_inicio, data_fim) {
    if (data_inicio && data_fim) {
      try {
        const parseDate = (dateStr) => {
          let dia, mes, ano;

          if (dateStr.includes("/")) {
            [dia, mes, ano] = dateStr.split("/").map(Number);
          } else if (dateStr.includes("-")) {
            const parts = dateStr.split("-");
            if (parts[0].length === 4) {   
              [ano, mes, dia] = parts.map(Number);
            } else {   
              [dia, mes, ano] = parts.map(Number);
            }
          } else {
            return null;
          }

          return new Date(ano, mes - 1, dia);
        };

        const data_inicioObj = parseDate(data_inicio);
        const data_fimObj = parseDate(data_fim);

        if (
          data_inicioObj &&
          data_fimObj &&
          !isNaN(data_inicioObj) &&
          !isNaN(data_fimObj)
        ) {
          this.filtros.data_cadastro = {
            $gte: data_inicioObj,
            $lte: new Date(
              data_fimObj.getFullYear(),
              data_fimObj.getMonth(),
              data_fimObj.getDate(),
              23,
              59,
              59,
              999
            ),
          };
        }
      } catch (error) {
        console.error("Erro ao processar filtro de data:", error);
      }
    }
    return this;
  }

  /**
   * Filtra movimentações por ID de usuário
   */
  async comUsuarioId(usuario_id) {
    if (usuario_id && mongoose.Types.ObjectId.isValid(usuario_id)) {
      const usuarioExiste = await this.usuarioRepository.buscarPorId(
        usuario_id
      );
      if (usuarioExiste) {
        this.filtros.id_usuario = usuario_id;
      } else {
        this.filtros.id_usuario = null;
      }
    }
    return this;
  }

  async comUsuarioNome(nome_usuario) {
    if (nome_usuario && nome_usuario.trim() !== "") {
      const usuarioEncontrado = await this.usuarioRepository.buscarPorNome(
        nome_usuario.trim()
      );

      const usuariosIDs = Array.isArray(usuarioEncontrado)
        ? usuarioEncontrado.map((g) => g._id)
        : usuarioEncontrado
        ? [usuarioEncontrado._id]
        : [];

      if (usuariosIDs.length > 0) {
        this.filtros.id_usuario = { $in: usuariosIDs };
      } else {
        // Se nenhum usuário for encontrado, garante que o filtro não retorne resultados
        this.filtros.id_usuario = { $exists: false };
      }
    }
    return this;
  }

  /**
   * Filtra movimentações por ID do produto
   * Agora verifica se o produto existe antes de aplicar o filtro.
   */
  async comProdutoId(produto_id) {
    if (produto_id && mongoose.Types.ObjectId.isValid(produto_id)) {
      const produtoExiste = await this.produtoRepository.buscarProdutoPorID(
        produto_id
      );

      if (produtoExiste) {
        this.filtros["produtos._id"] = new mongoose.Types.ObjectId(produto_id);
      } else {
        // Filtro impossível: nunca retorna nada
        this.filtros._id = { $exists: false };
      }
    }
    return this;
  }

  async comProdutoNome(nome_produto) {
    if (nome_produto && nome_produto.trim() !== "") {
      const produtoEncontrado = await this.produtoRepository.buscarPorNome(
        nome_produto.trim()
      );

      const produtosIDs = Array.isArray(produtoEncontrado)
        ? produtoEncontrado.map((g) => g._id)
        : produtoEncontrado
        ? [produtoEncontrado._id]
        : [];

      console.log("IDs dos produtos encontrados:", produtosIDs);

      if (produtosIDs.length > 0) {
        this.filtros["produtos._id"] = { $in: produtosIDs };
      } else {
        this.filtros._id = { $exists: false };
      }
    }
    return this;
  }

  /**
   * Filtra movimentações por código de produto
   */
  comProdutoCodigo(codigo_produto) {
    if (codigo_produto && codigo_produto.trim() !== "") {
      this.filtros["produtos.codigo_produto"] = {
        $regex: this.escapeRegex(codigo_produto),
        $options: "i",
      };
    }
    return this;
  }

  /**
   * Filtra movimentações por quantidade mínima de produtos
   */
  comQuantidadeMinima(quantidade_min) {
    const quantidade = Number(quantidade_min);
    if (!isNaN(quantidade)) {
      this.filtros["produtos.quantidade_produtos"] = {
        ...(this.filtros["produtos.quantidade_produtos"] || {}),
        $gte: quantidade,
      };
    }
    return this;
  }

  /**
   * Filtra movimentações por quantidade máxima de produtos
   */
  comQuantidadeMaxima(quantidade_max) {
    const quantidade = Number(quantidade_max);
    if (!isNaN(quantidade)) {
      this.filtros["produtos.quantidade_produtos"] = {
        ...(this.filtros["produtos.quantidade_produtos"] || {}),
        $lte: quantidade,
      };
    }
    return this;
  }

  /**
   * Filtra movimentações por data específica
   */
  comData(data) {
    if (data) {
      const dataObj = new Date(data);
      if (!isNaN(dataObj)) {
        this.filtros.data_cadastro = {
          $gte: new Date(dataObj.setHours(0, 0, 0, 0)),
          $lte: new Date(dataObj.setHours(23, 59, 59, 999)),
        };
      }
    }
    return this;
  }

  /**
   * Filtra movimentações após uma data específica
   */
  comDataApos(data) {
    const dataObj = new Date(data);
    if (!isNaN(dataObj)) {
      this.filtros.data_cadastro = {
        ...(this.filtros.data_cadastro || {}),
        $gte: dataObj,
      };
    }
    return this;
  }

  /**
   * Filtra movimentações antes de uma data específica
   */
  comDataAntes(data) {
    const dataObj = new Date(data);
    if (!isNaN(dataObj)) {
      this.filtros.data_cadastro = {
        ...(this.filtros.data_cadastro || {}),
        $lte: dataObj,
      };
    }
    return this;
  }

  /**
   * Filtra movimentações por status
   */
  comStatus(status) {
    if (status !== undefined) {
      this.filtros.status =
        typeof status === "string" ? status.toLowerCase() === "true" : status;
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

export default MovimentacaoFilterBuilder;
