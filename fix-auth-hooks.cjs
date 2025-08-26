const fs = require('fs');
const path = require('path');

const authTestFile = '/Users/ruanlopes/Documents/gestao-de-estoque/tests/integration/endpoints/auth.endpoints.test.js';

// Ler o arquivo
let content = fs.readFileSync(authTestFile, 'utf8');

// Remover todos os beforeEach incorretos que foram adicionados dentro dos testes
const beforeEachPattern = /\s*beforeEach\(async \(\) => \{\s*\/\/ Garantir que as dependências existam[\s\S]*?\}\);\s*/g;

content = content.replace(beforeEachPattern, '');

// Também remover beforeEach que estão dentro de outros beforeEach
const nestedBeforeEachPattern = /(\s*beforeEach\(async \(\) => \{[\s\S]*?)(\s*beforeEach\(async \(\) => \{[\s\S]*?\}\);\s*)([\s\S]*?\}\);)/g;

content = content.replace(nestedBeforeEachPattern, '$1$3');

// Escrever o arquivo corrigido
fs.writeFileSync(authTestFile, content);

console.log('Arquivo auth.endpoints.test.js limpo de hooks incorretos');
