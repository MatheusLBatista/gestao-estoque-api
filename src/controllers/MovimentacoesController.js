import MovimentacaoService from "../services/movimentacaoService.js";
import {
  MovimentacaoQuerySchema,
  MovimentacaoIdSchema,
} from "../utils/validators/schemas/zod/querys/MovimentacaoQuerySchema.js";
import {
  CommonResponse,
  CustomError,
  HttpStatusCodes,
} from "../utils/helpers/index.js";
import LogMiddleware from "../middlewares/LogMiddleware.js";
import {
  MovimentacaoSchema,
  MovimentacaoUpdateSchema,
} from "../utils/validators/schemas/zod/MovimentacaoSchema.js";

class MovimentacoesController {
  constructor() {
    this.service = new MovimentacaoService();
  }

  // Função utilitária para validação com erro customizado
  validateId(id, fieldName = "id", action = "processar") {
    if (!id) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: fieldName,
        details: [],
        customMessage: `ID da movimentação é obrigatório para ${action}.`,
      });
    }

    MovimentacaoIdSchema.parse(id);
  }

  async listarMovimentacoes(req, res) {
    console.log("Estou no listarMovimentacoes em MovimentacoesController");

    const { id } = req.params || {};
    if (id) {
      MovimentacaoIdSchema.parse(id);
    }

    const query = req.query || {};
    if (Object.keys(query).length !== 0) {
      await MovimentacaoQuerySchema.parseAsync(query);
    }

    const data = await this.service.listarMovimentacoes(req);

    // Verificar se a lista está vazia
    if (!data.docs || data.docs.length === 0) {
      return CommonResponse.error(
        res,
        404,
        "resourceNotFound",
        "Movimentacao",
        [],
        "Nenhuma movimentação encontrada com os critérios informados."
      );
    }

    return CommonResponse.success(res, data);
  }

  async buscarMovimentacaoPorID(req, res) {
    console.log("Estou no buscarMovimentacaoPorID em MovimentacoesController");

    const { id } = req.params || {};
    this.validateId(id, "id", "buscar");

    const data = await this.service.buscarMovimentacaoPorID(id);

    if (!data) {
      return CommonResponse.error(
        res,
        404,
        "resourceNotFound",
        "Movimentacao",
        [],
        "Movimentação não encontrada."
      );
    }

    return CommonResponse.success(
      res,
      data,
      200,
      "Movimentação encontrada com sucesso."
    );
  }

  async cadastrarMovimentacao(req, res) {
    console.log("Estou no cadastrarMovimentacao em MovimentacoesController");

    const parsedData = MovimentacaoSchema.parse(req.body);
    const data = await this.service.cadastrarMovimentacao(parsedData, req);

    return CommonResponse.created(
      res,
      data,
      HttpStatusCodes.CREATED.code,
      "Movimentação registrada com sucesso."
    );
  }

  async atualizarMovimentacao(req, res) {
    console.log("Estou no atualizarMovimentacao em MovimentacoesController");

    const { id } = req.params || {};
    this.validateId(id, "id", "atualizar");

    const parsedData = await MovimentacaoUpdateSchema.parseAsync(req.body);
    const data = await this.service.atualizarMovimentacao(id, parsedData);

    if (!data) {
      return CommonResponse.error(
        res,
        404,
        "resourceNotFound",
        "Movimentacao",
        [],
        "Movimentação não encontrada para atualização."
      );
    }

    LogMiddleware.logCriticalEvent(
      req.userId,
      "ESTOQUE_MOVIMENTO",
      {
        produtos: parsedData.produtos,
        tipo: parsedData.tipo,
        destino: parsedData.destino,
        movimentacao_id: data._id,
      },
      req
    );

    return CommonResponse.success(
      res,
      data,
      HttpStatusCodes.OK.code,
      "Movimentação atualizada com sucesso."
    );
  }

  async deletarMovimentacao(req, res) {
    console.log("Estou no deletarMovimentacao em MovimentacoesController");

    const { id } = req.params || {};
    this.validateId(id, "id", "deletar");

    const data = await this.service.deletarMovimentacao(id);

    if (!data) {
      return CommonResponse.error(
        res,
        404,
        "resourceNotFound",
        "Movimentacao",
        [],
        "Movimentação não encontrada para exclusão."
      );
    }

    return CommonResponse.success(
      res,
      data,
      200,
      "Movimentação excluída com sucesso."
    );
  }

  async desativarMovimentacao(req, res) {
    console.log("Estou no desativarMovimentacao em MovimentacoesController");

    const { id } = req.params || {};
    this.validateId(id, "id", "desativar");

    const data = await this.service.desativarMovimentacao(id);

    if (!data) {
      return CommonResponse.error(
        res,
        404,
        "resourceNotFound",
        "Movimentacao",
        [],
        "Movimentação não encontrada para desativação."
      );
    }

    return CommonResponse.success(
      res,
      data,
      200,
      "Movimentação desativada com sucesso."
    );
  }

  async reativarMovimentacao(req, res) {
    console.log("Estou no reativarMovimentacao em MovimentacoesController");

    const { id } = req.params || {};
    this.validateId(id, "id", "reativar");

    const data = await this.service.reativarMovimentacao(id);

    if (!data) {
      return CommonResponse.error(
        res,
        404,
        "resourceNotFound",
        "Movimentacao",
        [],
        "Movimentação não encontrada para reativação."
      );
    }

    return CommonResponse.success(
      res,
      data,
      200,
      "Movimentação reativada com sucesso."
    );
  }
}

export default MovimentacoesController;
