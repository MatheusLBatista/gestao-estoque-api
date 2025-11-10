import mongoose from "mongoose";
import FornecedorRepository from "../repositories/fornecedorRepository.js";
import { CustomError, HttpStatusCodes } from "../utils/helpers/index.js";

class FornecedorService {
  constructor() {
    this.repository = new FornecedorRepository();
  }

  async criar(dados) {
    const cnpjExistente = await this.repository.model.findOne({
      cnpj: dados.cnpj,
    });
    if (cnpjExistente) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "cnpj",
        details: [],
        customMessage: "CNPJ já está cadastrado no sistema.",
      });
    }

    const emailExistente = await this.repository.model.findOne({
      email: dados.email,
    });
    if (emailExistente) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "email",
        details: [],
        customMessage: "Email já está cadastrado no sistema.",
      });
    }

    const data = await this.repository.criar(dados);
    return data;
  }

  async listar(req) {
    const data = await this.repository.listar(req);
    return data;
  }

  async buscarPorId(id) {
    const data = await this.repository.buscarPorId(id);
    return data;
  }

  async atualizar(id, dados) {
    if (dados.cnpj) {
      const cnpjExistente = await this.repository.model.findOne({
        cnpj: dados.cnpj,
        _id: { $ne: id },
      });
      if (cnpjExistente) {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: "validationError",
          field: "cnpj",
          details: [],
          customMessage: "CNPJ já está cadastrado no sistema.",
        });
      }
    }

    if (dados.email) {
      const emailExistente = await this.repository.model.findOne({
        email: dados.email,
        _id: { $ne: id },
      });
      if (emailExistente) {
        throw new CustomError({
          statusCode: HttpStatusCodes.BAD_REQUEST.code,
          errorType: "validationError",
          field: "email",
          details: [],
          customMessage: "Email já está cadastrado no sistema.",
        });
      }
    }

    const data = await this.repository.atualizar(id, dados);
    return data;
  }

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
    const data = await this.repository.deletar(id);
    return data;
  }

  async desativarFornecedor(id) {
    console.log("Estou no desativarFornecedor em fornecedorService");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "id",
        details: [],
        customMessage: "ID do forecedor inválido.",
      });
    }

    const data = await this.repository.desativarFornecedor(id);
    return data;
  }

  async reativarFornecedor(id) {
    console.log("Estou no reativarFornecedor em fornecedorService");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError({
        statusCode: HttpStatusCodes.BAD_REQUEST.code,
        errorType: "validationError",
        field: "id",
        details: [],
        customMessage: "ID do forecedor inválido.",
      });
    }

    const data = await this.repository.reativarFornecedor(id);
    return data;
  }
}

export default FornecedorService;
