import mongoose from 'mongoose';

class MovimentacaoFilterBuilder {
    constructor() {
        this.filtros = {};
    }

    /**
     * Filtra movimentações por tipo (entrada ou saída)
     * @param {string} tipo - 'entrada' ou 'saida'
     * @returns {MovimentacaoFilterBuilder} - Instância atual para encadeamento
     */
    comTipo(tipo) {
        if (tipo && ['entrada', 'saida'].includes(tipo)) {
            this.filtros.tipo = tipo;
        }
        return this;
    }

    /**
     * Filtra movimentações por destino
     * @param {string} destino - Destino da movimentação
     * @returns {MovimentacaoFilterBuilder} - Instância atual para encadeamento
     */
    comDestino(destino) {
        if (destino && destino.trim() !== '') {
            this.filtros.destino = { $regex: this.escapeRegex(destino), $options: 'i' };
        }
        return this;
    }

    /**
     * Filtra movimentações por período
     * @param {string|Date} dataInicio - Data inicial do período
     * @param {string|Date} dataFim - Data final do período
     * @returns {MovimentacaoFilterBuilder} - Instância atual para encadeamento
     */
    comPeriodo(dataInicio, dataFim) {
        if (dataInicio && dataFim) {
            const dataInicioObj = new Date(dataInicio);
            const dataFimObj = new Date(dataFim);
            
            // Verifica se ambas as datas são válidas
            if (!isNaN(dataInicioObj) && !isNaN(dataFimObj)) {
                // Configura o fim do dia para a data final
                dataFimObj.setHours(23, 59, 59, 999);
                
                this.filtros.data_movimentacao = {
                    $gte: dataInicioObj,
                    $lte: dataFimObj
                };
            }
        }
        return this;
    }

    /**
     * Filtra movimentações por ID de usuário
     * @param {string} idUsuario - ID do usuário
     * @returns {MovimentacaoFilterBuilder} - Instância atual para encadeamento
     */
    comUsuarioId(idUsuario) {
        if (idUsuario && mongoose.Types.ObjectId.isValid(idUsuario)) {
            this.filtros.id_usuario = idUsuario;
        }
        return this;
    }

    /**
     * Filtra movimentações por nome de usuário
     * @param {string} nomeUsuario - Nome do usuário
     * @returns {MovimentacaoFilterBuilder} - Instância atual para encadeamento
     */
    comUsuarioNome(nomeUsuario) {
        if (nomeUsuario && nomeUsuario.trim() !== '') {
            this.filtros.nome_usuario = { $regex: this.escapeRegex(nomeUsuario), $options: 'i' };
        }
        return this;
    }

    /**
     * Filtra movimentações por ID do produto
     * @param {string} produtoId - ID do produto
     * @returns {MovimentacaoFilterBuilder} - Instância atual para encadeamento
     */
    comProdutoId(produtoId) {
        if (produtoId && mongoose.Types.ObjectId.isValid(produtoId)) {
            this.filtros['produtos.produto_ref'] = produtoId;
        }
        return this;
    }

    /**
     * Filtra movimentações por código de produto
     * @param {string} codigoProduto - Código do produto
     * @returns {MovimentacaoFilterBuilder} - Instância atual para encadeamento
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
     * Filtra movimentações por nome de produto
     * @param {string} nomeProduto - Nome do produto
     * @returns {MovimentacaoFilterBuilder} - Instância atual para encadeamento
     */
    comProdutoNome(nomeProduto) {
        if (nomeProduto && nomeProduto.trim() !== '') {
            this.filtros['produtos.nome_produto'] = { 
                $regex: this.escapeRegex(nomeProduto), 
                $options: 'i' 
            };
        }
        return this;
    }

    /**
     * Filtra movimentações por ID do fornecedor
     * @param {number|string} idFornecedor - ID do fornecedor
     * @returns {MovimentacaoFilterBuilder} - Instância atual para encadeamento
     */
    comFornecedorId(idFornecedor) {
        if (idFornecedor) {
            const fornecedorId = parseInt(idFornecedor);
            if (!isNaN(fornecedorId)) {
                this.filtros['produtos.id_fornecedor'] = fornecedorId;
            }
        }
        return this;
    }

