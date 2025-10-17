// Script para executar seeds em processo separado
// Usado pelos testes de integração

const mongoose = require('mongoose');

async function runSeeds() {
    try {
        console.log('🚀 Iniciando execução de seeds...');
        
        // Usar import dinâmico aqui funciona porque é um processo Node separado
        const { default: seedRotas } = await import('./seedRotas.js');  
        const { default: seedGrupos } = await import('./seedGrupos.js');
        const { default: seedUsuario } = await import('./seedsUsuario.js');
        
        console.log('🛤️  Executando seed de rotas...');
        await seedRotas();
        
        console.log('👥 Executando seed de grupos...');
        await seedGrupos();
        
        console.log('👤 Executando seed de usuários...');
        const usuarios = await seedUsuario();
        
        console.log('✅ Todas as seeds foram executadas com sucesso!');
        console.log(`📊 Total de usuários criados: ${usuarios.length}`);
        console.log('🎯 Usuários principais: Admin, Gerente e Estoquista prontos para uso!');
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
