import GrupoRepository from '../repositories/grupoRepository.js';
import { CustomError, HttpStatusCodes } from '../utils/helpers/index.js';

class GrupoService {
    constructor() {
        this.repository = new GrupoRepository();
    }

    /**
     * Lista grupos com filtros e paginação
     * @param {Object} req - Objeto de requisição
     * @returns {Object} - Resultado paginado ou grupo único
     */
    async listar(req) {
        return await this.repository.listar(req);
    }

    /**
     * Busca grupo por ID
     * @param {String} id - ID do grupo
     * @returns {Object} - Dados do grupo
     */
    async buscarPorId(id) {
        return await this.repository.buscarPorId(id);
    }

    /**
     * Cria um novo grupo
     * @param {Object} dadosGrupo - Dados do grupo
     * @returns {Object} - Grupo criado
     */
    async criar(dadosGrupo) {
        try {
            // Validar se o nome é único
            await this.validarNomeUnico(dadosGrupo.nome);

            // Validar permissões se fornecidas
            if (dadosGrupo.permissoes && dadosGrupo.permissoes.length > 0) {
                await this.validarPermissoes(dadosGrupo.permissoes);
            }

            return await this.repository.criar(dadosGrupo);
        } catch (error) {
            console.error('Erro no service ao criar grupo:', error);
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
        // Verificar se o grupo existe
        await this.repository.buscarPorId(id);

        // Validar nome único se está sendo alterado
        if (dadosAtualizacao.nome) {
            await this.validarNomeUnico(dadosAtualizacao.nome, id);
        }

        // Validar permissões se fornecidas
        if (dadosAtualizacao.permissoes && dadosAtualizacao.permissoes.length > 0) {
            await this.validarPermissoes(dadosAtualizacao.permissoes);
        }

        return await this.repository.atualizar(id, dadosAtualizacao);
    }

    /**
     * Deleta um grupo
     * @param {String} id - ID do grupo
     * @returns {Boolean} - Sucesso da operação
     */
    async deletar(id) {
        // Verificar se o grupo existe
        await this.repository.buscarPorId(id);

        return await this.repository.deletar(id);
    }

    /**
     * Ativa ou desativa um grupo
     * @param {String} id - ID do grupo
     * @param {Boolean} ativo - Status ativo
     * @returns {Object} - Grupo atualizado
     */
    async alterarStatus(id, ativo) {
        return await this.repository.alterarStatus(id, ativo);
    }

    // MÉTODOS AUXILIARES

    /**
     * Valida se o nome do grupo é único
     * @param {String} nome - Nome do grupo
     * @param {String} idIgnorado - ID a ser ignorado na validação
     */
    async validarNomeUnico(nome, idIgnorado = null) {
        try {
            const grupoExistente = await this.repository.buscarPorNome(nome, idIgnorado);
            
            if (grupoExistente) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'nome',
                    details: [],
                    customMessage: 'Já existe um grupo com este nome'
                });
            }
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            console.error('Erro ao validar nome único:', error);
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                errorType: 'serverError',
                field: 'nome',
                details: [],
                customMessage: 'Erro interno ao validar nome do grupo'
            });
        }
    }

    /**
     * Valida se as permissões são válidas (existem no cadastro de rotas)
     * @param {Array} permissoes - Array de permissões
     */
    async validarPermissoes(permissoes) {
        try {
            if (!permissoes || permissoes.length === 0) {
                return;
            }

            // Verificar se as rotas existem no sistema
            const rotasEncontradas = await this.repository.buscarPorPermissao(permissoes);
            
            if (rotasEncontradas.length !== permissoes.length) {
                // Identificar quais rotas não foram encontradas
                const rotasEncontradas_map = new Set(
                    rotasEncontradas.map(r => `${r.rota}_${r.dominio}`)
                );
                
                const rotasNaoEncontradas = permissoes.filter(p => 
                    !rotasEncontradas_map.has(`${p.rota.toLowerCase()}_${p.dominio || 'localhost'}`)
                );

                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'permissoes',
                    details: rotasNaoEncontradas.map(r => ({
                        rota: r.rota,
                        dominio: r.dominio,
                        message: `Rota ${r.rota} no domínio ${r.dominio || 'localhost'} não existe no sistema`
                    })),
                    customMessage: `Algumas rotas não existem no sistema: ${rotasNaoEncontradas.map(r => r.rota).join(', ')}`
                });
            }

            // Verificar duplicatas dentro do próprio array
            const combinacoes = permissoes.map(p => `${p.rota.toLowerCase()}_${p.dominio || 'localhost'}`);
            const combinacoesUnicas = [...new Set(combinacoes)];
            
            if (combinacoes.length !== combinacoesUnicas.length) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'permissoes',
                    details: [],
                    customMessage: 'Permissões duplicadas encontradas. Cada rota + domínio deve ser único'
                });
            }

        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            console.error('Erro ao validar permissões:', error);
            throw new CustomError({
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR.code,
                errorType: 'serverError',
                field: 'permissoes',
                details: [],
                customMessage: 'Erro interno ao validar permissões'
            });
        }
    }

    /**
     * Adiciona uma permissão a um grupo
     * @param {String} grupoId - ID do grupo
     * @param {Object} permissao - Dados da permissão
     * @returns {Object} - Grupo atualizado
     */
    async adicionarPermissao(grupoId, permissao) {
        try {
            const grupo = await this.repository.buscarPorId(grupoId);
            
            // Validar se a permissão é válida
            await this.validarPermissoes([permissao]);
            
            // Verificar se a permissão já existe no grupo
            const permissaoExiste = grupo.permissoes.some(p => 
                p.rota === permissao.rota.toLowerCase() && 
                p.dominio === (permissao.dominio || 'localhost')
            );
            
            if (permissaoExiste) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'permissao',
                    details: [],
                    customMessage: 'Esta permissão já existe no grupo'
                });
            }
            
            // Adicionar a permissão
            grupo.permissoes.push({
                ...permissao,
                rota: permissao.rota.toLowerCase()
            });
            
            return await this.repository.atualizar(grupoId, { permissoes: grupo.permissoes });
        } catch (error) {
            console.error('Erro no service ao adicionar permissão:', error);
            throw error;
        }
    }

    /**
     * Remove uma permissão de um grupo
     * @param {String} grupoId - ID do grupo
     * @param {String} rota - Nome da rota
     * @param {String} dominio - Domínio da aplicação
     * @returns {Object} - Grupo atualizado
     */
    async removerPermissao(grupoId, rota, dominio = 'localhost') {
        try {
            const grupo = await this.repository.buscarPorId(grupoId);
            
            // Filtrar as permissões removendo a especificada
            const permissoesAtualizadas = grupo.permissoes.filter(p => 
                !(p.rota === rota.toLowerCase() && p.dominio === dominio)
            );
            
            if (permissoesAtualizadas.length === grupo.permissoes.length) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.NOT_FOUND.code,
                    errorType: 'resourceNotFound',
                    field: 'permissao',
                    details: [],
                    customMessage: 'Permissão não encontrada no grupo'
                });
            }
            
            return await this.repository.atualizar(grupoId, { permissoes: permissoesAtualizadas });
        } catch (error) {
            console.error('Erro no service ao remover permissão:', error);
            throw error;
        }
    }
}

export default GrupoService;
