import { describe, expect, it } from '@jest/globals';
import { CategoriaHelper } from '../../src/utils/categoriaHelper.js';

describe('CategoriaHelper', () => {
  describe('calcularCategoriaPorValor', () => {
    it('should return categoria A for prices between 1001 and 10000', () => {
      expect(CategoriaHelper.calcularCategoriaPorValor(1001)).toBe('A');
      expect(CategoriaHelper.calcularCategoriaPorValor(5000)).toBe('A');
      expect(CategoriaHelper.calcularCategoriaPorValor(10000)).toBe('A');
    });

    it('should return categoria B for prices between 500 and 1000', () => {
      expect(CategoriaHelper.calcularCategoriaPorValor(500)).toBe('B');
      expect(CategoriaHelper.calcularCategoriaPorValor(750)).toBe('B');
      expect(CategoriaHelper.calcularCategoriaPorValor(1000)).toBe('B');
    });

    it('should return categoria C for prices between 0 and 499', () => {
      expect(CategoriaHelper.calcularCategoriaPorValor(0)).toBe('C');
      expect(CategoriaHelper.calcularCategoriaPorValor(250)).toBe('C');
      expect(CategoriaHelper.calcularCategoriaPorValor(499)).toBe('C');
    });

    it('should throw error for negative prices', () => {
      expect(() => {
        CategoriaHelper.calcularCategoriaPorValor(-1);
      }).toThrow('Preço fora das faixas de categorização definidas');
    });

    it('should throw error for prices above 10000', () => {
      expect(() => {
        CategoriaHelper.calcularCategoriaPorValor(10001);
      }).toThrow('Preço fora das faixas de categorização definidas');
    });

    it('should handle edge cases correctly', () => {
      expect(CategoriaHelper.calcularCategoriaPorValor(499.99)).toBe('C');
      expect(CategoriaHelper.calcularCategoriaPorValor(500)).toBe('B');
      expect(CategoriaHelper.calcularCategoriaPorValor(1000)).toBe('B');
      expect(CategoriaHelper.calcularCategoriaPorValor(1001)).toBe('A');
    });
  });

  describe('obterDescricaoCategoria', () => {
    it('should return correct description for categoria A', () => {
      const result = CategoriaHelper.obterDescricaoCategoria('A');
      expect(result).toBe('Alta (R$ 1.001,00 - R$ 10.000,00)');
    });

    it('should return correct description for categoria B', () => {
      const result = CategoriaHelper.obterDescricaoCategoria('B');
      expect(result).toBe('Média (R$ 500,00 - R$ 1.000,00)');
    });

    it('should return correct description for categoria C', () => {
      const result = CategoriaHelper.obterDescricaoCategoria('C');
      expect(result).toBe('Baixa (R$ 0,00 - R$ 499,00)');
    });

    it('should return invalid message for unknown categoria', () => {
      const result = CategoriaHelper.obterDescricaoCategoria('D');
      expect(result).toBe('Categoria inválida');
    });

    it('should return invalid message for null categoria', () => {
      const result = CategoriaHelper.obterDescricaoCategoria(null);
      expect(result).toBe('Categoria inválida');
    });

    it('should return invalid message for undefined categoria', () => {
      const result = CategoriaHelper.obterDescricaoCategoria(undefined);
      expect(result).toBe('Categoria inválida');
    });

    it('should return invalid message for empty string categoria', () => {
      const result = CategoriaHelper.obterDescricaoCategoria('');
      expect(result).toBe('Categoria inválida');
    });

    it('should be case sensitive', () => {
      const result = CategoriaHelper.obterDescricaoCategoria('a');
      expect(result).toBe('Categoria inválida');
    });
  });
});
