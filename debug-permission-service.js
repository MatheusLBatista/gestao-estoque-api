/**
 * Script para debugar especificamente o PermissionService
 */

import mongoose from 'mongoose';
import PermissionService from './src/services/PermissionService.js';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://romeuunidacalphanautilos:seb9FuncxtVEMH4D@cluster0.adr2eez.mongodb.net/gerenciarEstoque');
        console.log('📊 Conectado ao MongoDB Atlas');
    } catch (error) {
        console.error('❌ Erro ao conectar no MongoDB:', error);
        process.exit(1);
    }
};

async function debugPermissionService() {
    await connectDB();
    
    try {
        const permissionService = new PermissionService();
        
        // Simular exatamente o que o middleware está fazendo
        const userId = '68757430ccf588406dfe8aac'; // ID do ADM0001 do login
        const rota = 'movimentacoes';
        const dominio = 'localhost';
        const metodo = 'buscar'; // GET
        
        console.log('🧪 Testando PermissionService com os seguintes parâmetros:');
        console.log('   👤 userId:', userId);
        console.log('   🛣️  rota:', rota);
        console.log('   🌐 dominio:', dominio);
        console.log('   🔧 método:', metodo);
        
        console.log('\n🔍 Chamando permissionService.hasPermission()...');
        
        const hasPermission = await permissionService.hasPermission(
            userId,
            rota,
            dominio,
            metodo
        );
        
        console.log('\n📊 Resultado:', hasPermission ? '✅ TEM PERMISSÃO' : '❌ NÃO TEM PERMISSÃO');
        
        // Vamos também verificar se conseguimos obter o usuário diretamente
        console.log('\n🔍 Verificando se conseguimos encontrar o usuário...');
        const Usuario = (await import('./src/models/Usuario.js')).default;
        const usuario = await Usuario.findById(userId).populate('grupos');
        
        if (usuario) {
            console.log('✅ Usuário encontrado:');
            console.log('   📧 Email:', usuario.email);
            console.log('   🆔 Matrícula:', usuario.matricula);
            console.log('   👑 Grupos:', usuario.grupos?.map(g => g.nome).join(', ') || 'Nenhum');
            
            if (usuario.grupos && usuario.grupos.length > 0) {
                const grupo = usuario.grupos[0];
                console.log('\n📋 Primeiro grupo - permissões:');
                console.log('   📊 Total:', grupo.permissoes?.length || 0);
                
                const permMovimentacoes = grupo.permissoes?.find(p => p.rota === 'movimentacoes');
                if (permMovimentacoes) {
                    console.log('   🛡️  Permissão movimentacoes:');
                    console.log('     - rota:', permMovimentacoes.rota);
                    console.log('     - dominio:', permMovimentacoes.dominio);
                    console.log('     - ativo:', permMovimentacoes.ativo);
                    console.log('     - buscar:', permMovimentacoes.buscar);
                } else {
                    console.log('   ❌ Permissão movimentacoes não encontrada');
                }
            }
        } else {
            console.log('❌ Usuário não encontrado com ID:', userId);
        }
        
    } catch (error) {
        console.error('❌ Erro ao debugar PermissionService:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n📊 Desconectado do MongoDB');
    }
}

// Executar debug
console.log('🚀 Iniciando debug do PermissionService...\n');
debugPermissionService().then(() => {
    console.log('\n🏁 Debug concluído!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Erro inesperado:', error);
    process.exit(1);
});
