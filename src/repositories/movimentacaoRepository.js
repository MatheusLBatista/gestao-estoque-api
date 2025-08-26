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

      // Ajuste aqui para tratar possíveis erros de referência
      try {
        const data = await this.model
          .findById(id)
          .populate("id_usuario", "nome_usuario");

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

        // Tenta retornar sem o populate em caso de erro
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

    // Para busca por filtros
    const {
      tipo,
      data_inicio,
      data_fim,
      produto,
      usuario,
      page = 1,
    } = req.query || {};

    const limite = Math.min(parseInt(req.query?.limite, 10) || 10, 100);

    const filtros = {};

    if (tipo) {
      filtros.tipo = tipo;
      console.log(`Aplicando filtro por tipo: "${tipo}"`);
    }

    if (data_inicio && data_fim) {
      filtros.data_movimentacao = {
        $gte: new Date(data_inicio),
        $lte: new Date(data_fim),
      };
      console.log(
        `Aplicando filtro por período: de ${data_inicio} até ${data_fim}`
      );
    }

    // Restante do código de filtros...

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limite, 10),
      sort: { data_movimentacao: -1 },
      // Opções de populate simplificadas para reduzir dependências
      populate: [
        { path: "id_usuario", select: "nome_usuario email" },
        {
          path: "produtos.produto_ref",
          select: "nome_produto codigo_produto quantidade_estoque",
        },
      ],
    };

    console.log("Filtros aplicados:", filtros);

    try {
      const resultado = await this.model.paginate(filtros, options);
      console.log(`Encontradas ${resultado.docs?.length || 0} movimentações`);
      return resultado;
    } catch (paginateError) {
      console.error("Erro ao paginar movimentações:", paginateError);

      // Fallback sem populate em caso de erro
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limite, 10),
        sort: { data_movimentacao: -1 },
        populate: false,
      };

      const resultado = await this.model.paginate(filtros, options);
      return resultado;
    }
  }

  async buscarMovimentacaoPorID(id) {
    console.log("Estou no buscarMovimentacaoPorID em MovimentacaoRepository");
    const movimentacao = await this.model.findById(id);

    if (!movimentacao) {
      throw new CustomError({
        statusCode: 404,
        errorType: "resourceNotFound",
        field: "Movimentacao",
        details: [],
        customMessage: messages.error.resourceNotFound('Movimentacao')
      });
    }

    return movimentacao;
  }

  async cadastrarMovimentacao(dadosMovimentacao) {
    console.log("Estou no cadastrarMovimentacao em MovimentacaoRepository");

    try {
      const movimentacao = new this.model(dadosMovimentacao);
      const resultado = await movimentacao.save();
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
    console.log(
      "Dados de atualização:",
      JSON.stringify(dadosAtualizacao, null, 2)
    );

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
        .populate("id_usuario")
        .populate("produtos.produto_ref");

      console.log(
        "Resultado da atualização:",
        movimentacaoAtualizada ? "Sucesso" : "Falha"
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

      if (error instanceof CustomError) {
        throw error;
      }

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
    console.log(
      "Estou no filtrarMovimentacoesAvancado em MovimentacaoRepository"
    );

    const builder = new MovimentacaoFilterBuilder();

    // Aplicar filtros básicos
    if (opcoesFiltro.tipo) builder.comTipo(opcoesFiltro.tipo);
    if (opcoesFiltro.destino) builder.comDestino(opcoesFiltro.destino);

    // Filtros de data
    if (opcoesFiltro.data) {
      builder.comData(opcoesFiltro.data);
    } else if (opcoesFiltro.dataInicio && opcoesFiltro.dataFim) {
      builder.comPeriodo(opcoesFiltro.dataInicio, opcoesFiltro.dataFim);
    } else {
      if (opcoesFiltro.dataInicio)
        builder.comDataApos(opcoesFiltro.dataInicio);
      if (opcoesFiltro.dataFim) builder.comDataAntes(opcoesFiltro.dataFim);
    }

    // Filtros de usuário
    if (opcoesFiltro.idUsuario) builder.comUsuarioId(opcoesFiltro.idUsuario);
    if (opcoesFiltro.nomeUsuario)
      builder.comUsuarioNome(opcoesFiltro.nomeUsuario);

    // Filtros de produto
    if (opcoesFiltro.idProduto) builder.comProdutoId(opcoesFiltro.idProduto);
    if (opcoesFiltro.codigoProduto)
      builder.comProdutoCodigo(opcoesFiltro.codigoProduto);
    if (opcoesFiltro.nomeProduto)
      builder.comProdutoNome(opcoesFiltro.nomeProduto);

    // Filtros de fornecedor
    if (opcoesFiltro.idFornecedor)
      builder.comFornecedorId(opcoesFiltro.idFornecedor);
    if (opcoesFiltro.nomeFornecedor)
      builder.comFornecedorNome(opcoesFiltro.nomeFornecedor);

    // Filtros de quantidade
    if (opcoesFiltro.quantidadeMin !== undefined)
      builder.comQuantidadeMinima(opcoesFiltro.quantidadeMin);
    if (opcoesFiltro.quantidadeMax !== undefined)
      builder.comQuantidadeMaxima(opcoesFiltro.quantidadeMax);

    // Construir os filtros
    const filtros = builder.build();
    console.log("Filtros aplicados:", JSON.stringify(filtros, null, 2));

    // Configurar paginação
    const { page = 1, limite = 10 } = opcoesPaginacao;
    const options = {
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limite, 10), 100),
      sort: { data_movimentacao: -1 },
      populate: ["id_usuario", "produtos.produto_ref"],
    };

    const resultado = await this.model.paginate(filtros, options);
    console.log(`Encontradas ${resultado.docs?.length || 0} movimentações`);
    return resultado;
  }

  async desativarMovimentacao(id){
    const movimentacao = await this.model.findByIdAndUpdate (
      id,
      { status: false },
      { new: true }
  );
  return movimentacao;
  }

  async reativarMovimentacao(id){
    const movimentacao = await this.model.findByIdAndUpdate (
      id,
      { status: true },
      { new: true }
  );
  return movimentacao;
  }
}

export default MovimentacaoRepository;
