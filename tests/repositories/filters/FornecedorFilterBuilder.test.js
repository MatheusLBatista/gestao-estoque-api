// tests/repositories/filters/FornecedorFilterBuilder.test.js

import FornecedorFilterBuilder from '../../../src/repositories/filters/FornecedorFilterBuilder.js';

describe.skip('FornecedorFilterBuilder', () => {
    let filterBuilder;

    beforeEach(() => {
        filterBuilder = new FornecedorFilterBuilder();
    });

    describe('Basic functionality', () => {
        it('should create an instance', () => {
            expect(filterBuilder).toBeDefined();
            expect(filterBuilder).toBeInstanceOf(FornecedorFilterBuilder);
        });

        it('should initialize with empty filter', () => {
            const filter = filterBuilder.build();
            expect(filter).toEqual({});
        });
    });

    describe('Nome filtering', () => {
        it('should filter by nome', () => {
            const filter = filterBuilder.byNome('Fornecedor A').build();
            expect(filter.nome).toEqual({ $regex: 'Fornecedor A', $options: 'i' });
        });

        it('should handle empty nome', () => {
            const filter = filterBuilder.byNome('').build();
            expect(filter.nome).toBeUndefined();
        });

        it('should handle null nome', () => {
            const filter = filterBuilder.byNome(null).build();
            expect(filter.nome).toBeUndefined();
        });
    });

    describe('CNPJ filtering', () => {
        it('should filter by CNPJ', () => {
            const filter = filterBuilder.byCnpj('12345678000190').build();
            expect(filter.cnpj).toBe('12345678000190');
        });

        it('should handle empty CNPJ', () => {
            const filter = filterBuilder.byCnpj('').build();
            expect(filter.cnpj).toBeUndefined();
        });
    });

    describe('Email filtering', () => {
        it('should filter by email', () => {
            const filter = filterBuilder.byEmail('fornecedor@test.com').build();
            expect(filter.email).toEqual({ $regex: 'fornecedor@test.com', $options: 'i' });
        });

        it('should handle empty email', () => {
            const filter = filterBuilder.byEmail('').build();
            expect(filter.email).toBeUndefined();
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
                .byNome('Fornecedor A')
                .byCnpj('12345678000190')
                .byEmail('fornecedor@test.com')
                .byStatus(true)
                .build();

            expect(filter).toEqual({
                nome: { $regex: 'Fornecedor A', $options: 'i' },
                cnpj: '12345678000190',
                email: { $regex: 'fornecedor@test.com', $options: 'i' },
                ativo: true
            });
        });

        it('should reset filters', () => {
            filterBuilder.byNome('Test').byEmail('test@test.com');
            filterBuilder.reset();
            const filter = filterBuilder.build();
            expect(filter).toEqual({});
        });
    });

    describe('Edge cases', () => {
        it('should handle special characters in nome', () => {
            const filter = filterBuilder.byNome('Fornecedor & Cia').build();
            expect(filter.nome).toEqual({ $regex: 'Fornecedor & Cia', $options: 'i' });
        });

        it('should handle CNPJ with formatting', () => {
            const filter = filterBuilder.byCnpj('12.345.678/0001-90').build();
            expect(filter.cnpj).toBe('12.345.678/0001-90');
        });

        it('should handle undefined values', () => {
            const filter = filterBuilder
                .byNome(undefined)
                .byCnpj(undefined)
                .byEmail(undefined)
                .build();
            expect(filter).toEqual({});
        });
    });
});
