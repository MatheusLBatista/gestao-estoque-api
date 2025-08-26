class ProdutoFilterBuilder {
    constructor() {
        this.filters = {};
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

    comEstoqueMinimo(estoqueMin) {
        if (estoqueMin !== undefined && estoqueMin !== null && !isNaN(estoqueMin)) {
            this.filters.estoque = { ...this.filters.estoque, $gte: Number(estoqueMin) };
        }
        return this;
    }

    comFornecedor(idFornecedor) {
        if (idFornecedor && idFornecedor.trim() !== '') {
            this.filters.id_fornecedor = idFornecedor;
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