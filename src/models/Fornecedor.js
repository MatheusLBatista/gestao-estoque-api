import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

class Fornecedor {
  constructor() {
    const schema = new mongoose.Schema(
      {
        nome_fornecedor: { type: String, required: true, index: true },
        cnpj: { type: String, required: true, index: true },
        telefone: { type: String, required: true },
        email: { type: String, required: true },
        status: { type: Boolean, default: true },
        endereco: [
          {
            logradouro: { type: String, required: true },
            bairro: { type: String, required: true },
            cidade: { type: String, required: true },
            estado: { type: String, required: true },
            cep: { type: String, required: true },
          },
        ],
      },
      {
        timestamps: {
          createdAt: "data_cadastro",
          updatedAt: "data_ultima_atualizacao",
        },
        versionKey: false,
      }
    );
    schema.plugin(mongoosePaginate);
    this.model = mongoose.model("fornecedores", schema);
  }
}

export default new Fornecedor().model;
