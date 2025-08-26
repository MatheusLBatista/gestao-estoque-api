import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Configurar os mocks
jest.mock('../../src/repositories/grupoRepository.js', () => {
    return jest.fn().mockImplementation(() => ({
        listar: jest.fn(),
        buscarPorId: jest.fn(),
        criar: jest.fn(),
        atualizar: jest.fn(),
        deletar: jest.fn(),
        alterarStatus: jest.fn(),
        buscarPorNome: jest.fn(),
        buscarPorPermissao: jest.fn(),
    }));
});

jest.mock('mongoose', () => ({
    Types: {
        ObjectId: {
            isValid: jest.fn(),
        },
    },
}));

jest.mock('../../src/utils/helpers/index.js', () => ({
    CustomError: class extends Error {
        constructor(options) {
            super(options.customMessage || 'Custom error');
            this.statusCode = options.statusCode;
            this.errorType = options.errorType;
            this.field = options.field;
            this.customMessage = options.customMessage;
        }
    },
    HttpStatusCodes: {
        BAD_REQUEST: { code: 400 },
        NOT_FOUND: { code: 404 },
        OK: { code: 200 },
        CREATED: { code: 201 },
        CONFLICT: { code: 409 },
        INTERNAL_SERVER_ERROR: { code: 500 }
    },
}));

import GrupoService from '../../src/services/grupoService.js';
import GrupoRepository from '../../src/repositories/grupoRepository.js';
import mongoose from 'mongoose';

