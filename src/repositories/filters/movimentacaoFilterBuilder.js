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
    //todo: rever
    comDestino(destino) { 
        if (destino && destino.trim() !== '') {
            this.filtros.destino = { $regex: this.escapeRegex(destino), $options: 'i' };
        }
        return this;
    }

    /**
     * Filtra movimentações por período
     */
    //todo: rever formato da data e colocar data fim como opcional
    comPeriodo(data_inicio, data_fim) {
        if (data_inicio && data_fim) {
            const data_inicioObj = new Date(data_inicio);
            const data_fimObj = new Date(data_fim);

            if (!isNaN(data_inicioObj) && !isNaN(data_fimObj)) {
                this.filtros.data_movimentacao = {
                    $gte: data_inicioObj,
                    $lte: new Date(data_fimObj.setHours(23, 59, 59, 999))
                };
            }
        }
        return this;
    }

    /**
     * Filtra movimentações por ID de usuário
     */
    //todo: rever porque ele lista mesmo sem o user existir(lista tudo)
    comUsuarioId(usuario_id) {
        if (usuario_id) {
            if (mongoose.Types.ObjectId.isValid(usuario_id)) {
                this.filtros.id_usuario = usuario_id;
            } else {
                // Filtro impossível, nunca retorna nada
                this.filtros.id_usuario = null;
            }
        }
        return this;
    }

    /**
     * Filtra movimentações por nome de usuário
     */
    comUsuarioNome(nome_usuario) {
        if (nome_usuario && nome_usuario.trim() !== '') {
            this.filtros['id_usuario.nome_usuario'] = { 
                $regex: this.escapeRegex(nome_usuario), 
                $options: 'i' 
            };
        }
        return this;
    }

    /**
     * Filtra movimentações por ID do produto
     */
    comProdutoId(produto_id) {
        if (produto_id && mongoose.Types.ObjectId.isValid(produto_id)) {
            this.filtros['produtos.produto_ref'] = produto_id;
        }
        return this;
    }

    /**
     * Filtra movimentações por código de produto
     */
    comProdutoCodigo(codigo_produto) {
        if (codigo_produto && codigo_produto.trim() !== '') {
            this.filtros['produtos.codigo_produto'] = { 
                $regex: this.escapeRegex(codigo_produto), 
                $options: 'i' 
            };
        }
        return this;
    }

    /**
     * Filtra movimentações por quantidade mínima de produtos
     */
    comQuantidadeMinima(quantidade_min) {
        const quantidade = Number(quantidade_min);
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
    comQuantidadeMaxima(quantidade_max) {
        const quantidade = Number(quantidade_max);
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