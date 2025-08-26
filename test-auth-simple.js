import request from 'supertest';
import IntegrationTestHelper from './tests/integration/helpers/IntegrationTestHelper.js';

async function testAuth() {
    const helper = new IntegrationTestHelper();
    
    try {
        console.log('🚀 Iniciando setup...');
        const app = await helper.setup();
        
        console.log('🔍 Testando login direto...');
        const response = await request(app)
            .post('/auth/login')
            .send({
                matricula: 'ADM0001',
                senha: 'Admin@123'
            });
        
        console.log('📝 Resposta do login:');
        console.log('Status:', response.status);
        console.log('Body:', JSON.stringify(response.body, null, 2));
        
        if (response.status === 200) {
            console.log('✅ Login funcionou!');
            const token = response.body.accessToken;
            
            console.log('🔍 Testando acesso a rota protegida...');
            const protectedResponse = await request(app)
                .get('/api/usuarios')
                .set('Authorization', `Bearer ${token}`);
            
            console.log('📝 Resposta da rota protegida:');
            console.log('Status:', protectedResponse.status);
            console.log('Body:', JSON.stringify(protectedResponse.body, null, 2));
            
            if (protectedResponse.status === 200) {
                console.log('✅ Rota protegida funcionou!');
            } else {
                console.log('❌ Rota protegida falhou');
            }
        } else {
            console.log('❌ Login falhou');
        }
        
    } catch (error) {
        console.error('💥 Erro:', error.message);
        if (error.stack) {
            console.error(error.stack);
        }
    } finally {
        console.log('🧹 Limpando...');
        await helper.teardown();
        process.exit(0);
    }
}

testAuth();
