import FornecedorRepository from '../fornecedorRepository.js';
import mongoose from 'mongoose';
import ProdutoRepository from '../produtoRepository.js';

class ProdutoFilterBuilder {
    constructor() {
        this.filters = {};
        this.fornecedorRepository = new FornecedorRepository();
        this.repository = new ProdutoRepository();
    }

    comNome(nome) {
        if (nome && nome.trim() !== '') {
            this.filters.nome_produto = { $regex: nome, $options: 'i' };
        }
        return this;
    }

    comCategoria(categoria) {
        if (categoria && categoria.trim() !== '') {
            this.filters.categoria = { $regex: categoria, $options: 'i' };
        }
        return this;
    }

    comCodigo(codigo) {
        if (codigo && codigo.trim() !== '') {
            this.filters.codigo_produto = { $regex: codigo, $options: 'i' };
        }
        return this;
    }

    comPrecoMinimo(precoMin) {
        if (precoMin !== undefined && precoMin !== null && !isNaN(precoMin)) {
            this.filters.preco = { ...this.filters.preco, $gte: Number(precoMin) };
        }
        return this;
    }

    comPrecoMaximo(precoMax) {
        if (precoMax !== undefined && precoMax !== null && !isNaN(precoMax)) {
            this.filters.preco = { ...this.filters.preco, $lte: Number(precoMax) };
        }
        return this;
    }

    async comEstoqueBaixo(estoque_baixo) {
        if(estoque_baixo == 'true') {
            const produtoEncontrado = await this.repository.listarEstoqueBaixo();

            const produtosIDs = Array.isArray(produtoEncontrado)
            ? produtoEncontrado.map((g) => g._id)
            : produtoEncontrado
            ? [produtoEncontrado._id]
            : [];

            if (produtosIDs.length > 0) {
                this.filters._id = { $in: produtosIDs };
            } else {
                this.filters._id = { $exists: false };
            }
        }
        return this;
    }

    //TODO: ajustar filtros de fornecedores
    async comFornecedorId(fornecedor_id) {
        if (fornecedor_id && mongoose.Types.ObjectId.isValid(fornecedor_id)) {
          const fornecedorExiste = await this.fornecedorRepository.buscarPorId(
            fornecedor_id
          );
          if (fornecedorExiste) {
            this.filters.id_fornecedor = fornecedor_id;
          } else {
            // Filtro impossível, nunca retorna nada
            this.filters.id_fornecedor = null;
          }
        }
        return this;
    }

    async comFornecedorNome(fornecedor_nome) {
        if (fornecedor_nome) {
        const fornecedorEncontrado =
            await this.fornecedorRepository.buscarPorNome(fornecedor_nome);

        this.filters.fornecedores = { $in: fornecedorEncontrado ? [fornecedorEncontrado._id] : [] };
        }

        return this;
    }

    comStatus(status) {
        if (status !== undefined) {
            // Converter string 'true' ou 'false' para booleano
            if (typeof status === 'string') {
                status = status.toLowerCase() === 'true';
            }
            this.filters.status = status;
        }
        return this;
    }

    build() {
        return this.filters;
    }
}

export default ProdutoFilterBuilder;