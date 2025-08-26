// tests/services/PermissionService.test.js

import PermissionService from '../../src/services/PermissionService.js';
import Usuario from '../../src/models/Usuario.js';
import Grupo from '../../src/models/Grupo.js';
import Rota from '../../src/models/Rotas.js';
import UsuarioRepository from '../../src/repositories/usuarioRepository.js';
import { CustomError } from '../../src/utils/helpers/index.js';

// Mock dependencies
jest.mock('../../src/models/Usuario.js');
jest.mock('../../src/models/Grupo.js');
jest.mock('../../src/models/Rotas.js');
jest.mock('../../src/repositories/usuarioRepository.js');

describe('PermissionService', () => {
    let permissionService;
    let mockUsuario;
    let mockGrupo;
    let mockRota;
    let mockRepository;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Setup mocks
        mockUsuario = {
            findById: jest.fn(),
        };
        mockGrupo = {};
        mockRota = {
            findOne: jest.fn(),
        };
        mockRepository = {};

        Usuario.findById = mockUsuario.findById;
        Rota.findOne = mockRota.findOne;

        permissionService = new PermissionService();
    });

    describe('Constructor', () => {
        test('should initialize all dependencies', () => {
            expect(permissionService.repository).toBeInstanceOf(UsuarioRepository);
            expect(permissionService.Usuario).toBe(Usuario);
            expect(permissionService.Grupo).toBe(Grupo);
            expect(permissionService.Rota).toBe(Rota);
        });
    });

    describe('hasPermission', () => {
        const userId = '507f1f77bcf86cd799439011';
        const rota = 'produtos';
        const dominio = 'localhost';
        const metodo = 'buscar';

        test('should return false if user not found', async () => {
            mockUsuario.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(null)
                })
            });

            const result = await permissionService.hasPermission(userId, rota, dominio, metodo);

            expect(result).toBe(false);
            expect(mockUsuario.findById).toHaveBeenCalledWith(userId);
        });

        test('should return true if user has individual permission', async () => {
            const mockUser = {
                _id: userId,
                permissoes: [
                    {
                        rota: 'produtos',
                        dominio: 'localhost',
                        ativo: true,
                        buscar: true
                    }
                ],
                grupos: []
            };

            mockUsuario.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockUser)
                })
            });

            const result = await permissionService.hasPermission(userId, rota, dominio, metodo);

            expect(result).toBe(true);
        });

        test('should return false if user has permission but for different route', async () => {
            const mockUser = {
                _id: userId,
                permissoes: [
                    {
                        rota: 'usuarios',
                        dominio: 'localhost',
                        ativo: true,
                        buscar: true
                    }
                ],
                grupos: []
            };

            mockUsuario.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockUser)
                })
            });

            const result = await permissionService.hasPermission(userId, rota, dominio, metodo);

            expect(result).toBe(false);
        });

        test('should return false if user has permission but method is false', async () => {
            const mockUser = {
                _id: userId,
                permissoes: [
                    {
                        rota: 'produtos',
                        dominio: 'localhost',
                        ativo: true,
                        buscar: false
                    }
                ],
                grupos: []
            };

            mockUsuario.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockUser)
                })
            });

            const result = await permissionService.hasPermission(userId, rota, dominio, metodo);

            expect(result).toBe(false);
        });

        test('should return false if permission is inactive', async () => {
            const mockUser = {
                _id: userId,
                permissoes: [
                    {
                        rota: 'produtos',
                        dominio: 'localhost',
                        ativo: false,
                        buscar: true
                    }
                ],
                grupos: []
            };

            mockUsuario.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockUser)
                })
            });

            const result = await permissionService.hasPermission(userId, rota, dominio, metodo);

            expect(result).toBe(false);
        });

        test('should return true if user has permission through group', async () => {
            const mockUser = {
                _id: userId,
                permissoes: [],
                grupos: [
                    {
                        _id: 'grupo1',
                        nome: 'Administradores',
                        ativo: true,
                        permissoes: [
                            {
                                rota: 'produtos',
                                dominio: 'localhost',
                                ativo: true,
                                buscar: true
                            }
                        ]
                    }
                ]
            };

            mockUsuario.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockUser)
                })
            });

            const result = await permissionService.hasPermission(userId, rota, dominio, metodo);

            expect(result).toBe(true);
        });

        test('should ignore inactive groups', async () => {
            const mockUser = {
                _id: userId,
                permissoes: [],
                grupos: [
                    {
                        _id: 'grupo1',
                        nome: 'Administradores',
                        ativo: false,
                        permissoes: [
                            {
                                rota: 'produtos',
                                dominio: 'localhost',
                                ativo: true,
                                buscar: true
                            }
                        ]
                    }
                ]
            };

            mockUsuario.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockUser)
                })
            });

            const result = await permissionService.hasPermission(userId, rota, dominio, metodo);

            expect(result).toBe(false);
        });

        test('should prioritize individual permissions over group permissions', async () => {
            const mockUser = {
                _id: userId,
                permissoes: [
                    {
                        rota: 'produtos',
                        dominio: 'localhost',
                        ativo: true,
                        buscar: false // Individual permission denies
                    }
                ],
                grupos: [
                    {
                        _id: 'grupo1',
                        nome: 'Administradores',
                        ativo: true,
                        permissoes: [
                            {
                                rota: 'produtos',
                                dominio: 'localhost',
                                ativo: true,
                                buscar: true // Group permission allows
                            }
                        ]
                    }
                ]
            };

            mockUsuario.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockUser)
                })
            });

            const result = await permissionService.hasPermission(userId, rota, dominio, metodo);

            expect(result).toBe(false); // Individual permission should take precedence
        });

        test('should handle users with no permissions', async () => {
            const mockUser = {
                _id: userId,
                permissoes: null,
                grupos: null
            };

            mockUsuario.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockUser)
                })
            });

            const result = await permissionService.hasPermission(userId, rota, dominio, metodo);

            expect(result).toBe(false);
        });

        test('should handle different HTTP methods', async () => {
            const mockUser = {
                _id: userId,
                permissoes: [
                    {
                        rota: 'produtos',
                        dominio: 'localhost',
                        ativo: true,
                        buscar: true,
                        enviar: false,
                        modificar: true,
                        excluir: false
                    }
                ],
                grupos: []
            };

            mockUsuario.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockUser)
                })
            });

            expect(await permissionService.hasPermission(userId, rota, dominio, 'buscar')).toBe(true);
            expect(await permissionService.hasPermission(userId, rota, dominio, 'enviar')).toBe(false);
            expect(await permissionService.hasPermission(userId, rota, dominio, 'modificar')).toBe(true);
            expect(await permissionService.hasPermission(userId, rota, dominio, 'excluir')).toBe(false);
        });

        test('should handle errors gracefully', async () => {
            mockUsuario.findById.mockImplementation(() => {
                throw new Error('Database error');
            });

            const result = await permissionService.hasPermission(userId, rota, dominio, metodo);

            expect(result).toBe(false);
        });

        test('should convert route to lowercase', async () => {
            const mockUser = {
                _id: userId,
                permissoes: [
                    {
                        rota: 'produtos',
                        dominio: 'localhost',
                        ativo: true,
                        buscar: true
                    }
                ],
                grupos: []
            };

            mockUsuario.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockUser)
                })
            });

            const result = await permissionService.hasPermission(userId, 'PRODUTOS', dominio, metodo);

            expect(result).toBe(true);
        });
    });

    describe('removerPermissoesDuplicadas', () => {
        test('should remove duplicate permissions', () => {
            const permissoes = [
                { rota: 'produtos', dominio: 'localhost', buscar: true },
                { rota: 'produtos', dominio: 'localhost', buscar: false }, // Duplicate
                { rota: 'usuarios', dominio: 'localhost', buscar: true }
            ];

            const result = permissionService.removerPermissoesDuplicadas(permissoes);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ rota: 'produtos', dominio: 'localhost', buscar: true });
            expect(result[1]).toEqual({ rota: 'usuarios', dominio: 'localhost', buscar: true });
        });

        test('should handle empty array', () => {
            const result = permissionService.removerPermissoesDuplicadas([]);

            expect(result).toEqual([]);
        });

        test('should handle array with no duplicates', () => {
            const permissoes = [
                { rota: 'produtos', dominio: 'localhost', buscar: true },
                { rota: 'usuarios', dominio: 'localhost', buscar: true }
            ];

            const result = permissionService.removerPermissoesDuplicadas(permissoes);

            expect(result).toEqual(permissoes);
        });

        test('should keep first occurrence of duplicates', () => {
            const permissoes = [
                { rota: 'produtos', dominio: 'localhost', buscar: true, id: 1 },
                { rota: 'produtos', dominio: 'localhost', buscar: false, id: 2 },
                { rota: 'produtos', dominio: 'localhost', buscar: true, id: 3 }
            ];

            const result = permissionService.removerPermissoesDuplicadas(permissoes);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(1);
        });
    });

    describe('getUserPermissions', () => {
        const userId = '507f1f77bcf86cd799439011';

        test('should throw error if user not found', async () => {
            mockUsuario.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(null)
                })
            });

            await expect(permissionService.getUserPermissions(userId))
                .rejects.toThrow(CustomError);
        });

        test('should return user permissions with no groups', async () => {
            const mockUser = {
                _id: userId,
                nome_usuario: 'João Silva',
                email: 'joao@example.com',
                perfil: 'admin',
                permissoes: [
                    { rota: 'produtos', dominio: 'localhost', buscar: true }
                ],
                grupos: []
            };

            mockUsuario.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockUser)
                })
            });

            const result = await permissionService.getUserPermissions(userId);

            expect(result.usuario.id).toBe(userId);
            expect(result.usuario.nome).toBe('João Silva');
            expect(result.usuario.email).toBe('joao@example.com');
            expect(result.usuario.perfil).toBe('admin');
            expect(result.grupos).toEqual([]);
            expect(result.permissoes.individuais).toEqual(mockUser.permissoes);
            expect(result.permissoes.grupos).toEqual([]);
            expect(result.permissoes.efetivas).toEqual(mockUser.permissoes);
        });

        test('should return user permissions with groups', async () => {
            const mockUser = {
                _id: userId,
                nome_usuario: 'João Silva',
                email: 'joao@example.com',
                perfil: 'admin',
                permissoes: [
                    { rota: 'produtos', dominio: 'localhost', buscar: true }
                ],
                grupos: [
                    {
                        _id: 'grupo1',
                        nome: 'Administradores',
                        ativo: true,
                        permissoes: [
                            { rota: 'usuarios', dominio: 'localhost', buscar: true }
                        ]
                    }
                ]
            };

            mockUsuario.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockUser)
                })
            });

            const result = await permissionService.getUserPermissions(userId);

            expect(result.grupos).toHaveLength(1);
            expect(result.grupos[0].nome).toBe('Administradores');
            expect(result.permissoes.grupos).toHaveLength(1);
            expect(result.permissoes.grupos[0].grupo).toBe('Administradores');
            expect(result.permissoes.efetivas).toHaveLength(2);
        });

        test('should ignore inactive groups', async () => {
            const mockUser = {
                _id: userId,
                nome_usuario: 'João Silva',
                email: 'joao@example.com',
                perfil: 'admin',
                permissoes: [],
                grupos: [
                    {
                        _id: 'grupo1',
                        nome: 'Inativos',
                        ativo: false,
                        permissoes: [
                            { rota: 'usuarios', dominio: 'localhost', buscar: true }
                        ]
                    }
                ]
            };

            mockUsuario.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockUser)
                })
            });

            const result = await permissionService.getUserPermissions(userId);

            expect(result.permissoes.grupos).toEqual([]);
            expect(result.permissoes.efetivas).toEqual([]);
        });

        test('should handle user with null permissions and groups', async () => {
            const mockUser = {
                _id: userId,
                nome_usuario: 'João Silva',
                email: 'joao@example.com',
                perfil: 'user',
                permissoes: null,
                grupos: null
            };

            mockUsuario.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockUser)
                })
            });

            const result = await permissionService.getUserPermissions(userId);

            expect(result.permissoes.individuais).toEqual([]);
            expect(result.permissoes.grupos).toEqual([]);
            expect(result.permissoes.efetivas).toEqual([]);
            expect(result.grupos).toEqual([]);
        });
    });

    describe('verificarRotaExiste', () => {
        const rota = 'produtos';
        const dominio = 'localhost';

        test('should return route data if route exists', async () => {
            const mockRoute = {
                _id: 'rota1',
                rota: 'produtos',
                dominio: 'localhost',
                ativo: true
            };

            mockRota.findOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockRoute)
            });

            const result = await permissionService.verificarRotaExiste(rota, dominio);

            expect(result).toEqual(mockRoute);
            expect(mockRota.findOne).toHaveBeenCalledWith({
                rota: 'produtos',
                dominio: 'localhost'
            });
        });

        test('should return null if route does not exist', async () => {
            mockRota.findOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(null)
            });

            const result = await permissionService.verificarRotaExiste(rota, dominio);

            expect(result).toBeNull();
        });

        test('should convert route to lowercase', async () => {
            mockRota.findOne.mockReturnValue({
                lean: jest.fn().mockResolvedValue(null)
            });

            await permissionService.verificarRotaExiste('PRODUTOS', dominio);

            expect(mockRota.findOne).toHaveBeenCalledWith({
                rota: 'produtos',
                dominio: 'localhost'
            });
        });

        test('should handle errors gracefully', async () => {
            mockRota.findOne.mockImplementation(() => {
                throw new Error('Database error');
            });

            const result = await permissionService.verificarRotaExiste(rota, dominio);

            expect(result).toBeNull();
        });
    });
});
