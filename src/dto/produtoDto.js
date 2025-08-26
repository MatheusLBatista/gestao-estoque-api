export class criarProdutoDto {
    constructor(nome_produto, descricao, preco, marca, custo, categoria, estoque, estoque_min, data_ultima_entrada, status, id_fornecedor, codigo_produto) {
        this.nome_produto = nome_produto;
        this.descricao = descricao;
        this.preco = preco;
        this.marca = marca;
        this.custo = custo;
        this.categoria = categoria;
        this.estoque = estoque;
        this.estoque_min = estoque_min;
        this.data_ultima_entrada = data_ultima_entrada;
        this.status = status;
        this.id_fornecedor = id_fornecedor;
        this.codigo_produto = codigo_produto;
    }
}

export class atualizarProdutoDto {
    constructor({
        nome_produto,
        descricao,
        preco,
        marca,
        custo,
        categoria,
        estoque,
        estoque_min,
        data_ultima_entrada,
        status,
        id_fornecedor,
        codigo_produto
    } = {}) {
        if (nome_produto !== undefined) this.nome_produto = nome_produto;
        if (descricao !== undefined) this.descricao = descricao;
        if (preco !== undefined) this.preco = preco;
        if (marca !== undefined) this.marca = marca;
        if (custo !== undefined) this.custo = custo;
        if (categoria !== undefined) this.categoria = categoria;
        if (estoque !== undefined) this.estoque = estoque;
        if (estoque_min !== undefined) this.estoque_min = estoque_min;
        if (data_ultima_entrada !== undefined) this.data_ultima_entrada = data_ultima_entrada;
        if (status !== undefined) this.status = status;
        if (id_fornecedor !== undefined) this.id_fornecedor = id_fornecedor;
        if (codigo_produto !== undefined) this.codigo_produto = codigo_produto;
    }
}

// export class 