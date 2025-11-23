import axios from 'axios';
import 'dotenv/config';

const URL_MAIL_SERVICE = process.env.URL_MAIL_SERVICE;
const MAIL_API_KEY = process.env.MAIL_API_KEY;

/**
 * Envia email usando o serviço mailsender-ts
 * @param {Object} emailData - Objeto com os dados do email
 * @param {string} emailData.to - Email do destinatário
 * @param {string} emailData.subject - Assunto do email
 * @param {string} emailData.template - Template a ser usado (bemvindo, generico)
 * @param {Object} emailData.data - Dados para preencher o template
 * @returns {Promise<Object>} Resposta do servidor
 */
export async function enviarEmail(emailData) {
    if (!URL_MAIL_SERVICE) {
        console.warn('URL_MAIL_SERVICE não configurada - email não será enviado');
        return { success: false, error: 'URL_MAIL_SERVICE não configurada' };
    }

    if (!MAIL_API_KEY) {
        console.warn('MAIL_API_KEY não configurada - email não será enviado');
        return { success: false, error: 'MAIL_API_KEY não configurada' };
    }

    const url = `${URL_MAIL_SERVICE}/api/emails/send`;

    try {
        const resposta = await axios.post(
            url,
            emailData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': MAIL_API_KEY
                },
                timeout: parseInt(process.env.MAIL_API_TIMEOUT) || 30000
            }
        );

        console.log(`Email enviado com sucesso para ${emailData.to}`);
        console.log(`Resposta: ${resposta.data.message || 'OK'}`);
        
        return { 
            success: true, 
            data: resposta.data 
        };

    } catch (erro) {
        console.error('Erro ao enviar email:', erro.response?.data || erro.message);
        
        return { 
            success: false, 
            error: erro.response?.data || erro.message 
        };
    }
}

/**
 * Envia email em modo assíncrono (sem esperar resposta)
 */
export function enviarEmailAsync(emailData) {
    enviarEmail(emailData)
        .then(resultado => {
            if (!resultado.success) {
                console.error('Falha no envio assíncrono:', resultado.error);
            }
        })
        .catch(erro => {
            console.error('Erro no envio assíncrono:', erro);
        });
}

export default {
    enviarEmail,
    enviarEmailAsync
};
