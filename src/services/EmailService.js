import axios from 'axios';
import dotenv from 'dotenv';
import LogMiddleware from '../middlewares/LogMiddleware.js';

dotenv.config();

class EmailService {
    constructor() {
        this.mailApiUrl = process.env.URL_MAIL_SERVICE || 'http://localhost:5015';
        this.mailApiKey = process.env.MAIL_API_KEY;
        this.mailApiTimeout = parseInt(process.env.MAIL_API_TIMEOUT) || 30000;
        this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        this.systemName = 'Gestão de Estoque';
    }

    /**
     * Método genérico para enviar email
     * @param {Object} emailData - Dados do email (to, subject, template, data)
     * @returns {Object} - Resultado do envio
     */
    async enviarEmail(emailData) {
        if (!this.mailApiKey) {
            console.log('⚠️  MAIL_API_KEY não configurada - email não será enviado');
            return { success: false, sentViaEmail: false, reason: 'API Key não configurada' };
        }

        try {
            const response = await axios.post(
                `${this.mailApiUrl}/api/emails/send`,
                emailData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.mailApiKey
                    },
                    timeout: this.mailApiTimeout
                }
            );

            console.log(`✅ Email enviado com sucesso para ${emailData.to}`);

            return { 
                success: true, 
                sentViaEmail: true, 
                messageId: response.data.info?.messageId || 'unknown' 
            };

        } catch (error) {
            console.log(`❌ Falha ao enviar email para ${emailData.to}: ${error.message}`);

            return { 
                success: false, 
                sentViaEmail: false, 
                reason: `Erro no envio: ${error.message}` 
            };
        }
    }

    /**
     * Envia email de boas-vindas para novo usuário
     * @param {Object} usuario - Dados do usuário
     * @param {string} token - Token para definir senha
     * @returns {Object} - Resultado do envio
     */
    async enviarBoasVindas(usuario, token) {
        const emailData = {
            to: usuario.email,
            subject: `🎉 Bem-vindo(a) ao ${this.systemName}!`,
            template: 'generico',
            data: {
                mostrarHeader: true,
                nomeSistema: this.systemName,
                logoUrl: process.env.LOGO_URL || '',
                corPrimaria: '#0042D9',
                corSecundaria: '#E8F0FF',
                
                titulo: `Bem-vindo(a) ao ${this.systemName}! 🎉`,
                nome: usuario.nome_usuario,
                mensagem: `<div style="text-align: center; margin: 30px 0;">
                    <div style="background: linear-gradient(135deg, #0042D9 0%, #0056FF 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 20px;">
                        <h2 style="margin: 0 0 10px 0; font-size: 28px;">✨ Conta Criada com Sucesso!</h2>
                        <p style="margin: 0; font-size: 16px; opacity: 0.95;">Estamos muito felizes em ter você conosco</p>
                    </div>
                    </div>
                    <p style="font-size: 16px; line-height: 1.6; color: #333;">
                        Sua jornada começa agora! Para acessar o sistema, você precisa definir sua senha pessoal.
                    </p>
                    <p style="font-size: 15px; line-height: 1.6; color: #555; margin: 20px 0;">
                        Clique no botão abaixo para ativar sua conta:
                    </p>`,
                
                mostrarBotao: true,
                textoBotao: '🚀 Definir Minha Senha',
                urlBotao: `${this.frontendUrl}/definir-senha/${token}`,
                corBotao: '#0042D9',
                
                textoFooter: `<div style="text-align: center; padding: 20px; color: #888; font-size: 13px;">
                    <p style="margin: 5px 0;">Sistema de ${this.systemName}</p>
                    <p style="margin: 5px 0;">© ${new Date().getFullYear()} - Todos os direitos reservados</p>
                    <p style="margin: 15px 0 5px 0; color: #aaa; font-size: 12px;">
                        Se você não solicitou esta conta, pode ignorar este email
                    </p>
                </div>`
            }
        };

        return await this.enviarEmail(emailData);
    }

    /**
     * Envia email de código de cadastro (primeiro acesso)
     * @param {Object} usuario - Dados do usuário
     * @param {string} codigo - Código de 6 dígitos
     * @returns {Object} - Resultado do envio
     */
    async enviarCodigoCadastro(usuario, codigo) {
        const emailData = {
            to: usuario.email,
            subject: `🎉 Bem-vindo(a) ao ${this.systemName}!`,
            template: 'generico',
            data: {
                mostrarHeader: true,
                nomeSistema: this.systemName,
                logoUrl: process.env.LOGO_URL || '',
                corPrimaria: '#0042D9',
                corSecundaria: '#E8F0FF',
                
                titulo: `Bem-vindo(a) ao ${this.systemName}! 🎉`,
                nome: usuario.nome_usuario,
                mensagem: `<div style="text-align: center; margin: 30px 0;">
                    <div style="background: linear-gradient(135deg, #0042D9 0%, #0056FF 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 20px;">
                        <h2 style="margin: 0 0 10px 0; font-size: 28px;">✨ Conta Criada com Sucesso!</h2>
                        <p style="margin: 0; font-size: 16px; opacity: 0.95;">Estamos muito felizes em ter você conosco</p>
                    </div>
                    </div>
                    <p style="font-size: 16px; line-height: 1.6; color: #333;">
                        Sua jornada começa agora! Para acessar o sistema, você precisa definir sua senha pessoal.
                    </p>`,
                textoDestaque: `<div style="background: linear-gradient(135deg, #E8F0FF 0%, #D1E3FF 100%); padding: 25px; border-radius: 15px; border-left: 4px solid #0042D9; margin: 25px 0;">
                    <div style="text-align: center;">
                        <p style="margin: 0 0 15px 0; color: #666; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Seu Código de Ativação</p>
                        <div style="background: white; padding: 20px; border-radius: 12px; display: inline-block;">
                            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #0042D9; font-family: 'Courier New', monospace;">${codigo}</span>
                        </div>
                        <p style="margin: 15px 0 10px 0; color: #666; font-size: 14px;">
                            <strong>📋 Matrícula:</strong> <span style="font-weight: bold; color: #0042D9;">${usuario.matricula}</span>
                        </p>
                        <p style="margin: 10px 0 0 0; color: #888; font-size: 13px;">
                            ⏰ <strong>Válido por 24 horas</strong>
                        </p>
                    </div>
                </div>`,
                
                mostrarBotao: true,
                textoBotao: '🚀 Ativar Minha Conta',
                urlBotao: `${this.frontendUrl}/definir-senha?codigo=${codigo}`,
                corBotao: '#0042D9',
                
                textoFooter: `<div style="text-align: center; padding: 20px; color: #888; font-size: 13px;">
                    <p style="margin: 5px 0;">Sistema de ${this.systemName}</p>
                    <p style="margin: 5px 0;">© ${new Date().getFullYear()} - Todos os direitos reservados</p>
                    <p style="margin: 15px 0 5px 0; color: #aaa; font-size: 12px;">
                        Se você não solicitou esta conta, pode ignorar este email
                    </p>
                </div>`
            }
        };

        return await this.enviarEmail(emailData);
    }

    /**
     * Envia email de recuperação de senha
     * @param {Object} usuario - Dados do usuário
     * @param {string} token - Token de recuperação
     * @returns {Object} - Resultado do envio
     */
    async enviarRecuperacaoSenha(usuario, token) {
        const emailData = {
            to: usuario.email,
            subject: `🔐 Recuperação de Senha - ${this.systemName}`,
            template: 'generico',
            data: {
                mostrarHeader: true,
                nomeSistema: this.systemName,
                logoUrl: process.env.LOGO_URL || '',
                corPrimaria: '#0042D9',
                corSecundaria: '#E8F0FF',
                
                titulo: '🔐 Recuperação de Senha',
                nome: usuario.nome_usuario,
                mensagem: `<div style="text-align: center; margin: 30px 0;">
                    <div style="background: linear-gradient(135deg, #0042D9 0%, #0056FF 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 20px;">
                        <div style="font-size: 48px; margin-bottom: 10px;">🔑</div>
                        <h2 style="margin: 0 0 10px 0; font-size: 26px;">Redefinir Senha</h2>
                        <p style="margin: 0; font-size: 15px; opacity: 0.95;">Vamos recuperar o acesso à sua conta</p>
                    </div>
                    </div>
                    <p style="font-size: 16px; line-height: 1.6; color: #333; text-align: center;">
                        Recebemos uma solicitação para redefinir a senha da sua conta.
                    </p>
                    <p style="font-size: 15px; line-height: 1.6; color: #555; text-align: center; margin: 20px 0;">
                        Clique no botão abaixo para criar uma nova senha:
                    </p>`,
                textoDestaque: `<div style="background: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; margin: 20px 0; border-radius: 8px;">
                    <p style="margin: 0; color: #856404; font-size: 14px; text-align: center;">
                        <strong>⚠️ Importante:</strong> Este link expira em <strong>1 hora</strong> por segurança.
                    </p>
                </div>
                <p style="font-size: 14px; line-height: 1.6; color: #888; text-align: center; margin-top: 20px;">
                    Se você não solicitou a recuperação de senha, <strong style="color: #0042D9;">ignore este email</strong>.<br>
                    Sua senha atual permanecerá inalterada.
                </p>`,
                
                mostrarBotao: true,
                textoBotao: '🔐 Criar Nova Senha',
                urlBotao: `${this.frontendUrl}/redefinir-senha/${token}`,
                corBotao: '#0042D9',
                
                textoFooter: `<div style="text-align: center; padding: 20px; color: #888; font-size: 13px;">
                    <p style="margin: 5px 0;">Sistema de ${this.systemName}</p>
                    <p style="margin: 5px 0;">© ${new Date().getFullYear()} - Todos os direitos reservados</p>
                    <p style="margin: 15px 0 5px 0; color: #aaa; font-size: 12px;">
                        📧 Este é um email automático, não responda
                    </p>
                </div>`
            }
        };

        return await this.enviarEmail(emailData);
    }

    /**
     * Envia email de código de recuperação de senha
     * @param {Object} usuario - Dados do usuário
     * @param {string} codigo - Código de 6 dígitos
     * @returns {Object} - Resultado do envio
     */
    async enviarCodigoRecuperacao(usuario, codigo) {
        const emailData = {
            to: usuario.email,
            subject: `🔐 Recuperação de Senha - ${this.systemName}`,
            template: 'generico',
            data: {
                mostrarHeader: true,
                nomeSistema: this.systemName,
                logoUrl: process.env.LOGO_URL || '',
                corPrimaria: '#0042D9',
                corSecundaria: '#E8F0FF',
                
                titulo: '🔐 Recuperação de Senha',
                nome: usuario.nome_usuario,
                mensagem: `<div style="text-align: center; margin: 30px 0;">
                    <div style="background: linear-gradient(135deg, #0042D9 0%, #0056FF 100%); color: white; padding: 30px; border-radius: 20px; margin-bottom: 20px;">
                        <div style="font-size: 48px; margin-bottom: 10px;">🔑</div>
                        <h2 style="margin: 0 0 10px 0; font-size: 26px;">Redefinir Senha</h2>
                        <p style="margin: 0; font-size: 15px; opacity: 0.95;">Vamos recuperar o acesso à sua conta</p>
                    </div>
                    </div>
                    <p style="font-size: 16px; line-height: 1.6; color: #333; text-align: center;">
                        Recebemos uma solicitação para redefinir a senha da sua conta.
                    </p>
                    <p style="font-size: 15px; line-height: 1.6; color: #555; text-align: center; margin: 20px 0;">
                        Use o código abaixo para criar uma nova senha:
                    </p>`,
                textoDestaque: `<div style="background: linear-gradient(135deg, #E8F0FF 0%, #D1E3FF 100%); padding: 30px; border-radius: 15px; border-left: 4px solid #0042D9; margin: 25px 0;">
                    <div style="text-align: center;">
                        <p style="margin: 0 0 15px 0; color: #666; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Código de Recuperação</p>
                        <div style="background: white; padding: 20px; border-radius: 12px; display: inline-block;>
                            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #0042D9; font-family: 'Courier New', monospace;">${codigo}</span>
                        </div>
                        <p style="margin: 15px 0 10px 0; color: #666; font-size: 14px;">
                            <strong>📋 Matrícula:</strong> <span style="font-weight: bold; color: #0042D9;">${usuario.matricula}</span>
                        </p>
                        <div style="background: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; margin-top: 20px; border-radius: 8px; text-align: left;">
                            <p style="margin: 0; color: #856404; font-size: 13px;">
                                <strong>⚠️ Importante:</strong> Este código expira em <strong>1 hora</strong> por segurança.
                            </p>
                        </div>
                    </div>
                </div>
                <p style="font-size: 14px; line-height: 1.6; color: #888; text-align: center; margin-top: 25px;">
                    Se você não solicitou a recuperação de senha, <strong style="color: #0042D9;">ignore este email</strong>.<br>
                    Sua senha atual permanecerá inalterada.
                </p>`,
                
                mostrarBotao: true,
                textoBotao: '🔐 Redefinir Minha Senha',
                urlBotao: `${this.frontendUrl}/redefinir-senha?codigo=${codigo}`,
                corBotao: '#0042D9',
                
                textoFooter: `<div style="text-align: center; padding: 20px; color: #888; font-size: 13px;">
                    <p style="margin: 5px 0;">Sistema de ${this.systemName}</p>
                    <p style="margin: 5px 0;">© ${new Date().getFullYear()} - Todos os direitos reservados</p>
                    <p style="margin: 15px 0 5px 0; color: #aaa; font-size: 12px;">
                        📧 Este é um email automático, não responda
                    </p>
                </div>`
            }
        };

        return await this.enviarEmail(emailData);
    }

    /**
     * Envia email de confirmação de alteração de senha
     * @param {Object} usuario - Dados do usuário
     * @returns {Object} - Resultado do envio
     */
    async enviarConfirmacaoAlteracaoSenha(usuario) {
        const emailData = {
            to: usuario.email,
            subject: `Senha Alterada - ${this.systemName}`,
            template: 'generico',
            data: {
                mostrarHeader: true,
                nomeSistema: this.systemName,
                logoUrl: process.env.LOGO_URL || '',
                corPrimaria: '#10B981',
                
                titulo: 'Senha alterada com sucesso! ✅',
                nome: usuario.nome_usuario,
                mensagem: `Sua senha foi alterada com sucesso.<br><br>
                    Se você não realizou esta alteração, entre em contato conosco imediatamente.`,
                textoDestaque: `Data e hora: <strong>${new Date().toLocaleString('pt-BR')}</strong>`,
                
                mostrarBotao: true,
                textoBotao: 'Acessar Sistema',
                urlBotao: `${this.frontendUrl}/login`,
                corBotao: '#10B981',
                
                textoFooter: `Sistema de ${this.systemName} - ${new Date().getFullYear()}`
            }
        };

        return await this.enviarEmail(emailData);
    }

    /**
     * Envia notificação de movimentação de estoque
     * @param {Object} dados - Dados da movimentação
     * @returns {Object} - Resultado do envio
     */
    async enviarNotificacaoMovimentacao(dados) {
        const tipoEmoji = dados.tipo === 'entrada' ? '📦' : '📤';
        const corTipo = dados.tipo === 'entrada' ? '#10B981' : '#EF4444';

        const emailData = {
            to: dados.email,
            subject: `Movimentação de Estoque - ${dados.produto}`,
            template: 'generico',
            data: {
                mostrarHeader: true,
                nomeSistema: this.systemName,
                corPrimaria: corTipo,
                
                titulo: `${tipoEmoji} Movimentação de Estoque`,
                nome: dados.responsavel,
                mensagem: `Uma ${dados.tipo} foi registrada no sistema.`,
                
                dados: [
                    { label: 'Produto', valor: dados.produto },
                    { label: 'Tipo', valor: dados.tipo.toUpperCase() },
                    { label: 'Quantidade', valor: dados.quantidade },
                    { label: 'Data/Hora', valor: new Date().toLocaleString('pt-BR') }
                ],
                
                mostrarBotao: true,
                textoBotao: 'Ver Detalhes',
                urlBotao: `${this.frontendUrl}/movimentacoes/${dados.movimentacaoId}`,
                corBotao: corTipo,
                
                textoFooter: `Sistema de ${this.systemName} - ${new Date().getFullYear()}`
            }
        };

        return await this.enviarEmail(emailData);
    }

    /**
     * Envia alerta de estoque baixo
     * @param {Object} dados - Dados do produto com estoque baixo
     * @returns {Object} - Resultado do envio
     */
    async enviarAlertaEstoqueBaixo(dados) {
        const emailData = {
            to: dados.email,
            subject: `⚠️ Alerta: Estoque Baixo - ${dados.produto}`,
            template: 'generico',
            data: {
                mostrarHeader: true,
                nomeSistema: this.systemName,
                corPrimaria: '#F59E0B',
                
                titulo: '⚠️ Alerta de Estoque Baixo',
                nome: dados.responsavel,
                mensagem: `O produto <strong>${dados.produto}</strong> está com estoque baixo e precisa de reposição.`,
                textoDestaque: `Estoque atual: <strong>${dados.quantidadeAtual}</strong> | Estoque mínimo: <strong>${dados.estoqueMinimo}</strong>`,
                
                mostrarBotao: true,
                textoBotao: 'Ver Produto',
                urlBotao: `${this.frontendUrl}/produtos/${dados.produtoId}`,
                corBotao: '#F59E0B',
                
                textoFooter: `Sistema de ${this.systemName} - ${new Date().getFullYear()}`
            }
        };

        return await this.enviarEmail(emailData);
    }
}

export default new EmailService();
