import DashboardService from '../services/dashboardService.js';
import { CommonResponse } from '../utils/helpers/index.js';

class DashboardController {
    constructor() {
        this.service = new DashboardService();
    }

    async obterProdutosCategoriaA(req, res) {
        console.log('Estou no obterProdutosCategoriaA em DashboardController');
        
        try {
            const produtos = await this.service.obterProdutosCategoriaA();
            
            if (!produtos || produtos.length === 0) {
                return CommonResponse.error(
                    res,
                    404,
                    'resourceNotFound',
                    'Produto',
                    [],
                    'Nenhum produto encontrado na categoria A.'
                );
            }

            return CommonResponse.success(res, {
                categoria: 'A',
                descricao: 'Alta (R$ 1.001,00 - R$ 10.000,00)',
                total: produtos.length,
                produtos: produtos
            });
        } catch (error) {
            console.error('Erro ao buscar produtos categoria A:', error);
            return CommonResponse.error(
                res,
                500,
                'internalServerError',
                'Produto',
                [],
                'Erro interno do servidor ao buscar produtos da categoria A.'
            );
        }
    }

    async obterProdutosCategoriaB(req, res) {
        console.log('Estou no obterProdutosCategoriaB em DashboardController');
        
        try {
            const produtos = await this.service.obterProdutosCategoriaB();
            
            if (!produtos || produtos.length === 0) {
                return CommonResponse.error(
                    res,
                    404,
                    'resourceNotFound',
                    'Produto',
                    [],
                    'Nenhum produto encontrado na categoria B.'
                );
            }

            return CommonResponse.success(res, {
                categoria: 'B',
                descricao: 'Média (R$ 500,00 - R$ 1.000,00)',
                total: produtos.length,
                produtos: produtos
            });
        } catch (error) {
            console.error('Erro ao buscar produtos categoria B:', error);
            return CommonResponse.error(
                res,
                500,
                'internalServerError',
                'Produto',
                [],
                'Erro interno do servidor ao buscar produtos da categoria B.'
            );
        }
    }

    async obterProdutosCategoriaC(req, res) {
        console.log('Estou no obterProdutosCategoriaC em DashboardController');
        
        try {
            const produtos = await this.service.obterProdutosCategoriaC();
            
            if (!produtos || produtos.length === 0) {
                return CommonResponse.error(
                    res,
                    404,
                    'resourceNotFound',
                    'Produto',
                    [],
                    'Nenhum produto encontrado na categoria C.'
                );
            }

            return CommonResponse.success(res, {
                categoria: 'C',
                descricao: 'Baixa (R$ 0,00 - R$ 499,00)',
                total: produtos.length,
                produtos: produtos
            });
        } catch (error) {
            console.error('Erro ao buscar produtos categoria C:', error);
            return CommonResponse.error(
                res,
                500,
                'internalServerError',
                'Produto',
                [],
                'Erro interno do servidor ao buscar produtos da categoria C.'
            );
        }
    }

    async obterResumoCategoriasCount(req, res) {
        console.log('Estou no obterResumoCategoriasCount em DashboardController');
        
        try {
            const resumo = await this.service.obterResumoCategoriasCount();
            return CommonResponse.success(res, resumo);
        } catch (error) {
            console.error('Erro ao buscar resumo das categorias:', error);
            return CommonResponse.error(
                res,
                500,
                'internalServerError',
                'Produto',
                [],
                'Erro interno do servidor ao buscar resumo das categorias.'
            );
        }
    }
}

export default DashboardController;