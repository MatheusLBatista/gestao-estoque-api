import express from 'express';
import LogController from '../controllers/LogController.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';

const router = express.Router();
const logController = new LogController();

// Todas as rotas de logs precisam de autenticação
router.use(authMiddleware);

router
    // Usuários online (apenas administradores)
    .get(
        "/online-users",
        asyncWrapper(logController.getOnlineUsers.bind(logController))
    )
    
    // Obter logs de um usuário específico
    .get(
        "/usuario/:userId",
        asyncWrapper(logController.getUserLogs.bind(logController))
    )
    
    // Buscar eventos específicos (apenas administradores)
    .get(
        "/search",
        asyncWrapper(logController.searchEvents.bind(logController))
    )
    
    // Obter estatísticas de logs (apenas administradores)
    .get(
        "/statistics",
        asyncWrapper(logController.getLogStatistics.bind(logController))
    )
    
    // Obter eventos críticos (apenas administradores)
    .get(
        "/critical",
        asyncWrapper(logController.getCriticalEvents.bind(logController))
    );

export default router;
