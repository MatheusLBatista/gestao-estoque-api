/**
 * Script para verificar permissões do usuário ADM0001 no banco
 */

import mongoose from 'mongoose';
import Usuario from './src/models/Usuario.js';
import Grupo from './src/models/Grupo.js';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://romeuunidacalphanautilos:seb9FuncxtVEMH4D@cluster0.adr2eez.mongodb.net/gerenciarEstoque');
        console.log('📊 Conectado ao MongoDB Atlas');
    } catch (error) {
        console.error('❌ Erro ao conectar no MongoDB:', error);
        process.exit(1);
    }
};

async function debugUserPermissions() {
    await connectDB();
    
    try {
        // 1. Buscar o usuário ADM0001
        console.log('🔍 Buscando usuário ADM0001...');
        const usuario = await Usuario.findOne({ matricula: 'ADM0001' }).populate('grupos');
        
        if (!usuario) {
            console.log('❌ Usuário ADM0001 não encontrado!');
            return;
        }
        
        console.log('✅ Usuário encontrado:');
        console.log('   📧 Email:', usuario.email);
        console.log('   🆔 Matrícula:', usuario.matricula);
        console.log('   👤 Nome:', usuario.nome_usuario);
        console.log('   👑 Grupos:', usuario.grupos?.map(g => g.nome).join(', ') || 'Nenhum');
        
        // 2. Verificar os grupos e suas permissões
        if (usuario.grupos && usuario.grupos.length > 0) {
            console.log('\n🛡️  Verificando permissões dos grupos:');
            
            for (const grupo of usuario.grupos) {
                console.log(`\n📋 Grupo: ${grupo.nome}`);
                console.log('   📊 Total de permissões:', grupo.permissoes?.length || 0);
                
                // Buscar especificamente a permissão de movimentacoes
                const permissaoMovimentacoes = grupo.permissoes?.find(p => p.rota === 'movimentacoes');
                
                if (permissaoMovimentacoes) {
                    console.log('\n✅ Permissão para movimentacoes encontrada:');
                    console.log('   🔍 GET (buscar):', permissaoMovimentacoes.buscar);
                    console.log('   📤 POST (enviar):', permissaoMovimentacoes.enviar);
                    console.log('   🔄 PUT (substituir):', permissaoMovimentacoes.substituir);
                    console.log('   ✏️  PATCH (modificar):', permissaoMovimentacoes.modificar);
                    console.log('   🗑️  DELETE (excluir):', permissaoMovimentacoes.excluir);
                } else {
                    console.log('\n❌ Permissão para movimentacoes NÃO encontrada neste grupo!');
                    
                    // Listar algumas permissões disponíveis
                    console.log('\n📋 Primeiras 5 permissões do grupo:');
                    grupo.permissoes?.slice(0, 5).forEach(perm => {
                        console.log(`   🛡️  ${perm.rota}`);
                    });
                }
            }
        }
        
        // 3. Verificar todas as rotas no banco
        console.log('\n🗃️  Verificando rotas disponíveis no banco...');
        const grupoAdmin = await Grupo.findOne({ nome: 'Administradores' });
        
        if (grupoAdmin) {
            console.log('✅ Grupo Administradores encontrado:');
            console.log('   📊 Total de permissões:', grupoAdmin.permissoes?.length || 0);
            
            const permMovimentacoes = grupoAdmin.permissoes?.find(p => p.rota === 'movimentacoes');
            if (permMovimentacoes) {
                console.log('\n✅ Grupo tem permissão para movimentacoes:');
                console.log('   🔍 GET:', permMovimentacoes.buscar);
                console.log('   📤 POST:', permMovimentacoes.enviar);
                console.log('   🔄 PUT:', permMovimentacoes.substituir);
                console.log('   ✏️  PATCH:', permMovimentacoes.modificar);
                console.log('   🗑️  DELETE:', permMovimentacoes.excluir);
            } else {
                console.log('\n❌ Grupo NÃO tem permissão para movimentacoes!');
                
                console.log('\n📋 Primeiras 10 permissões do grupo:');
                grupoAdmin.permissoes?.slice(0, 10).forEach(perm => {
                    console.log(`   🛡️  ${perm.rota} - GET: ${perm.buscar}`);
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar permissões:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n📊 Desconectado do MongoDB');
    }
}

// Executar debug
console.log('🚀 Iniciando debug de permissões...\n');
debugUserPermissions().then(() => {
    console.log('\n🏁 Debug concluído!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Erro inesperado:', error);
    process.exit(1);
});
