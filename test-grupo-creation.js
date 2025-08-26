import request from 'supertest';
import IntegrationTestHelper from './tests/integration/helpers/IntegrationTestHelper.js';

async function testGrupoCreation() {
    const helper = new IntegrationTestHelper();
    
    try {
        console.log('🚀 Setup...');
        const app = await helper.setup();
        
        console.log('🔑 Obtendo token...');
        const token = await helper.getAdminToken();
        console.log('Token:', token ? 'presente' : 'ausente');
        
        console.log('🔍 Criando grupo...');
        const grupoData = {
            nome: 'Grupo Teste Debug',
            descricao: 'Descrição do grupo teste',
            ativo: true
        };

        const response = await request(app)
            .post('/api/grupos')
            .set('Authorization', `Bearer ${token}`)
            .send(grupoData);

        console.log('📝 Resposta criação grupo:');
        console.log('Status:', response.status);
        console.log('Body:', JSON.stringify(response.body, null, 2));
        
    } catch (error) {
        console.error('💥 Erro:', error.message);
    } finally {
        await helper.teardown();
        process.exit(0);
    }
}

testGrupoCreation();
