import mongoose from 'mongoose';
import Produto from '../models/Produto.js';
import { CustomError, messages } from '../utils/helpers/index.js';
import ProdutoFilterBuilder from './filters/ProdutoFilterBuilder.js';

class ProdutoRepository {
    constructor({ model = Produto } = {}) {
        this.model = model;
    }

    async listarProdutos(req) {
        console.log('Estou no listar em ProdutoRepository');
    
        const id = req.params ? req.params.id : null;
    
        if (id) {
            // Se tem ID, busca específica por ID - mantém o código original
            const data = await this.model.findById(id)
                .populate('fornecedores', '_id nome_fornecedor cnpj email');
    
            if (!data) {
                throw new CustomError({
                    statusCode: 404,
                    errorType: 'resourceNotFound',
                    field: 'Produto',
                    details: [],
                    customMessage: messages.error.resourceNotFound('Produto')
                });
            }
    
            return data;
        }
    
        // Para busca por filtros
        const { nome_produto, categoria, codigo_produto, estoque_baixo, id_fornecedor, nome_fornecedor } = req.query || {};
        
        // Garantir que os parâmetros de paginação sejam sempre processados corretamente
        const page = parseInt(req.query?.page, 10) || 1;
        const limite = Math.min(parseInt(req.query?.limite, 10) || 10, 100);
    
        // Use o ProdutoFilterBuilder para construir filtros
        const filterBuilder = new ProdutoFilterBuilder()
            .comNome(nome_produto || '')
            .comCategoria(categoria || '')
            .comCodigo(codigo_produto || '');

            await filterBuilder.comFornecedorNome(nome_fornecedor || '');
            await filterBuilder.comFornecedorId(id_fornecedor || '');
            await filterBuilder.comFornecedorNome(nome_fornecedor || '');
            await filterBuilder.comEstoqueBaixo(estoque_baixo || '');

        const filtros = filterBuilder.build();
    
        const options = {
            page: page,
            limit: limite,
            populate: 'fornecedores',
            sort: { nome_produto: 1 },
        };
    
        console.log('Filtros aplicados:', filtros);
        const resultado = await this.model.paginate(filtros, options);
        return resultado;
    }

    async buscarProdutoPorID(id) {
        const produto = await this.model.findById(id)
            .populate('fornecedores', '_id nome_fornecedor cnpj email');
        if (!produto) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Produto',
                details: [],
                customMessage: messages.error.resourceNotFound('Produto')
            });
        }
        return produto;
    }

    async buscarPorNome(nome) {
        let query = this.model.find({ nome_produto: { $regex: nome, $options: 'i' } });

        const produto = await query;
        
        if (!produto) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Usuário',
                details: [],
                customMessage: messages.error.resourceNotFound('Produto')
            });
        }
        console.log('Produto encontrado:', produto);

        return produto;
    }

    async cadastrarProduto(dadosProduto) {
        const produtoExistente = await this.model.findOne({ codigo_produto: dadosProduto.codigo_produto });
        if (produtoExistente) {
            throw new CustomError({ 
                statusCode: 400,
                errorType: 'validationError',
                field: 'codigo_produto',
                details: [],
                customMessage: 'Já existe um produto com este código.'
            });
        }

        const produto = new this.model(dadosProduto);
        return await produto.save();
    }

    async atualizarProduto(id, dadosProduto) {
        console.log('Repositório - atualizando produto:', id);
        console.log('Dados de atualização:', JSON.stringify(dadosProduto, null, 2));

        // Verifique se o ID é válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: 400,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto inválido'
            });
        }

        if (dadosProduto.codigo_produto) {
            const produtoExistente = await this.model.findOne({
                codigo_produto: dadosProduto.codigo_produto,
                _id: { $ne: id }
            });

            if (produtoExistente) {
                throw new CustomError({
                    statusCode: 400,
                    errorType: 'validationError',
                    field: 'codigo_produto',
                    details: [],
                    customMessage: 'Este código já está sendo usado por outro produto.'
                });
            }
        }

        // Garantir que estamos usando as opções corretas
        const produto = await this.model.findByIdAndUpdate(
            id,
            dadosProduto,
            { new: true, runValidators: true }
        );

        console.log('Resultado da atualização:', produto ? 'Sucesso' : 'Falha');

        if (!produto) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Produto',
                details: [],
                customMessage: 'Produto não encontrado'
            });
        }

        return produto;
    }

    async deletarProduto(id) {
        const produto = await this.model.findByIdAndDelete(id);
        if (!produto) {
            throw new CustomError({
                statusCode: 404,
                errorType: 'resourceNotFound',
                field: 'Produto',
                details: [],
                customMessage: messages.error.resourceNotFound('Produto')
            });
        }
        return produto;
    }

    async listarEstoqueBaixo() {
        return await this.model.find({
            $expr: { $lt: ["$estoque", "$estoque_min"] }
        });
    }

    async desativarProduto(id) { 
        const produto = await this.model.findByIdAndUpdate (
            id,
            { status: false },
            { new: true }
        );
        return produto;
    }

    async reativarProduto(id) {
        const produto = await this.model.findByIdAndUpdate (
            id,
            { status: true },
            { new: true }
        );
        return produto;
    }
}

export default ProdutoRepository;