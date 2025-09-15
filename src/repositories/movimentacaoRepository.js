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

      try {
        const data = await this.model
          .findById(id)
          .populate("id_usuario", "nome_usuario email")
          .populate(
            "produtos.produto_ref",
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
      } catch (populateError) {
        console.error("Erro ao popular referências:", populateError);

        const data = await this.model.findById(id);
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
    }

    const {
      tipo,
      destino,
      data_inicio,
      data_fim,
      produto,
      nome_produto,
      nome_usuario,
      usuario,
      page = 1,
    } = req.query || {};

    const limite = Math.min(parseInt(req.query?.limite, 10) || 10, 100);

    const filtros = {};

    // Aplicar filtros novos
    if (tipo) {
      filtros.tipo = tipo;
    }

    if (destino) {
      filtros.destino = destino;
    }

    if (data_inicio && data_fim) {
      filtros.data_movimentacao = {
        $gte: new Date(data_inicio),
        $lte: new Date(data_fim),
      };
    }

    if (produto) {
      filtros["produtos.produto_ref"] = produto;
    }

    if (nome_produto) {
      filtros["produtos.nome_produto"] = nome_produto;
    }

    if (usuario) {
      filtros.id_usuario = usuario;
    }

    if (nome_usuario) {
      filtros.nome_usuario = nome_usuario;
    }

    // Filtros adicionais
    const { quantidadeMin, quantidadeMax } = req.query || {};
    if (quantidadeMin !== undefined) {
      filtros.quantidade = { $gte: quantidadeMin };
    }
    if (quantidadeMax !== undefined) {
      filtros.quantidade = {
        ...filtros.quantidade,
        $lte: quantidadeMax,
      };
    }

    const options = {
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limite, 10), 100),
      sort: { data_movimentacao: -1 },
      populate: [
        { path: "id_usuario", select: "nome_usuario email" },
        {
          path: "produtos.produto_ref",
          select: "nome_produto estoque",
        },
      ],
    };

    try {
      const resultado = await this.model.paginate(filtros, options);
      console.log(`Encontradas ${resultado.totalDocs} movimentações`);
      return resultado;
    } catch (paginateError) {
      console.error("Erro ao paginar movimentações:", paginateError);

      const fallbackOptions = {
        page: parseInt(page, 10),
        limit: parseInt(limite, 10),
        sort: { data_movimentacao: -1 },
        populate: false,
      };

      const resultado = await this.model.paginate(filtros, fallbackOptions);
      return resultado;
    }
  }

  async buscarMovimentacaoPorID(id) {
    console.log("Estou no buscarMovimentacaoPorID em MovimentacaoRepository");

    const movimentacao = await this.model
      .findById(id)
      .populate("id_usuario", "nome_usuario email")
      .populate(
        "produtos.produto_ref",
        "nome_produto estoque"
      );

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
          .findById(produto.produto_ref);

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
          "produtos.produto_ref",
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

  async filtrarMovimentacoesAvancado(opcoesFiltro = {}, opcoesPaginacao = {}) {
    console.log("Estou no filtrarMovimentacoesAvancado em MovimentacaoRepository");

    const builder = new MovimentacaoFilterBuilder();

    // Filtros básicos
    if (opcoesFiltro.tipo) builder.comTipo(opcoesFiltro.tipo);
    if (opcoesFiltro.destino) builder.comDestino(opcoesFiltro.destino);

    // Filtros de data
    if (opcoesFiltro.data) {
      builder.comData(opcoesFiltro.data);
    } else if (opcoesFiltro.dataInicio && opcoesFiltro.dataFim) {
      builder.comPeriodo(opcoesFiltro.dataInicio, opcoesFiltro.dataFim);
    } else {
      if (opcoesFiltro.dataInicio) builder.comDataApos(opcoesFiltro.dataInicio);
      if (opcoesFiltro.dataFim) builder.comDataAntes(opcoesFiltro.dataFim);
    }

    // Filtros de usuário (async)
    if (opcoesFiltro.idUsuario) await builder.comUsuarioId(opcoesFiltro.idUsuario);
    if (opcoesFiltro.nomeUsuario) await builder.comUsuarioNome(opcoesFiltro.nomeUsuario);

    // Filtros de produto (async)
    if (opcoesFiltro.idProduto) await builder.comProdutoId(opcoesFiltro.idProduto);
    // if (opcoesFiltro.codigoProduto) await builder.comProdutoCodigo(opcoesFiltro.codigoProduto);
    if (opcoesFiltro.nomeProduto) await builder.comProdutoNome(opcoesFiltro.nomeProduto);

    // Filtros de quantidade
    if (opcoesFiltro.quantidadeMin !== undefined) builder.comQuantidadeMinima(opcoesFiltro.quantidadeMin);
    if (opcoesFiltro.quantidadeMax !== undefined) builder.comQuantidadeMaxima(opcoesFiltro.quantidadeMax);

    // Filtro de status
    if (opcoesFiltro.status !== undefined) builder.comStatus(opcoesFiltro.status);

    // Constrói filtros finais
    const filtros = builder.build();
    console.log("Filtros aplicados:", JSON.stringify(filtros, null, 2));

    // Paginação
    const { page = 1, limite = 10 } = opcoesPaginacao;
    const options = {
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limite, 10), 100),
      sort: { data_movimentacao: -1 },
      populate: [
        { path: "id_usuario", select: "nome_usuario email" },
        { path: "produtos.produto_ref", select: "nome_produto estoque" }
      ]
    };

    const resultado = await this.model.paginate(filtros, options);
    console.log(`Encontradas ${resultado.docs?.length || 0} movimentações`);
    return resultado;
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
