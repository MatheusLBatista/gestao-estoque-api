// tests/repositories/filters/UsuarioFilterBuilder.test.js

import UsuarioFilterBuilder from '../../../src/repositories/filters/UsuarioFilterBuilder.js';

describe.skip('UsuarioFilterBuilder', () => {
    let filterBuilder;

    beforeEach(() => {
        filterBuilder = new UsuarioFilterBuilder();
    });

    describe('Basic functionality', () => {
        it('should create an instance', () => {
            expect(filterBuilder).toBeDefined();
            expect(filterBuilder).toBeInstanceOf(UsuarioFilterBuilder);
        });

        it('should initialize with empty filter', () => {
            const filter = filterBuilder.build();
            expect(filter).toEqual({});
        });
    });

    describe('Nome filtering', () => {
        it('should filter by nome', () => {
            const filter = filterBuilder.byNome('João').build();
            expect(filter.nome_usuario).toEqual({ $regex: 'João', $options: 'i' });
        });

        it('should handle empty nome', () => {
            const filter = filterBuilder.byNome('').build();
            expect(filter.nome_usuario).toBeUndefined();
        });

        it('should handle null nome', () => {
            const filter = filterBuilder.byNome(null).build();
            expect(filter.nome_usuario).toBeUndefined();
        });
    });

    describe('Email filtering', () => {
        it('should filter by email', () => {
            const filter = filterBuilder.byEmail('test@test.com').build();
            expect(filter.email).toEqual({ $regex: 'test@test.com', $options: 'i' });
        });

        it('should handle empty email', () => {
            const filter = filterBuilder.byEmail('').build();
            expect(filter.email).toBeUndefined();
        });
    });

    describe('Matricula filtering', () => {
        it('should filter by matricula', () => {
            const filter = filterBuilder.byMatricula('12345').build();
            expect(filter.matricula).toBe('12345');
        });

        it('should handle empty matricula', () => {
            const filter = filterBuilder.byMatricula('').build();
            expect(filter.matricula).toBeUndefined();
        });
    });

    describe('Status filtering', () => {
        it('should filter by active status', () => {
            const filter = filterBuilder.byStatus(true).build();
            expect(filter.ativo).toBe(true);
        });

        it('should filter by inactive status', () => {
            const filter = filterBuilder.byStatus(false).build();
            expect(filter.ativo).toBe(false);
        });
    });

    describe('Complex filtering', () => {
        it('should combine multiple filters', () => {
            const filter = filterBuilder
                .byNome('João')
                .byEmail('joao@test.com')
                .byMatricula('12345')
                .byStatus(true)
                .build();

            expect(filter).toEqual({
                nome_usuario: { $regex: 'João', $options: 'i' },
                email: { $regex: 'joao@test.com', $options: 'i' },
                matricula: '12345',
                ativo: true
            });
        });

        it('should reset filters', () => {
            filterBuilder.byNome('João').byEmail('test@test.com');
            filterBuilder.reset();
            const filter = filterBuilder.build();
            expect(filter).toEqual({});
        });
    });

    describe('Edge cases', () => {
        it('should handle special characters in nome', () => {
            const filter = filterBuilder.byNome('João & Maria').build();
            expect(filter.nome_usuario).toEqual({ $regex: 'João & Maria', $options: 'i' });
        });

        it('should handle numbers in nome', () => {
            const filter = filterBuilder.byNome('User123').build();
            expect(filter.nome_usuario).toEqual({ $regex: 'User123', $options: 'i' });
        });

        it('should handle undefined values', () => {
            const filter = filterBuilder
                .byNome(undefined)
                .byEmail(undefined)
                .byMatricula(undefined)
                .build();
            expect(filter).toEqual({});
        });
    });
});
