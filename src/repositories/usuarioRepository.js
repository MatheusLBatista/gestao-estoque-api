import mongoose from 'mongoose';
import Usuario from '../models/Usuario.js';
import { CustomError, messages } from '../utils/helpers/index.js';
import { CssFunction } from '@faker-js/faker';

class UsuarioRepository {
    constructor({ model = Usuario } = {}) {
        this.model = model;
    }

    async listarUsuarios(req) {
        console.log('Estou no listarUsuarios em UsuarioRepository');
        console.log('Query recebida:', req.query);

        const id = req.params ? req.params.id : null;

        if (id) {
            const data = await this.model.findById(id);

            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Usuario',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Usuario')
                });
            }

            return data;
        }

        // Para busca por filtros
        // Mapeia o nome da query para nome_usuario no banco
        const { nome_usuario, matricula, senha, cargo, data_cadastro, data_ultima_atualizacao, page = 1 } = req.query || {};
        const limite = Math.min(parseInt(req.query?.limite, 10) || 10, 100);

        const filtros = {};

        if (nome_usuario) {
            filtros.nome_usuario = { $regex: nome_usuario, $options: 'i' };
            console.log(`Aplicando filtro por nome: "${nome_usuario}"`);
        }

        if (matricula) {
            filtros.matricula = { $regex: matricula, $options: 'i' };
            console.log(`Aplicando filtro por matricula: "${matricula}"`);
        }

        if (cargo) {
            filtros.cargo = { $regex: cargo, $options: 'i' };
            console.log(`Aplicando filtro por cargo: "${cargo}"`);
        }

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limite, 10),
            sort: { nome_usuario: 1 },
        };

        console.log('Filtros aplicados:', filtros);
        const resultado = await this.model.paginate(filtros, options);
        console.log(`Encontrados ${resultado.docs?.length || 0} usuários`);
        return resultado;
    }

    async buscarPorId(id, includeTokens = false) {
        let query = this.model.findById(id)

        if (includeTokens) {
            query = query.select('+refreshtoken +accesstoken');
        }

        const user = await query;
        
        if (!user) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }

        return user;
    }

    async buscarPorMatricula(matricula, incluirSenha = false) {
        let query = this.model.findOne({ matricula });

        if (incluirSenha) {
            query = query.select('+senha');
        }

        const user = await query;

        if (!user) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }

        return user;
    }

    async cadastrarUsuario(dadosUsuario) {
        console.log('Estou no cadastrarUsuario em UsuarioRepository');

        // Verificar se já existe um usuário com a mesma matrícula
        if (dadosUsuario.matricula) {
            const usuarioExistente = await this.model.findOne({ matricula: dadosUsuario.matricula }); 
            if (usuarioExistente) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'matricula',
                    details: [],
                    customMessage: 'Já existe um usuário com esta matrícula.'
                });
            }
        }
        const novoUsuario = await this.model.create(dadosUsuario);
        return novoUsuario
    }

    async atualizarUsuario(matricula, dadosAtualizacao) {
        console.log('Repositório - atualizando usuário por matrícula:', matricula);
        console.log('Dados de atualização:', JSON.stringify(dadosAtualizacao, null, 2));

        // Verificar se a matrícula foi fornecida
        if (!matricula || typeof matricula !== 'string') {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'matricula',
                details: [],
                customMessage: 'Matrícula do usuário é obrigatória e deve ser uma string válida'
            });
        }

        // Buscar o usuário pela matrícula primeiro para validar que existe
        const usuarioExistente = await this.model.findOne({ matricula });
        if (!usuarioExistente) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'matricula',
                details: [],
                customMessage: 'Usuário não encontrado com a matrícula informada'
            });
        }

        // Verificar se a matrícula está sendo atualizada e se já existe
        if (dadosAtualizacao.matricula && dadosAtualizacao.matricula !== matricula) {
            const outroUsuario = await this.model.findOne({
                matricula: dadosAtualizacao.matricula,
                _id: { $ne: usuarioExistente._id }
            });

            if (outroUsuario) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'matricula',
                    details: [],
                    customMessage: 'Esta matrícula já está sendo usada por outro usuário.'
                });
            }
        }

        // Atualizar o usuário usando a matrícula como filtro
        const usuario = await this.model.findOneAndUpdate(
            { matricula },
            dadosAtualizacao,
            { new: true, runValidators: true }
        );

        console.log('Resultado da atualização:', usuario ? 'Sucesso' : 'Falha');

        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuario',
                details: [],
                customMessage: 'Usuário não encontrado'
            });
        }

        return usuario;
    }

    async deletarUsuario(matricula) {
        console.log('Estou no deletarUsuario em UsuarioRepository');

        if (!matricula || typeof matricula !== 'string' || matricula.trim() === '') {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'matricula',
                details: [],
                customMessage: 'Matrícula do usuário inválida'
            });
        }

        const usuario = await this.model.findOneAndDelete({ matricula });
        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'matricula',
                details: [],
                customMessage: 'Usuário não encontrado'
            });
        }

        return usuario;
    }
    
    async desativarUsuario(matricula) { 
        const usuario = await this.model.findOneAndUpdate(
            { matricula },
            { ativo: false },
            { new: true }
        );

        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'matricula',
                details: [],
                customMessage: 'Usuário não encontrado com a matrícula informada'
            });
        }

        return usuario;
    }

    async reativarUsuario(matricula) { 
        const usuario = await this.model.findOneAndUpdate(
            { matricula },
            { ativo: true },
            { new: true }
        );

        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'matricula',
                details: [],
                customMessage: 'Usuário não encontrado com a matrícula informada'
            });
        }

        return usuario;
    }
    /**
     * Armazenar accesstoken e refreshtoken no banco de dados
     */
    async armazenarTokens(id, accesstoken, refreshtoken) {
        const document = await this.model.findById(id);
        if(!document) {
            throw new CustomError({
                statusCode: 401,
                errorType: "resourceNotFound",
                field: "Usuário",
                details: [],
                customMessage: messages.error.resourceNotFound("Usuário")
            })
        }
        document.accesstoken = accesstoken;
        document.refreshtoken = refreshtoken;
        const data = await document.save();
        return data;
    }

    /**
     * Atualizar usuário removendo accesstoken e refreshtoken
     */
    async removeToken(id) {
        return await this.model.findByIdAndUpdate(
            id,
            { accesstoken: null, refreshtoken: null },
            { new: true }
        );
    }

    async atualizarTokenRecuperacao(id, token, codigo) {
        return await this.model.findByIdAndUpdate(
            id,
            {
                token_recuperacao: token,
                codigo_recuperacao: codigo,
                token_recuperacao_expira: Date.now() + 3600000
            },
            { new: true }
        );
    }

    async atualizarSenha(id, senha) {
        return await this.model.findByIdAndUpdate(
            id,
            {
                senha,
                token_recuperacao: null,
                codigo_recuperacao: null,
                token_recuperacao_expira: null
            },
            { new: true }
        );
    }

    async atualizarSenhaCompleta(id, dadosAtualizacao) {
        return await this.model.findByIdAndUpdate(
            id,
            dadosAtualizacao,
            { new: true }
        );
    }

    async criarUsuario(dadosUsuario) {
        const novoUsuario = new this.model(dadosUsuario);
        return await novoUsuario.save();
    }

    async removeToken(id) {
        //criar objeto com os campos a serem atualizados
        const parsedData = {
            accesstoken: null,
            refreshtoken: null
        };

        const usuario = await this.model.findByIdAndUpdate(id, parsedData, { new: true }).exec();

        //validar se o usuário atualizado foi retornado
        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            })
        }
        return usuario;
    }

    async buscarPorEmail(email, incluirSenha = false) {
        let query = this.model.findOne({ email });

        if (incluirSenha) {
            query = query.select('+senha');
        }

        const user = await query;

        if (!user) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }

        return user;
    }

    async buscarPorNome(nome, includeTokens = false) {
        let query = this.model.find({ nome });

        if (includeTokens) {
            query = query.select('+refreshtoken +accesstoken');
        }

        const user = await query;
        
        if (!user) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }

        return user;
    }

    async buscarPorCodigoRecuperacao(codigo) {
        let query = this.model.findOne({ codigo_recuperacao: codigo })
            .select('+senha +token_recuperacao +codigo_recuperacao +token_recuperacao_expira');

        const user = await query;

        if (!user) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Usuário')
            });
        }

        return user;
    }

    async atualizarTokenRecuperacao(id, token, codigo) {
        return await this.model.findByIdAndUpdate(
            id,
            {
                token_recuperacao: token,
                codigo_recuperacao: codigo,
                token_recuperacao_expira: new Date(Date.now() + 3600000) // 1 hora
            },
            { new: true }
        );
    }

    async setUserOnlineStatus(id, isOnline) {
        return await this.model.findByIdAndUpdate(
            id,
            { online: isOnline },
            { new: true }
        );
    }

    async getOnlineUsers() {
        return await this.model.find({ online: true, ativo: true })
            .select('nome_usuario email matricula perfil data_cadastro');
    }
}

export default UsuarioRepository;