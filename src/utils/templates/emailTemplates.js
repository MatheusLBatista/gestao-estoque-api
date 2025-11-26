import 'dotenv/config';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const LOGO_URL = process.env.LOGO_URL || '';
const COR_PRIMARIA = process.env.COR_PRIMARIA || '#4F46E5';
const SYSTEM_NAME = 'Gestão de Estoque';

/**
 * Template de boas-vindas para novo usuário (primeiro acesso)
 * @param {Object} data - { email, nome, token }
 */
export const emailBoasVindas = (data) => ({
    to: data.email,
    subject: `🎉 Bem-vindo(a) ao ${SYSTEM_NAME}!`,
    template: 'generico',
    data: {
        // Header
        mostrarHeader: true,
        logoUrl: LOGO_URL,
        corPrimaria: '#10B981',
        nomeSistema: SYSTEM_NAME,
        mostrarDivisor: true,

        // Conteúdo
        titulo: `Bem-vindo(a) ao ${SYSTEM_NAME}! 🎉`,
        nome: data.nome,
        mensagem: `Sua conta foi criada com sucesso e estamos muito felizes em ter você conosco!<br><br>
            <strong>Próximo passo:</strong> Defina sua senha de acesso para começar a usar o sistema.<br><br>
            É rápido e simples! Clique no botão abaixo e crie uma senha segura. 
            Após definir sua senha, sua conta será ativada automaticamente e você já poderá fazer login.`,
        textoDestaque: '✨ <strong>Primeiro Acesso:</strong> Este link expira em 24 horas.',

        // Botão de ação
        mostrarBotao: true,
        textoBotao: 'Ativar Minha Conta',
        urlBotao: `${FRONTEND_URL}/definir-senha/${data.token}`,
        corBotao: '#10B981',

        // Footer
        textoFooter: `Sistema de ${SYSTEM_NAME} - ${new Date().getFullYear()}`
    }
});

/**
 * Template de recuperação de senha
 * @param {Object} data - { email, nome, token }
 */
export const emailRecuperacaoSenha = (data) => ({
    to: data.email,
    subject: `Recuperação de Senha - ${SYSTEM_NAME}`,
    template: 'generico',
    data: {
        // Header
        mostrarHeader: true,
        logoUrl: LOGO_URL,
        corPrimaria: '#EF4444',
        nomeSistema: SYSTEM_NAME,

        // Conteúdo
        nome: data.nome,
        titulo: 'Recuperação de Senha',
        mensagem: `Recebemos uma solicitação para recuperar a senha da sua conta.<br><br>
            <strong>Se foi você</strong>, clique no botão abaixo para redefinir sua senha. 
            Você será direcionado para uma página segura onde poderá criar uma nova senha.<br><br>
            <strong>Se você não fez essa solicitação</strong>, pode ignorar este e-mail com segurança. 
            Sua senha atual permanecerá ativa e nenhuma alteração será feita.`,
        textoDestaque: '⚠️ <strong>Importante:</strong> Este link expira em 1 hora por segurança.',

        // Botão de ação
        mostrarBotao: true,
        textoBotao: 'Redefinir Minha Senha',
        urlBotao: `${FRONTEND_URL}/redefinir-senha/${data.token}`,
        corBotao: '#EF4444',

        // Footer
        textoFooter: `Sistema de ${SYSTEM_NAME} - ${new Date().getFullYear()}`
    }
});

/**
 * Template de confirmação de alteração de senha
 * @param {Object} data - { email, nome }
 */
export const emailConfirmacaoSenhaAlterada = (data) => ({
    to: data.email,
    subject: `Senha Alterada - ${SYSTEM_NAME}`,
    template: 'generico',
    data: {
        // Header
        mostrarHeader: true,
        logoUrl: LOGO_URL,
        corPrimaria: '#10B981',
        nomeSistema: SYSTEM_NAME,

        // Conteúdo
        titulo: 'Senha alterada com sucesso!',
        nome: data.nome,
        mensagem: `Sua senha foi alterada com sucesso.<br><br>
            Se você não realizou esta alteração, entre em contato conosco imediatamente.`,
        textoDestaque: `Data e hora: <strong>${new Date().toLocaleString('pt-BR')}</strong>`,

        // Botão de ação
        mostrarBotao: true,
        textoBotao: 'Acessar Sistema',
        urlBotao: `${FRONTEND_URL}/login`,
        corBotao: '#10B981',

        // Footer
        textoFooter: `Sistema de ${SYSTEM_NAME} - ${new Date().getFullYear()}`
    }
});

