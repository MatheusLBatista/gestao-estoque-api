import axios from 'axios';
import dotenv from 'dotenv';
import LogMiddleware from '../middlewares/LogMiddleware.js';

dotenv.config();

class EmailService {
    constructor() {
        this.mailApiUrl = process.env.MAIL_API_URL || 'http://localhost:5013';
        this.mailApiKey = process.env.MAIL_API_KEY;
        this.mailApiTimeout = parseInt(process.env.MAIL_API_TIMEOUT) || 5000;
        this.systemUrl = process.env.SYSTEM_URL || 'http://localhost:5011';
    }

    /**
     * Envia email de primeiro acesso com código de verificação
     * @param {Object} usuario - Dados do usuário
     * @param {string} codigo - Código de verificação gerado
     * @returns {Object} - Resultado do envio
     */
    async enviarCodigoCadastro(usuario, codigo) {
        // Sempre mostrar código no console para facilitar desenvolvimento
        console.log(`Código de recuperação: ${codigo}`);
        
        if (!this.mailApiKey) {
            console.log('⚠️  MAIL_API_KEY não configurada - email não será enviado');
            LogMiddleware.logError('EMAIL_CONFIG_MISSING', {
                usuario_id: usuario._id,
                email: usuario.email,
                error: 'MAIL_API_KEY não configurada'
            });
            return { success: true, sentViaEmail: false, reason: 'API Key não configurada' };
        }

        try {
            const emailData = {
                to: usuario.email,
                subject: 'Bem-vindo(a) ao Sistema de Gestão de Estoque!',
                template: 'first-access',
                data: {
                    name: usuario.nome_usuario,
                    matricula: usuario.matricula,
                    verificationCode: codigo,
                    systemUrl: this.systemUrl,
                    expirationHours: 24,
                    year: new Date().getFullYear(),
                    company: 'HR - Gestão de Estoque'
                }
            };

            const response = await axios.post(
                `${this.mailApiUrl}/emails/send`,
                emailData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.mailApiKey
                    },
                    timeout: this.mailApiTimeout
                }
            );

            console.log(`✅ Email enviado com sucesso para ${usuario.email}`);
            
            LogMiddleware.logInfo('EMAIL_SENT_SUCCESS', {
                usuario_id: usuario._id,
                email: usuario.email,
                template: 'first-access',
                matricula: usuario.matricula
            });

            return { 
                success: true, 
                sentViaEmail: true, 
                messageId: response.data.info?.messageId || 'unknown' 
            };

        } catch (error) {
            console.log(`❌ Falha ao enviar email para ${usuario.email}: ${error.message}`);
            
            LogMiddleware.logError('EMAIL_SEND_FAILED', {
                usuario_id: usuario._id,
                email: usuario.email,
                error: error.message,
                stack: error.stack,
                mailApiUrl: this.mailApiUrl
            });

            return { 
                success: true, 
                sentViaEmail: false, 
                reason: `Erro no envio: ${error.message}` 
            };
        }
    }

    /**
     * Envia email de recuperação de senha
     * @param {Object} usuario - Dados do usuário
     * @param {string} codigo - Código de recuperação
     * @returns {Object} - Resultado do envio
     */
    async enviarCodigoRecuperacao(usuario, codigo) {
        if (!this.mailApiKey) {
            console.log('⚠️  MAIL_API_KEY não configurada - email não será enviado');
            LogMiddleware.logError('EMAIL_CONFIG_MISSING', {
                usuario_id: usuario._id,
                email: usuario.email,
                error: 'MAIL_API_KEY não configurada'
            });
            return { success: true, sentViaEmail: false, reason: 'API Key não configurada' };
        }

        try {
            const emailData = {
                to: usuario.email,
                subject: 'Código de Recuperação de Senha',
                template: 'verification-code',
                data: {
                    name: usuario.nome_usuario,
                    appName: 'Sistema de Gestão de Estoque',
                    verificationCode: codigo,
                    expirationMinutes: 60,
                    year: new Date().getFullYear(),
                    company: 'Gestão de Estoque'
                }
            };

            const response = await axios.post(
                `${this.mailApiUrl}/emails/send`,
                emailData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.mailApiKey
                    },
                    timeout: this.mailApiTimeout
                }
            );

            console.log(`✅ Email de recuperação enviado para ${usuario.email}`);
            
            LogMiddleware.logInfo('EMAIL_RECOVERY_SENT', {
                usuario_id: usuario._id,
                email: usuario.email,
                template: 'verification-code'
            });

            return { 
                success: true, 
                sentViaEmail: true, 
                messageId: response.data.info?.messageId || 'unknown' 
            };

        } catch (error) {
            console.log(`❌ Falha ao enviar email de recuperação para ${usuario.email}: ${error.message}`);
            
            LogMiddleware.logError('EMAIL_RECOVERY_FAILED', {
                usuario_id: usuario._id,
                email: usuario.email,
                error: error.message,
                stack: error.stack
            });

            return { 
                success: true, 
                sentViaEmail: false, 
                reason: `Erro no envio: ${error.message}` 
            };
        }
    }
}

export default new EmailService();
