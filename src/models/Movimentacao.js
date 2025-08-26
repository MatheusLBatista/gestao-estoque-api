import 'dotenv/config'
import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2';

class Movimentacao {
    constructor() {
        const produtoMovimentacaoSchema = new mongoose.Schema({
            produto_ref: { type: mongoose.Schema.Types.ObjectId, ref: 'produtos' },
            id_produto: { type: Number, required: true },
            codigo_produto: { type: String, required: true },
            nome_produto: { type: String, required: true },
            quantidade_produtos: { type: Number, required: true },
            preco: { type: Number, required: true },
            custo: { type: Number, required: true },
            id_fornecedor: { type: Number },
            nome_fornecedor: { type: String }
        });

        const movimentacaoSchema = new mongoose.Schema(
            {
                tipo: { type: String, required: true, enum: ['entrada', 'saida'] },
                destino: { type: String, required: true },
                data_movimentacao: { type: Date, default: Date.now },
                id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarios' },
                nome_usuario: { type: String, required: true },
                status: {type: Boolean, default: true},
                produtos: [produtoMovimentacaoSchema]
            },
            {
                timestamps: { createdAt: 'data_cadastro', updatedAt: 'data_ultima_atualizacao' },
                versionKey: false,
            }
        );

        movimentacaoSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('movimentacoes', movimentacaoSchema);
    }
}

export default new Movimentacao().model;