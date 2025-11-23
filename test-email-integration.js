/**
 * Script de Teste - Integração Mailsender
 * 
 * Execute com: node test-email-integration.js
 * 
 * Certifique-se de que:
 * 1. O mailsender está rodando (porta 5015)
 * 2. As variáveis de ambiente estão configuradas
 * 3. Você tem uma API Key válida
 */

import 'dotenv/config';
import { enviarEmail } from './src/utils/mailClient.js';
import { 
    emailBoasVindas, 
    emailRecuperacaoSenha, 
    emailConfirmacaoSenhaAlterada,
    emailMovimentacaoEstoque,
    emailAlertaEstoqueBaixo,
    emailGenerico 
} from './src/utils/templates/emailTemplates.js';

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

const EMAIL_TESTE = process.env.EMAIL_TESTE || 'lucca.f.livino@gmail.com';

console.log(`\n${colors.blue}========================================${colors.reset}`);
console.log(`${colors.blue}  Teste de Integração - Mailsender-TS  ${colors.reset}`);
console.log(`${colors.blue}========================================${colors.reset}\n`);

console.log('Verificando configurações...\n');
console.log(`URL Mailsender: ${colors.yellow}${process.env.URL_MAIL_SERVICE || 'NÃO CONFIGURADO'}${colors.reset}`);
console.log(`API Key: ${colors.yellow}${process.env.MAIL_API_KEY ? '✓ Configurada' : '✗ NÃO CONFIGURADA'}${colors.reset}`);
console.log(`Email de teste: ${colors.yellow}${EMAIL_TESTE}${colors.reset}\n`);

if (!process.env.URL_MAIL_SERVICE || !process.env.MAIL_API_KEY) {
    console.log(`${colors.red}Erro: Configure URL_MAIL_SERVICE e MAIL_API_KEY no .env${colors.reset}\n`);
    process.exit(1);
}

async function testarTemplate(nome, emailData) {
    try {
        console.log(`\nTestando: ${colors.blue}${nome}${colors.reset}`);
        console.log(`   Para: ${emailData.to}`);
        console.log(`   Assunto: ${emailData.subject}`);
        
        const resultado = await enviarEmail(emailData);
        
        if (resultado.success) {
            console.log(`   ${colors.green}✓ Email enviado com sucesso!${colors.reset}`);
            return true;
        } else {
            console.log(`   ${colors.red}✗ Falha: ${resultado.error}${colors.reset}`);
            return false;
        }
    } catch (erro) {
        console.log(`   ${colors.red}✗ Erro: ${erro.message}${colors.reset}`);
        return false;
    }
}

async function executarTestes() {
    const resultados = {
        sucesso: 0,
        falha: 0
    };

    console.log(`\n${colors.blue}Iniciando testes...${colors.reset}\n`);

    // Teste 1: Email de Boas-Vindas
    const teste1 = await testarTemplate(
        'Email de Boas-Vindas',
        emailBoasVindas({
            email: EMAIL_TESTE,
            nome: 'Usuário Teste',
            token: 'token-exemplo-123'
        })
    );
    teste1 ? resultados.sucesso++ : resultados.falha++;
    await esperar(2000);

    // Teste 2: Email de Recuperação de Senha
    const teste2 = await testarTemplate(
        'Email de Recuperação de Senha',
        emailRecuperacaoSenha({
            email: EMAIL_TESTE,
            nome: 'Usuário Teste',
            token: 'token-recuperacao-456'
        })
    );
    teste2 ? resultados.sucesso++ : resultados.falha++;
    await esperar(2000);

    // Teste 3: Email de Confirmação de Senha Alterada
    const teste3 = await testarTemplate(
        'Email de Confirmação de Senha Alterada',
        emailConfirmacaoSenhaAlterada({
            email: EMAIL_TESTE,
            nome: 'Usuário Teste'
        })
    );
    teste3 ? resultados.sucesso++ : resultados.falha++;
    await esperar(2000);

    // Teste 4: Email de Movimentação de Estoque
    const teste4 = await testarTemplate(
        'Email de Movimentação de Estoque',
        emailMovimentacaoEstoque({
            email: EMAIL_TESTE,
            responsavel: 'Usuário Teste',
            produto: 'Notebook Dell Inspiron',
            tipo: 'entrada',
            quantidade: 10,
            movimentacaoId: 'mov123'
        })
    );
    teste4 ? resultados.sucesso++ : resultados.falha++;
    await esperar(2000);

    // Teste 5: Email de Alerta de Estoque Baixo
    const teste5 = await testarTemplate(
        'Email de Alerta de Estoque Baixo',
        emailAlertaEstoqueBaixo({
            email: EMAIL_TESTE,
            responsavel: 'Usuário Teste',
            produto: 'Mouse USB',
            quantidadeAtual: 2,
            estoqueMinimo: 10,
            produtoId: 'prod123'
        })
    );
    teste5 ? resultados.sucesso++ : resultados.falha++;
    await esperar(2000);

    // Teste 6: Email Genérico
    const teste6 = await testarTemplate(
        'Email Genérico',
        emailGenerico({
            email: EMAIL_TESTE,
            subject: 'Notificação de Teste',
            nome: 'Usuário Teste',
            titulo: 'Sistema de Teste',
            mensagem: 'Este é um email genérico de teste da integração.',
            destaque: 'Todos os sistemas estão funcionando corretamente.',
            botao: {
                texto: 'Acessar Sistema',
                url: 'http://localhost:3000',
                cor: '#4F46E5'
            }
        })
    );
    teste6 ? resultados.sucesso++ : resultados.falha++;

    // Resultados finais
    console.log(`\n${colors.blue}========================================${colors.reset}`);
    console.log(`${colors.blue}           Resultados dos Testes        ${colors.reset}`);
    console.log(`${colors.blue}========================================${colors.reset}\n`);
    
    console.log(`${colors.green}✓ Sucessos: ${resultados.sucesso}${colors.reset}`);
    console.log(`${colors.red}✗ Falhas: ${resultados.falha}${colors.reset}`);
    
    const total = resultados.sucesso + resultados.falha;
    const porcentagem = ((resultados.sucesso / total) * 100).toFixed(0);
    
    console.log(`\nTaxa de sucesso: ${porcentagem}%\n`);

    if (resultados.falha === 0) {
        console.log(`${colors.green}Todos os testes passaram! Integração funcionando perfeitamente.${colors.reset}\n`);
    } else {
        console.log(`${colors.yellow}Alguns testes falharam. Verifique os logs acima.${colors.reset}\n`);
    }
}

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Executar testes
executarTestes().catch(erro => {
    console.error(`\n${colors.red}Erro fatal:${colors.reset}`, erro);
    process.exit(1);
});