/**
 * Template de notificação de movimentação de estoque
 * @param {Object} data - { email, responsavel, produto, tipo, quantidade, movimentacaoId }
 */
export const emailMovimentacaoEstoque = (data) => {
    const tipoEmoji = data.tipo === 'entrada' ? 'Entrada' : 'Saída';
    const corTipo = data.tipo === 'entrada' ? '#10B981' : '#EF4444';

    return {
        to: data.email,
        subject: `Movimentacao de Estoque - ${data.produto}`,
        template: 'generico',
        data: {
            // Header
            mostrarHeader: true,
            nomeSistema: SYSTEM_NAME,
            corPrimaria: corTipo,

            // Conteúdo
            titulo: `${tipoEmoji} de Estoque`,
            nome: data.responsavel,
            mensagem: `Uma <strong>${data.tipo}</strong> foi registrada no sistema.`,

            // Dados da movimentação
            dados: [
                { label: 'Produto', valor: data.produto },
                { label: 'Tipo', valor: data.tipo.toUpperCase() },
                { label: 'Quantidade', valor: data.quantidade },
                { label: 'Data/Hora', valor: new Date().toLocaleString('pt-BR') }
            ],

            // Botão de ação
            mostrarBotao: true,
            textoBotao: 'Ver Detalhes',
            urlBotao: `${FRONTEND_URL}/movimentacoes/${data.movimentacaoId}`,
            corBotao: corTipo,

            // Footer
            textoFooter: `Sistema de ${SYSTEM_NAME} - ${new Date().getFullYear()}`
        }
    };
};

/**
 * Template de alerta de estoque baixo
 * @param {Object} data - { email, responsavel, produto, quantidadeAtual, estoqueMinimo, produtoId }
 */
export const emailAlertaEstoqueBaixo = (data) => ({
    to: data.email,
    subject: `Alerta: Estoque Baixo - ${data.produto}`,
    template: 'generico',
    data: {
        // Header
        mostrarHeader: true,
        nomeSistema: SYSTEM_NAME,
        corPrimaria: '#F59E0B',

        // Conteúdo
        titulo: 'Alerta de Estoque Baixo',
        nome: data.responsavel,
        mensagem: `O produto <strong>${data.produto}</strong> está com estoque baixo e precisa de reposição urgente.`,
        textoDestaque: `Estoque atual: <strong>${data.quantidadeAtual}</strong> | Estoque mínimo: <strong>${data.estoqueMinimo}</strong>`,

        // Botão de ação
        mostrarBotao: true,
        textoBotao: 'Ver Produto',
        urlBotao: `${FRONTEND_URL}/produtos/${data.produtoId}`,
        corBotao: '#F59E0B',

        // Footer
        textoFooter: `Sistema de ${SYSTEM_NAME} - ${new Date().getFullYear()}`
    }
});

/**
 * Template genérico para notificações customizadas
 * @param {Object} data - { email, nome, titulo, mensagem, botao?: { texto, url } }
 */
export const emailGenerico = (data) => ({
    to: data.email,
    subject: data.subject || `Notificação - ${SYSTEM_NAME}`,
    template: 'generico',
    data: {
        // Header
        mostrarHeader: true,
        logoUrl: LOGO_URL,
        corPrimaria: COR_PRIMARIA,
        nomeSistema: SYSTEM_NAME,

        // Conteúdo
        titulo: data.titulo,
        nome: data.nome,
        mensagem: data.mensagem,
        textoDestaque: data.destaque || '',

        // Botão opcional
        mostrarBotao: !!data.botao,
        textoBotao: data.botao?.texto || 'Acessar Sistema',
        urlBotao: data.botao?.url || FRONTEND_URL,
        corBotao: data.botao?.cor || COR_PRIMARIA,

        // Footer
        textoFooter: `Sistema de ${SYSTEM_NAME} - ${new Date().getFullYear()}`
    }
});
