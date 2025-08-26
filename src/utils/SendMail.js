import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

class SendMail {
  static async enviaEmail(infoemail) {
    // Verifica se o serviço de email está desativado
    if (process.env.DISABLED_EMAIL) {
      console.log('Serviço de Email desativado');
      return; // Adiciona o return para interromper a execução
    }


    try {
      // Configuração do transportador
      let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true para 465, false para outras portas
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Gerar hash para o ID do email
      const hashId = () => crypto.randomBytes(6).toString('hex');

      // Envia o email
      let info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: infoemail.to,
        subject: `${infoemail.subject} Email: #${hashId()}`,
        text: infoemail.text,
        html: infoemail.html,
      });

      console.log('Email enviado: %s', info.messageId);
    } catch (err) {
      console.error('Erro ao enviar email:', err);
      return { error: true, code: 500, message: 'Erro interno do Servidor' };
    }
  }

  static async enviaEmailError(err, pathname, date, req) {
    const infoEmail = {
      to: process.env.ADMIN_EMAIL,
      subject: `Erro interno do servidor na classe: ${pathname}`,
      text: `Erro Detectado \n\nErro interno do Servidor\n\nAtenciosamente,\nEquipe de suporte\n\nErro: ${err.message}\n\nArquivo: ${pathname}\n\nData e Hora: ${date}`,
      html: `<p>Olá,</p><p>Erro interno do Servidor</p><p>Atenciosamente,</p><p>Equipe de suporte</p><p>Erro: ${err.message}</p><p>Arquivo: ${pathname}</p><p>Data e Hora: ${date}</p><p>Requisição: ${req.method}</p><p>URL: ${req.protocol}://${req.get('host')}${req.originalUrl}</p>`,
    };

    await this.enviaEmail(infoEmail);
  }

  static async enviaEmailErrorDbConect(err, pathname, date) {
    const infoEmail = {
      to: process.env.ADMIN_EMAIL,
      subject: `Erro interno do servidor na classe: ${pathname}`,
      text: `Erro Detectado \n\nErro interno do Servidor\n\nAtenciosamente,\nEquipe de suporte\n\nErro: ${err.message}\n\nArquivo: ${pathname}\n\nData e Hora: ${date}`,
      html: `<p>Olá,</p><p>Erro interno do Servidor</p><p>Atenciosamente,</p><p>Equipe de suporte</p><p>Erro: ${err.message}</p><p>Arquivo: ${pathname}</p><p>Data e Hora: ${date}</p>`,
    };

    await this.enviaEmail(infoEmail);
  }
}

export default SendMail;
