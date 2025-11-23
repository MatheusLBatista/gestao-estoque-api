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
            LogMiddleware.logError('EMAIL_CONFIG_MISSING', {
                email: emailData.to,
                error: 'MAIL_API_KEY não configurada'
            });
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
            
            LogMiddleware.logInfo('EMAIL_SENT_SUCCESS', {
                email: emailData.to,
                template: emailData.template,
                subject: emailData.subject
            });

            return { 
                success: true, 
                sentViaEmail: true, 
                messageId: response.data.info?.messageId || 'unknown' 
            };

        } catch (error) {
            console.log(`❌ Falha ao enviar email para ${emailData.to}: ${error.message}`);
            
            LogMiddleware.logError('EMAIL_SEND_FAILED', {
                email: emailData.to,
                error: error.message,
                stack: error.stack,
                mailApiUrl: this.mailApiUrl
            });

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
            subject: `Bem-vindo(a) ao ${this.systemName}!`,
            template: 'generico',
            data: {
                mostrarHeader: true,
                nomeSistema: this.systemName,
                logoUrl: process.env.LOGO_URL || '',
                corPrimaria: '#4F46E5',
                
                titulo: `Bem-vindo(a) ao ${this.systemName}!`,
                nome: usuario.nome_usuario,
                mensagem: `Sua conta foi criada com sucesso e estamos felizes em ter você conosco.<br><br>
                    Para seu primeiro acesso, só falta um passo: <strong>definir sua senha para poder acessar a plataforma!</strong><br><br>
                    Clique no botão abaixo para começar.`,
                
                mostrarBotao: true,
                textoBotao: 'Definir minha senha',
                urlBotao: `${this.frontendUrl}/definir-senha/${token}`,
                corBotao: '#4F46E5',
                
                textoFooter: `Sistema de ${this.systemName} - ${new Date().getFullYear()}`
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
            subject: `Redefinição de Senha - ${this.systemName}`,
            template: 'generico',
            data: {
                mostrarHeader: true,
                nomeSistema: this.systemName,
                logoUrl: process.env.LOGO_URL || '',
                corPrimaria: '#4F46E5',
                
                titulo: 'Redefina sua senha',
                nome: usuario.nome_usuario,
                mensagem: `Recebemos uma solicitação para redefinir a senha da sua conta.<br><br>
                    Se foi você, clique no botão abaixo para criar uma nova senha. 
                    Se você não fez essa solicitação, pode ignorar este e-mail com segurança.`,
                textoDestaque: 'Por segurança, este link expira em <strong>1 hora</strong>.',
                
                mostrarBotao: true,
                textoBotao: 'Criar nova senha',
                urlBotao: `${this.frontendUrl}/nova-senha/${token}`,
                corBotao: '#EF4444',
                
                textoFooter: `Sistema de ${this.systemName} - ${new Date().getFullYear()}`
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
