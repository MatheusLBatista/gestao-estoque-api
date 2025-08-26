import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import bcrypt from "bcrypt";

class Usuario {
  constructor() {
    const schema = new mongoose.Schema(
      {
        nome_usuario: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        matricula: { type: String, required: true, unique: true },
        senha: { type: String, required: false, select: false }, // Não obrigatório inicialmente
        perfil: {
          type: String,
          enum: ["administrador", "gerente", "estoquista"],
          default: "estoquista"
        },
        ativo: { type: Boolean, default: true },
        senha_definida: { type: Boolean, default: false }, // Nova flag para controlar se senha foi definida
        accesstoken: { type: String, select: false },
        refreshtoken: { type: String, select: false },
        token_recuperacao: { type: String, select: false },
        token_recuperacao_expira: { type: String, select: false },
        codigo_recuperacao: { type: String, select: false },
        data_expiracao_codigo: { type: Date, select: false },
        online: { type: Boolean, default: false },
        
        // Referências para Grupos de Permissão
        grupos: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'grupos'
          }
        ],
        
        /**
         * Permissões individuais do usuário (sobrescreve permissões do grupo)
         * Estas permissões têm precedência sobre as permissões do grupo
         */
        permissoes: [
          {
            rota: { 
              type: String, 
              required: true,
              index: true,
              trim: true,
              lowercase: true
            },
            dominio: { 
              type: String,
              default: 'localhost'
            },
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
        ]
      },
      {
        timestamps: {
          createdAt: "data_cadastro",
          updatedAt: "data_ultima_atualizacao",
        },
        versionKey: false,
      }
    );

    // Método para comparar senha
    schema.methods.verificarSenha = async function (senha) {
      return await bcrypt.compare(senha, this.senha);
    };

    // Hook para garantir que o campo 'rota' está em minúsculas antes de salvar
    schema.pre('save', function (next) {
      if (this.permissoes && this.permissoes.length > 0) {
        this.permissoes.forEach(permissao => {
          if (permissao.rota) {
            permissao.rota = permissao.rota.toLowerCase();
          }
        });
      }
      next();
    });

    // Validação personalizada para garantir que rota + dominio sejam únicos dentro do usuário
    schema.pre('save', function (next) {
      const permissoes = this.permissoes;
      if (permissoes && permissoes.length > 0) {
        const combinacoes = permissoes.map(p => `${p.rota}_${p.dominio}`);
        const setCombinacoes = new Set(combinacoes);

        if (combinacoes.length !== setCombinacoes.size) {
          return next(new Error('Permissões duplicadas encontradas: rota + domínio devem ser únicos dentro de cada usuário.'));
        }
      }
      next();
    });

    schema.plugin(mongoosePaginate);
    this.model = mongoose.model("usuarios", schema);
  }
}

export default new Usuario().model;