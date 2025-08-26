import { Router } from 'express';
import MovimentacoesController from '../controllers/MovimentacoesController.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import LogMiddleware from '../middlewares/LogMiddleware.js';

const router = Router();
const movimentacoesController = new MovimentacoesController();

router
    // Rotas sem parâmetros de rota primeiro
    .get(
        '/',
        LogMiddleware.log('CONSULTA_MOVIMENTACOES'),
        asyncWrapper(movimentacoesController.listarMovimentacoes.bind(movimentacoesController))
    )
    
    .post(
        '/',
        LogMiddleware.log('CADASTRO_MOVIMENTACAO'),
        asyncWrapper(movimentacoesController.cadastrarMovimentacao.bind(movimentacoesController))
    )
    
    // Rotas com query strings (busca e filtro)
    .get(
        '/busca',
        LogMiddleware.log('BUSCA_MOVIMENTACOES'),
        asyncWrapper(movimentacoesController.buscarMovimentacoes.bind(movimentacoesController))
    )
    
    .get(
        '/filtro',
        LogMiddleware.log('FILTRO_MOVIMENTACOES'),
        asyncWrapper(movimentacoesController.filtrarMovimentacoesAvancado.bind(movimentacoesController))
    )
    
    // Rotas com parâmetros de rota por último
    .get(
        '/:id',
        LogMiddleware.log('CONSULTA_MOVIMENTACAO'),
        asyncWrapper(movimentacoesController.buscarMovimentacaoPorID.bind(movimentacoesController))
    )
    
    // Rotas específicas ANTES das rotas genéricas com parâmetros
    .patch(
        '/desativar/:id',
        LogMiddleware.log('DESATIVACAO_MOVIMENTACAO'),
        asyncWrapper(movimentacoesController.desativarMovimentacao.bind(movimentacoesController))
    )
    
    .patch(
        '/reativar/:id',
        LogMiddleware.log('REATIVACAO_MOVIMENTACAO'),
        asyncWrapper(movimentacoesController.reativarMovimentacao.bind(movimentacoesController))
    )
    
    // Rota genérica por último
    .patch(
        '/:id',
        LogMiddleware.log('ATUALIZACAO_MOVIMENTACAO'),
        asyncWrapper(movimentacoesController.atualizarMovimentacao.bind(movimentacoesController))
    )
    
    .delete(
        '/:id',
        LogMiddleware.log('EXCLUSAO_MOVIMENTACAO'),
        asyncWrapper(movimentacoesController.deletarMovimentacao.bind(movimentacoesController))
    );



export default router;