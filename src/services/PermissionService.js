// services/PermissionService.js

import Rota from '../models/Rotas.js';
import Grupo from '../models/Grupo.js';
import UsuarioRepository from '../repositories/usuarioRepository.js';
import Usuario from '../models/Usuario.js';
import { CustomError, messages } from '../utils/helpers/index.js';

class PermissionService {
    constructor() {
        this.repository = new UsuarioRepository();
        this.Usuario = Usuario;
        this.Grupo = Grupo;
        this.Rota = Rota;
    }

    /**
     * Verifica se um usuário tem permissão para realizar uma ação específica
     * @param {String} userId - ID do usuário
     * @param {String} rota - Nome da rota (ex: 'produtos', 'usuarios')
     * @param {String} dominio - Domínio da aplicação (ex: 'localhost')
     * @param {String} metodo - Método HTTP mapeado (ex: 'buscar', 'enviar', 'modificar', 'excluir')
     * @returns {Boolean} - true se tem permissão, false caso contrário
     */
    async hasPermission(userId, rota, dominio, metodo) {
        try {
            // Busca o usuário com os grupos populados
            const usuario = await this.Usuario.findById(userId)
                .populate('grupos')
                .lean();

            if (!usuario) {
                console.error(`Usuário ${userId} não encontrado`);
                return false;
            }

            // Coleta todas as permissões do usuário (individuais + grupos)
            let todasPermissoes = [];

            // 1. Adiciona permissões individuais do usuário (têm prioridade)
            if (usuario.permissoes && usuario.permissoes.length > 0) {
                todasPermissoes = todasPermissoes.concat(usuario.permissoes);
            }

            // 2. Adiciona permissões dos grupos do usuário
            if (usuario.grupos && usuario.grupos.length > 0) {
                for (const grupo of usuario.grupos) {
                    if (grupo.ativo && grupo.permissoes && grupo.permissoes.length > 0) {
                        todasPermissoes = todasPermissoes.concat(grupo.permissoes);
                    }
                }
            }

            // 3. Remove duplicatas (permissões individuais têm precedência sobre as do grupo)
            const permissoesUnicas = this.removerPermissoesDuplicadas(todasPermissoes);

            // 4. Verifica se tem a permissão específica
            const hasPermissao = permissoesUnicas.some(permissao => {
                return (
                    permissao.rota === rota.toLowerCase() &&
                    permissao.dominio === dominio &&
                    permissao.ativo &&
                    permissao[metodo] === true
                );
            });

            return hasPermissao;
        } catch (error) {
            console.error("Erro ao verificar permissões:", error);
            return false;
        }
    }

    /**
     * Remove permissões duplicadas, dando prioridade para as primeiras encontradas
     * (permissões individuais vêm primeiro, então têm precedência)
     * @param {Array} permissoes - Array de permissões
     * @returns {Array} - Array de permissões únicas
     */
    removerPermissoesDuplicadas(permissoes) {
        const permissoesUnicas = [];
        const combinacoes = new Set();

        permissoes.forEach(permissao => {
            const chave = `${permissao.rota}_${permissao.dominio}`;
            if (!combinacoes.has(chave)) {
                combinacoes.add(chave);
                permissoesUnicas.push(permissao);
            }
        });

        return permissoesUnicas;
    }

    /**
     * Obtém todas as permissões de um usuário (individuais + grupos)
     * @param {String} userId - ID do usuário
     * @returns {Object} - Objeto com permissões organizadas
     */
    async getUserPermissions(userId) {
        const usuario = await this.Usuario.findById(userId)
            .populate('grupos')
            .lean();

        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: 'Usuário não encontrado'
            });
        }

        const permissoesIndividuais = usuario.permissoes || [];
        let permissoesGrupos = [];

        if (usuario.grupos && usuario.grupos.length > 0) {
            for (const grupo of usuario.grupos) {
                if (grupo.ativo && grupo.permissoes) {
                    permissoesGrupos = permissoesGrupos.concat(
                        grupo.permissoes.map(p => ({
                            ...p,
                            grupo: grupo.nome
                        }))
                    );
                }
            }
        }

        const todasPermissoes = [...permissoesIndividuais, ...permissoesGrupos];
        const permissoesUnicas = this.removerPermissoesDuplicadas(todasPermissoes);

        return {
            usuario: {
                id: usuario._id,
                nome: usuario.nome_usuario,
                email: usuario.email,
                perfil: usuario.perfil
            },
            grupos: usuario.grupos?.map(g => ({ id: g._id, nome: g.nome, ativo: g.ativo })) || [],
            permissoes: {
                individuais: permissoesIndividuais,
                grupos: permissoesGrupos,
                efetivas: permissoesUnicas
            }
        };
    }

    /**
     * Verifica se uma rota existe e está ativa no sistema
     * @param {String} rota - Nome da rota
     * @param {String} dominio - Domínio da aplicação
     * @returns {Object|null} - Dados da rota ou null se não encontrar
     */
    async verificarRotaExiste(rota, dominio) {
        try {
            const rotaDB = await this.Rota.findOne({ 
                rota: rota.toLowerCase(), 
                dominio: dominio 
            }).lean();

            return rotaDB;
        } catch (error) {
            console.error("Erro ao verificar rota:", error);
            return null;
        }
    }
}

export default PermissionService;
