import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import UsuarioRepository from '../repositories/usuarioRepository.js';
import CustomError from '../utils/helpers/CustomError.js';
import TokenUtil from '../utils/TokenUtil.js';
import EmailService from './EmailService.js';

dotenv.config();

export class AuthService {
    constructor() {
        this.usuarioRepository = new UsuarioRepository();
        this.tokenUtil = TokenUtil;
        this.ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
        this.REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "your_jwt_refresh_secret";
        this.ACCESS_TOKEN_EXPIRY = '1h';
        this.REFRESH_TOKEN_EXPIRY = '7d';
    }

    async autenticar(matricula, senha) {
        console.log('🔍 [AuthService] Iniciando autenticação para matrícula:', matricula);
        const usuario = await this.usuarioRepository.buscarPorMatricula(matricula, '+senha +senha_definida');
        console.log('🔍 [AuthService] Usuário encontrado com ID:', usuario?._id?.toString());

        if (!usuario) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Matrícula ou senha incorretos'
            });
        }

        if (!usuario.ativo) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Usuário inativo'
            });
        }

        // Verificar se a senha foi definida
        if (!usuario.senha_definida || !usuario.senha) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Usuário ainda não definiu sua senha. Use o código de segurança fornecido para definir sua senha.'
            });
        }

        // Verificar senha
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Matrícula ou senha incorretos'
            });
        }

        // Gerar tokens
        console.log('🔍 [AuthService] Gerando tokens para usuário ID:', usuario._id?.toString());
        const accessToken = this._gerarAccessToken(usuario);
        const refreshToken = this._gerarRefreshToken(usuario);
        console.log('🔍 [AuthService] Token gerado:', accessToken.substring(0, 50) + '...');

        // Armazenar tokens no usuário e marcar como online
        await this.usuarioRepository.armazenarTokens(usuario._id, accessToken, refreshToken);
        await this.usuarioRepository.setUserOnlineStatus(usuario._id, true);

        // Retornar dados sem a senha
        const usuarioSemSenha = {
            id: usuario._id,
            nome_usuario: usuario.nome_usuario,
            email: usuario.email,
            matricula: usuario.matricula,
            perfil: usuario.perfil
        };

        return {
            usuario: usuarioSemSenha,
            accessToken,
            refreshToken
        };
    }

    async logout(userId) {
        // Marcar usuário como offline
        await this.usuarioRepository.setUserOnlineStatus(userId, false);
        return await this.usuarioRepository.removeToken(userId);
    }

    async refreshToken(refreshToken) {
        try {
            // Verificar se o token é válido
            const decoded = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET);

            // Buscar usuário pelo ID
            const usuario = await this.usuarioRepository.buscarPorId(decoded.id);

            if (!usuario || usuario.refreshtoken !== refreshToken) {
                throw new CustomError({
                    statusCode: 401,
                    errorType: 'authError',
                    customMessage: 'Token de atualização inválido'
                });
            }

            // Gerar novos tokens
            const accessToken = this._gerarAccessToken(usuario);
            const newRefreshToken = this._gerarRefreshToken(usuario);

            // Armazenar novos tokens
            await this.usuarioRepository.armazenarTokens(usuario._id, accessToken, newRefreshToken);

            return {
                accessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Token de atualização inválido ou expirado'
            });
        }
    }

    _gerarAccessToken(usuario) {
        return jwt.sign(
            {
                id: usuario._id,
                matricula: usuario.matricula,
                perfil: usuario.perfil
            },
            this.ACCESS_TOKEN_SECRET,
            { expiresIn: this.ACCESS_TOKEN_EXPIRY }
        );
    }

    _gerarRefreshToken(usuario) {
        return jwt.sign(
            { id: usuario._id },
            this.REFRESH_TOKEN_SECRET,
            { expiresIn: this.REFRESH_TOKEN_EXPIRY }
        );
    }

    async revoke(matricula) {
        // Verificar se a matrícula foi fornecida
        if (!matricula) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                customMessage: 'Matrícula não fornecida'
            });
        }

        // Buscar usuário pela matrícula
        const usuario = await this.usuarioRepository.buscarPorMatricula(matricula);

        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'notFoundError',
                customMessage: 'Usuário não encontrado com esta matrícula'
            });
        }

        // Remove tokens do usuário e marca como offline
        await this.usuarioRepository.setUserOnlineStatus(usuario._id, false);
        const data = await this.usuarioRepository.removeToken(usuario._id);
        return { data };
    }

    async recuperarSenha(email) {
        // Buscar o usuário pelo email
        const usuario = await this.usuarioRepository.buscarPorEmail(email);

        // Mesmo que não encontre o usuário, não revelamos isso por segurança
        if (!usuario) {
            return {
                message: 'Solicitação de recuperação de senha recebida, um email será enviado com as instruções para recuperação de senha'
            };
        }

        // Gerar token de recuperação (JWT)
        const token = await this.tokenUtil.generatePasswordRecoveryToken(usuario._id);

        // Gerar código de recuperação (4 dígitos)
        const codigo = Math.random().toString(36).replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase();

        // Salvar token e código no usuário
        await this.usuarioRepository.atualizarTokenRecuperacao(usuario._id, token, codigo);

        // Tentar enviar email de recuperação
        await EmailService.enviarCodigoRecuperacao(usuario, codigo);

        return {
            message: 'Solicitação de recuperação de senha recebida, um email será enviado com as instruções para recuperação de senha'
        };
    }

    async redefinirSenhaComToken(token, novaSenha) {
        try {
            // Decodificar o token para obter o ID do usuário
            const usuarioId = await this.tokenUtil.decodePasswordRecoveryToken(token);

            // Verificar se o usuário existe
            const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
            if (!usuario) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'notFound',
                    customMessage: 'Usuário não encontrado'
                });
            }

            // Hash da nova senha
            const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

            // Atualizar senha e remover tokens de recuperação
            await this.usuarioRepository.atualizarSenha(usuarioId, senhaCriptografada);

            return {
                message: 'Senha atualizada com sucesso'
            };
        } catch (error) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Token inválido ou expirado'
            });
        }
    }

    async redefinirSenhaComCodigo(codigo, novaSenha) {
        // Buscar usuário pelo código de recuperação
        const usuario = await this.usuarioRepository.buscarPorCodigoRecuperacao(codigo);

        if (!usuario) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'notFound',
                customMessage: 'Código de recuperação inválido'
            });
        }

        // Verificar se o código não expirou
        const agora = new Date();
        if (usuario.data_expiracao_codigo && usuario.data_expiracao_codigo < agora) {
            throw new CustomError({
                statusCode: 401,
                errorType: 'authError',
                customMessage: 'Código de recuperação expirado'
            });
        }

        // Hash da nova senha
        const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

        // Atualizar senha, ativar usuário e remover informações de recuperação
        await this.usuarioRepository.atualizarSenhaCompleta(usuario._id, {
            senha: senhaCriptografada,
            senha_definida: true,
            ativo: true,
            codigo_recuperacao: null,
            data_expiracao_codigo: null,
            token_recuperacao: null,
            token_recuperacao_expira: null
        });

        // Verificar se é primeira definição de senha
        const isPrimeiraDefinicao = !usuario.senha_definida;

        return {
            message: isPrimeiraDefinicao ? 
                'Senha definida com sucesso! Sua conta está ativa e você já pode fazer login.' : 
                'Senha atualizada com sucesso'
        };
    }
}
