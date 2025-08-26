import ProdutoRepository from '../repositories/produtoRepository.js';
import mongoose from 'mongoose';
import { CustomError, HttpStatusCodes } from '../utils/helpers/index.js';
import Produto from '../models/Produto.js';
import { CategoriaHelper } from '../utils/categoriaHelper.js';

class ProdutoService { 
    constructor() {
        this.repository = new ProdutoRepository();
    }

    // Método utilitário para adicionar nome do fornecedor aos resultados
    async enriquecerComNomesFornecedores(data) {
        // Enriquecer os resultados com os nomes dos fornecedores
        if (data.docs && data.docs.length > 0) {
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
            data.docs = data.docs.map(doc => {
                const docObj = typeof doc.toObject === 'function' ? doc.toObject() : {...doc};
                docObj.nome_fornecedor = fornecedorMap[doc.id_fornecedor] || 'Fornecedor não encontrado';
                return docObj;
            });
            
            return data;
        } else if (data && !data.docs && data.id_fornecedor) {
            // Caso seja apenas um produto (não paginado)
            const Fornecedor = mongoose.model('fornecedores');
            const fornecedores = await Fornecedor.find().lean();
            
            const fornecedorMap = {};
            fornecedores.forEach(fornecedor => {
                const tempId = fornecedor._id.toString().substring(0, 8);
                const idNumerico = parseInt(tempId, 16) % 1000;
                fornecedorMap[idNumerico] = fornecedor.nome_fornecedor;
            });
            
            const dataObj = typeof data.toObject === 'function' ? data.toObject() : {...data};
            dataObj.nome_fornecedor = fornecedorMap[data.id_fornecedor] || 'Fornecedor não encontrado';
            return dataObj;
        } else if (Array.isArray(data) && data.length > 0) {
            // Caso seja um array de produtos (ex: listarEstoqueBaixo)
            const Fornecedor = mongoose.model('fornecedores');
            const fornecedores = await Fornecedor.find().lean();
            
            const fornecedorMap = {};
            fornecedores.forEach(fornecedor => {
                const tempId = fornecedor._id.toString().substring(0, 8);
                const idNumerico = parseInt(tempId, 16) % 1000;
                fornecedorMap[idNumerico] = fornecedor.nome_fornecedor;
            });
            
            return data.map(item => {
                const itemObj = typeof item.toObject === 'function' ? item.toObject() : {...item};
                itemObj.nome_fornecedor = fornecedorMap[item.id_fornecedor] || 'Fornecedor não encontrado';
                return itemObj;
            });
        }
        
        return data;
    }

    async listarProdutos(req) {
        console.log('Estou no listar em ProdutoService');
        const data = await this.repository.listarProdutos(req);
        const resultado = await this.enriquecerComNomesFornecedores(data);
        
        console.log('Estou retornando os dados em ProdutoService');
        return resultado;
    }

    async cadastrarProduto(dadosProduto) { 
        console.log('Estou no criar em ProdutoService');

        if (!dadosProduto.data_ultima_entrada) {
            dadosProduto.data_ultima_entrada = new Date();
        }

        if (dadosProduto.status === undefined) {
            dadosProduto.status = true;
        }

        // Calcular categoria automaticamente baseado no preço
        if (dadosProduto.preco !== undefined) {
            dadosProduto.categoria = CategoriaHelper.calcularCategoriaPorValor(dadosProduto.preco);
        }

        const data = await this.repository.cadastrarProduto(dadosProduto);
        return data;
    }

