// Script para corrigir TODOS os testes de integração
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testFiles = [
    'tests/integration/produto.integration.test.js',
    'tests/integration/usuario.integration.test.js', 
    'tests/integration/movimentacao.integration.test.js',
    'tests/integration/grupo.integration.test.js'
];

console.log('🔧 Corrigindo estruturas de resposta em todos os testes...');

testFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`📝 Processando ${file}...`);
        let content = fs.readFileSync(file, 'utf8');
        
        // Substituições para estrutura de paginação
        const replacements = [
            {
                from: /expect\(response\.body\.data\)\.toBeInstanceOf\(Array\)/g,
                to: 'expect(response.body.data.docs).toBeInstanceOf(Array)'
            },
            {
                from: /expect\(response\.body\.data\.length\)\.toBeGreaterThan\(0\)/g,
                to: 'expect(response.body.data.docs.length).toBeGreaterThan(0)'
            },
            {
                from: /expect\(response\.body\.data\[0\]\)/g,
                to: 'expect(response.body.data.docs[0])'
            },
            {
                from: /response\.body\.data\.length/g,
                to: 'response.body.data.docs.length'
            },
            {
                from: /response\.body\.data\[0\]/g,
                to: 'response.body.data.docs[0]'
            }
        ];
        
        let changesMade = 0;
        replacements.forEach(replacement => {
            const before = content;
            content = content.replace(replacement.from, replacement.to);
            if (content !== before) {
                const matches = before.match(replacement.from);
                if (matches) {
                    changesMade += matches.length;
                }
            }
        });
        
        fs.writeFileSync(file, content);
        console.log(`  ✅ ${changesMade} correções aplicadas`);
    } else {
        console.log(`  ⚠️ Arquivo não encontrado: ${file}`);
    }
});

console.log('✅ Todos os arquivos foram corrigidos!');
