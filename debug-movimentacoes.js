/**
 * Script para debuggar especificamente o problema com a rota de movimentações
 */

import axios from 'axios';
import mongoose from 'mongoose';

const BASE_URL = 'http://localhost:5011';

// Dados do usuário ADM0001
const adminCredentials = {
    matricula: 'ADM0001',
    senha: 'Admin@123'
};

// Configuração de conexão com MongoDB (usando as mesmas configurações do projeto)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gestao-estoque';

async function debugMovimentacoesPermission() {
    try {
        console.log('🔍 Debug detalhado da permissão de movimentações...\n');

        // 1. Conectar ao MongoDB para verificar os dados diretamente
        console.log('📊 Conectando ao MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado ao MongoDB\n');

        // 2. Verificar o usuário ADM0001 no banco
        const Usuario = mongoose.model('Usuario', new mongoose.Schema({}, { strict: false }));
        const Grupo = mongoose.model('Grupo', new mongoose.Schema({}, { strict: false }));
        const Rota = mongoose.model('Rota', new mongoose.Schema({}, { strict: false }));

        console.log('👤 Verificando usuário ADM0001...');
        const usuario = await Usuario.findOne({ matricula: 'ADM0001' }).populate('grupos');
        
        if (!usuario) {
            console.log('❌ Usuário ADM0001 não encontrado!');
            return;
        }
        
        console.log('✅ Usuário encontrado:');
        console.log('   🆔 ID:', usuario._id);
        console.log('   📧 Email:', usuario.email);
        console.log('   👑 Grupos:', usuario.grupos?.map(g => g.nome) || 'Nenhum');
        console.log('   🔐 Permissões individuais:', usuario.permissoes?.length || 0);

        // 3. Verificar o grupo Administradores
        if (usuario.grupos && usuario.grupos.length > 0) {
            for (const grupo of usuario.grupos) {
                console.log(`\\n🏷️  Grupo: ${grupo.nome}`);
                console.log('   ✅ Ativo:', grupo.ativo);
                console.log('   🔐 Permissões:', grupo.permissoes?.length || 0);
                
                if (grupo.permissoes) {
                    const movPermissao = grupo.permissoes.find(p => p.rota === 'movimentacoes');
                    if (movPermissao) {
                        console.log('   📋 Permissão de movimentações encontrada:');
                        console.log('      🔍 Buscar (GET):', movPermissao.buscar);
                        console.log('      📤 Enviar (POST):', movPermissao.enviar);
                        console.log('      🔄 Substituir (PUT):', movPermissao.substituir);
                        console.log('      ✏️  Modificar (PATCH):', movPermissao.modificar);
                        console.log('      🗑️  Excluir (DELETE):', movPermissao.excluir);
                        console.log('      ✅ Ativo:', movPermissao.ativo);
                        console.log('      🌐 Domínio:', movPermissao.dominio);
                    } else {
                        console.log('   ❌ Permissão de movimentações NÃO encontrada no grupo!');
                    }
                }
            }
        }

        // 4. Verificar a rota movimentações no banco
        console.log('\\n🛣️  Verificando rota movimentações...');
        const rotaMovimentacoes = await Rota.findOne({ rota: 'movimentacoes', dominio: 'localhost' });
        
        if (rotaMovimentacoes) {
            console.log('✅ Rota encontrada:');
            console.log('   ✅ Ativa:', rotaMovimentacoes.ativo);
            console.log('   🔍 Buscar (GET):', rotaMovimentacoes.buscar);
            console.log('   📤 Enviar (POST):', rotaMovimentacoes.enviar);
            console.log('   🔄 Substituir (PUT):', rotaMovimentacoes.substituir);
            console.log('   ✏️  Modificar (PATCH):', rotaMovimentacoes.modificar);
            console.log('   🗑️  Excluir (DELETE):', rotaMovimentacoes.excluir);
        } else {
            console.log('❌ Rota movimentações não encontrada no banco!');
        }

        // 5. Testar login na API
        console.log('\\n🔑 Testando login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, adminCredentials);
        
        if (loginResponse.status === 200 && loginResponse.data.accessToken) {
            console.log('✅ Login realizado com sucesso!');
            const token = loginResponse.data.accessToken;
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // 6. Testar acesso à rota de movimentações com logs detalhados
            console.log('\\n🧪 Testando acesso à rota de movimentações...');
            try {
                const response = await axios.get(`${BASE_URL}/api/movimentacoes`, { headers });
                console.log('✅ Sucesso! Status:', response.status);
                console.log('📊 Dados retornados:', response.data?.length || 0, 'movimentações');
            } catch (error) {
                console.log('❌ Erro ao acessar movimentações:');
                console.log('   Status:', error.response?.status);
                console.log('   Mensagem:', error.response?.data?.message || error.message);
                console.log('   Detalhes:', error.response?.data);
            }

            // 7. Comparar com outras rotas que funcionam
            console.log('\\n🔄 Comparando com rota de produtos (que funciona)...');
            try {
                const response = await axios.get(`${BASE_URL}/api/produtos`, { headers });
                console.log('✅ Produtos - Sucesso! Status:', response.status);
            } catch (error) {
                console.log('❌ Produtos - Erro:', error.response?.status, error.response?.data?.message);
            }
        }

        await mongoose.disconnect();
        console.log('\\n🔌 Desconectado do MongoDB');

    } catch (error) {
        console.error('💥 Erro:', error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
}

// Executar debug
debugMovimentacoesPermission().then(() => {
    console.log('\\n🏁 Debug concluído!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Erro inesperado:', error);
    process.exit(1);
});
