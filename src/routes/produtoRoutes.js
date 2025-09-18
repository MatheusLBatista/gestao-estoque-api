import express from 'express';
import ProdutoController from '../controllers/ProdutoController.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import LogMiddleware from '../middlewares/LogMiddleware.js';

const router = express.Router();
const produtoController = new ProdutoController();

router
    // Rotas gerais primeiro
    .get(
        "/",
        LogMiddleware.log('CONSULTA_PRODUTOS'),
        asyncWrapper(produtoController.listarProdutos.bind(produtoController))
    )
    
    .post(
        "/",
        LogMiddleware.log('CADASTRO_PRODUTO'),
        asyncWrapper(produtoController.cadastrarProduto.bind(produtoController))
    )
    
    //TODO: substituir por busca com filtros
    // Rotas específicas antes das rotas com parâmetros
    .get(
        "/estoque-baixo",
        LogMiddleware.log('CONSULTA_ESTOQUE_BAIXO'),
        asyncWrapper(produtoController.listarEstoqueBaixo.bind(produtoController))
    )
    
    //TODO: substituir por busca com filtros
    .get(
        "/busca",
        LogMiddleware.log('BUSCA_PRODUTOS'),
        asyncWrapper(produtoController.buscarProdutos.bind(produtoController))
    )
    
    .patch(
        "/desativar/:id",
        LogMiddleware.log('DESATIVACAO_PRODUTO'),
        asyncWrapper(produtoController.desativarProduto.bind(produtoController))
    )
    
    .patch(
        "/reativar/:id",
        LogMiddleware.log('REATIVACAO_PRODUTO'),
        asyncWrapper(produtoController.reativarProduto.bind(produtoController))
    )
    
    // Rotas com parâmetros por último
    .get(
        "/:id",
        LogMiddleware.log('CONSULTA_PRODUTO'),
        asyncWrapper(produtoController.buscarProdutoPorID.bind(produtoController))
    )
    
    .patch(
        "/:id",
        LogMiddleware.log('ATUALIZACAO_PRODUTO'),
        asyncWrapper(produtoController.atualizarProduto.bind(produtoController))
    )
    
    .delete(
        "/:id",
        LogMiddleware.log('EXCLUSAO_PRODUTO'),
        asyncWrapper(produtoController.deletarProduto.bind(produtoController))
    );



export default router;