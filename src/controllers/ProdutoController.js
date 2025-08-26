import ProdutoService from '../services/produtoService.js'
import { ProdutoQuerySchema, ProdutoIdSchema } from '../utils/validators/schemas/zod/querys/ProdutoQuerySchema.js';
import { ProdutoSchema, ProdutoUpdateSchema } from '../utils/validators/schemas/zod/ProdutoSchema.js';
import { CommonResponse, CustomError, HttpStatusCodes } from '../utils/helpers/index.js';

class ProdutoController {
    constructor() {
        this.service = new ProdutoService(); 
    }

    async listarProdutos(req, res) {
        console.log('Estou no listarProdutos em ProdutoController');
    
        const { id } = req.params || {};
        if (id) {
            ProdutoIdSchema.parse(id);
        }

        // Garantir que os parâmetros de paginação existam
        if (!req.query) req.query = {};
        if (!req.query.page) req.query.page = 1;
        if (!req.query.limite) req.query.limite = 10;
        
        // Validar query params (se existirem outros além da paginação)
        if (Object.keys(req.query).some(key => !['page', 'limite'].includes(key))) {
            await ProdutoQuerySchema.parseAsync(req.query);
        }

        const data = await this.service.listarProdutos(req);

        // Verificar se a lista está vazia
        if (data.docs && data.docs.length === 0) {
            return CommonResponse.error(
                res,
                404,
                'resourceNotFound',
                'Produto',
                [],
                'Nenhum produto encontrado com os critérios informados.'
            );
        }

        return CommonResponse.success(res, data);
    }

    async buscarProdutoPorID(req, res) { 
        console.log('Estou no buscarProdutoPorID em ProdutoController');

        const { id } = req.params || {};

        ProdutoIdSchema.parse(id);
        const data = await this.service.buscarProdutoPorID(id);
        return CommonResponse.success(res, data, 200, 'Produto encontrado com sucesso.');
    }

    async buscarProdutos(req, res) {
        console.log('Estou no buscarProdutos em ProdutoController');
        console.log('Query params:', req.query);
    
        
        const query = req.query || {};
        const page = parseInt(query.page) || 1;
        const limite = Math.min(parseInt(query.limite) || 10, 100);
        
        let data = null;
        let tipoFiltro = null;
        
        // Verificar qual filtro foi passado
        if (query.nome) {
            tipoFiltro = 'nome';
            data = await this.service.buscarProdutosPorNome(query.nome, page, limite);
        } else if (query.categoria) {
            tipoFiltro = 'categoria';
            data = await this.service.buscarProdutosPorCategoria(query.categoria, page, limite);
        } else if (query.codigo) {
            tipoFiltro = 'codigo';
            data = await this.service.buscarProdutosPorCodigo(query.codigo, page, limite);
        } else if (query.fornecedor) {
            tipoFiltro = 'fornecedor';
            data = await this.service.buscarProdutosPorFornecedor(query.fornecedor, page, limite, true);
        } else {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'query',
                details: [],
                customMessage: 'É necessário informar ao menos um parâmetro de busca: nome, categoria, codigo ou fornecedor.'
            });
        }
        
        // Verificar se a busca retornou resultados
        if (data.docs && data.docs.length === 0) {
            return CommonResponse.error(
                res,
                404,
                'resourceNotFound',
                'Produto',
                [],
                `Nenhum produto encontrado com o(a) ${tipoFiltro}: ${query[tipoFiltro]}`
            );
        }
        
        return CommonResponse.success(res, data, 200, 'Produtos encontrados com sucesso.');
    
    }

    async cadastrarProduto(req, res) {
        console.log('Estou no cadastrarProduto em ProdutoController');
    
        
        const parsedData = ProdutoSchema.parse(req.body);
        const data = await this.service.cadastrarProduto(parsedData);
        return CommonResponse.created(res, data, HttpStatusCodes.CREATED.code, 'Produto cadastrado com sucesso.');
    }

    async atualizarProduto(req, res) {
        console.log('Estou no atualizarProduto em ProdutoController');
        console.log('Dados recebidos:', JSON.stringify(req.body, null, 2));
        console.log('ID do produto:', req.params.id);

        
        const { id } = req.params;
        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto é obrigatório.'
            });
        }

        ProdutoIdSchema.parse(id);

        const dadosAtualizacao = req.body;

        // Verifica se há dados para atualizar
        if (Object.keys(dadosAtualizacao).length === 0) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'body',
                details: [],
                customMessage: 'Nenhum dado fornecido para atualização.'
            });
        }

        await ProdutoUpdateSchema.parseAsync(dadosAtualizacao);

        const produtoAtualizado = await this.service.atualizarProduto(id, dadosAtualizacao);

        console.log('Produto atualizado:', produtoAtualizado);

        return CommonResponse.success(
            res,
            produtoAtualizado,
            200,
            'Produto atualizado com sucesso.'
        );
    
    }

    async deletarProduto(req, res) {
        console.log('Estou no deletarProduto em ProdutoController');

        const { id } = req.params || {};
        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto é obrigatório para deletar.'
            });
        }

        ProdutoIdSchema.parse(id);
        const data = await this.service.deletarProduto(id);
        return CommonResponse.success(res, data, 200, 'Produto excluído com sucesso.');
    }

    async listarEstoqueBaixo(req, res) {
        console.log('Estou no listarEstoqueBaixo em ProdutoController');

        
        const data = await this.service.listarEstoqueBaixo();

        // Verificar se há produtos com estoque baixo
        if (!data || data.length === 0) {
            return CommonResponse.error(
                res,
                404,
                'resourceNotFound',
                'Produto',
                [],
                'Nenhum produto com estoque baixo encontrado.'
            );
        }

        return CommonResponse.success(res, data, 200, 'Lista de produtos com estoque baixo.');
    
    }

    async desativarProduto(req, res) {
        console.log('Estou no desativarProduto em ProdutoController');

        const { id } = req.params || {};
        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto é obrigatório para desativar.'
            });
        }

        ProdutoIdSchema.parse(id);
        const data = await this.service.desativarProduto(id);
        return CommonResponse.success(res, data, 200, 'Produto desativado com sucesso.');
    }

    async reativarProduto(req, res) {
        console.log('Estou no reativarProduto em ProdutoController');

        const { id } = req.params || {};
        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do produto é obrigatório para reativar.'
            });
        }

        ProdutoIdSchema.parse(id);
        const data = await this.service.reativarProduto(id);
        return CommonResponse.success(res, data, 200, 'Produto reativado com sucesso.');
    }
}

export default ProdutoController;