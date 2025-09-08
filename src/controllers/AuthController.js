import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { CommonResponse, CustomError, HttpStatusCodes, errorHandler, messages, StatusService, asyncWrapper } from '../utils/helpers/index.js';
import { AuthService } from "../services/AuthService.js";
import { UsuarioUpdateSchema } from '../utils/validators/schemas/zod/UsuarioSchema.js';
import LogMiddleware from '../middlewares/LogMiddleware.js';

class AuthController {
    constructor() {
        this.service = new AuthService();
    }

    async login(req, res) {
        const { matricula, senha } = req.body;

        if (!matricula || !senha) {
            return res.status(400).json({
                message: 'Matrícula e senha são obrigatórios',
                type: 'validationError'
            });
        }

        const authData = await this.service.autenticar(matricula, senha);

        // Inicia sessão de log para o usuário
        LogMiddleware.startSession(authData.usuario.id, {
            matricula: authData.usuario.matricula,
            nome: authData.usuario.nome_usuario,
            perfil: authData.usuario.perfil
        }, req);

        return res.status(200).json({
            message: 'Login realizado com sucesso',
            ...authData
        });
    }

    async logout(req, res) {
        const userId = req.userId; // Disponibilizado pelo middleware de autenticação

        await this.service.logout(userId);

        // Finaliza sessão de log
        LogMiddleware.endSession(userId, 'manual');

        return res.status(200).json({
            message: 'Logout realizado com sucesso'
        });
    }

    async refresh(req, res) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'invalidRefresh',
                field: 'Refresh',
                details: [],
                customMessage: 'Refresh token não informado.'
            });
        }

        const decoded = await promisify(jwt.verify)(
            refreshToken, 
            process.env.JWT_SECRET_REFRESH_TOKEN
        );

        const data = await this.service.refreshToken(decoded.id, refreshToken);
        return CommonResponse.success(res, data);
    }

    async revoke(req, res) {
        //verificação defensiva do body
        if (!req.body) {
            return res.status(400).json({
                message: 'Corpo da requisição ausente',
                type: 'validationError'
            });
        }

        const { matricula } = req.body;

        if (!matricula) {
            return res.status(400).json({
                message: 'Matrícula não fornecida',
                type: 'validationError'
            });
        }

        await this.service.revoke(matricula);

        // Registra evento crítico de revogação
        LogMiddleware.logCriticalEvent(req.userId, 'TOKEN_REVOKE', {
            matricula_revogada: matricula,
            revogado_por: req.userMatricula
        }, req);

        return res.status(200).json({
            message: 'Token revogado com sucesso'
        });
    }

    async solicitarRecuperacaoSenha(req, res) {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email é obrigatório',
                type: 'validationError'
            });
        }

        const resultado = await this.service.recuperarSenha(email);

        return res.status(200).json(resultado);
    }

    async redefinirSenhaComToken(req, res) {
        const { token } = req.query;
        const { senha } = req.body;

        if (!token || !senha) {
            return res.status(400).json({
                message: 'Token e senha são obrigatórios',
                type: 'validationError'
            });
        }

        const resultado = await this.service.redefinirSenhaComToken(token, senha);

        return res.status(200).json(resultado);
    }

    async redefinirSenhaComCodigo(req, res) {
        const { codigo, senha } = req.body;

        if (!codigo || !senha) {
            return res.status(400).json({
                message: 'Código e senha são obrigatórios',
                type: 'validationError'
            });
        }

        const resultado = await this.service.redefinirSenhaComCodigo(codigo, senha);

        return res.status(200).json(resultado);
    }
}

export default new AuthController();