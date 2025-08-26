import GrupoService from '../services/grupoService.js';
import { CommonResponse, CustomError, HttpStatusCodes } from '../utils/helpers/index.js';
import { GrupoSchema, GrupoUpdateSchema, GrupoPermissaoSchema } from '../utils/validators/schemas/zod/GrupoSchema.js';
import { GrupoIdSchema, GrupoQuerySchema } from '../utils/validators/schemas/zod/querys/GrupoQuerySchema.js';
import LogMiddleware from '../middlewares/LogMiddleware.js';

class GrupoController {
    constructor() {
        this.service = new GrupoService();
    }

    /**
     * Lista grupos com filtros e paginação
     */
    async listar(req, res) {
        console.log('Estou no listar em GrupoController');

        // Validação dos parâmetros de query
        const query = req.query || {};
        if (Object.keys(query).length !== 0) {
            GrupoQuerySchema.parse(query);
        }

        // Validação do ID se fornecido
        const { id } = req.params || {};
        if (id) {
            GrupoIdSchema.parse(id);
        }

        const data = await this.service.listar(req);

        // Se não encontrou nenhum grupo
        if (data.docs && data.docs.length === 0) {
            return CommonResponse.error(
                res,
                HttpStatusCodes.NOT_FOUND.code,
                'resourceNotFound',
                'Grupo',
                [],
                'Nenhum grupo encontrado com os critérios informados.'
            );
        }

        return CommonResponse.success(res, data, 200, 'Grupos listados com sucesso.');
    }

    /**
     * Busca grupo por ID
     */
    async buscarPorId(req, res) {
        console.log('Estou no buscarPorId em GrupoController');

        const { id } = req.params;

        // Validação do ID
        GrupoIdSchema.parse(id);

        const data = await this.service.buscarPorId(id);
        return CommonResponse.success(res, data, 200, 'Grupo encontrado com sucesso.');
    }

    /**
     * Cria um novo grupo
     */
    async criar(req, res) {
        console.log('Estou no criar em GrupoController');

        // Validação dos dados de entrada
        const dadosValidados = GrupoSchema.parse(req.body);

        const data = await this.service.criar(dadosValidados);

        // Registra evento crítico de criação de grupo
        LogMiddleware.logCriticalEvent(req.userId, 'GRUPO_CRIADO', {
            grupo_criado: data._id,
            nome: data.nome,
            criado_por: req.userMatricula
        }, req);

        return CommonResponse.created(
            res,
            data,
            HttpStatusCodes.CREATED.code,
            'Grupo criado com sucesso.'
        );
    }

    /**
     * Atualiza um grupo
     */
    async atualizar(req, res) {
        console.log('Estou no atualizar em GrupoController');

        const { id } = req.params;

        // Validação do ID
        GrupoIdSchema.parse(id);

        // Validação dos dados de entrada
        const dadosValidados = GrupoUpdateSchema.parse(req.body);

        const data = await this.service.atualizar(id, dadosValidados);

        // Registra evento crítico de atualização de grupo
        LogMiddleware.logCriticalEvent(req.userId, 'GRUPO_ATUALIZADO', {
            grupo_atualizado: id,
            nome: data.nome,
            alterado_por: req.userMatricula,
            dados_alterados: Object.keys(req.body)
        }, req);

        return CommonResponse.success(res, data, 200, 'Grupo atualizado com sucesso.');
    }

    /**
     * Deleta um grupo
     */
    async deletar(req, res) {
        console.log('Estou no deletar em GrupoController');

        const { id } = req.params;

        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do grupo é obrigatório.'
            });
        }

        // Buscar o grupo antes de deletar para logs
        const grupo = await this.service.buscarPorId(id);

        await this.service.deletar(id);

        // Registra evento crítico de exclusão de grupo
        LogMiddleware.logCriticalEvent(req.userId, 'GRUPO_DELETADO', {
            grupo_deletado: id,
            nome: grupo.nome,
            deletado_por: req.userMatricula
        }, req);

        return CommonResponse.success(res, null, 200, 'Grupo deletado com sucesso.');
    }

    /**
     * Ativa um grupo
     */
    async ativar(req, res) {
        console.log('Estou no ativar em GrupoController');

        const { id } = req.params;

        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do grupo é obrigatório.'
            });
        }

        const data = await this.service.alterarStatus(id, true);

        // Registra evento de ativação de grupo
        LogMiddleware.logCriticalEvent(req.userId, 'GRUPO_ATIVADO', {
            grupo_ativado: id,
            nome: data.nome,
            ativado_por: req.userMatricula
        }, req);

        return CommonResponse.success(res, data, 200, 'Grupo ativado com sucesso.');
    }

    /**
     * Desativa um grupo
     */
    async desativar(req, res) {
        console.log('Estou no desativar em GrupoController');

        const { id } = req.params;

        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do grupo é obrigatório.'
            });
        }

        const data = await this.service.alterarStatus(id, false);

        // Registra evento de desativação de grupo
        LogMiddleware.logCriticalEvent(req.userId, 'GRUPO_DESATIVADO', {
            grupo_desativado: id,
            nome: data.nome,
            desativado_por: req.userMatricula
        }, req);

        return CommonResponse.success(res, data, 200, 'Grupo desativado com sucesso.');
    }

    /**
     * Adiciona uma permissão a um grupo
     */
    async adicionarPermissao(req, res) {
        console.log('Estou no adicionarPermissao em GrupoController');

        const { id } = req.params;
        const permissao = req.body;

        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do grupo é obrigatório.'
            });
        }

        const data = await this.service.adicionarPermissao(id, permissao);

        // Registra evento de adição de permissão
        LogMiddleware.logCriticalEvent(req.userId, 'PERMISSAO_ADICIONADA', {
            grupo_id: id,
            grupo_nome: data.nome,
            permissao_adicionada: {
                rota: permissao.rota,
                dominio: permissao.dominio
            },
            adicionado_por: req.userMatricula
        }, req);

        return CommonResponse.success(res, data, 200, 'Permissão adicionada com sucesso.');
    }

    /**
     * Remove uma permissão de um grupo
     */
    async removerPermissao(req, res) {
        console.log('Estou no removerPermissao em GrupoController');

        const { id } = req.params;
        const { rota, dominio } = req.body;

        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do grupo é obrigatório.'
            });
        }

        if (!rota) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'rota',
                details: [],
                customMessage: 'Nome da rota é obrigatório.'
            });
        }

        const data = await this.service.removerPermissao(id, rota, dominio);

        // Registra evento de remoção de permissão
        LogMiddleware.logCriticalEvent(req.userId, 'PERMISSAO_REMOVIDA', {
            grupo_id: id,
            grupo_nome: data.nome,
            permissao_removida: {
                rota: rota,
                dominio: dominio || 'localhost'
            },
            removido_por: req.userMatricula
        }, req);

        return CommonResponse.success(res, data, 200, 'Permissão removida com sucesso.');
    }
}

export default GrupoController;
