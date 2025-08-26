// Debug script para testar login
import request from 'supertest';
import app from './src/app-test.js';
import IntegrationTestHelper from './tests/integration/helpers/IntegrationTestHelper.js';

const helper = new IntegrationTestHelper();

async function debugLogin() {
    try {
        console.log('🚀 Iniciando setup...');
        await helper.setup();
        
        console.log('🔍 Tentando fazer login...');
        const response = await request(app)
            .post('/auth/login')
            .send({ matricula: 'ADM0001', senha: 'Admin@123' });
        
        console.log('📝 Resposta do login:');
        console.log('Status:', response.status);
        console.log('Body:', JSON.stringify(response.body, null, 2));
        
        if (response.status === 200) {
            console.log('✅ Login bem-sucedido!');
            console.log('Token:', response.body.accessToken);
        } else {
            console.log('❌ Login falhou');
        }
        
    } catch (error) {
        console.error('💥 Erro:', error.message);
        console.error(error.stack);
    } finally {
        await helper.teardown();
        process.exit(0);
    }
}

debugLogin();
