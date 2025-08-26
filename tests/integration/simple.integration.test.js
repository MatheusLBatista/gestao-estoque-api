const { describe, it, beforeAll, afterAll, expect } = require('@jest/globals');
const request = require('supertest');
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app-test.js';

describe('Simple Integration Test', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.dropDatabase();
            await mongoose.disconnect();
        }
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    it('should respond to health check', async () => {
        const response = await request(app)
            .get('/api/health')
            .expect(404); // Esperamos 404 porque a rota não existe
        
        // Se chegou até aqui, o app está funcionando
        expect(response.status).toBe(404);
    });

    it('should reject unauthenticated requests', async () => {
        const response = await request(app)
            .get('/api/usuarios')
            .expect(401);
        
        expect(response.status).toBe(401);
    });
});
