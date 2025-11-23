import 'dotenv/config';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const LOGO_URL = process.env.LOGO_URL || '';
const COR_PRIMARIA = process.env.COR_PRIMARIA || '#4F46E5';
const SYSTEM_NAME = 'Gestão de Estoque';

/**
 * Template de boas-vindas para novo usuário
 * @param {Object} data - { email, nome, token }
 */
export const emailBoasVindas = (data) => ({
    to: data.email,
    subject: `Bem-vindo(a) ao ${SYSTEM_NAME}!`,
    template: 'generico',
    data: {
        // Header
        mostrarHeader: true,
        logoUrl: LOGO_URL,
        corPrimaria: COR_PRIMARIA,
        nomeSistema: SYSTEM_NAME,
        mostrarDivisor: true,

        // Conteúdo
        titulo: `Bem-vindo(a) ao ${SYSTEM_NAME}!`,
        nome: data.nome,
        mensagem: `Sua conta foi criada com sucesso e estamos felizes em ter você conosco.<br><br>
            Para seu primeiro acesso, só falta um passo: <strong>definir sua senha para poder acessar a plataforma!</strong><br><br>
            Clique no botão abaixo para começar.`,

        // Botão de ação
        mostrarBotao: true,
        textoBotao: 'Definir minha senha',
        urlBotao: `${FRONTEND_URL}/definir-senha/${data.token}`,
        corBotao: COR_PRIMARIA,

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
    subject: `Redefinição de Senha - ${SYSTEM_NAME}`,
    template: 'generico',
    data: {
        // Header
        mostrarHeader: true,
        logoUrl: LOGO_URL,
        corPrimaria: COR_PRIMARIA,
        nomeSistema: SYSTEM_NAME,

        // Conteúdo
        nome: data.nome,
        titulo: 'Redefina sua senha',
        mensagem: `Recebemos uma solicitação para redefinir a senha da sua conta.<br><br>
            Se foi você, clique no botão abaixo para criar uma nova senha. 
            Se você não fez essa solicitação, pode ignorar este e-mail com segurança.`,
        textoDestaque: 'Por segurança, este link expira em <strong>1 hora</strong>.',

        // Botão de ação
        mostrarBotao: true,
        textoBotao: 'Criar nova senha',
        urlBotao: `${FRONTEND_URL}/nova-senha/${data.token}`,
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
