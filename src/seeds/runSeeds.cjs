// Script para executar seeds em processo separado
// Usado pelos testes de integração

const mongoose = require('mongoose');

async function runSeeds() {
    try {
        // Usar import dinâmico aqui funciona porque é um processo Node separado
        const { default: seedUsuario } = await import('./seedsUsuario.js');
        const { default: seedRotas } = await import('./seedRotas.js');  
        const { default: seedGrupos } = await import('./seedGrupos.js');
        
        console.log('🌱 Executando seedRotas...');
        await seedRotas();
        
        console.log('🌱 Executando seedGrupos...');
        await seedGrupos();
        
        console.log('🌱 Executando seedUsuario...');
        await seedUsuario();
        
        console.log('✅ Todas as seeds foram executadas com sucesso!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Erro ao executar seeds:', error);
        process.exit(1);
    }
}

// Verificar se o MongoDB está conectado
if (mongoose.connection.readyState === 1) {
    runSeeds();
} else {
    console.log('⚠️  MongoDB não conectado, seeds não podem ser executadas');
    process.exit(1);
}
