// Script para corrigir o arquivo de teste de autenticação
import fs from 'fs';

const filePath = 'tests/integration/auth.integration.test.js';
let content = fs.readFileSync(filePath, 'utf8');

// Substituições principais
const replacements = [
    // Substituir email por matricula nos requests
    { from: /email: 'admin@teste\.com'/g, to: "matricula: 'ADM0001'" },
    { from: /email: 'invalid@teste\.com'/g, to: "matricula: 'INVALID001'" },
    { from: /email: 'naoexiste@teste\.com'/g, to: "matricula: 'NAOEXISTE'" },
    { from: /email: 'invalid-email'/g, to: "matricula: 'INVALID'" },
    
    // Substituir senhas para usar a correta das seeds
    { from: /senha: '123456'/g, to: "senha: 'Admin@123'" },
    { from: /senha: 'wrongpassword'/g, to: "senha: 'senhaerrada'" },
    
    // Ajustar mensagens de erro esperadas
    { from: /Credenciais inválidas/g, to: "Matrícula ou senha incorretos" },
    
    // Corrigir estrutura de resposta
    { from: /response\.body\.data\.user\.email/g, to: "response.body.usuario.matricula" },
    
    // Ajustar testes de recuperação de senha para usar matricula
    { from: /should send recovery email for valid user/g, to: "should send recovery for valid matricula" },
    { from: /should fail for non-existent email/g, to: "should fail for non-existent matricula" },
    { from: /should fail with invalid email format/g, to: "should fail with invalid matricula format" },
];

console.log('Corrigindo arquivo de autenticação...');

replacements.forEach((replacement, index) => {
    const before = content.length;
    content = content.replace(replacement.from, replacement.to);
    const after = content.length;
    const changes = content.match(replacement.from);
    console.log(`${index + 1}. ${replacement.from} -> ${replacement.to}: ${changes ? changes.length : 0} substituições`);
});

fs.writeFileSync(filePath, content);
console.log('✅ Arquivo corrigido com sucesso!');