describe('GrupoService', () => {
    let grupoService;
    let mockRepository;

    beforeEach(() => {
        grupoService = new GrupoService();
        mockRepository = grupoService.repository;

        // Reset dos mocks
        jest.clearAllMocks();
    });

    describe('listar', () => {
        it('deve listar grupos com sucesso', async () => {
            const mockGrupos = {
                docs: [
                    { id: '1', nome: 'Administradores', descricao: 'Grupo admin' },
                    { id: '2', nome: 'Estoquistas', descricao: 'Grupo estoque' }
                ],
                totalDocs: 2,
                page: 1,
                totalPages: 1
            };

            const mockReq = { query: { page: 1, limit: 10 } };
            mockRepository.listar.mockResolvedValue(mockGrupos);

            const result = await grupoService.listar(mockReq);

            expect(mockRepository.listar).toHaveBeenCalledWith(mockReq);
            expect(result).toEqual(mockGrupos);
        });

        it('deve propagar erro do repository', async () => {
            const error = new Error('Erro ao listar grupos');
            const mockReq = { query: {} };

            mockRepository.listar.mockRejectedValue(error);

            await expect(grupoService.listar(mockReq))
                .rejects.toThrow('Erro ao listar grupos');
        });
    });

    describe('buscarPorId', () => {
        it('deve buscar grupo por ID com sucesso', async () => {
            const mockGrupo = {
                id: '123',
                nome: 'Administradores',
                descricao: 'Grupo de administradores',
                permissoes: []
            };

            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);

            const result = await grupoService.buscarPorId('123');

            expect(mockRepository.buscarPorId).toHaveBeenCalledWith('123');
            expect(result).toEqual(mockGrupo);
        });

        it('deve propagar erro quando grupo não encontrado', async () => {
            const error = new Error('Grupo não encontrado');
            mockRepository.buscarPorId.mockRejectedValue(error);

            await expect(grupoService.buscarPorId('999'))
                .rejects.toThrow('Grupo não encontrado');
        });
    });

    describe('criar', () => {
        it('deve criar grupo com sucesso', async () => {
            const mockGrupo = {
                id: 'grupo123',
                nome: 'Novo Grupo',
                descricao: 'Descrição do novo grupo',
                ativo: true
            };

            const dadosGrupo = {
                nome: 'Novo Grupo',
                descricao: 'Descrição do novo grupo'
            };

            mockRepository.buscarPorNome.mockResolvedValue(null); // não existe grupo com mesmo nome
            mockRepository.criar.mockResolvedValue(mockGrupo);

            const result = await grupoService.criar(dadosGrupo);

            expect(mockRepository.buscarPorNome).toHaveBeenCalledWith('Novo Grupo', null);
            expect(mockRepository.criar).toHaveBeenCalledWith(dadosGrupo);
            expect(result).toEqual(mockGrupo);
        });

        it('deve criar grupo com permissões válidas', async () => {
            const dadosGrupo = {
                nome: 'Novo Grupo',
                permissoes: [
                    { rota: 'produtos', dominio: 'localhost' }
                ]
            };

            const mockGrupo = { ...dadosGrupo, id: 'grupo123' };

            mockRepository.buscarPorNome.mockResolvedValue(null);
            mockRepository.buscarPorPermissao.mockResolvedValue([
                { rota: 'produtos', dominio: 'localhost' }
            ]);
            mockRepository.criar.mockResolvedValue(mockGrupo);

            const result = await grupoService.criar(dadosGrupo);

            expect(result).toEqual(mockGrupo);
        });

        it('deve lançar erro quando grupo com mesmo nome já existe', async () => {
            const grupoExistente = { id: '123', nome: 'Grupo Existente' };
            const dadosGrupo = { nome: 'Grupo Existente' };

            mockRepository.buscarPorNome.mockResolvedValue(grupoExistente);

            await expect(grupoService.criar(dadosGrupo))
                .rejects.toThrow();
        });

        it('deve lançar erro para permissões inválidas', async () => {
            const dadosGrupo = {
                nome: 'Novo Grupo',
                permissoes: [
                    { rota: 'inexistente', dominio: 'localhost' }
                ]
            };

            mockRepository.buscarPorNome.mockResolvedValue(null);
            mockRepository.buscarPorPermissao.mockResolvedValue([]); // nenhuma rota encontrada

            await expect(grupoService.criar(dadosGrupo))
                .rejects.toThrow();
        });

        it('deve lançar erro para permissões duplicadas', async () => {
            const dadosGrupo = {
                nome: 'Novo Grupo',
                permissoes: [
                    { rota: 'produtos', dominio: 'localhost' },
                    { rota: 'produtos', dominio: 'localhost' }
                ]
            };

            mockRepository.buscarPorNome.mockResolvedValue(null);
            // Mock para retornar as rotas existentes - mesmo número que as permissões passadas
            // para que passe na validação de existência e chegue na validação de duplicatas
            mockRepository.buscarPorPermissao.mockResolvedValue([
                { rota: 'produtos', dominio: 'localhost' },
                { rota: 'produtos', dominio: 'localhost' }
            ]);

            await expect(grupoService.criar(dadosGrupo))
                .rejects.toThrow('Permissões duplicadas encontradas');
        });

        it('deve tratar erro genérico na criação', async () => {
            const dadosGrupo = { nome: 'Novo Grupo' };
            const error = new Error('Erro inesperado');

            mockRepository.buscarPorNome.mockResolvedValue(null);
            mockRepository.criar.mockRejectedValue(error);

            await expect(grupoService.criar(dadosGrupo))
                .rejects.toThrow('Erro inesperado');
        });

        it('deve tratar erro interno na validação de nome', async () => {
            const dadosGrupo = { nome: 'Novo Grupo' };
            const error = new Error('Erro de conexão');

            mockRepository.buscarPorNome.mockRejectedValue(error);

            await expect(grupoService.criar(dadosGrupo))
                .rejects.toThrow();
        });
    });

    describe('atualizar', () => {
        it('deve atualizar grupo com sucesso', async () => {
            const mockGrupo = {
                id: '123',
                nome: 'Grupo Atualizado',
                descricao: 'Descrição atualizada'
            };

            const dadosAtualizacao = { nome: 'Grupo Atualizado' };
            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);
            mockRepository.buscarPorNome.mockResolvedValue(null);
            mockRepository.atualizar.mockResolvedValue(mockGrupo);

            const result = await grupoService.atualizar('123', dadosAtualizacao);

            expect(mockRepository.buscarPorId).toHaveBeenCalledWith('123');
            expect(mockRepository.atualizar).toHaveBeenCalledWith('123', dadosAtualizacao);
            expect(result).toEqual(mockGrupo);
        });

        it('deve atualizar grupo com permissões válidas', async () => {
            const mockGrupo = { id: '123', nome: 'Grupo Teste' };
            const dadosAtualizacao = {
                permissoes: [
                    { rota: 'produtos', dominio: 'localhost' }
                ]
            };

            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);
            mockRepository.buscarPorPermissao.mockResolvedValue([
                { rota: 'produtos', dominio: 'localhost' }
            ]);
            mockRepository.atualizar.mockResolvedValue(mockGrupo);

            const result = await grupoService.atualizar('123', dadosAtualizacao);

            expect(result).toEqual(mockGrupo);
        });

        it('deve lançar erro quando grupo não existe', async () => {
            const error = new Error('Grupo não encontrado');
            mockRepository.buscarPorId.mockRejectedValue(error);

            await expect(grupoService.atualizar('invalid-id', {}))
                .rejects.toThrow('Grupo não encontrado');
        });

        it('deve lançar erro quando nome já existe em outro grupo', async () => {
            const mockGrupo = { id: '123', nome: 'Grupo Teste' };
            const grupoExistente = { id: '456', nome: 'Nome Duplicado' };
            const dadosAtualizacao = { nome: 'Nome Duplicado' };

            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);
            mockRepository.buscarPorNome.mockResolvedValue(grupoExistente);

            await expect(grupoService.atualizar('123', dadosAtualizacao))
                .rejects.toThrow();
        });

        it('deve lançar erro para permissões inválidas na atualização', async () => {
            const mockGrupo = { id: '123', nome: 'Grupo Teste' };
            const dadosAtualizacao = {
                permissoes: [
                    { rota: 'inexistente', dominio: 'localhost' }
                ]
            };

            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);
            mockRepository.buscarPorPermissao.mockResolvedValue([]);

            await expect(grupoService.atualizar('123', dadosAtualizacao))
                .rejects.toThrow();
        });
    });

    describe('deletar', () => {
        it('deve deletar grupo com sucesso', async () => {
            const mockResponse = { message: 'Grupo deletado com sucesso' };
            const mockGrupo = { id: '123', nome: 'Grupo Teste' };
            
            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);
            mockRepository.deletar.mockResolvedValue(mockResponse);

            const result = await grupoService.deletar('123');

            expect(mockRepository.buscarPorId).toHaveBeenCalledWith('123');
            expect(mockRepository.deletar).toHaveBeenCalledWith('123');
            expect(result).toEqual(mockResponse);
        });

        it('deve lançar erro quando grupo não existe', async () => {
            const error = new Error('Grupo não encontrado');
            mockRepository.buscarPorId.mockRejectedValue(error);

            await expect(grupoService.deletar('invalid-id'))
                .rejects.toThrow('Grupo não encontrado');
        });

        it('deve propagar erro do repository', async () => {
            const mockGrupo = { id: '123', nome: 'Grupo Teste' };
            const error = new Error('Erro ao deletar');
            
            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);
            mockRepository.deletar.mockRejectedValue(error);

            await expect(grupoService.deletar('123'))
                .rejects.toThrow('Erro ao deletar');
        });
    });

    describe('alterarStatus', () => {
        it('deve alterar status do grupo para ativo', async () => {
            const mockResponse = { id: '123', ativo: true };
            
            mockRepository.alterarStatus.mockResolvedValue(mockResponse);

            const result = await grupoService.alterarStatus('123', true);

            expect(mockRepository.alterarStatus).toHaveBeenCalledWith('123', true);
            expect(result).toEqual(mockResponse);
        });

        it('deve alterar status do grupo para inativo', async () => {
            const mockResponse = { id: '123', ativo: false };
            
            mockRepository.alterarStatus.mockResolvedValue(mockResponse);

            const result = await grupoService.alterarStatus('123', false);

            expect(mockRepository.alterarStatus).toHaveBeenCalledWith('123', false);
            expect(result).toEqual(mockResponse);
        });

        it('deve propagar erro do repository', async () => {
            const error = new Error('Erro ao alterar status');
            
            mockRepository.alterarStatus.mockRejectedValue(error);

            await expect(grupoService.alterarStatus('123', true))
                .rejects.toThrow('Erro ao alterar status');
        });
    });

    describe('adicionarPermissao', () => {
        it('deve adicionar permissão ao grupo com sucesso', async () => {
            const mockGrupo = {
                id: '123',
                nome: 'Grupo Teste',
                permissoes: [
                    { rota: 'usuarios', dominio: 'localhost', buscar: true }
                ]
            };
            const mockResponse = { message: 'Permissão adicionada com sucesso' };
            const permissao = {
                rota: 'produtos',
                dominio: 'localhost',
                buscar: true,
                enviar: true
            };

            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);
            mockRepository.buscarPorPermissao.mockResolvedValue([
                { rota: 'produtos', dominio: 'localhost' }
            ]);
            mockRepository.atualizar.mockResolvedValue(mockResponse);

            const result = await grupoService.adicionarPermissao('123', permissao);

            expect(mockRepository.buscarPorId).toHaveBeenCalledWith('123');
            expect(result).toEqual(mockResponse);
        });

        it('deve lançar erro quando permissão já existe no grupo', async () => {
            const mockGrupo = {
                id: '123',
                nome: 'Grupo Teste',
                permissoes: [
                    { rota: 'produtos', dominio: 'localhost', buscar: true }
                ]
            };
            const permissao = {
                rota: 'produtos',
                dominio: 'localhost',
                buscar: true
            };

            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);
            mockRepository.buscarPorPermissao.mockResolvedValue([
                { rota: 'produtos', dominio: 'localhost' }
            ]);

            await expect(grupoService.adicionarPermissao('123', permissao))
                .rejects.toThrow('Esta permissão já existe no grupo');
        });

        it('deve lançar erro quando permissão é inválida', async () => {
            const mockGrupo = {
                id: '123',
                nome: 'Grupo Teste',
                permissoes: []
            };
            const permissao = {
                rota: 'inexistente',
                dominio: 'localhost'
            };

            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);
            mockRepository.buscarPorPermissao.mockResolvedValue([]);

            await expect(grupoService.adicionarPermissao('123', permissao))
                .rejects.toThrow();
        });

        it('deve tratar erro genérico', async () => {
            const error = new Error('Erro inesperado');
            
            mockRepository.buscarPorId.mockRejectedValue(error);

            await expect(grupoService.adicionarPermissao('123', {}))
                .rejects.toThrow('Erro inesperado');
        });
    });

    describe('removerPermissao', () => {
        it('deve remover permissão do grupo com sucesso', async () => {
            const mockGrupo = {
                id: '123',
                nome: 'Grupo Teste',
                permissoes: [
                    { rota: 'produtos', dominio: 'localhost', buscar: true },
                    { rota: 'usuarios', dominio: 'localhost', buscar: true }
                ]
            };
            const mockResponse = { message: 'Permissão removida com sucesso' };

            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);
            mockRepository.atualizar.mockResolvedValue(mockResponse);

            const result = await grupoService.removerPermissao('123', 'produtos');

            expect(mockRepository.buscarPorId).toHaveBeenCalledWith('123');
            expect(result).toEqual(mockResponse);
        });

        it('deve lançar erro quando permissão não existe no grupo', async () => {
            const mockGrupo = {
                id: '123',
                nome: 'Grupo Teste',
                permissoes: [
                    { rota: 'usuarios', dominio: 'localhost', buscar: true }
                ]
            };

            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);

            await expect(grupoService.removerPermissao('123', 'produtos'))
                .rejects.toThrow('Permissão não encontrada no grupo');
        });

        it('deve considerar domínio específico', async () => {
            const mockGrupo = {
                id: '123',
                nome: 'Grupo Teste',
                permissoes: [
                    { rota: 'produtos', dominio: 'app1.com', buscar: true },
                    { rota: 'produtos', dominio: 'app2.com', buscar: true }
                ]
            };
            const mockResponse = { message: 'Permissão removida com sucesso' };

            mockRepository.buscarPorId.mockResolvedValue(mockGrupo);
            mockRepository.atualizar.mockResolvedValue(mockResponse);

            const result = await grupoService.removerPermissao('123', 'produtos', 'app1.com');

            expect(result).toEqual(mockResponse);
        });

        it('deve tratar erro genérico', async () => {
            const error = new Error('Erro inesperado');
            
            mockRepository.buscarPorId.mockRejectedValue(error);

            await expect(grupoService.removerPermissao('123', 'produtos'))
                .rejects.toThrow('Erro inesperado');
        });
    });

    describe('validarPermissoes', () => {
        it('deve validar com array vazio', async () => {
            await expect(grupoService.validarPermissoes([])).resolves.not.toThrow();
        });

        it('deve validar com null', async () => {
            await expect(grupoService.validarPermissoes(null)).resolves.not.toThrow();
        });

        it('deve tratar erro interno na validação de permissões', async () => {
            const permissoes = [{ rota: 'produtos', dominio: 'localhost' }];
            const error = new Error('Erro de conexão');

            mockRepository.buscarPorPermissao.mockRejectedValue(error);

            await expect(grupoService.validarPermissoes(permissoes))
                .rejects.toThrow();
        });
    });
});
