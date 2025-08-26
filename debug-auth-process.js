/**
 * Script para debugar o processo de autenticação completo
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UsuarioRepository from './src/repositories/usuarioRepository.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://romeuunidacalphanautilos:seb9FuncxtVEMH4D@cluster0.adr2eez.mongodb.net/gerenciarEstoque');
        console.log('📊 Conectado ao MongoDB Atlas');
    } catch (error) {
        console.error('❌ Erro ao conectar no MongoDB:', error);
        process.exit(1);
    }
};

async function debugAuthProcess() {
    await connectDB();
    
    try {
        const usuarioRepository = new UsuarioRepository();
        const matricula = 'ADM0001';
        const senha = 'Admin@123';
        
        console.log('🔍 Passo 1: Buscar usuário por matrícula...');
        const usuario = await usuarioRepository.buscarPorMatricula(matricula, '+senha +senha_definida');
        
        if (!usuario) {
            console.log('❌ Usuário não encontrado');
            return;
        }
        
        console.log('✅ Usuário encontrado:');
        console.log('   🆔 ID real:', usuario._id.toString());
        console.log('   📧 Email:', usuario.email);
        console.log('   👤 Nome:', usuario.nome_usuario);
        console.log('   🔑 Matrícula:', usuario.matricula);
        console.log('   🟢 Ativo:', usuario.ativo);
        console.log('   🔒 Senha definida:', usuario.senha_definida);
        
        console.log('\n🔍 Passo 2: Verificar senha...');
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        console.log('   ✅ Senha:', senhaCorreta ? 'CORRETA' : 'INCORRETA');
        
        if (!senhaCorreta) {
            console.log('❌ Senha incorreta, abortando...');
            return;
        }
        
        console.log('\n🔍 Passo 3: Gerar token de acesso...');
        const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
        
        const accessToken = jwt.sign(
            {
                id: usuario._id,
                matricula: usuario.matricula,
                perfil: usuario.perfil
            },
            ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );
        
        console.log('   🎫 Token gerado:', accessToken.substring(0, 50) + '...');
        
        console.log('\n🔍 Passo 4: Decodificar token para verificar ID...');
        const decoded = jwt.decode(accessToken);
        console.log('   🆔 ID no token:', decoded.id);
        console.log('   🔑 Matrícula no token:', decoded.matricula);
        console.log('   👑 Perfil no token:', decoded.perfil);
        
        console.log('\n🔍 Passo 5: Comparar IDs...');
        console.log('   🆔 ID do usuário (string):', usuario._id.toString());
        console.log('   🆔 ID no token (string):', decoded.id);
        console.log('   ✅ IDs são iguais:', usuario._id.toString() === decoded.id);
        
        console.log('\n🔍 Passo 6: Testar se o ID do token pode encontrar o usuário...');
        const usuarioTest = await usuarioRepository.buscarPorId(decoded.id);
        if (usuarioTest) {
            console.log('   ✅ Usuário encontrado pelo ID do token');
            console.log('   📧 Email:', usuarioTest.email);
        } else {
            console.log('   ❌ Usuário NÃO encontrado pelo ID do token');
        }
        
    } catch (error) {
        console.error('❌ Erro durante debug:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n📊 Desconectado do MongoDB');
    }
}

// Executar debug
console.log('🚀 Iniciando debug completo do processo de autenticação...\n');
debugAuthProcess().then(() => {
    console.log('\n🏁 Debug concluído!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Erro inesperado:', error);
    process.exit(1);
});
