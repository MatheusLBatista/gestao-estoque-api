import Grupo from '../models/Grupo.js';
import Usuario from '../models/Usuario.js';
import Rota from '../models/Rotas.js';
import { CustomError, messages } from '../utils/helpers/index.js';

class GrupoRepository {
    constructor({
        grupoModel = Grupo,
        usuarioModel = Usuario,
        rotaModel = Rota,
    } = {}) {
        this.model = grupoModel;
        this.usuarioModel = usuarioModel;
        this.rotaModel = rotaModel;
    }

    /**
     * Lista grupos com filtros e paginação
     * @param {Object} req - Objeto de requisição
     * @returns {Object} - Resultado paginado
     */
    async listar(req) {
        const { id } = req.params || {};
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limite) || 10;

        // Se foi fornecido um ID, busca apenas esse grupo
        if (id) {
            const grupo = await this.model.findById(id).lean();
            if (!grupo) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Grupo',
                    details: [],
                    customMessage: 'Grupo não encontrado'
                });
            }
            return grupo;
        }

        // Construir filtros
        const filtros = {};
        
        if (req.query.nome) {
            filtros.nome = { $regex: req.query.nome, $options: 'i' };
        }
        
        if (req.query.ativo !== undefined) {
            filtros.ativo = req.query.ativo === 'true';
        }

        const options = {
            page,
            limit,
            sort: { data_criacao: -1 },
            lean: true
        };

        return await this.model.paginate(filtros, options);
    }

    /**
     * Busca grupo por ID
     * @param {String} id - ID do grupo
     * @returns {Object} - Dados do grupo
     */
    async buscarPorId(id) {
        const grupo = await this.model.findById(id).lean();
        if (!grupo) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Grupo',
                details: [],
                customMessage: 'Grupo não encontrado'
            });
        }
        return grupo;
    }

    /**
     * Busca grupo por nome
     * @param {String} nome - Nome do grupo
     * @param {String} idIgnorado - ID a ser ignorado na busca (para updates)
     * @returns {Object|null} - Dados do grupo ou null
     */
    async buscarPorNome(nome, idIgnorado = null) {
        const filtro = { nome: { $regex: `^${nome}$`, $options: 'i' } };
        
        if (idIgnorado) {
            filtro._id = { $ne: idIgnorado };
        }

        return await this.model.findOne(filtro).lean();
    }

    /**
     * Cria um novo grupo
     * @param {Object} dadosGrupo - Dados do grupo
     * @returns {Object} - Grupo criado
     */
    async criar(dadosGrupo) {
        try {
            const grupo = new this.model(dadosGrupo);
            return await grupo.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'nome',
                    details: [],
                    customMessage: 'Já existe um grupo com este nome'
                });
            }
            console.error('Erro ao criar grupo:', error);
            throw error;
        }
    }

    /**
     * Atualiza um grupo
     * @param {String} id - ID do grupo
     * @param {Object} dadosAtualizacao - Dados para atualização
     * @returns {Object} - Grupo atualizado
     */
    async atualizar(id, dadosAtualizacao) {
        try {
            const grupo = await this.model.findByIdAndUpdate(
                id,
                dadosAtualizacao,
                { new: true, runValidators: true }
            );

            if (!grupo) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Grupo',
                    details: [],
                    customMessage: 'Grupo não encontrado'
                });
            }

            return grupo;
        } catch (error) {
            if (error.code === 11000) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'nome',
                    details: [],
                    customMessage: 'Já existe um grupo com este nome'
                });
            }
            console.error('Erro ao atualizar grupo:', error);
            throw error;
        }
    }

    /**
     * Deleta um grupo
     * @param {String} id - ID do grupo
     * @returns {Boolean} - Sucesso da operação
     */
    async deletar(id) {
        // Verificar se há usuários associados ao grupo
        const usuariosAssociados = await this.verificarUsuariosAssociados(id);
        if (usuariosAssociados) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'grupo',
                details: [],
                customMessage: 'Não é possível deletar o grupo pois há usuários associados a ele'
            });
        }

        const resultado = await this.model.findByIdAndDelete(id);
        if (!resultado) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Grupo',
                details: [],
                customMessage: 'Grupo não encontrado'
            });
        }

        return true;
    }

    /**
     * Verifica se há usuários associados ao grupo
     * @param {String} id - ID do grupo
     * @returns {Boolean} - true se houver usuários associados
     */
    async verificarUsuariosAssociados(id) {
        try {
            const usuario = await this.usuarioModel.findOne({ grupos: id }).lean();
            return !!usuario;
        } catch (error) {
            console.error('Erro ao verificar usuários associados:', error);
            return false;
        }
    }

    /**
     * Verifica se as permissões existem no cadastro de rotas
     * @param {Array} permissoes - Array de permissões
     * @returns {Array} - Rotas encontradas
     */
    async buscarPorPermissao(permissoes) {
        if (!permissoes || permissoes.length === 0) {
            return [];
        }

        const query = permissoes.map(p => ({
            rota: p.rota.toLowerCase(),
            dominio: p.dominio || 'localhost'
        }));

        const rotasEncontradas = await this.rotaModel.find({ $or: query }).lean();
        return rotasEncontradas;
    }

    /**
     * Ativa ou desativa um grupo
     * @param {String} id - ID do grupo
     * @param {Boolean} ativo - Status ativo
     * @returns {Object} - Grupo atualizado
     */
    async alterarStatus(id, ativo) {
        const grupo = await this.model.findByIdAndUpdate(
            id,
            { ativo },
            { new: true }
        );

        if (!grupo) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Grupo',
                details: [],
                customMessage: 'Grupo não encontrado'
            });
        }

        return grupo;
    }
}

export default GrupoRepository;
