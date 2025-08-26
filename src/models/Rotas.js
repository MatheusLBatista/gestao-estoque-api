// models/Rota.js
import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

class Rota {
    constructor() {
        const rotaSchema = new mongoose.Schema(
            {
                rota: { type: String, index: true,  trim: true, lowercase: true },
                dominio: { type: String, required: true },
                ativo: { type: Boolean, default: false },  // false
                buscar: { type: Boolean, default: false },    // false
                enviar: { type: Boolean, default: false },   // false
                substituir: { type: Boolean, default: false },    // false
                modificar: { type: Boolean, default: false },  // false
                excluir: { type: Boolean, default: false }, // falseæ
            },
            { timestamps: true }
        );

        // Adiciona a restrição de unicidade para o campo 'rota' + 'dominio'
        rotaSchema.index({ rota: 1, dominio: 1 }, { unique: true });

        // Plugin de paginação
        rotaSchema.plugin(mongoosePaginate);

        // Hook para garantir que o campo 'rota' está em minúsculas antes de salvar
        rotaSchema.pre('save', function (next) {
            if (this.rota) {
                this.rota = this.rota.toLowerCase();
            }
            next();
        });

        this.model = mongoose.model('rotas', rotaSchema);
    }
}

export default new Rota().model;
