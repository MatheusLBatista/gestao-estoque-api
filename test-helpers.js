import request from 'supertest';
import IntegrationTestHelper from './tests/integration/helpers/IntegrationTestHelper.js';

async function testHelpers() {
    const helper = new IntegrationTestHelper();
    
    try {
        console.log('🚀 Iniciando setup...');
        const app = await helper.setup();
        
        console.log('🔍 Obtendo token admin...');
        const token = await helper.getAdminToken();
        console.log('✅ Token obtido:', token ? 'SIM' : 'NÃO');
        
        console.log('🔍 Criando fornecedor de teste...');
        const fornecedor = await helper.createTestFornecedor(token);
        console.log('✅ Fornecedor criado:', fornecedor ? fornecedor._id : 'FALHOU');
        
        if (fornecedor) {
            console.log('🔍 Criando produto de teste...');
            const produto = await helper.createTestProduto(token, fornecedor._id);
            console.log('✅ Produto criado:', produto ? produto._id : 'FALHOU');
        }
        
    } catch (error) {
        console.error('💥 Erro:', error.message);
    } finally {
        console.log('🧹 Limpando...');
        await helper.teardown();
        process.exit(0);
    }
}

testHelpers();
