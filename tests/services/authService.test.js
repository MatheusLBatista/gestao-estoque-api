import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../src/services/AuthService.js';
import UsuarioRepository from '../../src/repositories/usuarioRepository.js';
import CustomError from '../../src/utils/helpers/CustomError.js';
import TokenUtil from '../../src/utils/TokenUtil.js';
import EmailService from '../../src/services/EmailService.js';

// Mock das dependências
jest.mock('../../src/repositories/usuarioRepository.js');
jest.mock('../../src/utils/helpers/CustomError.js');
jest.mock('../../src/utils/TokenUtil.js');
jest.mock('../../src/services/EmailService.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    let authService;
    let mockUsuarioRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockUsuarioRepository = {
            buscarPorMatricula: jest.fn(),
            buscarPorEmail: jest.fn(),
            buscarPorId: jest.fn(),
            atualizarTokenRecuperacao: jest.fn(),
            buscarPorCodigoRecuperacao: jest.fn(),
            atualizarSenha: jest.fn(),
            atualizarSenhaCompleta: jest.fn(),
            atualizar: jest.fn(),
            removeToken: jest.fn(),
            armazenarTokens: jest.fn(),
            setUserOnlineStatus: jest.fn(),
        };
        
        UsuarioRepository.mockImplementation(() => mockUsuarioRepository);
        
        authService = new AuthService();
        
        // Mock do process.env
        process.env.JWT_SECRET = 'test_secret';
        process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
        
        // Mock CustomError to behave like an Error
        CustomError.mockImplementation((options) => {
            const error = new Error(options.customMessage);
            error.statusCode = options.statusCode;
            error.errorType = options.errorType;
            return error;
        });
    });

    describe('constructor', () => {
        it('should initialize with correct properties', () => {
            expect(authService.usuarioRepository).toBeDefined();
            expect(authService.tokenUtil).toBe(TokenUtil);
            expect(authService.ACCESS_TOKEN_SECRET).toBeDefined();
            expect(authService.REFRESH_TOKEN_SECRET).toBeDefined();
            expect(authService.ACCESS_TOKEN_EXPIRY).toBe('1h');
            expect(authService.REFRESH_TOKEN_EXPIRY).toBe('7d');
        });

        it('should use default secrets when env vars not set', () => {
            delete process.env.JWT_SECRET;
            delete process.env.JWT_REFRESH_SECRET;
            
            const newAuthService = new AuthService();
            
            expect(newAuthService.ACCESS_TOKEN_SECRET).toBeDefined();
            expect(newAuthService.REFRESH_TOKEN_SECRET).toBeDefined();
        });
    });

    describe('autenticar', () => {
        it('should authenticate user successfully', async () => {
            const matricula = '12345';
            const senha = 'password123';
            const hashedPassword = 'hashedPassword';
            const mockUser = {
                _id: 'user_id',
                matricula,
                senha: hashedPassword,
                ativo: true,
                senha_definida: true,
                nome_usuario: 'Test User',
                email: 'test@example.com',
                perfil: 'user'
            };

            mockUsuarioRepository.buscarPorMatricula.mockResolvedValue(mockUser);
            mockUsuarioRepository.armazenarTokens.mockResolvedValue(true);
            mockUsuarioRepository.setUserOnlineStatus.mockResolvedValue(true);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');

            const result = await authService.autenticar(matricula, senha);

            expect(mockUsuarioRepository.buscarPorMatricula).toHaveBeenCalledWith(matricula, '+senha +senha_definida');
            expect(bcrypt.compare).toHaveBeenCalledWith(senha, hashedPassword);
            expect(mockUsuarioRepository.armazenarTokens).toHaveBeenCalled();
            expect(mockUsuarioRepository.setUserOnlineStatus).toHaveBeenCalledWith('user_id', true);
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result).toHaveProperty('usuario');
            expect(result.usuario).not.toHaveProperty('senha');
        });

        it('should throw error when user not found', async () => {
            const matricula = '12345';
            const senha = 'password123';

            mockUsuarioRepository.buscarPorMatricula.mockResolvedValue(null);

            await expect(authService.autenticar(matricula, senha)).rejects.toThrow('Matrícula ou senha incorretos');
        });

        it('should throw error when user is inactive', async () => {
            const matricula = '12345';
            const senha = 'password123';
            const mockUser = {
                _id: 'user_id',
                matricula,
                ativo: false,
                senha_definida: true
            };

            mockUsuarioRepository.buscarPorMatricula.mockResolvedValue(mockUser);

            await expect(authService.autenticar(matricula, senha)).rejects.toThrow('Usuário inativo');
        });

        it('should throw error when password not defined', async () => {
            const matricula = '12345';
            const senha = 'password123';
            const mockUser = {
                _id: 'user_id',
                matricula,
                ativo: true,
                senha_definida: false
            };

            mockUsuarioRepository.buscarPorMatricula.mockResolvedValue(mockUser);

            await expect(authService.autenticar(matricula, senha)).rejects.toThrow('Usuário ainda não definiu sua senha');
        });

        it('should throw error when senha field is missing', async () => {
            const matricula = '12345';
            const senha = 'password123';
            const mockUser = {
                _id: 'user_id',
                matricula,
                ativo: true,
                senha_definida: true,
                senha: null
            };

            mockUsuarioRepository.buscarPorMatricula.mockResolvedValue(mockUser);

            await expect(authService.autenticar(matricula, senha)).rejects.toThrow('Usuário ainda não definiu sua senha');
        });

        it('should throw error when password is incorrect', async () => {
            const matricula = '12345';
            const senha = 'wrongpassword';
            const mockUser = {
                _id: 'user_id',
                matricula,
                senha: 'hashedPassword',
                ativo: true,
                senha_definida: true
            };

            mockUsuarioRepository.buscarPorMatricula.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await expect(authService.autenticar(matricula, senha)).rejects.toThrow('Matrícula ou senha incorretos');
        });
    });

    describe('logout', () => {
        it('should logout user successfully', async () => {
            const userId = 'user_id';

            mockUsuarioRepository.setUserOnlineStatus.mockResolvedValue(true);
            mockUsuarioRepository.removeToken.mockResolvedValue({ success: true });

            const result = await authService.logout(userId);

            expect(mockUsuarioRepository.setUserOnlineStatus).toHaveBeenCalledWith(userId, false);
            expect(mockUsuarioRepository.removeToken).toHaveBeenCalledWith(userId);
            expect(result).toEqual({ success: true });
        });
    });

    describe('refreshToken', () => {
        it('should refresh token successfully', async () => {
            const refreshToken = 'valid_refresh_token';
            const mockUser = {
                _id: 'user_id',
                matricula: '12345',
                perfil: 'user',
                refreshtoken: refreshToken
            };

            jwt.verify.mockReturnValue({ id: 'user_id' });
            mockUsuarioRepository.buscarPorId.mockResolvedValue(mockUser);
            mockUsuarioRepository.armazenarTokens.mockResolvedValue(true);
            jwt.sign.mockReturnValueOnce('new_access_token').mockReturnValueOnce('new_refresh_token');

            const result = await authService.refreshToken(refreshToken);

            expect(jwt.verify).toHaveBeenCalledWith(refreshToken, authService.REFRESH_TOKEN_SECRET);
            expect(mockUsuarioRepository.buscarPorId).toHaveBeenCalledWith('user_id');
            expect(mockUsuarioRepository.armazenarTokens).toHaveBeenCalled();
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
        });

        it('should throw error when user not found for refresh token', async () => {
            const refreshToken = 'valid_refresh_token';

            jwt.verify.mockReturnValue({ id: 'user_id' });
            mockUsuarioRepository.buscarPorId.mockResolvedValue(null);

            await expect(authService.refreshToken(refreshToken)).rejects.toThrow('Token de atualização inválido');
        });

        it('should throw error when refresh token does not match', async () => {
            const refreshToken = 'valid_refresh_token';
            const mockUser = {
                _id: 'user_id',
                matricula: '12345',
                perfil: 'user',
                refreshtoken: 'different_token'
            };

            jwt.verify.mockReturnValue({ id: 'user_id' });
            mockUsuarioRepository.buscarPorId.mockResolvedValue(mockUser);

            await expect(authService.refreshToken(refreshToken)).rejects.toThrow('Token de atualização inválido');
        });

        it('should throw error when jwt verification fails', async () => {
            const refreshToken = 'invalid_refresh_token';

            jwt.verify.mockImplementation(() => {
                throw new Error('JWT verification failed');
            });

            await expect(authService.refreshToken(refreshToken)).rejects.toThrow('Token de atualização inválido ou expirado');
        });
    });

    describe('_gerarAccessToken', () => {
        it('should generate access token with correct payload', () => {
            const mockUser = {
                _id: 'user_id',
                matricula: '12345',
                perfil: 'admin'
            };

            jwt.sign.mockReturnValue('access_token');

            const token = authService._gerarAccessToken(mockUser);

            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    id: mockUser._id,
                    matricula: mockUser.matricula,
                    perfil: mockUser.perfil
                },
                authService.ACCESS_TOKEN_SECRET,
                { expiresIn: authService.ACCESS_TOKEN_EXPIRY }
            );
            expect(token).toBe('access_token');
        });
    });

    describe('_gerarRefreshToken', () => {
        it('should generate refresh token with correct payload', () => {
            const mockUser = { _id: 'user_id' };

            jwt.sign.mockReturnValue('refresh_token');

            const token = authService._gerarRefreshToken(mockUser);

            expect(jwt.sign).toHaveBeenCalledWith(
                { id: mockUser._id },
                authService.REFRESH_TOKEN_SECRET,
                { expiresIn: authService.REFRESH_TOKEN_EXPIRY }
            );
            expect(token).toBe('refresh_token');
        });
    });

    describe('revoke', () => {
        it('should revoke user tokens successfully', async () => {
            const matricula = '12345';
            const mockUser = { _id: 'user_id', matricula };

            mockUsuarioRepository.buscarPorMatricula.mockResolvedValue(mockUser);
            mockUsuarioRepository.setUserOnlineStatus.mockResolvedValue(true);
            mockUsuarioRepository.removeToken.mockResolvedValue({ success: true });

            const result = await authService.revoke(matricula);

            expect(mockUsuarioRepository.buscarPorMatricula).toHaveBeenCalledWith(matricula);
            expect(mockUsuarioRepository.setUserOnlineStatus).toHaveBeenCalledWith('user_id', false);
            expect(mockUsuarioRepository.removeToken).toHaveBeenCalledWith('user_id');
            expect(result).toEqual({ data: { success: true } });
        });

        it('should throw error when matricula not provided', async () => {
            await expect(authService.revoke()).rejects.toThrow('Matrícula não fornecida');
            await expect(authService.revoke('')).rejects.toThrow('Matrícula não fornecida');
        });

        it('should throw error when user not found', async () => {
            const matricula = '12345';

            mockUsuarioRepository.buscarPorMatricula.mockResolvedValue(null);

            await expect(authService.revoke(matricula)).rejects.toThrow('Usuário não encontrado com esta matrícula');
        });
    });

    describe('recuperarSenha', () => {
        it('should send recovery email when user exists', async () => {
            const email = 'test@example.com';
            const mockUser = { _id: 'user_id', email };

            mockUsuarioRepository.buscarPorEmail.mockResolvedValue(mockUser);
            mockUsuarioRepository.atualizarTokenRecuperacao.mockResolvedValue(true);
            TokenUtil.generatePasswordRecoveryToken.mockResolvedValue('recovery_token');
            EmailService.enviarCodigoRecuperacao.mockResolvedValue({ success: true });

            const result = await authService.recuperarSenha(email);

            expect(mockUsuarioRepository.buscarPorEmail).toHaveBeenCalledWith(email);
            expect(TokenUtil.generatePasswordRecoveryToken).toHaveBeenCalledWith('user_id');
            expect(mockUsuarioRepository.atualizarTokenRecuperacao).toHaveBeenCalled();
            expect(EmailService.enviarCodigoRecuperacao).toHaveBeenCalled();
            expect(result.message).toContain('Solicitação de recuperação de senha recebida');
        });

        it('should not reveal when user does not exist', async () => {
            const email = 'nonexistent@example.com';

            mockUsuarioRepository.buscarPorEmail.mockResolvedValue(null);

            const result = await authService.recuperarSenha(email);

            expect(result.message).toContain('Solicitação de recuperação de senha recebida');
            expect(TokenUtil.generatePasswordRecoveryToken).not.toHaveBeenCalled();
        });
    });

    describe('redefinirSenhaComToken', () => {
        it('should reset password with valid token', async () => {
            const token = 'valid_token';
            const novaSenha = 'newPassword123';
            const mockUser = { _id: 'user_id' };

            TokenUtil.decodePasswordRecoveryToken.mockResolvedValue('user_id');
            mockUsuarioRepository.buscarPorId.mockResolvedValue(mockUser);
            mockUsuarioRepository.atualizarSenha.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('hashed_new_password');

            const result = await authService.redefinirSenhaComToken(token, novaSenha);

            expect(TokenUtil.decodePasswordRecoveryToken).toHaveBeenCalledWith(token);
            expect(mockUsuarioRepository.buscarPorId).toHaveBeenCalledWith('user_id');
            expect(bcrypt.hash).toHaveBeenCalledWith(novaSenha, 10);
            expect(mockUsuarioRepository.atualizarSenha).toHaveBeenCalledWith('user_id', 'hashed_new_password');
            expect(result.message).toBe('Senha atualizada com sucesso');
        });

        it('should throw error when user not found', async () => {
            const token = 'valid_token';
            const novaSenha = 'newPassword123';

            TokenUtil.decodePasswordRecoveryToken.mockResolvedValue('user_id');
            mockUsuarioRepository.buscarPorId.mockResolvedValue(null);

            await expect(authService.redefinirSenhaComToken(token, novaSenha)).rejects.toThrow('Token inválido ou expirado');
        });

        it('should throw error when token is invalid', async () => {
            const token = 'invalid_token';
            const novaSenha = 'newPassword123';

            TokenUtil.decodePasswordRecoveryToken.mockRejectedValue(new Error('Invalid token'));

            await expect(authService.redefinirSenhaComToken(token, novaSenha)).rejects.toThrow('Token inválido ou expirado');
        });
    });

    describe('redefinirSenhaComCodigo', () => {
        it('should reset password with valid code - first time', async () => {
            const codigo = 'ABCD';
            const novaSenha = 'newPassword123';
            const mockUser = {
                _id: 'user_id',
                senha_definida: false,
                data_expiracao_codigo: new Date(Date.now() + 3600000) // 1 hour from now
            };

            mockUsuarioRepository.buscarPorCodigoRecuperacao.mockResolvedValue(mockUser);
            mockUsuarioRepository.atualizarSenhaCompleta.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('hashed_new_password');

            const result = await authService.redefinirSenhaComCodigo(codigo, novaSenha);

            expect(mockUsuarioRepository.buscarPorCodigoRecuperacao).toHaveBeenCalledWith(codigo);
            expect(bcrypt.hash).toHaveBeenCalledWith(novaSenha, 10);
            expect(mockUsuarioRepository.atualizarSenhaCompleta).toHaveBeenCalledWith('user_id', {
                senha: 'hashed_new_password',
                senha_definida: true,
                ativo: true,
                codigo_recuperacao: null,
                data_expiracao_codigo: null,
                token_recuperacao: null,
                token_recuperacao_expira: null
            });
            expect(result.message).toContain('Senha definida com sucesso');
        });

        it('should reset password with valid code - not first time', async () => {
            const codigo = 'ABCD';
            const novaSenha = 'newPassword123';
            const mockUser = {
                _id: 'user_id',
                senha_definida: true,
                data_expiracao_codigo: new Date(Date.now() + 3600000)
            };

            mockUsuarioRepository.buscarPorCodigoRecuperacao.mockResolvedValue(mockUser);
            mockUsuarioRepository.atualizarSenhaCompleta.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('hashed_new_password');

            const result = await authService.redefinirSenhaComCodigo(codigo, novaSenha);

            expect(result.message).toBe('Senha atualizada com sucesso');
        });

        it('should throw error when code is invalid', async () => {
            const codigo = 'INVALID';
            const novaSenha = 'newPassword123';

            mockUsuarioRepository.buscarPorCodigoRecuperacao.mockResolvedValue(null);

            await expect(authService.redefinirSenhaComCodigo(codigo, novaSenha)).rejects.toThrow('Código de recuperação inválido');
        });

        it('should throw error when code is expired', async () => {
            const codigo = 'ABCD';
            const novaSenha = 'newPassword123';
            const mockUser = {
                _id: 'user_id',
                data_expiracao_codigo: new Date(Date.now() - 3600000) // 1 hour ago
            };

            mockUsuarioRepository.buscarPorCodigoRecuperacao.mockResolvedValue(mockUser);

            await expect(authService.redefinirSenhaComCodigo(codigo, novaSenha)).rejects.toThrow('Código de recuperação expirado');
        });

        it('should handle missing expiration date', async () => {
            const codigo = 'ABCD';
            const novaSenha = 'newPassword123';
            const mockUser = {
                _id: 'user_id',
                senha_definida: false,
                data_expiracao_codigo: null
            };

            mockUsuarioRepository.buscarPorCodigoRecuperacao.mockResolvedValue(mockUser);
            mockUsuarioRepository.atualizarSenhaCompleta.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('hashed_new_password');

            const result = await authService.redefinirSenhaComCodigo(codigo, novaSenha);

            expect(result.message).toContain('Senha definida com sucesso');
        });
    });
});