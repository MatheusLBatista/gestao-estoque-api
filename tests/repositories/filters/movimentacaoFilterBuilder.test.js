import MovimentacaoFilterBuilder from '../../../src/repositories/filters/movimentacaoFilterBuilder.js';
import mongoose from 'mongoose';

describe('MovimentacaoFilterBuilder', () => {
  let filterBuilder;

  beforeEach(() => {
    filterBuilder = new MovimentacaoFilterBuilder();
  });

  describe('Constructor', () => {
    it('should initialize with empty filters', () => {
      expect(filterBuilder.filtros).toEqual({});
    });
  });

  describe('comTipo', () => {
    it('should filter by tipo entrada', () => {
      filterBuilder.comTipo('entrada');
      expect(filterBuilder.filtros.tipo).toBe('entrada');
    });

    it('should filter by tipo saida', () => {
      filterBuilder.comTipo('saida');
      expect(filterBuilder.filtros.tipo).toBe('saida');
    });

    it('should ignore invalid tipo', () => {
      filterBuilder.comTipo('invalid');
      expect(filterBuilder.filtros.tipo).toBeUndefined();
    });

    it('should ignore empty tipo', () => {
      filterBuilder.comTipo('');
      expect(filterBuilder.filtros.tipo).toBeUndefined();
    });

    it('should return this for chaining', () => {
      const result = filterBuilder.comTipo('entrada');
      expect(result).toBe(filterBuilder);
    });
  });

  describe('comDestino', () => {
    it('should filter by destino with regex', () => {
      filterBuilder.comDestino('Almoxarifado');
      expect(filterBuilder.filtros.destino).toEqual({
        $regex: 'Almoxarifado',
        $options: 'i'
      });
    });

    it('should escape special regex characters', () => {
      filterBuilder.comDestino('Test (Special)');
      expect(filterBuilder.filtros.destino).toEqual({
        $regex: 'Test\\ \\(Special\\)',
        $options: 'i'
      });
    });

    it('should ignore empty destino', () => {
      filterBuilder.comDestino('');
      expect(filterBuilder.filtros.destino).toBeUndefined();
    });

    it('should ignore whitespace-only destino', () => {
      filterBuilder.comDestino('   ');
      expect(filterBuilder.filtros.destino).toBeUndefined();
    });

    it('should return this for chaining', () => {
      const result = filterBuilder.comDestino('test');
      expect(result).toBe(filterBuilder);
    });
  });

  describe('comPeriodo', () => {
    it('should filter by date period', () => {
      const dataInicio = '2023-01-01';
      const dataFim = '2023-01-31';
      
      filterBuilder.comPeriodo(dataInicio, dataFim);
      
      expect(filterBuilder.filtros.data_movimentacao).toBeDefined();
      expect(filterBuilder.filtros.data_movimentacao.$gte).toEqual(new Date(dataInicio));
      expect(filterBuilder.filtros.data_movimentacao.$lte.getHours()).toBe(23);
      expect(filterBuilder.filtros.data_movimentacao.$lte.getMinutes()).toBe(59);
    });

    it('should handle Date objects', () => {
      const dataInicio = new Date('2023-01-01');
      const dataFim = new Date('2023-01-31');
      
      filterBuilder.comPeriodo(dataInicio, dataFim);
      
      expect(filterBuilder.filtros.data_movimentacao).toBeDefined();
      expect(filterBuilder.filtros.data_movimentacao.$gte).toEqual(dataInicio);
    });

    it('should ignore invalid dates', () => {
      filterBuilder.comPeriodo('invalid', 'dates');
      expect(filterBuilder.filtros.data_movimentacao).toBeUndefined();
    });

    it('should ignore when only one date is provided', () => {
      filterBuilder.comPeriodo('2023-01-01', null);
      expect(filterBuilder.filtros.data_movimentacao).toBeUndefined();
    });

    it('should return this for chaining', () => {
      const result = filterBuilder.comPeriodo('2023-01-01', '2023-01-31');
      expect(result).toBe(filterBuilder);
    });
  });

  describe('comUsuarioId', () => {
    it('should filter by valid usuario ID', () => {
      const validId = new mongoose.Types.ObjectId();
      filterBuilder.comUsuarioId(validId.toString());
      expect(filterBuilder.filtros.id_usuario).toBe(validId.toString());
    });

    it('should ignore invalid ObjectId', () => {
      filterBuilder.comUsuarioId('invalid-id');
      expect(filterBuilder.filtros.id_usuario).toBeUndefined();
    });

    it('should ignore empty ID', () => {
      filterBuilder.comUsuarioId('');
      expect(filterBuilder.filtros.id_usuario).toBeUndefined();
    });

    it('should return this for chaining', () => {
      const validId = new mongoose.Types.ObjectId();
      const result = filterBuilder.comUsuarioId(validId.toString());
      expect(result).toBe(filterBuilder);
    });
  });

  describe('comUsuarioNome', () => {
    it('should filter by usuario nome with regex', () => {
      filterBuilder.comUsuarioNome('João Silva');
      expect(filterBuilder.filtros.nome_usuario).toEqual({
        $regex: 'João\\ Silva',
        $options: 'i'
      });
    });

    it('should escape special characters', () => {
      filterBuilder.comUsuarioNome('Test (User)');
      expect(filterBuilder.filtros.nome_usuario).toEqual({
        $regex: 'Test\\ \\(User\\)',
        $options: 'i'
      });
    });

    it('should ignore empty nome', () => {
      filterBuilder.comUsuarioNome('');
      expect(filterBuilder.filtros.nome_usuario).toBeUndefined();
    });

    it('should return this for chaining', () => {
      const result = filterBuilder.comUsuarioNome('test');
      expect(result).toBe(filterBuilder);
    });
  });

  describe('comProdutoId', () => {
    it('should filter by valid produto ID', () => {
      const validId = new mongoose.Types.ObjectId();
      filterBuilder.comProdutoId(validId.toString());
      expect(filterBuilder.filtros['produtos.produto_ref']).toBe(validId.toString());
    });

    it('should ignore invalid ObjectId', () => {
      filterBuilder.comProdutoId('invalid-id');
      expect(filterBuilder.filtros['produtos.produto_ref']).toBeUndefined();
    });

    it('should return this for chaining', () => {
      const validId = new mongoose.Types.ObjectId();
      const result = filterBuilder.comProdutoId(validId.toString());
      expect(result).toBe(filterBuilder);
    });
  });

  describe('comProdutoCodigo', () => {
    it('should filter by produto codigo with regex', () => {
      filterBuilder.comProdutoCodigo('PROD001');
      expect(filterBuilder.filtros['produtos.codigo_produto']).toEqual({
        $regex: 'PROD001',
        $options: 'i'
      });
    });

    it('should ignore empty codigo', () => {
      filterBuilder.comProdutoCodigo('');
      expect(filterBuilder.filtros['produtos.codigo_produto']).toBeUndefined();
    });

    it('should return this for chaining', () => {
      const result = filterBuilder.comProdutoCodigo('test');
      expect(result).toBe(filterBuilder);
    });
  });

  describe('comProdutoNome', () => {
    it('should filter by produto nome with regex', () => {
      filterBuilder.comProdutoNome('Notebook Dell');
      expect(filterBuilder.filtros['produtos.nome_produto']).toEqual({
        $regex: 'Notebook\\ Dell',
        $options: 'i'
      });
    });

    it('should ignore empty nome', () => {
      filterBuilder.comProdutoNome('');
      expect(filterBuilder.filtros['produtos.nome_produto']).toBeUndefined();
    });

    it('should return this for chaining', () => {
      const result = filterBuilder.comProdutoNome('test');
      expect(result).toBe(filterBuilder);
    });
  });

  describe('comFornecedorId', () => {
    it('should filter by valid fornecedor ID', () => {
      filterBuilder.comFornecedorId('123');
      expect(filterBuilder.filtros['produtos.id_fornecedor']).toBe(123);
    });

    it('should handle numeric ID', () => {
      filterBuilder.comFornecedorId(456);
      expect(filterBuilder.filtros['produtos.id_fornecedor']).toBe(456);
    });

    it('should ignore invalid ID', () => {
      filterBuilder.comFornecedorId('invalid');
      expect(filterBuilder.filtros['produtos.id_fornecedor']).toBeUndefined();
    });

    it('should ignore empty ID', () => {
      filterBuilder.comFornecedorId('');
      expect(filterBuilder.filtros['produtos.id_fornecedor']).toBeUndefined();
    });

    it('should return this for chaining', () => {
      const result = filterBuilder.comFornecedorId('123');
      expect(result).toBe(filterBuilder);
    });
  });

  describe('comFornecedorNome', () => {
    it('should filter by fornecedor nome with regex', () => {
      filterBuilder.comFornecedorNome('Dell Inc');
      expect(filterBuilder.filtros['produtos.nome_fornecedor']).toEqual({
        $regex: 'Dell\\ Inc',
        $options: 'i'
      });
    });

    it('should ignore empty nome', () => {
      filterBuilder.comFornecedorNome('');
      expect(filterBuilder.filtros['produtos.nome_fornecedor']).toBeUndefined();
    });

    it('should return this for chaining', () => {
      const result = filterBuilder.comFornecedorNome('test');
      expect(result).toBe(filterBuilder);
    });
  });

  describe('comQuantidadeMinima', () => {
    it('should filter by minimum quantity', () => {
      filterBuilder.comQuantidadeMinima(10);
      expect(filterBuilder.filtros['produtos.quantidade_produtos']).toEqual({
        $gte: 10
      });
    });

    it('should handle string numbers', () => {
      filterBuilder.comQuantidadeMinima('20');
      expect(filterBuilder.filtros['produtos.quantidade_produtos']).toEqual({
        $gte: 20
      });
    });

    it('should handle zero', () => {
      filterBuilder.comQuantidadeMinima(0);
      expect(filterBuilder.filtros['produtos.quantidade_produtos']).toEqual({
        $gte: 0
      });
    });

    it('should ignore invalid numbers', () => {
      filterBuilder.comQuantidadeMinima('invalid');
      expect(filterBuilder.filtros['produtos.quantidade_produtos']).toBeUndefined();
    });

    it('should return this for chaining', () => {
      const result = filterBuilder.comQuantidadeMinima(10);
      expect(result).toBe(filterBuilder);
    });
  });

  describe('comQuantidadeMaxima', () => {
    it('should filter by maximum quantity', () => {
      filterBuilder.comQuantidadeMaxima(100);
      expect(filterBuilder.filtros['produtos.quantidade_produtos']).toEqual({
        $lte: 100
      });
    });

    it('should combine with minimum quantity', () => {
      filterBuilder.comQuantidadeMinima(10).comQuantidadeMaxima(100);
      expect(filterBuilder.filtros['produtos.quantidade_produtos']).toEqual({
        $gte: 10,
        $lte: 100
      });
    });

    it('should return this for chaining', () => {
      const result = filterBuilder.comQuantidadeMaxima(100);
      expect(result).toBe(filterBuilder);
    });
  });

  describe('comData', () => {
    it('should filter by specific date', () => {
      const data = '2023-01-15';
      filterBuilder.comData(data);
      
      expect(filterBuilder.filtros.data_movimentacao).toBeDefined();
      expect(filterBuilder.filtros.data_movimentacao.$gte).toBeDefined();
      expect(filterBuilder.filtros.data_movimentacao.$lte).toBeDefined();
    });

    it('should ignore invalid date', () => {
      filterBuilder.comData('invalid-date');
      expect(filterBuilder.filtros.data_movimentacao).toBeUndefined();
    });

    it('should return this for chaining', () => {
      const result = filterBuilder.comData('2023-01-15');
      expect(result).toBe(filterBuilder);
    });
  });

  describe('comDataApos', () => {
    it('should filter after specific date', () => {
      const data = '2023-01-15';
      filterBuilder.comDataApos(data);
      
      expect(filterBuilder.filtros.data_movimentacao.$gte).toEqual(new Date(data));
    });

    it('should combine with existing date filters', () => {
      filterBuilder.comDataAntes('2023-01-31').comDataApos('2023-01-01');
      
      expect(filterBuilder.filtros.data_movimentacao.$gte).toEqual(new Date('2023-01-01'));
      expect(filterBuilder.filtros.data_movimentacao.$lte).toEqual(new Date('2023-01-31'));
    });

    it('should return this for chaining', () => {
      const result = filterBuilder.comDataApos('2023-01-15');
      expect(result).toBe(filterBuilder);
    });
  });

  describe('comDataAntes', () => {
    it('should filter before specific date', () => {
      const data = '2023-01-31';
      filterBuilder.comDataAntes(data);
      
      expect(filterBuilder.filtros.data_movimentacao.$lte).toEqual(new Date(data));
    });

    it('should return this for chaining', () => {
      const result = filterBuilder.comDataAntes('2023-01-31');
      expect(result).toBe(filterBuilder);
    });
  });

  describe('comStatus', () => {
    it('should filter by boolean status', () => {
      filterBuilder.comStatus(true);
      expect(filterBuilder.filtros.status).toBe(true);
    });

    it('should convert string "true" to boolean', () => {
      filterBuilder.comStatus('true');
      expect(filterBuilder.filtros.status).toBe(true);
    });

    it('should convert string "false" to boolean', () => {
      filterBuilder.comStatus('false');
      expect(filterBuilder.filtros.status).toBe(false);
    });

    it('should handle mixed case strings', () => {
      filterBuilder.comStatus('TRUE');
      expect(filterBuilder.filtros.status).toBe(true);
    });

    it('should return this for chaining', () => {
      const result = filterBuilder.comStatus(true);
      expect(result).toBe(filterBuilder);
    });
  });

  describe('escapeRegex', () => {
    it('should escape special regex characters', () => {
      const input = 'Test (Special) [Characters] {More} +Plus ?Question *Star .Dot ^Caret $Dollar |Pipe #Hash';
      const expected = 'Test\\ \\(Special\\)\\ \\[Characters\\]\\ \\{More\\}\\ \\+Plus\\ \\?Question\\ \\*Star\\ \\.Dot\\ \\^Caret\\ \\$Dollar\\ \\|Pipe\\ \\#Hash';
      
      expect(filterBuilder.escapeRegex(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      expect(filterBuilder.escapeRegex('')).toBe('');
    });

    it('should handle string without special characters', () => {
      const input = 'NormalText123';
      expect(filterBuilder.escapeRegex(input)).toBe(input);
    });
  });

  describe('build', () => {
    it('should return the filters object', () => {
      filterBuilder.comTipo('entrada').comDestino('Almoxarifado');
      const filters = filterBuilder.build();
      
      expect(filters).toEqual({
        tipo: 'entrada',
        destino: { $regex: 'Almoxarifado', $options: 'i' }
      });
    });

    it('should return empty object if no filters applied', () => {
      const filters = filterBuilder.build();
      expect(filters).toEqual({});
    });
  });

  describe('Method chaining', () => {
    it('should allow chaining multiple filters', () => {
      const validId = new mongoose.Types.ObjectId();
      
      const result = filterBuilder
        .comTipo('entrada')
        .comDestino('Almoxarifado')
        .comUsuarioId(validId.toString())
        .comProdutoNome('Notebook')
        .comQuantidadeMinima(10)
        .comQuantidadeMaxima(100);
      
      expect(result).toBe(filterBuilder);
      
      const filters = filterBuilder.build();
      expect(filters.tipo).toBe('entrada');
      expect(filters.destino).toBeDefined();
      expect(filters.id_usuario).toBe(validId.toString());
      expect(filters['produtos.nome_produto']).toBeDefined();
      expect(filters['produtos.quantidade_produtos']).toEqual({ $gte: 10, $lte: 100 });
    });
  });
});
