import mongoose from 'mongoose';

class MovimentacaoFilterBuilder {
    constructor() {
        this.filtros = {};
    }

    /**
     * Filtra movimentações por tipo (entrada ou saída)
     */
    comTipo(tipo) {
        if (tipo && ['entrada', 'saida'].includes(tipo)) {
            this.filtros.tipo = tipo;
        }
        return this;
    }

    /**
     * Filtra movimentações por destino
     */
    comDestino(destino) {
        if (destino && destino.trim() !== '') {
            this.filtros.destino = { $regex: this.escapeRegex(destino), $options: 'i' };
        }
        return this;
    }

    /**
     * Filtra movimentações por período
     */
    comPeriodo(dataInicio, dataFim) {
        if (dataInicio && dataFim) {
            const dataInicioObj = new Date(dataInicio);
            const dataFimObj = new Date(dataFim);

            if (!isNaN(dataInicioObj) && !isNaN(dataFimObj)) {
                this.filtros.data_movimentacao = {
                    $gte: dataInicioObj,
                    $lte: new Date(dataFimObj.setHours(23, 59, 59, 999))
                };
            }
        }
        return this;
    }

    /**
     * Filtra movimentações por ID de usuário
     */
    comUsuarioId(idUsuario) {
        if (idUsuario && mongoose.Types.ObjectId.isValid(idUsuario)) {
            this.filtros.id_usuario = idUsuario;
        }
        return this;
    }

    /**
     * Filtra movimentações por nome de usuário
     */
    comUsuarioNome(nomeUsuario) {
        if (nomeUsuario && nomeUsuario.trim() !== '') {
            this.filtros.nome_usuario = { $regex: this.escapeRegex(nomeUsuario), $options: 'i' };
        }
        return this;
    }

    /**
     * Filtra movimentações por ID do produto
     */
    comProdutoId(produtoId) {
        if (produtoId && mongoose.Types.ObjectId.isValid(produtoId)) {
            this.filtros['produtos.produto_ref'] = produtoId;
        }
        return this;
    }

    /**
     * Filtra movimentações por código de produto
     */
    comProdutoCodigo(codigoProduto) {
        if (codigoProduto && codigoProduto.trim() !== '') {
            this.filtros['produtos.codigo_produto'] = { 
                $regex: this.escapeRegex(codigoProduto), 
                $options: 'i' 
            };
        }
        return this;
    }

    /**
     * Filtra movimentações por quantidade mínima de produtos
     */
    comQuantidadeMinima(quantidadeMin) {
        const quantidade = Number(quantidadeMin);
        if (!isNaN(quantidade)) {
            this.filtros['produtos.quantidade_produtos'] = { 
                ...(this.filtros['produtos.quantidade_produtos'] || {}),
                $gte: quantidade 
            };
        }
        return this;
    }

    /**
     * Filtra movimentações por quantidade máxima de produtos
     */
    comQuantidadeMaxima(quantidadeMax) {
        const quantidade = Number(quantidadeMax);
        if (!isNaN(quantidade)) {
            this.filtros['produtos.quantidade_produtos'] = { 
                ...(this.filtros['produtos.quantidade_produtos'] || {}),
                $lte: quantidade 
            };
        }
        return this;
    }

    /**
     * Filtra movimentações por data específica
     */
    comData(data) {
        if (data) {
            const dataObj = new Date(data);
            if (!isNaN(dataObj)) {
                this.filtros.data_movimentacao = {
                    $gte: new Date(dataObj.setHours(0, 0, 0, 0)),
                    $lte: new Date(dataObj.setHours(23, 59, 59, 999))
                };
            }
        }
        return this;
    }

    /**
     * Filtra movimentações após uma data específica
     */
    comDataApos(data) {
        const dataObj = new Date(data);
        if (!isNaN(dataObj)) {
            this.filtros.data_movimentacao = {
                ...(this.filtros.data_movimentacao || {}),
                $gte: dataObj
            };
        }
        return this;
    }

    /**
     * Filtra movimentações antes de uma data específica
     */
    comDataAntes(data) {
        const dataObj = new Date(data);
        if (!isNaN(dataObj)) {
            this.filtros.data_movimentacao = {
                ...(this.filtros.data_movimentacao || {}),
                $lte: dataObj
            };
        }
        return this;
    }

    /**
     * Filtra movimentações por status
     */
    comStatus(status) {
        if (status !== undefined) {
            this.filtros.status = typeof status === 'string' ? status.toLowerCase() === 'true' : status;
        }
        return this;
    }

    /**
     * Utilitário para escapar caracteres especiais em expressões regulares
     */
    escapeRegex(texto) {
        return texto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    /**
     * Constrói e retorna o objeto de filtros
     */
    build() {
        return this.filtros;
    }
}

export default MovimentacaoFilterBuilder;