    /**
     * Filtra movimentações por nome do fornecedor
     * @param {string} nomeFornecedor - Nome do fornecedor
     * @returns {MovimentacaoFilterBuilder} - Instância atual para encadeamento
     */
    comFornecedorNome(nomeFornecedor) {
        if (nomeFornecedor && nomeFornecedor.trim() !== '') {
            this.filtros['produtos.nome_fornecedor'] = { 
                $regex: this.escapeRegex(nomeFornecedor), 
                $options: 'i' 
            };
        }
        return this;
    }

    /**
     * Filtra movimentações por quantidade mínima de produtos
     * @param {number|string} quantidadeMin - Quantidade mínima
     * @returns {MovimentacaoFilterBuilder} - Instância atual para encadeamento
     */
    comQuantidadeMinima(quantidadeMin) {
        if (quantidadeMin !== undefined && quantidadeMin !== null) {
            const quantidade = Number(quantidadeMin);
            if (!isNaN(quantidade)) {
                this.filtros['produtos.quantidade_produtos'] = { 
                    ...(this.filtros['produtos.quantidade_produtos'] || {}),
                    $gte: quantidade 
                };
            }
        }
        return this;
    }

    /**
     * Filtra movimentações por quantidade máxima de produtos
     * @param {number|string} quantidadeMax - Quantidade máxima
     * @returns {MovimentacaoFilterBuilder} - Instância atual para encadeamento
     */
    comQuantidadeMaxima(quantidadeMax) {
        if (quantidadeMax !== undefined && quantidadeMax !== null) {
            const quantidade = Number(quantidadeMax);
            if (!isNaN(quantidade)) {
                this.filtros['produtos.quantidade_produtos'] = { 
                    ...(this.filtros['produtos.quantidade_produtos'] || {}),
                    $lte: quantidade 
                };
            }
        }
        return this;
    }

    /**
     * Filtra movimentações por data específica
     * @param {string|Date} data - Data da movimentação
     * @returns {MovimentacaoFilterBuilder} - Instância atual para encadeamento
     */
    comData(data) {
        if (data) {
            const dataObj = new Date(data);
            if (!isNaN(dataObj)) {
                // Criar intervalo de início e fim do dia
                const inicioData = new Date(dataObj.setHours(0, 0, 0, 0));
                const fimData = new Date(dataObj.setHours(23, 59, 59, 999));
                
                this.filtros.data_movimentacao = {
                    $gte: inicioData,
                    $lte: fimData
                };
            }
        }
        return this;
    }

    /**
     * Filtra movimentações após uma data específica
     * @param {string|Date} data - Data a partir da qual filtrar
     * @returns {MovimentacaoFilterBuilder} - Instância atual para encadeamento
     */
    comDataApos(data) {
        if (data) {
            const dataObj = new Date(data);
            if (!isNaN(dataObj)) {
                this.filtros.data_movimentacao = {
                    ...(this.filtros.data_movimentacao || {}),
                    $gte: dataObj
                };
            }
        }
        return this;
    }

    /**
     * Filtra movimentações antes de uma data específica
     * @param {string|Date} data - Data até a qual filtrar
     * @returns {MovimentacaoFilterBuilder} - Instância atual para encadeamento
     */
    comDataAntes(data) {
        if (data) {
            const dataObj = new Date(data);
            if (!isNaN(dataObj)) {
                this.filtros.data_movimentacao = {
                    ...(this.filtros.data_movimentacao || {}),
                    $lte: dataObj
                };
            }
        }
        return this;
    }

    /**
     * Utilitário para escapar caracteres especiais em expressões regulares
     * @param {string} texto - Texto a ser escapado
     * @returns {string} - Texto com caracteres especiais escapados
     */
    escapeRegex(texto) {
        return texto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    comStatus(status) {
        if (status !== undefined) {
            // Converter string 'true' ou 'false' para booleano
            if (typeof status === 'string') {
                status = status.toLowerCase() === 'true';
            }
            this.filtros.status = status;
        }
        return this;
    }

    /**
     * Constrói e retorna o objeto de filtros
     * @returns {Object} - Filtros para consulta MongoDB
     */
    build() {
        return this.filtros;
    }
}

export default MovimentacaoFilterBuilder;