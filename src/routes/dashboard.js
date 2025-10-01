import express from 'express';
import DashboardController from '../controllers/DashboardController.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';
import LogMiddleware from '../middlewares/LogMiddleware.js';

const router = express.Router();
const dashboardController = new DashboardController();

router
    // Rota para resumo das categorias
    .get(
        "/categorias",
        LogMiddleware.log('CONSULTA_RESUMO_CATEGORIAS'),
        asyncWrapper(dashboardController.obterResumoCategoriasCount.bind(dashboardController))
    )

    // Rotas específicas de produtos por categoria
    .get(
        "/categorias/categoria-a",
        LogMiddleware.log('CONSULTA_PRODUTOS_CATEGORIA_A'),
        asyncWrapper(dashboardController.obterProdutosCategoriaA.bind(dashboardController))
    )

    .get(
        "/categorias/categoria-b",
        LogMiddleware.log('CONSULTA_PRODUTOS_CATEGORIA_B'),
        asyncWrapper(dashboardController.obterProdutosCategoriaB.bind(dashboardController))
    )

    .get(
        "/categorias/categoria-c",
        LogMiddleware.log('CONSULTA_PRODUTOS_CATEGORIA_C'),
        asyncWrapper(dashboardController.obterProdutosCategoriaC.bind(dashboardController))
    );

export default router;
