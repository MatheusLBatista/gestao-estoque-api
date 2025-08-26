const { beforeAll, afterAll, beforeEach, describe, expect, it } = require('@jest/globals');
const request = require('supertest');
const IntegrationTestHelper = require('../helpers/IntegrationTestHelper.cjs');

describe('Debug Test', () => {
    let app;
    let helper;
    let authToken;

    beforeAll(async () => {
        helper = new IntegrationTestHelper();
        await helper.setup();
        app = await helper.getApp();
        authToken = await helper.getAdminToken();
    });

    afterAll(async () => {
        await helper.teardown();
    });

    it('should debug response structure', async () => {
        const response = await request(app)
            .get('/api/grupos?page=1&limit=5')
            .set('Authorization', `Bearer ${authToken}`);

        console.log('Status:', response.status);
        console.log('Response body:', JSON.stringify(response.body, null, 2));
        
        expect(response.status).toBe(200);
    });
});
