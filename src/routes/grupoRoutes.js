import express from 'express';
import GrupoController from '../controllers/GrupoController.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import LogMiddleware from '../middlewares/LogMiddleware.js';

const router = express.Router();
const grupoController = new GrupoController();

router
    // Listar grupos
    .get(
        "/",
        authMiddleware,
        LogMiddleware.log('CONSULTA_GRUPOS'),
        asyncWrapper(grupoController.listar.bind(grupoController))
    )
    
    // Criar grupo
    .post(
        "/",
        authMiddleware,
        LogMiddleware.log('CRIACAO_GRUPO'),
        asyncWrapper(grupoController.criar.bind(grupoController))
    )
    
    // Buscar grupo por ID
    .get(
        "/:id",
        authMiddleware,
        LogMiddleware.log('CONSULTA_GRUPO'),
        asyncWrapper(grupoController.buscarPorId.bind(grupoController))
    )
    
    // Atualizar grupo
    .patch(
        "/:id",
        authMiddleware,
        LogMiddleware.log('ATUALIZACAO_GRUPO'),
        asyncWrapper(grupoController.atualizar.bind(grupoController))
    )
    
    // Deletar grupo
    .delete(
        "/:id",
        authMiddleware,
        LogMiddleware.log('EXCLUSAO_GRUPO'),
        asyncWrapper(grupoController.deletar.bind(grupoController))
    )
    
    // Ativar grupo
    .patch(
        "/:id/ativar",
        authMiddleware,
        LogMiddleware.log('ATIVACAO_GRUPO'),
        asyncWrapper(grupoController.ativar.bind(grupoController))
    )
    
    // Desativar grupo
    .patch(
        "/:id/desativar",
        authMiddleware,
        LogMiddleware.log('DESATIVACAO_GRUPO'),
        asyncWrapper(grupoController.desativar.bind(grupoController))
    )
    
    // Adicionar permissão ao grupo
    .post(
        "/:id/permissoes",
        authMiddleware,
        LogMiddleware.log('ADICAO_PERMISSAO_GRUPO'),
        asyncWrapper(grupoController.adicionarPermissao.bind(grupoController))
    )
    
    // Remover permissão do grupo
    .delete(
        "/:id/permissoes",
        authMiddleware,
        LogMiddleware.log('REMOCAO_PERMISSAO_GRUPO'),
        asyncWrapper(grupoController.removerPermissao.bind(grupoController))
    );

export default router;
