import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

class Grupo {
    constructor() {
        const grupoSchema = new mongoose.Schema(
            {
                nome: { 
                    type: String, 
                    required: true,
                    unique: true,
                    index: true,
                    trim: true
                },
                descricao: { 
                    type: String, 
                    required: true 
                },
                ativo: { 
                    type: Boolean, 
                    default: true 
                },
                /**
                 * Permissões personalizadas para cada rota do sistema
                 * Cada permissão define o que o grupo pode fazer em uma rota específica
                 */
                permissoes: [
                    {
                        rota: { 
                            type: String, 
                            required: true,
                            index: true,
                            trim: true,
                            lowercase: true
                        }, // produtos, usuarios, fornecedores, etc
                        dominio: { 
                            type: String,
                            default: 'localhost'
                        }, // localhost, api.exemplo.com, etc
                        ativo: { 
                            type: Boolean, 
                            default: true 
                        },
                        // Permissões CRUD mapeadas para métodos HTTP
                        buscar: { 
                            type: Boolean, 
                            default: false 
                        },    // GET
                        enviar: { 
                            type: Boolean, 
                            default: false 
                        },   // POST
                        substituir: { 
                            type: Boolean, 
                            default: false 
                        },    // PUT
                        modificar: { 
                            type: Boolean, 
                            default: false 
                        },  // PATCH
                        excluir: { 
                            type: Boolean, 
                            default: false 
                        }, // DELETE
                    }
                ],
            },
            {
                timestamps: {
                    createdAt: "data_criacao",
                    updatedAt: "data_atualizacao",
                },
                versionKey: false
            }
        );

        // Validação personalizada para garantir que rota + dominio sejam únicos dentro do grupo
        grupoSchema.pre('save', function (next) {
            const permissoes = this.permissoes;
            const combinacoes = permissoes.map(p => `${p.rota}_${p.dominio}`);
            const setCombinacoes = new Set(combinacoes);

            if (combinacoes.length !== setCombinacoes.size) {
                return next(new Error('Permissões duplicadas encontradas: rota + domínio devem ser únicos dentro de cada grupo.'));
            }

            next();
        });

        // Hook para garantir que o campo 'rota' está em minúsculas antes de salvar
        grupoSchema.pre('save', function (next) {
            if (this.permissoes && this.permissoes.length > 0) {
                this.permissoes.forEach(permissao => {
                    if (permissao.rota) {
                        permissao.rota = permissao.rota.toLowerCase();
                    }
                });
            }
            next();
        });

        grupoSchema.plugin(mongoosePaginate);

        this.model = mongoose.model('grupos', grupoSchema);
    }
}

export default new Grupo().model;
