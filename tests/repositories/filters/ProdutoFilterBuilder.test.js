import ProdutoFilterBuilder from '../../../src/repositories/filters/ProdutoFilterBuilder.js';

describe('ProdutoFilterBuilder', () => {
    let builder;

    beforeEach(() => {
        builder = new ProdutoFilterBuilder();
    });

    describe('constructor', () => {
        it('should initialize with empty filters', () => {
            expect(builder.filters).toEqual({});
        });
    });

    describe('comNome', () => {
        it('should add name filter when nome is provided', () => {
            const result = builder.comNome('teste');
            
            expect(result).toBe(builder); // should return builder for chaining
            expect(builder.filters.nome_produto).toEqual({
                $regex: 'teste',
                $options: 'i'
            });
        });

        it('should not add filter when nome is empty string', () => {
            builder.comNome('');
            expect(builder.filters.nome_produto).toBeUndefined();
        });

        it('should not add filter when nome is only whitespace', () => {
            builder.comNome('   ');
            expect(builder.filters.nome_produto).toBeUndefined();
        });

        it('should not add filter when nome is null', () => {
            builder.comNome(null);
            expect(builder.filters.nome_produto).toBeUndefined();
        });

        it('should not add filter when nome is undefined', () => {
            builder.comNome(undefined);
            expect(builder.filters.nome_produto).toBeUndefined();
        });
    });

    describe('comCategoria', () => {
        it('should add category filter when categoria is provided', () => {
            const result = builder.comCategoria('eletrônicos');
            
            expect(result).toBe(builder);
            expect(builder.filters.categoria).toEqual({
                $regex: 'eletrônicos',
                $options: 'i'
            });
        });

        it('should not add filter when categoria is empty string', () => {
            builder.comCategoria('');
            expect(builder.filters.categoria).toBeUndefined();
        });

        it('should not add filter when categoria is only whitespace', () => {
            builder.comCategoria('  ');
            expect(builder.filters.categoria).toBeUndefined();
        });

        it('should not add filter when categoria is null', () => {
            builder.comCategoria(null);
            expect(builder.filters.categoria).toBeUndefined();
        });
    });

    describe('comCodigo', () => {
        it('should add code filter when codigo is provided', () => {
            const result = builder.comCodigo('ABC123');
            
            expect(result).toBe(builder);
            expect(builder.filters.codigo_produto).toEqual({
                $regex: 'ABC123',
                $options: 'i'
            });
        });

        it('should not add filter when codigo is empty string', () => {
            builder.comCodigo('');
            expect(builder.filters.codigo_produto).toBeUndefined();
        });

        it('should not add filter when codigo is only whitespace', () => {
            builder.comCodigo(' \t ');
            expect(builder.filters.codigo_produto).toBeUndefined();
        });

        it('should not add filter when codigo is null', () => {
            builder.comCodigo(null);
            expect(builder.filters.codigo_produto).toBeUndefined();
        });
    });

    describe('comPrecoMinimo', () => {
        it('should add minimum price filter when precoMin is provided', () => {
            const result = builder.comPrecoMinimo(10.5);
            
            expect(result).toBe(builder);
            expect(builder.filters.preco).toEqual({
                $gte: 10.5
            });
        });

        it('should handle string numbers', () => {
            builder.comPrecoMinimo('25.99');
            expect(builder.filters.preco).toEqual({
                $gte: 25.99
            });
        });

        it('should handle zero', () => {
            builder.comPrecoMinimo(0);
            expect(builder.filters.preco).toEqual({
                $gte: 0
            });
        });

        it('should merge with existing price filters', () => {
            builder.comPrecoMaximo(100);
            builder.comPrecoMinimo(10);
            
            expect(builder.filters.preco).toEqual({
                $lte: 100,
                $gte: 10
            });
        });

        it('should not add filter when precoMin is NaN', () => {
            builder.comPrecoMinimo('not a number');
            expect(builder.filters.preco).toBeUndefined();
        });

        it('should not add filter when precoMin is null', () => {
            builder.comPrecoMinimo(null);
            expect(builder.filters.preco).toBeUndefined();
        });

        it('should not add filter when precoMin is undefined', () => {
            builder.comPrecoMinimo(undefined);
            expect(builder.filters.preco).toBeUndefined();
        });
    });

    describe('comPrecoMaximo', () => {
        it('should add maximum price filter when precoMax is provided', () => {
            const result = builder.comPrecoMaximo(100);
            
            expect(result).toBe(builder);
            expect(builder.filters.preco).toEqual({
                $lte: 100
            });
        });

        it('should handle string numbers', () => {
            builder.comPrecoMaximo('99.99');
            expect(builder.filters.preco).toEqual({
                $lte: 99.99
            });
        });

        it('should merge with existing price filters', () => {
            builder.comPrecoMinimo(10);
            builder.comPrecoMaximo(100);
            
            expect(builder.filters.preco).toEqual({
                $gte: 10,
                $lte: 100
            });
        });

        it('should not add filter when precoMax is NaN', () => {
            builder.comPrecoMaximo('invalid');
            expect(builder.filters.preco).toBeUndefined();
        });

        it('should not add filter when precoMax is null', () => {
            builder.comPrecoMaximo(null);
            expect(builder.filters.preco).toBeUndefined();
        });

        it('should not add filter when precoMax is undefined', () => {
            builder.comPrecoMaximo(undefined);
            expect(builder.filters.preco).toBeUndefined();
        });
    });

    describe('comEstoqueMinimo', () => {
        it('should add minimum stock filter when estoqueMin is provided', () => {
            const result = builder.comEstoqueMinimo(5);
            
            expect(result).toBe(builder);
            expect(builder.filters.estoque).toEqual({
                $gte: 5
            });
        });

        it('should handle string numbers', () => {
            builder.comEstoqueMinimo('10');
            expect(builder.filters.estoque).toEqual({
                $gte: 10
            });
        });

        it('should handle zero', () => {
            builder.comEstoqueMinimo(0);
            expect(builder.filters.estoque).toEqual({
                $gte: 0
            });
        });

        it('should not add filter when estoqueMin is NaN', () => {
            builder.comEstoqueMinimo('not a number');
            expect(builder.filters.estoque).toBeUndefined();
        });

        it('should not add filter when estoqueMin is null', () => {
            builder.comEstoqueMinimo(null);
            expect(builder.filters.estoque).toBeUndefined();
        });

        it('should not add filter when estoqueMin is undefined', () => {
            builder.comEstoqueMinimo(undefined);
            expect(builder.filters.estoque).toBeUndefined();
        });
    });

    describe('comFornecedor', () => {
        it('should add supplier filter when idFornecedor is provided', () => {
            const result = builder.comFornecedor('60d5ec49e1b2c8b1234567890');
            
            expect(result).toBe(builder);
            expect(builder.filters.id_fornecedor).toBe('60d5ec49e1b2c8b1234567890');
        });

        it('should not add filter when idFornecedor is empty string', () => {
            builder.comFornecedor('');
            expect(builder.filters.id_fornecedor).toBeUndefined();
        });

        it('should not add filter when idFornecedor is only whitespace', () => {
            builder.comFornecedor('   ');
            expect(builder.filters.id_fornecedor).toBeUndefined();
        });

        it('should not add filter when idFornecedor is null', () => {
            builder.comFornecedor(null);
            expect(builder.filters.id_fornecedor).toBeUndefined();
        });

        it('should not add filter when idFornecedor is undefined', () => {
            builder.comFornecedor(undefined);
            expect(builder.filters.id_fornecedor).toBeUndefined();
        });
    });

    describe('comStatus', () => {
        it('should add status filter when status is boolean true', () => {
            const result = builder.comStatus(true);
            
            expect(result).toBe(builder);
            expect(builder.filters.status).toBe(true);
        });

        it('should add status filter when status is boolean false', () => {
            builder.comStatus(false);
            expect(builder.filters.status).toBe(false);
        });

        it('should convert string "true" to boolean true', () => {
            builder.comStatus('true');
            expect(builder.filters.status).toBe(true);
        });

        it('should convert string "TRUE" to boolean true', () => {
            builder.comStatus('TRUE');
            expect(builder.filters.status).toBe(true);
        });

        it('should convert string "false" to boolean false', () => {
            builder.comStatus('false');
            expect(builder.filters.status).toBe(false);
        });

        it('should convert string "FALSE" to boolean false', () => {
            builder.comStatus('FALSE');
            expect(builder.filters.status).toBe(false);
        });

        it('should convert other strings to false', () => {
            builder.comStatus('anything else');
            expect(builder.filters.status).toBe(false);
        });

        it('should not add filter when status is undefined', () => {
            builder.comStatus(undefined);
            expect(builder.filters.status).toBeUndefined();
        });

        it('should add filter when status is null (stores as null)', () => {
            builder.comStatus(null);
            expect(builder.filters.status).toBe(null);
        });

        it('should add filter when status is 0 (stores as 0)', () => {
            builder.comStatus(0);
            expect(builder.filters.status).toBe(0);
        });

        it('should add filter when status is 1 (stores as 1)', () => {
            builder.comStatus(1);
            expect(builder.filters.status).toBe(1);
        });
    });

    describe('build', () => {
        it('should return the filters object', () => {
            const expectedFilters = {
                nome_produto: { $regex: 'test', $options: 'i' },
                categoria: { $regex: 'category', $options: 'i' },
                preco: { $gte: 10, $lte: 100 },
                status: true
            };

            builder
                .comNome('test')
                .comCategoria('category')
                .comPrecoMinimo(10)
                .comPrecoMaximo(100)
                .comStatus(true);

            const result = builder.build();
            expect(result).toEqual(expectedFilters);
        });

        it('should return empty object when no filters are set', () => {
            const result = builder.build();
            expect(result).toEqual({});
        });
    });

    describe('method chaining', () => {
        it('should allow method chaining', () => {
            const result = builder
                .comNome('produto teste')
                .comCategoria('eletrônicos')
                .comCodigo('ABC123')
                .comPrecoMinimo(50)
                .comPrecoMaximo(200)
                .comEstoqueMinimo(10)
                .comFornecedor('60d5ec49e1b2c8b1234567890')
                .comStatus(true)
                .build();

            expect(result).toEqual({
                nome_produto: { $regex: 'produto teste', $options: 'i' },
                categoria: { $regex: 'eletrônicos', $options: 'i' },
                codigo_produto: { $regex: 'ABC123', $options: 'i' },
                preco: { $gte: 50, $lte: 200 },
                estoque: { $gte: 10 },
                id_fornecedor: '60d5ec49e1b2c8b1234567890',
                status: true
            });
        });
    });
});
