// Script para corrigir todos os testes que esperam array direto
// Substituir expect(response.body.data).toBeInstanceOf(Array) por estrutura de paginação

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testFiles = [
    'tests/integration/produto.integration.test.js',
    'tests/integration/usuario.integration.test.js',
    'tests/integration/movimentacao.integration.test.js',
    'tests/integration/fornecedor.integration.test.js',
    'tests/integration/grupo.integration.test.js'
];

const oldPattern = /expect\(response\.body\.data\)\.toBeInstanceOf\(Array\);/g;
const newCode = `// A resposta tem estrutura de paginação, então data.docs é o array
            expect(response.body.data).toHaveProperty('docs');
            expect(response.body.data.docs).toBeInstanceOf(Array);`;

testFiles.forEach(filePath => {
    const fullPath = path.join('c:', 'Shark', 'ADS', 'Code', 'gestao-de-estoque', filePath);
    
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        const originalContent = content;
        
        content = content.replace(oldPattern, newCode);
        
        if (content !== originalContent) {
            fs.writeFileSync(fullPath, content);
            console.log(`✅ Arquivo corrigido: ${filePath}`);
        } else {
            console.log(`ℹ️  Nenhuma alteração necessária: ${filePath}`);
        }
    } else {
        console.log(`❌ Arquivo não encontrado: ${filePath}`);
    }
});

console.log('\n🎉 Correção dos testes de array concluída!');
