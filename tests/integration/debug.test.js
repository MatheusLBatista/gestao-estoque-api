const IntegrationTestHelper = require('./helpers/IntegrationTestHelper.cjs');

describe('Debug Test', () => {
    const helper = new IntegrationTestHelper();

    beforeAll(async () => {
        console.log('🚀 Iniciando setup do teste...');
        try {
            await helper.setupDatabase();
            console.log('✅ Setup completado com sucesso');
        } catch (error) {
            console.error('❌ Erro no setup:', error);
            throw error;
        }
    }, 30000); // 30 seconds timeout

    afterAll(async () => {
        console.log('🧹 Iniciando teardown do teste...');
        try {
            await helper.teardownDatabase();
            console.log('✅ Teardown completado com sucesso');
        } catch (error) {
            console.error('❌ Erro no teardown:', error);
        }
    }, 15000); // 15 seconds timeout

    it('should login successfully', async () => {
        try {
            console.log('🔐 Tentando fazer login...');
            const result = await helper.login();
            console.log('✅ Login realizado com sucesso:', result);
            expect(result).toBeDefined();
            expect(result.accessToken).toBeDefined();
        } catch (error) {
            console.error('❌ Erro no login:', error);
            throw error;
        }
    }, 10000); // 10 seconds timeout
});
