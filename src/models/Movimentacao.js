import "dotenv/config";
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

class Movimentacao {
  constructor() {
    const produtoMovimentacaoSchema = new mongoose.Schema({
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "produtos" },
      codigo_produto: { type: String, required: true },
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

    movimentacaoSchema.virtual("totalProdutos").get(function () {
      return this.produtos.reduce(
        (total, p) => total + (p.quantidade_produtos || 0),
        0
      );
    });

    movimentacaoSchema.virtual("totalCusto").get(function () {
      if (this.tipo !== "entrada") return undefined;
      return this.produtos.reduce(
        (total, p) =>
          total + (p.custo_total || p.custo * p.quantidade_produtos || 0),
        0
      );
    });

    movimentacaoSchema.virtual("totalPreco").get(function () {
      if (this.tipo !== "saida") return undefined;
      return this.produtos.reduce(
        (total, p) =>
          total + (p.preco_total || p.preco * p.quantidade_produtos || 0),
        0
      );
    });

    movimentacaoSchema.set("toJSON", { virtuals: true });
    movimentacaoSchema.set("toObject", { virtuals: true });

    movimentacaoSchema.plugin(mongoosePaginate);
    this.model = mongoose.model("movimentacoes", movimentacaoSchema);
  }
}

export default new Movimentacao().model;
