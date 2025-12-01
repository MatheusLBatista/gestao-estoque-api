import express from 'express';
import UsuarioController from '../controllers/UsuarioController.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import LogMiddleware from '../middlewares/LogMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

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

    // Rota específica para cadastrar usuário sem senha (primeiro acesso)
    .post(
        "/cadastrar-sem-senha",
        LogMiddleware.log('CADASTRO_USUARIO_SEM_SENHA'),
        asyncWrapper(usuarioController.cadastrarUsuario.bind(usuarioController))
    )

router

    .patch(
        "/desativar/:matricula",
        LogMiddleware.log('DESATIVACAO_USUARIO'),
        asyncWrapper(usuarioController.desativarUsuario.bind(usuarioController))
    )

    
    .patch(
        "/reativar/:matricula",
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
    )

    // Upload de foto de perfil
    .post(
        "/:matricula/foto-perfil",
        authMiddleware,
        upload.single('foto'),
        LogMiddleware.log('UPLOAD_FOTO_PERFIL'),
        asyncWrapper(usuarioController.uploadFotoPerfil.bind(usuarioController))
    );

export default router;