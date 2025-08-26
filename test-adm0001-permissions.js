/**
 * Script para testar se o usuário ADM0001 tem acesso total a todas as rotas
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5011';

// Dados do usuário ADM0001
const adminCredentials = {
    matricula: 'ADM0001',
    senha: 'Admin@123'
};

async function testAdminPermissions() {
    try {
        console.log('🔑 Testando login do ADM0001...');
        
        // 1. Fazer login para obter o token
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, adminCredentials);
        
        if (loginResponse.status === 200 && loginResponse.data.accessToken) {
            console.log('✅ Login realizado com sucesso!');
            console.log('🎫 Token obtido:', loginResponse.data.accessToken.substring(0, 50) + '...');
            
            const token = loginResponse.data.accessToken;
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            
            // 2. Testar acesso a diferentes rotas
            const routesToTest = [
                { method: 'GET', url: '/api/produtos', name: 'Listar Produtos' },
                { method: 'GET', url: '/api/fornecedores', name: 'Listar Fornecedores' },
                { method: 'GET', url: '/api/usuarios', name: 'Listar Usuários' },
                { method: 'GET', url: '/api/grupos', name: 'Listar Grupos' },
                { method: 'GET', url: '/api/movimentacoes', name: 'Listar Movimentações' },
                { method: 'GET', url: '/api/logs', name: 'Listar Logs' },
                { method: 'GET', url: '/auth/me', name: 'Dados do Usuário Logado' }
            ];
            
            console.log('\n🧪 Testando acesso às rotas...');
            
            for (const route of routesToTest) {
                try {
                    const response = await axios({
                        method: route.method,
                        url: `${BASE_URL}${route.url}`,
                        headers: headers
                    });
                    
                    if (response.status >= 200 && response.status < 300) {
                        console.log(`✅ ${route.name}: ACESSO PERMITIDO (${response.status})`);
                    } else {
                        console.log(`⚠️  ${route.name}: Status ${response.status}`);
                    }
                } catch (error) {
                    if (error.response) {
                        if (error.response.status === 403) {
                            console.log(`❌ ${route.name}: ACESSO NEGADO (403 - Forbidden)`);
                        } else if (error.response.status === 401) {
                            console.log(`❌ ${route.name}: NÃO AUTORIZADO (401 - Unauthorized)`);
                        } else {
                            console.log(`⚠️  ${route.name}: Erro ${error.response.status} - ${error.response.statusText}`);
                        }
                    } else {
                        console.log(`❌ ${route.name}: Erro de conexão - ${error.message}`);
                    }
                }
            }
            
            // 3. Verificar dados do usuário logado
            try {
                const userResponse = await axios.get(`${BASE_URL}/auth/me`, { headers });
                console.log('\n👤 Dados do usuário logado:');
                console.log('   📧 Email:', userResponse.data.usuario?.email);
                console.log('   🆔 Matrícula:', userResponse.data.usuario?.matricula);
                console.log('   👑 Grupo:', userResponse.data.usuario?.grupo?.nome);
                console.log('   🔐 Permissões:', userResponse.data.usuario?.grupo?.permissoes?.length || 0, 'rotas');
                
                if (userResponse.data.usuario?.grupo?.permissoes) {
                    console.log('\n📋 Algumas permissões do grupo:');
                    userResponse.data.usuario.grupo.permissoes.slice(0, 5).forEach(perm => {
                        const methods = [];
                        if (perm.get) methods.push('GET');
                        if (perm.post) methods.push('POST');
                        if (perm.put) methods.push('PUT');
                        if (perm.patch) methods.push('PATCH');
                        if (perm.delete) methods.push('DELETE');
                        console.log(`   🛡️  ${perm.rota}: [${methods.join(', ')}]`);
                    });
                    
                    if (userResponse.data.usuario.grupo.permissoes.length > 5) {
                        console.log(`   ... e mais ${userResponse.data.usuario.grupo.permissoes.length - 5} permissões`);
                    }
                }
                
            } catch (error) {
                console.log('❌ Erro ao obter dados do usuário:', error.response?.status || error.message);
            }
            
        } else {
            console.log('❌ Falha no login. Resposta:', loginResponse.data);
        }
        
    } catch (error) {
        console.log('❌ Erro no login:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('💡 Verifique se as credenciais do ADM0001 estão corretas:');
            console.log('   🆔 Matrícula:', adminCredentials.matricula);
            console.log('   🔑 Senha: Admin@123');
            console.log('   💭 Certifique-se de que as seeds foram executadas: npm run seed');
        }
    }
}

// Executar teste
console.log('🚀 Iniciando teste de permissões do ADM0001...\n');
testAdminPermissions().then(() => {
    console.log('\n🏁 Teste concluído!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Erro inesperado:', error);
    process.exit(1);
});
