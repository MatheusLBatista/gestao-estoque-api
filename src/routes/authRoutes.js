import express from 'express';
import AuthController from '../controllers/AuthController.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';
import { asyncWrapper } from '../utils/helpers/index.js';

const router = express.Router();

// Rotas públicas
router.post('/login', asyncWrapper(AuthController.login.bind(AuthController)));

router.post('/refresh', asyncWrapper(AuthController.refresh.bind(AuthController)));

router.post('/recuperar-senha', asyncWrapper(AuthController.solicitarRecuperacaoSenha.bind(AuthController)));

router.post('/redefinir-senha/token', asyncWrapper(AuthController.redefinirSenhaComToken.bind(AuthController)));

router.post('/redefinir-senha/codigo', asyncWrapper(AuthController.redefinirSenhaComCodigo.bind(AuthController)));

// Rotas protegidas
router.post('/logout', authMiddleware, asyncWrapper(AuthController.logout.bind(AuthController)));

router.post('/revoke', authMiddleware, asyncWrapper(AuthController.revoke.bind(AuthController)));

export default router;