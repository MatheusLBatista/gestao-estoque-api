import mongoose from "mongoose";
import MovimentacaoRepository from "../repositories/movimentacaoRepository.js";
import ProdutoService from "./produtoService.js";
import { CustomError, HttpStatusCodes } from "../utils/helpers/index.js";

class MovimentacaoService {
  constructor() {
    this.repository = new MovimentacaoRepository();
    this.produtoService = new ProdutoService();
  }

  async listarMovimentacoes(req) {
    console.log("Estou no listarMovimentacoes em MovimentacaoService");
    const data = await this.repository.listarMovimentacoes(req);

    if (!data.docs || data.docs.length === 0) {
      throw new CustomError({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        errorType: "resourceNotFound",
        field: "movimentacoes",
        details: [],
        customMessage: "Nenhuma movimentação encontrada.",
      });
    }

    return data;
  }

  async buscarMovimentacaoPorID(id) {
    console.log("Estou no buscarMovimentacaoPorID em MovimentacaoService");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "id",
        details: [],
        customMessage: "ID da movimentação inválido.",
      });
    }

    const data = await this.repository.buscarMovimentacaoPorID(id);

    if (!data) {
      throw new CustomError({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        errorType: "resourceNotFound",
        field: "id",
        details: [],
        customMessage: "Movimentação não encontrada.",
      });
    }

    return data;
  }

  async cadastrarMovimentacao(dadosMovimentacao, req) {
    console.log("Estou no cadastrarMovimentacao em MovimentacaoService");

    if (!dadosMovimentacao.id_usuario && req && req.userId) {
      dadosMovimentacao.id_usuario = req.userId;
    }

    if (
      !dadosMovimentacao.produtos ||
      dadosMovimentacao.produtos.length === 0
    ) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "produtos",
        details: [],
        customMessage: "A movimentação deve conter pelo menos um produto.",
      });
    }

    for (const produtoMov of dadosMovimentacao.produtos) {
      const produto = await this.produtoService.buscarProdutoPorID(
        produtoMov._id
      );

      // Verificação entre _id e codigo_produto
      if (
        produtoMov.codigo_produto &&
        produto.codigo_produto !== produtoMov.codigo_produto
      ) {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: "validationError",
          field: "codigo_produto",
          details: [],
          customMessage: `O código do produto informado (${produtoMov.codigo_produto}) não corresponde ao produto com ID ${produtoMov._id}.`,
        });
      }

      if (dadosMovimentacao.tipo === "saida") {
        delete dadosMovimentacao.produtos.custo;

        // Validar se o estoque é suficiente (deve ser maior que 0 e maior ou igual à quantidade solicitada)
        if (produto.estoque <= 0) {
          throw new CustomError({
            statusCode: HttpStatusCodes.BAD_REQUEST.code,
            errorType: "businessRuleViolation",
            field: "estoque",
            details: [],
            customMessage: `O produto ${produto.nome_produto} está sem estoque disponível.`,
          });
        }

        if (produto.estoque < produtoMov.quantidade_produtos) {
          throw new CustomError({
            statusCode: HttpStatusCodes.BAD_REQUEST.code,
            errorType: "businessRuleViolation",
            field: "quantidade_produtos",
            details: [],
            customMessage: `Estoque insuficiente para o produto ${produto.nome_produto}. Disponível: ${produto.estoque}, solicitado: ${produtoMov.quantidade_produtos}.`,
          });
        }

        await this.produtoService.atualizarProduto(produto._id, {
          estoque: produto.estoque - produtoMov.quantidade_produtos,
        });
      } else if (dadosMovimentacao.tipo === "entrada") {
        delete dadosMovimentacao.produtos.preco;

        await this.produtoService.atualizarProduto(produto._id, {
          estoque: produto.estoque + produtoMov.quantidade_produtos,
          custo: produtoMov.custo, // manter custo atual
          data_ultima_entrada: new Date(),
        });
      }
    }

    const data = await this.repository.cadastrarMovimentacao(dadosMovimentacao);
    return data;
  }

  async atualizarMovimentacao(id, dadosAtualizacao) {
    console.log("Estou no atualizarMovimentacao em MovimentacaoService");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "id",
        details: [],
        customMessage: "ID da movimentação inválido.",
      });
    }

    const movimentacaoOriginal = await this.repository.buscarMovimentacaoPorID(
      id
    );

    if (!movimentacaoOriginal) {
      throw new CustomError({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        errorType: "resourceNotFound",
        field: "id",
        details: [],
        customMessage: "Movimentação não encontrada.",
      });
    }

    const agora = new Date();
    const dataMovimentacao = new Date(movimentacaoOriginal.data_movimentacao);
    const diferencaHoras = Math.abs(agora - dataMovimentacao) / 36e5;

    if (
      diferencaHoras > 24 &&
      (dadosAtualizacao.produtos || dadosAtualizacao.tipo)
    ) {
      throw new CustomError({
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        errorType: "businessRuleViolation",
        field: "data_movimentacao",
        details: [],
        customMessage:
          "Não é possível alterar produtos ou tipo de movimentações com mais de 24 horas.",
      });
    }

    // Se produtos ou tipo foram alterados, refazer estoque
    if (dadosAtualizacao.produtos || dadosAtualizacao.tipo) {
      const novoTipo = dadosAtualizacao.tipo || movimentacaoOriginal.tipo;
      const novosProdutos =
        dadosAtualizacao.produtos || movimentacaoOriginal.produtos;

      // 1. Estorna movimentação original
      for (const produtoMov of movimentacaoOriginal.produtos) {
        const produto = await this.produtoService.buscarProdutoPorID(
          produtoMov._id
        );

        if (movimentacaoOriginal.tipo === "entrada") {
          await this.produtoService.atualizarProduto(produto._id, {
            estoque: Math.max(
              0,
              produto.estoque - produtoMov.quantidade_produtos
            ),
          });
        } else if (movimentacaoOriginal.tipo === "saida") {
          await this.produtoService.atualizarProduto(produto._id, {
            estoque: produto.estoque + produtoMov.quantidade_produtos,
          });
        }
      }

      // 2. Aplica movimentação atualizada
      for (const produtoMov of novosProdutos) {
        const produto = await this.produtoService.buscarProdutoPorID(
          produtoMov._id
        );

        if (novoTipo === "entrada") {
          await this.produtoService.atualizarProduto(produto._id, {
            estoque: produto.estoque + produtoMov.quantidade_produtos,
          });
        } else if (novoTipo === "saida") {
          // Validar se o estoque é suficiente (deve ser maior que 0 e maior ou igual à quantidade solicitada)
          if (produto.estoque <= 0) {
            throw new CustomError({
              statusCode: HttpStatusCodes.BAD_REQUEST.code,
              errorType: "businessRuleViolation",
              field: "estoque",
              details: [],
              customMessage: `O produto ${produto.nome_produto} está sem estoque disponível.`,
            });
          }

          if (produto.estoque < produtoMov.quantidade_produtos) {
            throw new CustomError({
              statusCode: HttpStatusCodes.BAD_REQUEST.code,
              errorType: "businessRuleViolation",
              field: "quantidade_produtos",
              details: [],
              customMessage: `Estoque insuficiente para o produto ${produto.nome_produto}. Disponível: ${produto.estoque}, solicitado: ${produtoMov.quantidade_produtos}.`,
            });
          }

          await this.produtoService.atualizarProduto(produto._id, {
            estoque: produto.estoque - produtoMov.quantidade_produtos,
          });
        }
      }
    }

    const allowedFields = ["destino"];
    dadosAtualizacao = Object.fromEntries(
      Object.entries(dadosAtualizacao).filter(([key]) =>
        allowedFields.includes(key)
      )
    );

    // sempre atualiza a data
    dadosAtualizacao.data_ultima_atualizacao = new Date();

    const movimentacaoAtualizada = await this.repository.atualizarMovimentacao(
      id,
      dadosAtualizacao
    );
    return movimentacaoAtualizada;
  }

  async desativarMovimentacao(id) {
    console.log("Estou no desativarMovimentacao em MovimentacaoService");

    const movimentacao = await this.repository.buscarMovimentacaoPorID(id);
    if (!movimentacao) {
      throw new CustomError({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        errorType: "resourceNotFound",
        field: "id",
        details: [],
        customMessage: "Movimentação não encontrada.",
      });
    }

    if (movimentacao.status === false) {
      throw new CustomError({
        statusCode: HttpStatusCodes.CONFLICT.code,
        errorType: "businessRuleViolation",
        field: "status",
        details: [],
        customMessage: "Movimentação já está desativada.",
      });
    }

    // Estorno do estoque
    if (movimentacao.tipo === "entrada") {
      for (const produtoMov of movimentacao.produtos) {
        const produto = await this.produtoService.buscarProdutoPorID(
          produtoMov._id
        );

        await this.produtoService.atualizarProduto(produto._id, {
          estoque: Math.max(
            0,
            produto.estoque - produtoMov.quantidade_produtos
          ),
        });
      }
    } else if (movimentacao.tipo === "saida") {
      for (const produtoMov of movimentacao.produtos) {
        const produto = await this.produtoService.buscarProdutoPorID(
          produtoMov._id
        );

        await this.produtoService.atualizarProduto(produto._id, {
          estoque: produto.estoque + produtoMov.quantidade_produtos,
        });
      }
    }

    const data = await this.repository.atualizarMovimentacao(id, {
      status: false,
    });
    return data;
  }

  async reativarMovimentacao(id) {
    console.log("Estou no reativarMovimentacao em MovimentacaoService");

    const movimentacao = await this.repository.buscarMovimentacaoPorID(id);
    if (!movimentacao) {
      throw new CustomError({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        errorType: "resourceNotFound",
        field: "id",
        details: [],
        customMessage: "Movimentação não encontrada.",
      });
    }

    if (movimentacao.status === true) {
      throw new CustomError({
        statusCode: HttpStatusCodes.CONFLICT.code,
        errorType: "businessRuleViolation",
        field: "status",
        details: [],
        customMessage: "Movimentação já está ativa.",
      });
    }

    // Reaplicar movimentação no estoque
    if (movimentacao.tipo === "entrada") {
      for (const produtoMov of movimentacao.produtos) {
        const produto = await this.produtoService.buscarProdutoPorID(
          produtoMov._id
        );

        await this.produtoService.atualizarProduto(produto._id, {
          estoque: produto.estoque + produtoMov.quantidade_produtos,
        });
      }
    } else if (movimentacao.tipo === "saida") {
      for (const produtoMov of movimentacao.produtos) {
        const produto = await this.produtoService.buscarProdutoPorID(
          produtoMov._id
        );

        // Validar se há estoque suficiente para reativar a movimentação de saída
        if (produto.estoque <= 0) {
          throw new CustomError({
            statusCode: HttpStatusCodes.CONFLICT.code,
            errorType: "businessRuleViolation",
            field: "estoque",
            details: [],
            customMessage: `O produto ${produto.nome_produto} está sem estoque disponível para reativar a movimentação.`,
          });
        }

        if (produto.estoque < produtoMov.quantidade_produtos) {
          throw new CustomError({
            statusCode: HttpStatusCodes.CONFLICT.code,
            errorType: "businessRuleViolation",
            field: "estoque",
            details: [],
            customMessage: `Não há estoque suficiente para reativar a movimentação do produto ${produto.nome_produto}. Disponível: ${produto.estoque}, necessário: ${produtoMov.quantidade_produtos}.`,
          });
        }

        await this.produtoService.atualizarProduto(produto._id, {
          estoque: produto.estoque - produtoMov.quantidade_produtos,
        });
      }
    }

    const data = await this.repository.atualizarMovimentacao(id, {
      status: true,
    });
    return data;
  }

  async deletarMovimentacao(id) {
    console.log("Estou no deletarMovimentacao em MovimentacaoService");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "id",
        details: [],
        customMessage: "ID da movimentação inválido.",
      });
    }

    const movimentacao = await this.repository.buscarMovimentacaoPorID(id);

    if (!movimentacao) {
      throw new CustomError({
        statusCode: HttpStatusCodes.NOT_FOUND.code,
        errorType: "resourceNotFound",
        field: "id",
        details: [],
        customMessage: "Movimentação não encontrada.",
      });
    }

    const agora = new Date();
    const dataMovimentacao = new Date(movimentacao.data_movimentacao);
    const diferencaDias = Math.floor(
      (agora - dataMovimentacao) / (1000 * 60 * 60 * 24)
    );

    if (diferencaDias > 3) {
      throw new CustomError({
        statusCode: HttpStatusCodes.FORBIDDEN.code,
        errorType: "businessRuleViolation",
        field: "data_movimentacao",
        details: [],
        customMessage:
          "Não é possível deletar movimentações com mais de 3 dias.",
      });
    }

    if (movimentacao.tipo === "saida") {
      for (const produtoMov of movimentacao.produtos) {
        const produto = await this.produtoService.buscarProdutoPorID(
          produtoMov._id
        );

        await this.produtoService.atualizarProduto(produto._id, {
          estoque: produto.estoque + produtoMov.quantidade_produtos,
        });
      }
    } else if (movimentacao.tipo === "entrada") {
      for (const produtoMov of movimentacao.produtos) {
        const produto = await this.produtoService.buscarProdutoPorID(
          produtoMov._id
        );

        await this.produtoService.atualizarProduto(produto._id, {
          estoque: Math.max(
            0,
            produto.estoque - produtoMov.quantidade_produtos
          ),
        });
      }
    }

    const data = await this.repository.deletarMovimentacao(id);
    return data;
  }
}

export default MovimentacaoService;
