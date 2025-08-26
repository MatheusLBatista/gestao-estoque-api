import mongoose from 'mongoose';
import MovimentacaoRepository from '../repositories/movimentacaoRepository.js';
import ProdutoService from './produtoService.js';
import { CustomError, HttpStatusCodes } from '../utils/helpers/index.js';

class MovimentacaoService {
    constructor() {
        this.repository = new MovimentacaoRepository();
        this.produtoService = new ProdutoService();
    }

    async listarMovimentacoes(req) {
        console.log('Estou no listarMovimentacoes em MovimentacaoService');
        const data = await this.repository.listarMovimentacoes(req);
        console.log('Estou retornando os dados em MovimentacaoService');
        return data;
    }

    async buscarMovimentacaoPorID(id) {
        console.log('Estou no buscarMovimentacaoPorID em MovimentacaoService');

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID da movimentação inválido.'
            });
        }

        const data = await this.repository.buscarMovimentacaoPorID(id);
        
        if (!data) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'id',
                details: [],
                customMessage: 'Movimentação não encontrada.'
            });
        }
        
        return data;
    }

    async buscarMovimentacoesPorTipo(tipo, page = 1, limite = 10) {
        console.log('Estou no buscarMovimentacoesPorTipo em MovimentacaoService');
        
        if (!tipo || tipo.trim() === '' || !['entrada', 'saida'].includes(tipo)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'tipo',
                details: [],
                customMessage: 'Tipo de movimentação inválido. Use "entrada" ou "saida".'
            });
        }

        const req = {
            params: {},
            query: {
                tipo: tipo,
                page: page,
                limite: limite
            }
        };

        const data = await this.repository.listarMovimentacoes(req);
        return data;
    }

    async buscarMovimentacoesPorPeriodo(dataInicio, dataFim, page = 1, limite = 10) {
        console.log('Estou no buscarMovimentacoesPorPeriodo em MovimentacaoService');
        
        // Validar formato das datas
        const dataInicioObj = new Date(dataInicio);
        const dataFimObj = new Date(dataFim);
        
        if (isNaN(dataInicioObj.getTime()) || isNaN(dataFimObj.getTime())) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'data',
                details: [],
                customMessage: 'Formato de data inválido. Use o formato YYYY-MM-DD.'
            });
        }
        
        if (dataInicioObj > dataFimObj) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'periodo',
                details: [],
                customMessage: 'Data de início não pode ser posterior à data de fim.'
            });
        }

        const req = {
            params: {},
            query: {
                data_inicio: dataInicio,
                data_fim: dataFim,
                page: page,
                limite: limite
            }
        };

        const data = await this.repository.listarMovimentacoes(req);
        return data;
    }

    async buscarMovimentacoesPorProduto(produto, page = 1, limite = 10) {
        console.log('Estou no buscarMovimentacoesPorProduto em MovimentacaoService');
        
        if (!produto || produto.trim() === '') {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'produto',
                details: [],
                customMessage: 'Identificador do produto é obrigatório para busca.'
            });
        }

        const req = {
            params: {},
            query: {
                produto: produto,
                page: page,
                limite: limite
            }
        };

        const data = await this.repository.listarMovimentacoes(req);
        return data;
    }

    async buscarMovimentacoesPorUsuario(usuario, page = 1, limite = 10) {
        console.log('Estou no buscarMovimentacoesPorUsuario em MovimentacaoService');
        
        if (!usuario || usuario.trim() === '') {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'usuario',
                details: [],
                customMessage: 'Identificador do usuário é obrigatório para busca.'
            });
        }

        const req = {
            params: {},
            query: {
                usuario: usuario,
                page: page,
                limite: limite
            }
        };

        const data = await this.repository.listarMovimentacoes(req);
        return data;
    }

    async cadastrarMovimentacao(dadosMovimentacao) {
        console.log('Estou no cadastrarMovimentacao em MovimentacaoService');
        
        // Definir data de movimentação caso não exista
        if (!dadosMovimentacao.data_movimentacao) {
            dadosMovimentacao.data_movimentacao = new Date();
        }
        
        // Validar produtos
        if (!dadosMovimentacao.produtos || dadosMovimentacao.produtos.length === 0) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'produtos',
                details: [],
                customMessage: 'A movimentação deve conter pelo menos um produto.'
            });
        }
        
        // Se for saída, verificar disponibilidade de estoque
        if (dadosMovimentacao.tipo === 'saida') {
            for (const produtoMov of dadosMovimentacao.produtos) {
                try {
                    const produto = await this.produtoService.buscarProdutoPorID(produtoMov.produto_ref);
                    
                    if (produto.quantidade_estoque < produtoMov.quantidade_produtos) {
                        throw new CustomError({
                            statusCode: HttpStatusCodes.BAD_REQUEST.code,
                            errorType: 'businessRuleViolation',
                            field: 'quantidade_produtos',
                            details: [],
                            customMessage: `Estoque insuficiente para o produto ${produto.nome_produto}. Disponível: ${produto.quantidade_estoque}.`
                        });
                    }
                    
                    // Atualizar estoque do produto
                    await this.produtoService.atualizarProduto(produto._id, {
                        quantidade_estoque: produto.quantidade_estoque - produtoMov.quantidade_produtos
                    });
                } catch (error) {
                    if (error.statusCode !== HttpStatusCodes.BAD_REQUEST.code) {
                        throw new CustomError({
                            statusCode: HttpStatusCodes.BAD_REQUEST.code,
                            errorType: 'validationError',
                            field: 'produto_ref',
                            details: [],
                            customMessage: `Produto não encontrado: ${produtoMov.produto_ref}`
                        });
                    }
                    throw error;
                }
            }
        } else if (dadosMovimentacao.tipo === 'entrada') {
            // Para entradas, aumentar o estoque
            for (const produtoMov of dadosMovimentacao.produtos) {
                try {
                    const produto = await this.produtoService.buscarProdutoPorID(produtoMov.produto_ref);
                    
                    // Atualizar estoque do produto
                    await this.produtoService.atualizarProduto(produto._id, {
                        quantidade_estoque: produto.quantidade_estoque + produtoMov.quantidade_produtos,
                        data_ultima_entrada: new Date()
                    });
                } catch (error) {
                    if (error.statusCode !== HttpStatusCodes.BAD_REQUEST.code) {
                        throw new CustomError({
                            statusCode: HttpStatusCodes.BAD_REQUEST.code,
                            errorType: 'validationError',
                            field: 'produto_ref',
                            details: [],
                            customMessage: `Produto não encontrado: ${produtoMov.produto_ref}`
                        });
                    }
                    throw error;
                }
            }
        }
        
        // Cadastrar a movimentação
        const data = await this.repository.cadastrarMovimentacao(dadosMovimentacao);
        return data;
    }

    async atualizarMovimentacao(id, dadosAtualizacao) {
        console.log('Estou no atualizarMovimentacao em MovimentacaoService');
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID da movimentação inválido.'
            });
        }
        
        // Buscar movimentação original para verificar alterações
        const movimentacaoOriginal = await this.repository.buscarMovimentacaoPorID(id);
        
        if (!movimentacaoOriginal) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'id',
                details: [],
                customMessage: 'Movimentação não encontrada.'
            });
        }
        
        // Verificar se a movimentação tem mais de 24 horas
        const agora = new Date();
        const dataMovimentacao = new Date(movimentacaoOriginal.data_movimentacao);
        const diferencaHoras = Math.abs(agora - dataMovimentacao) / 36e5; // 36e5 é o número de milissegundos em uma hora
        
        if (diferencaHoras > 24 && (dadosAtualizacao.produtos || dadosAtualizacao.tipo)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: 'businessRuleViolation',
                field: 'data_movimentacao',
                details: [],
                customMessage: 'Não é possível alterar produtos ou tipo de movimentações com mais de 24 horas.'
            });
        }
        
        // Ajustar estoque caso haja mudança nos produtos
        if (dadosAtualizacao.produtos && movimentacaoOriginal.tipo === 'saida') {
            // Devolver produtos ao estoque (cancelar saída original)
            for (const produtoMov of movimentacaoOriginal.produtos) {
                try {
                    const produto = await this.produtoService.buscarProdutoPorID(produtoMov.produto_ref);
                    // Devolver ao estoque
                    await this.produtoService.atualizarProduto(produto._id, {
                        quantidade_estoque: produto.quantidade_estoque + produtoMov.quantidade_produtos
                    });
                } catch (error) {
                    console.error(`Erro ao restaurar estoque para produto ${produtoMov.produto_ref}:`, error);
                }
            }
            
            // Verificar e deduzir estoque para novos produtos
            for (const produtoMov of dadosAtualizacao.produtos) {
                try {
                    const produto = await this.produtoService.buscarProdutoPorID(produtoMov.produto_ref);
                    
                    if (produto.quantidade_estoque < produtoMov.quantidade_produtos) {
                        throw new CustomError({
                            statusCode: HttpStatusCodes.BAD_REQUEST.code,
                            errorType: 'businessRuleViolation',
                            field: 'quantidade_produtos',
                            details: [],
                            customMessage: `Estoque insuficiente para o produto ${produto.nome_produto}. Disponível: ${produto.quantidade_estoque}.`
                        });
                    }
                    
                    // Atualizar estoque
                    await this.produtoService.atualizarProduto(produto._id, {
                        quantidade_estoque: produto.quantidade_estoque - produtoMov.quantidade_produtos
                    });
                } catch (error) {
                    if (error.statusCode !== HttpStatusCodes.BAD_REQUEST.code) {
                        throw new CustomError({
                            statusCode: HttpStatusCodes.BAD_REQUEST.code,
                            errorType: 'validationError',
                            field: 'produto_ref',
                            details: [],
                            customMessage: `Produto não encontrado: ${produtoMov.produto_ref}`
                        });
                    }
                    throw error;
                }
            }
        } else if (dadosAtualizacao.produtos && movimentacaoOriginal.tipo === 'entrada') {
            // Semelhante para entradas, mas inverter a lógica
            // Remover produtos do estoque (cancelar entrada original)
            for (const produtoMov of movimentacaoOriginal.produtos) {
                try {
                    const produto = await this.produtoService.buscarProdutoPorID(produtoMov.produto_ref);
                    // Remover do estoque
                    await this.produtoService.atualizarProduto(produto._id, {
                        quantidade_estoque: Math.max(0, produto.quantidade_estoque - produtoMov.quantidade_produtos)
                    });
                } catch (error) {
                    console.error(`Erro ao ajustar estoque para produto ${produtoMov.produto_ref}:`, error);
                }
            }
            
            // Adicionar novos produtos ao estoque
            for (const produtoMov of dadosAtualizacao.produtos) {
                try {
                    const produto = await this.produtoService.buscarProdutoPorID(produtoMov.produto_ref);
                    
                    // Atualizar estoque
                    await this.produtoService.atualizarProduto(produto._id, {
                        quantidade_estoque: produto.quantidade_estoque + produtoMov.quantidade_produtos,
                        data_ultima_entradaup: new Date()
                    });
                } catch (error) {
                    if (error.statusCode !== HttpStatusCodes.BAD_REQUEST.code) {
                        throw new CustomError({
                            statusCode: HttpStatusCodes.BAD_REQUEST.code,
                            errorType: 'validationError',
                            field: 'produto_ref',
                            details: [],
                            customMessage: `Produto não encontrado: ${produtoMov.produto_ref}`
                        });
                    }
                    throw error;
                }
            }
        }
        
        // Adicionar data de última atualização
        dadosAtualizacao.data_ultima_atualizacao = new Date();
        
        // Atualizar a movimentação
        const movimentacaoAtualizada = await this.repository.atualizarMovimentacao(id, dadosAtualizacao);
        return movimentacaoAtualizada;
    }

    async deletarMovimentacao(id) {
        console.log('Estou no deletarMovimentacao em MovimentacaoService');
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID da movimentação inválido.'
            });
        }
        
        // Buscar movimentação para verificar se existe e para ajustar estoque
        const movimentacao = await this.repository.buscarMovimentacaoPorID(id);
        
        if (!movimentacao) {
            throw new CustomError({
                statusCode: HttpStatusCodes.NOT_FOUND.code,
                errorType: 'resourceNotFound',
                field: 'id',
                details: [],
                customMessage: 'Movimentação não encontrada.'
            });
        }
        
        // Verificar se a movimentação tem mais de 3 dias (regras de negócio)
        const agora = new Date();
        const dataMovimentacao = new Date(movimentacao.data_movimentacao);
        const diferencaDias = Math.floor((agora - dataMovimentacao) / (1000 * 60 * 60 * 24));
        
        if (diferencaDias > 3) {
            throw new CustomError({
                statusCode: HttpStatusCodes.FORBIDDEN.code,
                errorType: 'businessRuleViolation',
                field: 'data_movimentacao',
                details: [],
                customMessage: 'Não é possível deletar movimentações com mais de 3 dias.'
            });
        }
        
        // Ajustar estoque ao deletar movimentação
        if (movimentacao.tipo === 'saida') {
            // Devolver produtos ao estoque
            for (const produtoMov of movimentacao.produtos) {
                try {
                    const produto = await this.produtoService.buscarProdutoPorID(produtoMov.produto_ref);
                    // Devolver ao estoque
                    await this.produtoService.atualizarProduto(produto._id, {
                        quantidade_estoque: produto.quantidade_estoque + produtoMov.quantidade_produtos
                    });
                } catch (error) {
                    console.error(`Erro ao restaurar estoque para produto ${produtoMov.produto_ref}:`, error);
                }
            }
        } else if (movimentacao.tipo === 'entrada') {
            // Remover produtos do estoque
            for (const produtoMov of movimentacao.produtos) {
                try {
                    const produto = await this.produtoService.buscarProdutoPorID(produtoMov.produto_ref);
                    // Remover do estoque (sem permitir quantidade negativa)
                    await this.produtoService.atualizarProduto(produto._id, {
                        quantidade_estoque: Math.max(0, produto.quantidade_estoque - produtoMov.quantidade_produtos)
                    });
                } catch (error) {
                    console.error(`Erro ao ajustar estoque para produto ${produtoMov.produto_ref}:`, error);
                }
            }
        }
        
        // Excluir a movimentação
        const data = await this.repository.deletarMovimentacao(id);
        return data;
    }

    async filtrarMovimentacoesAvancado(filtros = {}, opcoesPaginacao = {}) {
        console.log('Estou no filtrarMovimentacoesAvancado em MovimentacaoService');
        
        // Validações básicas
        if (filtros.dataInicio && filtros.dataFim) {
            const dataInicioObj = new Date(filtros.dataInicio);
            const dataFimObj = new Date(filtros.dataFim);
            
            if (isNaN(dataInicioObj.getTime()) || isNaN(dataFimObj.getTime())) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'data',
                    details: [],
                    customMessage: 'Formato de data inválido. Use o formato YYYY-MM-DD.'
                });
            }
            
            if (dataInicioObj > dataFimObj) {
                throw new CustomError({
                    statusCode: HttpStatusCodes.BAD_REQUEST.code,
                    errorType: 'validationError',
                    field: 'periodo',
                    details: [],
                    customMessage: 'Data de início não pode ser posterior à data de fim.'
                });
            }
        }
        
        // Chamada ao repository com filtro avançado
        return this.repository.filtrarMovimentacoesAvancado(filtros, opcoesPaginacao);
    }

    async desativarMovimentacao(id) {
        console.log('Estou no desativarMovimentacao em movimentacaoService');

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID da movimentacao inválido.'
            });
        }

        const data = await this.repository.desativarMovimentacao(id);
        return data;
    }

    async reativarMovimentacao(id) {
        console.log('Estou no reativarMovimentacao em movimentacaoService');

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID da movimentacao inválido.'
            });
        }

        const data = await this.repository.reativarMovimentacao(id);
        return data;
    }
}

export default MovimentacaoService;