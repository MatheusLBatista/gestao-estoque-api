import "dotenv/config";
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

class Movimentacao {
  constructor() {
    const produtoMovimentacaoSchema = new mongoose.Schema({
      codigo_produto: { type: String, required: true, ref: "produtos" },
      quantidade_produtos: { type: Number, required: true },
      preco: { type: Number }, //obrigatório para saídas
      preco_total: { type: Number },
      custo: { type: Number }, //obrigatório para entradas
      custo_total: { type: Number },
    });

    const movimentacaoSchema = new mongoose.Schema(
      {
        tipo: { type: String, required: true, enum: ["entrada", "saida"] },
        destino: { type: String, required: true },
        id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: "usuarios" },
        status: { type: Boolean, default: true },
        nota_fiscal: {
          numero: { type: String },
          serie: { type: String },
          chave: { type: String },
          data_emissao: { type: Date },
        },
        observacoes: { type: String },
        produtos: [produtoMovimentacaoSchema],
      },
      {
        timestamps: {
          createdAt: "data_cadastro",
          updatedAt: "data_ultima_atualizacao",
        },
        versionKey: false,
      }
    );

    movimentacaoSchema.pre("save", function (next) {
      this.produtos.forEach((produto) => {
        produto.custo_total = produto.custo * produto.quantidade_produtos;

        if (produto.preco) {
          produto.preco_total = produto.preco * produto.quantidade_produtos;
        }
      });

      next();
    });

    movimentacaoSchema.plugin(mongoosePaginate);
    this.model = mongoose.model("movimentacoes", movimentacaoSchema);
  }
}

export default new Movimentacao().model;
