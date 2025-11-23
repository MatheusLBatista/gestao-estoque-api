import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import UsuarioRepository from "../repositories/usuarioRepository.js";
import TokenUtil from "../utils/TokenUtil.js";
import {
  CommonResponse,
  CustomError,
  HttpStatusCodes,
  errorHandler,
  messages,
  StatusService,
  asyncWrapper,
} from "../utils/helpers/index.js";
import { enviarEmail } from "../utils/mailClient.js";
import { emailRecuperacaoSenha, emailConfirmacaoSenhaAlterada, emailBoasVindas } from "../utils/templates/emailTemplates.js";

dotenv.config();

export class AuthService {
  constructor() {
    this.usuarioRepository = new UsuarioRepository();
    this.tokenUtil = TokenUtil;

    this.ACCESS_TOKEN_SECRET =
      process.env.JWT_SECRET_ACCESS_TOKEN ||
      process.env.JWT_SECRET_ACCESS_TOKEN ||
      "your_jwt_secret";

    this.REFRESH_TOKEN_SECRET =
      process.env.JWT_SECRET_REFRESH_TOKEN ||
      process.env.JWT_REFRESH_SECRET ||
      "your_jwt_refresh_secret";

    this.ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRATION || "1h";
    this.REFRESH_TOKEN_EXPIRY =
      process.env.JWT_REFRESH_TOKEN_EXPIRATION || "7d";
  }

