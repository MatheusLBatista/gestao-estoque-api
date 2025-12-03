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
      telefone: usuario.telefone,
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

    if (!user) {
      return { 
        message: "Se existe uma conta com este email, você receberá instruções para redefinir sua senha."
      };
    }

    // Verificar se a conta está ativa
    if (!user.ativo && user.senha_definida) {
      return { 
        message: "Se existe uma conta com este email, você receberá instruções para redefinir sua senha."
      };
    }

    // Gerar código e token único
    const codigo = Math.random().toString(36).substring(2, 6).toUpperCase();
    const tokenUnico = await this.tokenUtil.generatePasswordRecoveryToken(
      user._id
    );

    // Salvar no banco com os novos campos
    await this.usuarioRepository.atualizarUsuario(user.matricula, {
      tokenUnico: tokenUnico,
      exp_tokenUnico_recuperacao: new Date(Date.now() + 60 * 60 * 1000), 
      token_recuperacao: tokenUnico, 
      token_recuperacao_expira: new Date(Date.now() + 60 * 60 * 1000),
      codigo_recuperacao: codigo,
      data_expiracao_codigo: new Date(Date.now() + 60 * 60 * 1000), 
    });

    // Determinar tipo de email baseado no status da senha
    const isPrimeiroAcesso = !user.senha_definida;

    try {
      if (isPrimeiroAcesso) {
        // Email de boas-vindas para primeiro acesso
        const emailData = emailBoasVindas({
          email: user.email,
          nome: user.nome_usuario,
          token: tokenUnico
        });
        await enviarEmail(emailData);
        console.log(`Email de boas-vindas enviado para ${user.email}`);
      } else {
        // Email de recuperação de senha
        const emailData = emailRecuperacaoSenha({
          email: user.email,
          nome: user.nome_usuario,
          token: tokenUnico
        });
        await enviarEmail(emailData);
        console.log(`Email de recuperação enviado para ${user.email}`);
      }
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      // Continua mesmo se o email falhar
    }

    console.log(`Código de recuperação: ${codigo} | Token: ${tokenUnico.substring(0, 20)}...`);

    return { 
      message: "Se existe uma conta com este email, você receberá instruções para redefinir sua senha.",
      // Em desenvolvimento, retornar código para facilitar testes
      ...(process.env.NODE_ENV === 'development' && { codigo, token: tokenUnico, isPrimeiroAcesso })
    };
  }

  async redefinirSenhaComToken(token, novaSenha) {
    // Validar formato da senha
    if (!novaSenha || novaSenha.length < 6) {
      throw new CustomError({
        statusCode: 400,
        errorType: "validationError",
        field: "senha",
        details: [],
        customMessage: "A senha deve ter no mínimo 6 caracteres",
      });
    }

    const usuarioId = await this.tokenUtil
      .decodePasswordRecoveryToken(token)
      .catch(() => {
        throw new CustomError({
          statusCode: 401,
          errorType: "authError",
          field: "Token",
          details: [],
          customMessage: "Token inválido ou expirado",
        });
      });
    
    let usuarioMatricula = await this.usuarioRepository.buscarPorId(usuarioId);
    usuarioMatricula = usuarioMatricula.matricula;

    const usuario = await this.usuarioRepository.buscarPorMatricula(usuarioMatricula);

    if (!usuario) {
      throw new CustomError({
        statusCode: 404,
        errorType: "authError",
        field: "Usuário",
        details: [],
        customMessage: "Usuário não encontrado",
      });
    }

    // Verificar se o token não expirou
    if (
      usuario.token_recuperacao_expira &&
      new Date(usuario.token_recuperacao_expira) < new Date()
    ) {
      throw new CustomError({
        statusCode: 401,
        errorType: "authError",
        field: "Token",
        details: [],
        customMessage: "Token expirado. Solicite um novo link de recuperação.",
      });
    }

    // Verificar se é primeiro acesso
    const isPrimeiroAcesso = !usuario.senha_definida;

    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

    await this.usuarioRepository.atualizarUsuario(usuarioMatricula, {
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
    try {
      const emailData = emailConfirmacaoSenhaAlterada({
        email: usuario.email,
        nome: usuario.nome_usuario
      });
      await enviarEmail(emailData);
    } catch (emailError) {
      console.error('Erro ao enviar email de confirmação:', emailError);
      // Continua mesmo se o email falhar
    }

    if (isPrimeiroAcesso) {
      console.log(`Primeira senha definida para ${usuario.email} - Conta ativada`);
      return { 
        message: "Senha definida com sucesso! Sua conta está ativa e você já pode fazer login.",
        isPrimeiroAcesso: true
      };
    } else {
      console.log(`Senha redefinida para ${usuario.email}`);
      return { 
        message: "Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.",
        isPrimeiroAcesso: false
      };
    }
  }

  async redefinirSenhaComCodigo(codigo, novaSenha) {
    // Validar formato da senha
    if (!novaSenha || novaSenha.length < 6) {
      throw new CustomError({
        statusCode: 400,
        errorType: "validationError",
        field: "senha",
        details: [],
        customMessage: "A senha deve ter no mínimo 6 caracteres",
      });
    }

    // Validar formato do código
    if (!codigo || codigo.length < 4) {
      throw new CustomError({
        statusCode: 400,
        errorType: "validationError",
        field: "codigo",
        details: [],
        customMessage: "Código inválido",
      });
    }

    // Buscar usuário pelo código de recuperação
    const usuario = await this.usuarioRepository.buscarPorCodigoRecuperacao(
      codigo
    );

    if (!usuario) {
      throw new CustomError({
        statusCode: 404,
        errorType: "authError",
        field: "Código",
        details: [],
        customMessage: "Código inválido ou expirado",
      });
    }

    // Verificar se o código não expirou
    const agora = new Date();
    if (
      usuario.data_expiracao_codigo &&
      usuario.data_expiracao_codigo < agora
    ) {
      throw new CustomError({
        statusCode: 401,
        errorType: "authError",
        field: "Código",
        details: [],
        customMessage: "Código expirado. Solicite um novo código de recuperação.",
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
    try {
      const emailData = emailConfirmacaoSenhaAlterada({
        email: usuario.email,
        nome: usuario.nome_usuario
      });
      await enviarEmail(emailData);
    } catch (emailError) {
      console.error('Erro ao enviar email de confirmação:', emailError);
      // Continua mesmo se o email falhar
    }

    if (isPrimeiraDefinicao) {
      console.log(`Primeira senha definida via código para ${usuario.email} - Conta ativada`);
      return {
        message: "Senha definida com sucesso! Sua conta está ativa e você já pode fazer login.",
        isPrimeiroAcesso: true
      };
    } else {
      console.log(`Senha redefinida via código para ${usuario.email}`);
      return {
        message: "Senha atualizada com sucesso! Você já pode fazer login com sua nova senha.",
        isPrimeiroAcesso: false
      };
    }
  }
}
