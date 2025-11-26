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
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'authError',
                field: "Usuário",
                details: [],
                customMessage: messages.error.resourceNotFound("Matricula ou senha")
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
                customMessage: messages.error.resourceNotFound("Refresh token")
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
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'Body',
                details: [],
                customMessage: messages.error.resourceNotFound("Body")
            });
        }

        const { matricula } = req.body;

        if (!matricula) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'authError',
                field: 'Matrícula',
                details: [],
                customMessage: messages.error.resourceNotFound("Matrícula")
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
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'Email',
                details: [],
                customMessage: messages.error.resourceNotFound("Email")
            });
        }

        const resultado = await this.service.recuperarSenha(email);

        return res.status(200).json(resultado);
    }

    async redefinirSenhaComToken(req, res) {
        const { token } = req.query;
        const { senha } = req.body;

        if (!token) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'Token',
                details: [],
                customMessage: "Token é obrigatório"
            });
        }

        if (!senha) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'Senha',
                details: [],
                customMessage: "Senha é obrigatória"
            });
        }

        const resultado = await this.service.redefinirSenhaComToken(token, senha);

        // Log do evento
        if (resultado.isPrimeiroAcesso) {
            console.log('✅ Primeiro acesso concluído com sucesso');
        } else {
            console.log('🔄 Senha redefinida com sucesso');
        }

        return res.status(200).json(resultado);
    }

    async redefinirSenhaComCodigo(req, res) {
        const { codigo, senha } = req.body;

        if (!codigo) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'Código',
                details: [],
                customMessage: "Código é obrigatório"
            });
        }

        if (!senha) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'Senha',
                details: [],
                customMessage: "Senha é obrigatória"
            });
        }

        const resultado = await this.service.redefinirSenhaComCodigo(codigo, senha);

        // Log do evento
        if (resultado.isPrimeiroAcesso) {
            console.log('✅ Primeiro acesso via código concluído com sucesso');
        } else {
            console.log('🔄 Senha redefinida via código com sucesso');
        }

        return res.status(200).json(resultado);
    }
}

export default new AuthController();