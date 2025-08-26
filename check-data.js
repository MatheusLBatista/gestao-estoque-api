// Script simples para verificar dados após setup
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Usuario from './src/models/Usuario.js';
import Grupo from './src/models/Grupo.js';
import bcrypt from 'bcrypt';

import { seedGrupos } from './src/seeds/seedGrupos.js';
import { seedRotas } from './src/seeds/seedRotas.js';
import { seedUsuarios } from './src/seeds/seedsUsuario.js';

async function checkData() {
    let mongoServer;
    try {
        console.log('🚀 Iniciando MongoDB em memória...');
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri);
        console.log('✅ Conectado ao MongoDB');

        console.log('📦 Executando seeds...');
        await seedRotas();
        await seedGrupos();
        await seedUsuarios();
        
        console.log('🔍 Verificando usuários criados...');
        const usuarios = await Usuario.find({});
        console.log(`Total de usuários: ${usuarios.length}`);
        
        for (const user of usuarios) {
            console.log(`- ${user.matricula}: ${user.nome_usuario} (${user.perfil}) - Ativo: ${user.ativo} - Senha definida: ${user.senha_definida}`);
        }
        
        console.log('🔍 Verificando grupos...');
        const grupos = await Grupo.find({});
        console.log(`Total de grupos: ${grupos.length}`);
        
        for (const grupo of grupos) {
            console.log(`- ${grupo.nome}: ${grupo.descricao}`);
        }
        
        console.log('🔍 Verificando usuário ADM0001...');
        const adminUser = await Usuario.findOne({ matricula: 'ADM0001' }).select('+senha +senha_definida');
        if (adminUser) {
            console.log('✅ Usuário admin encontrado:');
            console.log(`  - ID: ${adminUser._id}`);
            console.log(`  - Nome: ${adminUser.nome_usuario}`);
            console.log(`  - Email: ${adminUser.email}`);
            console.log(`  - Perfil: ${adminUser.perfil}`);
            console.log(`  - Ativo: ${adminUser.ativo}`);
            console.log(`  - Senha definida: ${adminUser.senha_definida}`);
            console.log(`  - Tem senha hash: ${!!adminUser.senha}`);
            
            if (adminUser.senha) {
                const isCorrectPassword = await bcrypt.compare('Admin@123', adminUser.senha);
                console.log(`  - Senha 'Admin@123' confere: ${isCorrectPassword}`);
            }
        } else {
            console.log('❌ Usuário admin não encontrado');
        }
        
    } catch (error) {
        console.error('💥 Erro:', error.message);
        console.error(error.stack);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        if (mongoServer) {
            await mongoServer.stop();
        }
        process.exit(0);
    }
}

checkData();
