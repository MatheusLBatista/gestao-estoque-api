import { validate } from "uuid";
import Fornecedor from "../models/Fornecedor.js";
import FornecedorFilterBuilder from "./filters/FornecedorFilterBuilder.js";
import CustomError from "../utils/helpers/CustomError.js";
import messages from "../utils/helpers/messages.js";
import mongoose from "mongoose";

class FornecedorRepository {
  constructor({ model = Fornecedor } = {}) {
    this.model = model;
  }

  async criar(dadosFornecedor) {
    const fornecedor = new this.model(dadosFornecedor);
    return await fornecedor.save();
  }

  // Método para listar fornecedores, podendo buscar por ID ou aplicar filtros simples
  async listar(req) {
    const { id } = req.params || null;
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: "validationError",
          field: "id",
          details: [],
          customMessage: "ID do fornecedor inválido.",
        });
      }
      const fornecedor = await this.model.findById(id);
      if (!fornecedor) {
        throw new CustomError({
          statusCode: 404,
          errorType: "resourceNotFound",
          field: "Fornecedor",
          customMessage: messages.error.resourceNotFound("Fornecedor"),
        });
      }
      return fornecedor;
    }

    const { cnpj, nome_fornecedor, page = 1 } = req.query;
    const limite = Math.min(parseInt(req.query.limite, 10) || 10, 100);

    const filterBuilder = new FornecedorFilterBuilder()
      .comCNPJ(cnpj || "")
      .comNome(nome_fornecedor || "");

    if (typeof filterBuilder.build !== "function") {
      throw new CustomError({
        statusCode: 500,
        errorType: "internalServerError",
        field: "Fornecedor",
        details: [],
        customMessage: messages.error.internalServerError("Fornecedor"),
      });
    }
    const filtros = filterBuilder.build();

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limite, 10),
      sort: { nome_fornecedor: 1 },
    };

    const resultado = await this.model.paginate(filtros, options);
    return resultado;
  }

  // Método para buscar um fornecedor por ID
  async buscarPorId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "id",
        details: [],
        customMessage: "ID do fornecedor inválido.",
      });
    }
    const fornecedor = await this.model.findById(id);
    if (!fornecedor) {
      throw new CustomError({
        statusCode: 404,
        errorType: "resourceNotFound",
        field: "Fornecedor",
        customMessage: messages.error.resourceNotFound("Fornecedor"),
      });
    }
    return fornecedor;
  }

  // Método para atualizar um fornecedor existente
  async atualizar(id, dadosAtualizados) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "id",
        details: [],
        customMessage: "ID do fornecedor inválido.",
      });
    }
    const fornecedor = await this.model.findByIdAndUpdate(
      id,
      dadosAtualizados,
      { new: true }
    );

    if (!fornecedor) {
      throw new CustomError({
        statusCode: 404,
        errorType: "resourceNotFound",
        field: "Fornecedor",
        customMessage: messages.error.resourceNotFound("Fornecedor"),
      });
    }
    return fornecedor;
  }

  // Método para deletar um fornecedor
  async deletar(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "id",
        details: [],
        customMessage: "ID do fornecedor inválido.",
      });
    }
    const fornecedor = await this.model.findByIdAndDelete(id);
    if (!fornecedor) {
      throw new CustomError({
        statusCode: 400,
        errorType: "BadRequest",
        field: "ID",
        details: [],
        customMessage: messages.error.resourceNotFound(
          "fornecedor não encontrado"
        ),
      });
    }
    return fornecedor;
  }

  async desativarFornecedor(id) {
    const fornecedor = await this.model.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );
    return fornecedor;
  }

  async reativarFornecedor(id) {
    const fornecedor = await this.model.findByIdAndUpdate(
      id,
      { status: true },
      { new: true }
    );
    return fornecedor;
  }
}
export default FornecedorRepository;
