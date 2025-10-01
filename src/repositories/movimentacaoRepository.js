import mongoose from "mongoose";
import Movimentacao from "../models/Movimentacao.js";
import MovimentacaoFilterBuilder from "./filters/movimentacaoFilterBuilder.js";
import { CustomError, messages } from "../utils/helpers/index.js";

class MovimentacaoRepository {
  constructor({ model = Movimentacao } = {}) {
    this.model = model;
  }

  async listarMovimentacoes(req) {
    console.log("Estou no listarMovimentacoes em MovimentacaoRepository");

    const id = req.params ? req.params.id : null;

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError({
          statusCode: 400,
          errorType: "validationError",
          field: "id",
          details: [],
          customMessage: "ID da movimentação inválido",
        });
      }

      const data = await this.model
        .findById(id)
        .populate("id_usuario", "nome_usuario email")
        .populate(
          "produtos._id",
          "nome_produto codigo_produto estoque id_fornecedor"
        );

      if (!data) {
        throw new CustomError({
          statusCode: 404,
          errorType: "resourceNotFound",
          field: "Movimentacao",
          details: [],
          customMessage: messages.error.resourceNotFound("Movimentação"),
        });
      }

      return data;
    }

    const {
      tipo,
      destino,
      data_inicio,
      data_fim,
      produto,
      nome_produto,
      nome_usuario,
      codigo_produto,
      usuario,
      page = 1,
    } = req.query || {};

    const limite = Math.min(parseInt(req.query?.limite, 10) || 10, 100);

    const filterBuilder = new MovimentacaoFilterBuilder()
      .comTipo(tipo || "")
      .comDestino(destino || "")
      .comPeriodo(data_inicio || "", data_fim || "");

    await Promise.all([
      filterBuilder.comProdutoId(produto || ""),
      filterBuilder.comProdutoNome(nome_produto || ""),
      filterBuilder.comUsuarioId(usuario || ""),
      filterBuilder.comUsuarioNome(nome_usuario || ""),
      filterBuilder.comProdutoCodigo(codigo_produto || ""),
    ]);

    console.log("Filtros aplicados:", JSON.stringify(filterBuilder, null, 2));

    const filtros = filterBuilder.build();

    const options = {
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limite, 10), 100),
      sort: { data_movimentacao: -1 },
      populate: [
        { path: "id_usuario", select: "nome_usuario email" },
        { path: "produtos._id", select: "nome_produto estoque" },
      ],
    };

    const resultado = await this.model.paginate(filtros, options);

    if (!resultado || !resultado.docs) {
      throw new CustomError({
        statusCode: 404,
        errorType: "resourceNotFound",
        field: "Movimentacao",
        details: [],
        customMessage: messages.error.resourceNotFound("Movimentações"),
      });
    }

    const stats = {
      total_entradas: 0,
      total_saidas: 0,
      valor_total_entradas: 0, 
      valor_total_saidas: 0, 
      lucro_total: 0,
    };

    resultado.docs.forEach((mov) => {
      if (mov.tipo === "entrada") {
        stats.total_entradas++;
        mov.produtos.forEach((prod) => {
          stats.valor_total_entradas +=
            (prod.custo || 0) * prod.quantidade_produtos;
        });
      } else if (mov.tipo === "saida") {
        stats.total_saidas++;
        mov.produtos.forEach((prod) => {
          stats.valor_total_saidas +=
            (prod.preco || 0) * prod.quantidade_produtos;
        });
      }
    });

    stats.lucro_total = stats.valor_total_saidas - stats.valor_total_entradas;

    return {
      ...resultado,
      estatisticas: {
        total_entradas: stats.total_entradas,
        total_saidas: stats.total_saidas,
        valor_total_entradas: parseFloat(stats.valor_total_entradas.toFixed(2)),
        valor_total_saidas: parseFloat(stats.valor_total_saidas.toFixed(2)),
        lucro_total: parseFloat(stats.lucro_total.toFixed(2)),
      },
    };
  }

  async buscarMovimentacaoPorID(id) {
    console.log("Estou no buscarMovimentacaoPorID em MovimentacaoRepository");

    const movimentacao = await this.model
      .findById(id)
      .populate("id_usuario", "nome_usuario email")
      .populate("produtos._id", "nome_produto estoque");

    if (!movimentacao) {
      throw new CustomError({
        statusCode: 404,
        errorType: "resourceNotFound",
        field: "Movimentacao",
        details: [],
        customMessage: messages.error.resourceNotFound("Movimentação"),
      });
    }

    return movimentacao;
  }

  async cadastrarMovimentacao(dadosMovimentacao, req) {
    console.log("Estou no cadastrarMovimentacao em MovimentacaoRepository");

    // Atribuir automaticamente o usuário logado ao campo id_usuario
    if (req && req.user && req.user._id) {
      dadosMovimentacao.id_usuario = req.user._id;
    }

    try {
      const movimentacao = new this.model(dadosMovimentacao);
      const resultado = await movimentacao.save();

      // Verificar se o estoque foi atualizado corretamente
      for (const produto of dadosMovimentacao.produtos) {
        const produtoAtualizado = await mongoose
          .model("produtos")
          .findById(produto._id);

        // Garantir que a quantidade de estoque não seja NaN
        if (!isNaN(produtoAtualizado.estoque)) {
          console.log(
            `Produto: ${produtoAtualizado.nome_produto}, Estoque Atual: ${produtoAtualizado.estoque}`
          );
        } else {
          console.error(
            `Erro: Estoque do produto ${produtoAtualizado.nome_produto} é inválido.`
          );
        }
      }

      console.log("Movimentação cadastrada com sucesso");
      return resultado;
    } catch (error) {
      console.error("Erro ao cadastrar movimentação:", error);

      if (error.name === "ValidationError") {
        const detalhes = Object.keys(error.errors).map((campo) => ({
          campo: campo,
          mensagem: error.errors[campo].message,
        }));

        throw new CustomError({
          statusCode: 400,
          errorType: "validationError",
          field: "Movimentacao",
          details: detalhes,
          customMessage: "Dados de movimentação inválidos",
        });
      }

      throw new CustomError({
        statusCode: 500,
        errorType: "internalServerError",
        field: "Movimentacao",
        details: [],
        customMessage: messages.error.internalServerError(
          "ao cadastrar movimentação"
        ),
      });
    }
  }

  async atualizarMovimentacao(id, dadosAtualizacao) {
    console.log("Estou no atualizarMovimentacao em MovimentacaoRepository");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError({
        statusCode: 400,
        errorType: "validationError",
        field: "id",
        details: [],
        customMessage: "ID da movimentação inválido",
      });
    }

    try {
      const movimentacaoAtualizada = await this.model
        .findByIdAndUpdate(id, dadosAtualizacao, {
          new: true,
          runValidators: true,
        })
        .populate("id_usuario", "nome_usuario email")
        .populate(
          "produtos._id",
          "nome_produto codigo_produto estoque id_fornecedor"
        );

      if (!movimentacaoAtualizada) {
        throw new CustomError({
          statusCode: 404,
          errorType: "resourceNotFound",
          field: "Movimentacao",
          details: [],
          customMessage: "Movimentação não encontrada",
        });
      }

      return movimentacaoAtualizada;
    } catch (error) {
      console.error("Erro ao atualizar movimentação:", error);

      if (error.name === "ValidationError") {
        const detalhes = Object.keys(error.errors).map((campo) => ({
          campo: campo,
          mensagem: error.errors[campo].message,
        }));

        throw new CustomError({
          statusCode: 400,
          errorType: "validationError",
          field: "Movimentacao",
          details: detalhes,
          customMessage: "Dados de atualização inválidos",
        });
      }

      throw new CustomError({
        statusCode: 500,
        errorType: "internalServerError",
        field: "Movimentacao",
        details: [],
        customMessage: messages.error.internalServerError(
          "ao atualizar movimentação"
        ),
      });
    }
  }

  async deletarMovimentacao(id) {
    console.log("Estou no deletarMovimentacao em MovimentacaoRepository");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError({
        statusCode: 400,
        errorType: "validationError",
        field: "id",
        details: [],
        customMessage: "ID da movimentação inválido",
      });
    }

    const movimentacao = await this.model.findByIdAndDelete(id);

    if (!movimentacao) {
      throw new CustomError({
        statusCode: 404,
        errorType: "resourceNotFound",
        field: "Movimentacao",
        details: [],
        customMessage: messages.error.resourceNotFound("Movimentação"),
      });
    }

    console.log("Movimentação excluída com sucesso");
    return movimentacao;
  }

  async desativarMovimentacao(id) {
    const movimentacao = await this.model.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );
    return movimentacao;
  }

  async reativarMovimentacao(id) {
    const movimentacao = await this.model.findByIdAndUpdate(
      id,
      { status: true },
      { new: true }
    );
    return movimentacao;
  }
}

export default MovimentacaoRepository;