    async atualizarProduto(id, dadosAtualizacao) {
        console.log('Atualizando produto:', id, dadosAtualizacao);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto inválido.'
            });
        }

        // Recalcular categoria se preço for alterado
        if (dadosAtualizacao.preco !== undefined) {
            dadosAtualizacao.categoria = CategoriaHelper.calcularCategoriaPorValor(dadosAtualizacao.preco);
        }

        const produtoAtualizado = await this.repository.atualizarProduto(id, dadosAtualizacao);
        return produtoAtualizado;
    }

    async buscarProdutoPorID(id) {
        console.log('Estou no buscarPorId em ProdutoService');

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto inválido.'
            });
        }

        const data = await this.repository.buscarProdutoPorID(id);
        return await this.enriquecerComNomesFornecedores(data);
    }

    async buscarProdutosPorNome(nome, page = 1, limite = 10) {
        console.log('Estou no buscarProdutosPorNome em ProdutoService');
    
        if (!nome || nome.trim() === '') {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'nome',
                details: [],
                customMessage: 'Nome de produto válido é obrigatório para busca.'
            });
        }
    
        const req = {
            params: {},
            query: {
                nome_produto: nome,
                page: page,
                limite: limite
            }
        };
    
        const data = await this.repository.listarProdutos(req);
        return await this.enriquecerComNomesFornecedores(data);
    }
    
    async buscarProdutosPorCategoria(categoria, page = 1, limite = 10) {
        console.log('Estou no buscarProdutosPorCategoria em ProdutoService');
    
        if (!categoria || categoria.trim() === '') {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'categoria',
                details: [],
                customMessage: 'Categoria válida é obrigatória para busca.'
            });
        }
    
        const req = {
            params: {},
            query: {
                categoria: categoria,
                page: page,
                limite: limite
            }
        };
    
        const data = await this.repository.listarProdutos(req);
        return await this.enriquecerComNomesFornecedores(data);
    }
    
    async buscarProdutosPorCodigo(codigo, page = 1, limite = 10) {
        console.log('Estou no buscarProdutosPorCodigo em ProdutoService');
    
        if (!codigo || codigo.trim() === '') {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'codigo_produto',
                details: [],
                customMessage: 'Código de produto válido é obrigatório para busca.'
            });
        }
    
        const req = {
            params: {},
            query: {
                codigo_produto: codigo,
                page: page,
                limite: limite
            }
        };
    
        const data = await this.repository.listarProdutos(req);
        return await this.enriquecerComNomesFornecedores(data);
    }
    
    async buscarProdutosPorFornecedor(fornecedor, page = 1, limite = 10, ehNome = false) {
        console.log('Estou no buscarProdutosPorFornecedor em ProdutoService');
    
        if (!fornecedor || (typeof fornecedor === 'string' && fornecedor.trim() === '')) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: ehNome ? 'nome_fornecedor' : 'id_fornecedor',
                details: [],
                customMessage: `${ehNome ? 'Nome' : 'ID'} de fornecedor válido é obrigatório para busca.`
            });
        }
    
        const req = {
            params: {},
            query: {
                page: page,
                limite: limite
            }
        };
    
        // Definir o parâmetro correto com base em ehNome
        if (ehNome) {
            req.query.nome_fornecedor = fornecedor;
        } else {
            req.query.id_fornecedor = fornecedor;
        }
    
        const data = await this.repository.listarProdutos(req);
        return await this.enriquecerComNomesFornecedores(data);
    }

    async deletarProduto(id) {
        console.log('Estou no deletar em ProdutoService');

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto inválido.'
            });
        }

        const data = await this.repository.deletarProduto(id);
        return data;
    }

    async listarEstoqueBaixo() {
        console.log('Estou no listarEstoqueBaixo em ProdutoService');
        const data = await this.repository.listarEstoqueBaixo();
        return await this.enriquecerComNomesFornecedores(data);
    }

    async desativarProduto(id) { 
        console.log('Estou no desativarProduto em ProdutoService');

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto inválido.'
            });
        }

        const data = await this.repository.desativarProduto(id);
        return data;
    }

    async reativarProduto(id) {
        console.log('Estou no reativarProduto em ProdutoService');

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto inválido.'
            });
        }

        const data = await this.repository.reativarProduto(id);
        return data;
    }
}

export default ProdutoService;