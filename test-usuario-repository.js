/**
 * Script para testar diretamente o usuarioRepository
 */

import mongoose from 'mongoose';
import UsuarioRepository from './src/repositories/usuarioRepository.js';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://romeuunidacalphanautilos:seb9FuncxtVEMH4D@cluster0.adr2eez.mongodb.net/gerenciarEstoque');
        console.log('📊 Conectado ao MongoDB Atlas');
    } catch (error) {
        console.error('❌ Erro ao conectar no MongoDB:', error);
        process.exit(1);
    }
};

async function testUsuarioRepository() {
    await connectDB();
    
    try {
        const usuarioRepository = new UsuarioRepository();
        
        console.log('🔍 Testando usuarioRepository.buscarPorMatricula("ADM0001")...');
        
        const usuario = await usuarioRepository.buscarPorMatricula('ADM0001', '+senha +senha_definida');
        
        if (usuario) {
            console.log('✅ Usuário encontrado:');
            console.log('   🆔 ID:', usuario._id.toString());
            console.log('   📧 Email:', usuario.email);
            console.log('   👤 Nome:', usuario.nome_usuario);
            console.log('   🔑 Matrícula:', usuario.matricula);
            console.log('   👑 Perfil:', usuario.perfil);
            console.log('   🔒 Senha definida:', usuario.senha_definida);
            console.log('   🟢 Ativo:', usuario.ativo);
        } else {
            console.log('❌ Usuário não encontrado pelo repository');
        }
        
    } catch (error) {
        console.error('❌ Erro ao testar repository:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n📊 Desconectado do MongoDB');
    }
}

// Executar teste
console.log('🚀 Iniciando teste do usuarioRepository...\n');
testUsuarioRepository().then(() => {
    console.log('\n🏁 Teste concluído!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Erro inesperado:', error);
    process.exit(1);
});
