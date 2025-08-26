import jwt from 'jsonwebtoken';
import authMiddleware, { permissaoMiddleware } from '../../src/middlewares/AuthMiddleware.js';
import Usuario from '../../src/models/Usuario.js';

// Mock do modelo Usuario
jest.mock('../../src/models/Usuario.js');

describe('AuthMiddleware', () => {
    let req, res, next;
    const mockToken = 'valid-token';
    const mockSecret = 'test-secret';

    beforeEach(() => {
        req = {
            headers: {},
            userId: null,
            userMatricula: null,
            userPerfil: null
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        
        // Mock do JWT_SECRET
        process.env.JWT_SECRET = mockSecret;
        
        // Reset dos mocks
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('authMiddleware', () => {
        test('deve retornar erro 401 quando não há Authorization header', async () => {
            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Token de autenticação não fornecido',
                type: 'authError'
            });
            expect(next).not.toHaveBeenCalled();
        });

        test('deve retornar erro 401 quando Authorization header não começa com Bearer', async () => {
            req.headers.authorization = 'Invalid token';

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Token de autenticação não fornecido',
                type: 'authError'
            });
            expect(next).not.toHaveBeenCalled();
        });

        test('deve retornar erro 401 quando usuário não é encontrado', async () => {
            const decoded = { id: 'user-id', matricula: '123', perfil: 'admin' };
            jest.spyOn(jwt, 'verify').mockReturnValue(decoded);
            
            // Mock do findById retornando null
            const mockFindById = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });
            Usuario.findById = mockFindById;

            req.headers.authorization = `Bearer ${mockToken}`;

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Usuário não encontrado',
                type: 'authError'
            });
            expect(next).not.toHaveBeenCalled();
        });

        test('deve retornar erro 401 quando token foi revogado', async () => {
            const decoded = { id: 'user-id', matricula: '123', perfil: 'admin' };
            const mockUser = { id: 'user-id', accesstoken: 'different-token' };
            
            jest.spyOn(jwt, 'verify').mockReturnValue(decoded);
            
            const mockFindById = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });
            Usuario.findById = mockFindById;

            req.headers.authorization = `Bearer ${mockToken}`;

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Token foi revogado ou é inválido',
                type: 'authError'
            });
            expect(next).not.toHaveBeenCalled();
        });

        test('deve autenticar usuário com sucesso quando token é válido', async () => {
            const decoded = { id: 'user-id', matricula: '123', perfil: 'admin' };
            const mockUser = { id: 'user-id', accesstoken: mockToken };
            
            jest.spyOn(jwt, 'verify').mockReturnValue(decoded);
            
            const mockFindById = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });
            Usuario.findById = mockFindById;

            req.headers.authorization = `Bearer ${mockToken}`;

            await authMiddleware(req, res, next);

            expect(req.userId).toBe(decoded.id);
            expect(req.userMatricula).toBe(decoded.matricula);
            expect(req.userPerfil).toBe(decoded.perfil);
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('deve retornar erro 401 quando token é inválido (jwt.verify falha)', async () => {
            jest.spyOn(jwt, 'verify').mockImplementation(() => {
                throw new Error('Token inválido');
            });

            req.headers.authorization = `Bearer invalid-token`;

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Token inválido ou expirado',
                type: 'authError'
            });
            expect(next).not.toHaveBeenCalled();
        });

        test('deve retornar erro 401 quando findById falha', async () => {
            const decoded = { id: 'user-id', matricula: '123', perfil: 'admin' };
            jest.spyOn(jwt, 'verify').mockReturnValue(decoded);
            
            const mockFindById = jest.fn().mockReturnValue({
                select: jest.fn().mockRejectedValue(new Error('Database error'))
            });
            Usuario.findById = mockFindById;

            req.headers.authorization = `Bearer ${mockToken}`;

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Token inválido ou expirado',
                type: 'authError'
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('permissaoMiddleware', () => {
        test('deve retornar erro 401 quando usuário não está autenticado', () => {
            const middleware = permissaoMiddleware(['admin']);
            
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Usuário não autenticado',
                type: 'authError'
            });
            expect(next).not.toHaveBeenCalled();
        });

        test('deve retornar erro 403 quando usuário não tem permissão', () => {
            req.userPerfil = 'usuario';
            const middleware = permissaoMiddleware(['admin']);
            
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Acesso negado. Perfil sem permissões suficientes',
                type: 'permissionError'
            });
            expect(next).not.toHaveBeenCalled();
        });

        test('deve permitir acesso quando usuário tem perfil correto', () => {
            req.userPerfil = 'admin';
            const middleware = permissaoMiddleware(['admin', 'gerente']);
            
            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('deve permitir acesso quando usuário tem um dos perfis permitidos', () => {
            req.userPerfil = 'gerente';
            const middleware = permissaoMiddleware(['admin', 'gerente']);
            
            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });
    });
});
