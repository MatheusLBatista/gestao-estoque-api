import LogMiddleware from '../middlewares/LogMiddleware.js';
import UsuarioRepository from '../repositories/usuarioRepository.js';

class LogController {
    constructor() {
        this.logMiddleware = LogMiddleware;
        this.usuarioRepository = new UsuarioRepository();
    }

    /**
     * Obtém logs de um usuário específico
     */
    async getUserLogs(req, res) {
        const { userId } = req.params;
        const { limit = 10 } = req.query;

        // Verificar se o usuário tem permissão para ver logs
        // Só administradores ou o próprio usuário podem ver seus logs
        if (req.userPerfil !== 'administrador' && req.userId !== userId) {
            return res.status(403).json({
                message: 'Acesso negado. Você só pode visualizar seus próprios logs',
                type: 'permissionError'
            });
        }

        const logs = this.logMiddleware.getUserLogs(userId, parseInt(limit));

        return res.status(200).json({
            message: 'Logs recuperados com sucesso',
            data: logs,
            total: logs.length
        });
    }

    /**
     * Busca eventos específicos (apenas para administradores)
     */
    async searchEvents(req, res) {
        // Apenas administradores podem fazer buscas amplas
        if (req.userPerfil !== 'administrador') {
            return res.status(403).json({
                message: 'Acesso negado. Apenas administradores podem pesquisar eventos',
                type: 'permissionError'
            });
        }

        const { eventType, startDate, endDate } = req.query;

        if (!eventType) {
            return res.status(400).json({
                message: 'Tipo de evento é obrigatório',
                type: 'validationError'
            });
        }

        const results = this.logMiddleware.searchEvents(eventType, startDate, endDate);

        return res.status(200).json({
            message: 'Busca realizada com sucesso',
            data: results,
            total: results.length
        });
    }

    /**
     * Obtém estatísticas de logs (apenas para administradores)
     */
    async getLogStatistics(req, res) {
        if (req.userPerfil !== 'administrador') {
            return res.status(403).json({
                message: 'Acesso negado. Apenas administradores podem ver estatísticas',
                type: 'permissionError'
            });
        }

        // Buscar diferentes tipos de eventos para estatísticas
        const loginEvents = this.logMiddleware.searchEvents('LOGIN');
        const logoutEvents = this.logMiddleware.searchEvents('LOGOUT');
        const estoqueEvents = this.logMiddleware.searchEvents('ESTOQUE_MOVIMENTO');
        const criticalEvents = this.logMiddleware.searchEvents('TOKEN_REVOKE');

        const statistics = {
            totalLogins: loginEvents.reduce((acc, user) => acc + user.eventos.length, 0),
            totalLogouts: logoutEvents.reduce((acc, user) => acc + user.eventos.length, 0),
            movimentacoesEstoque: estoqueEvents.reduce((acc, user) => acc + user.eventos.length, 0),
            eventosCriticos: criticalEvents.reduce((acc, user) => acc + user.eventos.length, 0),
            usuariosAtivos: new Set([
                ...loginEvents.map(user => user.usuario.id),
                ...estoqueEvents.map(user => user.usuario.id)
            ]).size
        };

        return res.status(200).json({
            message: 'Estatísticas recuperadas com sucesso',
            data: statistics
        });
    }

    /**
     * Obtém logs de eventos críticos (para administradores)
     */
    async getCriticalEvents(req, res) {
        if (req.userPerfil !== 'administrador') {
            return res.status(403).json({
                message: 'Acesso negado. Apenas administradores podem ver eventos críticos',
                type: 'permissionError'
            });
        }

        const { days = 7 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const criticalEventTypes = ['TOKEN_REVOKE', 'ESTOQUE_MOVIMENTO', 'USUARIO_ACAO'];
        const allCriticalEvents = [];

        for (const eventType of criticalEventTypes) {
            const events = this.logMiddleware.searchEvents(eventType, startDate.toISOString());
            allCriticalEvents.push(...events);
        }

        // Ordenar por data (mais recentes primeiro)
        allCriticalEvents.sort((a, b) => {
            const latestA = Math.max(...a.eventos.map(e => new Date(e.timestamp)));
            const latestB = Math.max(...b.eventos.map(e => new Date(e.timestamp)));
            return latestB - latestA;
        });

        return res.status(200).json({
            message: 'Eventos críticos recuperados com sucesso',
            data: allCriticalEvents,
            periodo: `Últimos ${days} dias`,
            total: allCriticalEvents.length
        });
    }

    /**
     * Lista usuários atualmente online
     */
    async getOnlineUsers(req, res) {
        // Apenas administradores podem ver usuários online
        if (req.userPerfil !== 'administrador') {
            return res.status(403).json({
                message: 'Acesso negado. Apenas administradores podem ver usuários online',
                type: 'permissionError'
            });
        }

        const onlineUsers = await this.usuarioRepository.getOnlineUsers();

        return res.status(200).json({
            message: 'Usuários online recuperados com sucesso',
            data: onlineUsers,
            total: onlineUsers.length,
            timestamp: new Date().toISOString()
        });
    }
}

export default LogController;
