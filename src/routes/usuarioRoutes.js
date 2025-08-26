import express from 'express';
import UsuarioController from '../controllers/UsuarioController.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import LogMiddleware from '../middlewares/LogMiddleware.js';

const router = express.Router();
const usuarioController = new UsuarioController();

router
    // Rotas gerais primeiro
    .get(
        "/",
        LogMiddleware.log('CONSULTA_USUARIOS'),
        asyncWrapper(usuarioController.listarUsuarios.bind(usuarioController))
    )

    
    .post(
        "/",
        LogMiddleware.log('CADASTRO_USUARIO'),
        asyncWrapper(usuarioController.cadastrarUsuario.bind(usuarioController))
    )

router
    
    // Rotas específicas antes das rotas com parâmetros
    .get(
        "/busca/:matricula",
        LogMiddleware.log('BUSCA_USUARIO_MATRICULA'),
        asyncWrapper(usuarioController.buscarUsuarioPorMatricula.bind(usuarioController))
    )

    
    // Rotas com parâmetros por último
    .get(
        "/:id",
        LogMiddleware.log('CONSULTA_USUARIO'),
        asyncWrapper(usuarioController.buscarUsuarioPorID.bind(usuarioController))
    )

    
    //Rota para desativar/ativar usuario por id
    .patch(
        "/desativar/:id",
        LogMiddleware.log('DESATIVACAO_USUARIO'),
        asyncWrapper(usuarioController.desativarUsuario.bind(usuarioController))
    )

    
    .patch(
        "/reativar/:id",
        LogMiddleware.log('REATIVACAO_USUARIO'),
        asyncWrapper(usuarioController.reativarUsuario.bind(usuarioController))
    )

    
    .patch(
        "/:matricula",
        LogMiddleware.log('ATUALIZACAO_USUARIO'),
        asyncWrapper(usuarioController.atualizarUsuario.bind(usuarioController))
    )

    
    .delete(
        "/:matricula",
        LogMiddleware.log('EXCLUSAO_USUARIO'),
        asyncWrapper(usuarioController.deletarUsuario.bind(usuarioController))
    )

    
    // Gerenciamento de grupos de usuários
    .post(
        "/grupos/adicionar",
        authMiddleware,
        LogMiddleware.log('ADICAO_USUARIO_GRUPO'),
        asyncWrapper(usuarioController.adicionarUsuarioAoGrupo.bind(usuarioController))
    )

    
    .post(
        "/grupos/remover",
        authMiddleware,
        LogMiddleware.log('REMOCAO_USUARIO_GRUPO'),
        asyncWrapper(usuarioController.removerUsuarioDoGrupo.bind(usuarioController))
    )

    
    // Gerenciamento de permissões individuais
    .post(
        "/:id/permissoes",
        authMiddleware,
        LogMiddleware.log('ADICAO_PERMISSAO_USUARIO'),
        asyncWrapper(usuarioController.adicionarPermissaoAoUsuario.bind(usuarioController))
    )

    
    .delete(
        "/:id/permissoes",
        authMiddleware,
        LogMiddleware.log('REMOCAO_PERMISSAO_USUARIO'),
        asyncWrapper(usuarioController.removerPermissaoDoUsuario.bind(usuarioController))
    )

    
    // Consulta de permissões
    .get(
        "/:id/permissoes",
        authMiddleware,
        LogMiddleware.log('CONSULTA_PERMISSOES_USUARIO'),
        asyncWrapper(usuarioController.obterPermissoesUsuario.bind(usuarioController))
    );

export default router;