  async autenticar(matricula, senha) {
    const usuario = await this.usuarioRepository.buscarPorMatricula(
      matricula,
      "+senha +senha_definida"
    );

    if (!usuario.ativo) {
      throw new CustomError({
        statusCode: 401,
        errorType: "authError",
        field: "Usuário",
        details: [],
        customMessage: messages.error.resourceNotFound("Usuário"),
      });
    }

    if (!usuario.senha_definida || !usuario.senha) {
      throw new CustomError({
        statusCode: 401,
        errorType: "authError",
        customMessage:
          "Usuário ainda não definiu sua senha. Use o código de segurança fornecido para definir sua senha.",
      });
    }

    // Verificar senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      throw new CustomError({
        statusCode: 401,
        errorType: "authError",
        field: "Senha",
        details: [],
        customMessage: messages.error.unauthorized("Credenciais inválidas"),
      });
    }

    // Gerar tokens
    const accessToken = await this.tokenUtil.generateAccessToken(usuario._id);
    const refreshToken = await this.tokenUtil.generateRefreshToken(usuario._id);

    // Armazenar tokens no usuário e marcar como online
    await this.usuarioRepository.armazenarTokens(
      usuario._id,
      accessToken,
      refreshToken
    );
    await this.usuarioRepository.setUserOnlineStatus(usuario._id, true);

    // Retornar dados sem a senha
    const usuarioSemSenha = {
      id: usuario._id,
      nome_usuario: usuario.nome_usuario,
      email: usuario.email,
      matricula: usuario.matricula,
      perfil: usuario.perfil,
    };

    return {
      usuario: usuarioSemSenha,
      accessToken,
      refreshToken,
    };
  }

  async logout(userId) {
    // Marcar usuário como offline
    await this.usuarioRepository.setUserOnlineStatus(userId, false);
    return await this.usuarioRepository.removeToken(userId);
  }

  async refreshToken(id, refreshToken) {
    const user = await this.usuarioRepository.buscarPorId(id, {
      includeTokens: true,
    });

    if (user.refreshtoken !== refreshToken) {
      throw new CustomError({
        statusCode: HttpStatusCodes.UNAUTHORIZED.code,
        errorType: "invalidToken",
        field: "Token",
        details: [],
        customMessage: messages.error.unauthorized("Token"),
      });
    }

    const accesstoken = await this.tokenUtil.generateAccessToken(id);

    let refreshtoken = "";
    if (process.env.SINGLE_SESSION_REFRESH_TOKEN === "true") {
      refreshtoken = await this.tokenUtil.generateRefreshToken(id);
    } else {
      refreshtoken = user.refreshtoken;
    }

    await this.usuarioRepository.armazenarTokens(id, accesstoken, refreshtoken);

    const userLogado = await this.usuarioRepository.buscarPorId(id, {
      includeTokens: true,
    });
    const userObjeto = userLogado.toObject();

    const userComTokens = {
      accesstoken,
      refreshtoken,
      ...userObjeto,
    };

    return { user: userComTokens };
  }

  async revoke(matricula) {
    // Buscar usuário pela matrícula
    const usuario = await this.usuarioRepository.buscarPorMatricula(matricula);

    // Remove tokens do usuário e marca como offline
    await this.usuarioRepository.setUserOnlineStatus(usuario._id, false);
    const data = await this.usuarioRepository.removeToken(usuario._id);
    return { data };
  }

  async recuperarSenha(email) {
    const user = await this.usuarioRepository.buscarPorEmail(email);

    // Gerar código e token único
    const codigo = Math.random().toString(36).substring(2, 6).toUpperCase();
    const tokenUnico = await this.tokenUtil.generatePasswordRecoveryToken(
      user._id
    );

    // Salvar no banco com os novos campos
    await this.usuarioRepository.atualizarUsuario(user._id, {
      tokenUnico: tokenUnico,
      exp_tokenUnico_recuperacao: new Date(Date.now() + 60 * 60 * 1000), // 1h
      token_recuperacao: tokenUnico, // Compatibilidade
      token_recuperacao_expira: new Date(Date.now() + 60 * 60 * 1000), // Compatibilidade
      codigo_recuperacao: codigo,
      data_expiracao_codigo: new Date(Date.now() + 60 * 60 * 1000), // 1h
    });

    // Enviar email usando o template
    const emailData = emailRecuperacaoSenha({
      email: user.email,
      nome: user.nome_usuario,
      token: tokenUnico
    });

    await enviarEmail(emailData);

    console.log(`🔑 Código de recuperação: ${codigo} | Token: ${tokenUnico.substring(0, 20)}...`);

    return { 
      message: "E-mail de recuperação enviado com sucesso.",
      // Em desenvolvimento, retornar código para facilitar testes
      ...(process.env.NODE_ENV === 'development' && { codigo, token: tokenUnico })
    };
  }

  async redefinirSenhaComToken(token, novaSenha) {
    const usuarioId = await this.tokenUtil
      .decodePasswordRecoveryToken(token)
      .catch(() => {
        throw new CustomError({
          statusCode: 404,
          errorType: "authError",
          field: "Usuário",
          details: [],
          customMessage: messages.error.resourceNotFound("Token"),
        });
      });

    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);

    if (
      usuario.token_recuperacao_expira &&
      new Date(usuario.token_recuperacao_expira) < new Date()
    ) {
      throw new CustomError({
        statusCode: 401,
        errorType: "authError",
        customMessage: "Token expirado",
      });
    }

    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

    await this.usuarioRepository.atualizarUsuario(usuarioId, {
      senha: senhaCriptografada,
      senha_definida: true,
      ativo: true,
      codigo_recuperacao: null,
      tokenUnico: null,
      exp_tokenUnico_recuperacao: null,
      token_recuperacao: null,
      token_recuperacao_expira: null,
    });

    // Enviar email de confirmação
    const emailData = emailConfirmacaoSenhaAlterada({
      email: usuario.email,
      nome: usuario.nome_usuario
    });

    await enviarEmail(emailData);

    return { message: "Senha atualizada com sucesso" };
  }

  async redefinirSenhaComCodigo(codigo, novaSenha) {
    // Buscar usuário pelo código de recuperação
    const usuario = await this.usuarioRepository.buscarPorCodigoRecuperacao(
      codigo
    );

    // Verificar se o código não expirou
    const agora = new Date();
    if (
      usuario.data_expiracao_codigo &&
      usuario.data_expiracao_codigo < agora
    ) {
      throw new CustomError({
        statusCode: 401,
        errorType: "authError",
        field: "Usuário",
        details: [],
        customMessage: messages.error.resourceNotFound("Código de recuperação"),
      });
    }

    // Hash da nova senha
    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

    // Verificar se é primeira definição de senha
    const isPrimeiraDefinicao = !usuario.senha_definida;

    // Atualizar senha, ativar usuário e remover informações de recuperação
    await this.usuarioRepository.atualizarSenhaCompleta(usuario._id, {
      senha: senhaCriptografada,
      senha_definida: true,
      ativo: true,
      codigo_recuperacao: null,
      data_expiracao_codigo: null,
      tokenUnico: null,
      exp_tokenUnico_recuperacao: null,
      token_recuperacao: null,
      token_recuperacao_expira: null,
    });

    // Enviar email de confirmação
    const emailData = emailConfirmacaoSenhaAlterada({
      email: usuario.email,
      nome: usuario.nome_usuario
    });

    await enviarEmail(emailData);

    return {
      message: isPrimeiraDefinicao
        ? "Senha definida com sucesso! Sua conta está ativa e você já pode fazer login."
        : "Senha atualizada com sucesso",
    };
  }
}
