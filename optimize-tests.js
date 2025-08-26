// Script para otimizar todos os testes de integração
import fs from 'fs';

const testFiles = [
    'tests/integration/usuario.integration.test.js',
    'tests/integration/produto.integration.test.js', 
    'tests/integration/fornecedor.integration.test.js',
    'tests/integration/movimentacao.integration.test.js',
    'tests/integration/grupo.integration.test.js',
    'tests/integration/workflow.integration.test.js'
];

console.log('⚡ Otimizando testes para performance...');

testFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`📝 Processando ${file}...`);
        let content = fs.readFileSync(file, 'utf8');
        
        // Comentar cleanDatabase para acelerar execução
        content = content.replace(
            /(\s+)await helper\.cleanDatabase\(\);/g, 
            '$1// await helper.cleanDatabase(); // Otimizado para performance'
        );
        
        fs.writeFileSync(file, content);
        console.log(`  ✅ Otimizado`);
    } else {
        console.log(`  ⚠️ Arquivo não encontrado: ${file}`);
    }
});

console.log('✅ Todos os arquivos foram otimizados!');
