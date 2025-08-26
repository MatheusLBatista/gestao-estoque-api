// Função para calcular categoria automaticamente baseada no preço
export class CategoriaHelper {
    static calcularCategoriaPorValor(preco) {
        if (preco >= 1001 && preco <= 10000) {
            return 'A';
        } else if (preco >= 500 && preco <= 1000) {
            return 'B';
        } else if (preco >= 0 && preco < 500) {
            return 'C';
        } else {
            throw new Error('Preço fora das faixas de categorização definidas');
        }
    }

    static obterDescricaoCategoria(categoria) {
        const descricoes = {
            'A': 'Alta (R$ 1.001,00 - R$ 10.000,00)',
            'B': 'Média (R$ 500,00 - R$ 1.000,00)',
            'C': 'Baixa (R$ 0,00 - R$ 499,00)'
        };
        return descricoes[categoria] || 'Categoria inválida';
    }
}

export default CategoriaHelper;
