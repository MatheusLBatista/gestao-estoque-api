import ProdutoRepository from '../repositories/produtoRepository.js';
import mongoose from 'mongoose';

class DashboardService {
    constructor() {
        this.produtoRepository = new ProdutoRepository();
    }

    // Método utilitário para enriquecer produtos com nomes dos fornecedores
    async enriquecerComNomesFornecedores(produtos) {
        if (!produtos || produtos.length === 0) {
            return produtos;
        }

        const Fornecedor = mongoose.model('fornecedores');
        const fornecedores = await Fornecedor.find().lean();
        
        // Criar um mapa de ID para nome de fornecedor
        const fornecedorMap = {};
        fornecedores.forEach(fornecedor => {
            const tempId = fornecedor._id.toString().substring(0, 8);
            const idNumerico = parseInt(tempId, 16) % 1000;
            fornecedorMap[idNumerico] = fornecedor.nome_fornecedor;
        });
        
        // Adicionar o nome do fornecedor a cada produto
        return produtos.map(produto => {
            const produtoObj = typeof produto.toObject === 'function' ? produto.toObject() : {...produto};
            produtoObj.nome_fornecedor = fornecedorMap[produto.id_fornecedor] || 'Fornecedor não encontrado';
            return produtoObj;
        });
    }

    async obterProdutosCategoriaA() {
        console.log('Buscando produtos da categoria A');
        const Produto = mongoose.model('produtos');
        const produtos = await Produto.find({ categoria: 'A' }).lean();
        return await this.enriquecerComNomesFornecedores(produtos);
    }

    async obterProdutosCategoriaB() {
        console.log('Buscando produtos da categoria B');
        const Produto = mongoose.model('produtos');
        const produtos = await Produto.find({ categoria: 'B' }).lean();
        return await this.enriquecerComNomesFornecedores(produtos);
    }

    async obterProdutosCategoriaC() {
        console.log('Buscando produtos da categoria C');
        const Produto = mongoose.model('produtos');
        const produtos = await Produto.find({ categoria: 'C' }).lean();
        return await this.enriquecerComNomesFornecedores(produtos);
    }

    async obterResumoCategoriasCount() {
        console.log('Obtendo resumo das categorias');
        const Produto = mongoose.model('produtos');
        const [categoriaA, categoriaB, categoriaC] = await Promise.all([
            Produto.countDocuments({ categoria: 'A' }),
            Produto.countDocuments({ categoria: 'B' }),
            Produto.countDocuments({ categoria: 'C' })
        ]);
        return {
            categoria_A: {
                count: categoriaA,
                descricao: 'Alta (R$ 1.001,00 - R$ 10.000,00)'
            },
            categoria_B: {
                count: categoriaB,
                descricao: 'Média (R$ 500,00 - R$ 1.000,00)'
            },
            categoria_C: {
                count: categoriaC,
                descricao: 'Baixa (R$ 0,00 - R$ 499,00)'
            }
        };
    }
}

export default DashboardService;