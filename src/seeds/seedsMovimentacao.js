import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Movimentacao from '../models/Movimentacao.js';
import { MovimentacaoSchema } from '../utils/validators/schemas/zod/MovimentacaoSchema.js';

async function seedMovimentacao(usuarios = [], produtos = [], fornecedores = []) {
    try {
        await Movimentacao.deleteMany({});
        
        // Verificar se temos dados suficientes
        if (usuarios.length === 0 || produtos.length === 0) {
            throw new Error("Dados insuficientes para criar movimentações relacionadas");
        }

        const movimentacoes = [];
        const tipos = ['entrada', 'saida'];
        
        // Criar duas movimentações fixas (uma de entrada e uma de saída)
        // para garantir que pelo menos estas serão válidas
        const adminUser = usuarios.find(u => u.nome_usuario === 'Administrador' || u.perfil === 'administrador') || usuarios[0];
        const produto1 = produtos[0];
        const produto2 = produtos[1] || produtos[0];

        // Encontrar fornecedor correspondente ao produto
        const fornecedorId1 = produto1.id_fornecedor;
        const fornecedorId2 = produto2.id_fornecedor;
        
        let nomeFornecedor1 = 'Distribuidora Central Ltda';
        let nomeFornecedor2 = 'Mercado Atacado Brasil';

        // Movimentação de entrada fixa
        const movEntrada = {
            tipo: 'entrada',
            destino: 'Estoque',
            data_movimentacao: new Date(),
            id_produto: produto1._id.toString(),
            id_usuario: adminUser._id,
            nome_usuario: adminUser.nome_usuario,
            produtos: [{
                produto_ref: produto1._id.toString(),
                id_produto: produto1.id_fornecedor * 10 + 1,
                codigo_produto: produto1.codigo_produto || 'COD-001',
                nome_produto: produto1.nome_produto,
                quantidade_produtos: 50,
                preco: produto1.preco,
                custo: produto1.custo || (produto1.preco * 0.7),
                id_fornecedor: fornecedorId1,
                nome_fornecedor: nomeFornecedor1
            }]
        };

        // Movimentação de saída fixa
        const movSaida = {
            tipo: 'saida',
            destino: 'Venda',
            data_movimentacao: new Date(),
            id_produto: produto2._id.toString(),
            id_usuario: adminUser._id,
            nome_usuario: adminUser.nome_usuario,
            produtos: [{
                produto_ref: produto2._id.toString(),
                id_produto: produto2.id_fornecedor * 10 + 2,
                codigo_produto: produto2.codigo_produto || 'COD-002',
                nome_produto: produto2.nome_produto,
                quantidade_produtos: 10,
                preco: produto2.preco,
                custo: produto2.custo || (produto2.preco * 0.7),
                id_fornecedor: fornecedorId2,
                nome_fornecedor: nomeFornecedor2
            }]
        };

        // Validar as movimentações fixas com Zod antes de adicionar
        try {
            MovimentacaoSchema.parse(movEntrada);
            movimentacoes.push(movEntrada);
            console.log('✅ Movimentação fixa de entrada validada com sucesso');
        } catch (error) {
            console.error('❌ Erro ao validar movimentação fixa de entrada:', error.message);
        }

        try {
            MovimentacaoSchema.parse(movSaida);
            movimentacoes.push(movSaida);
            console.log('✅ Movimentação fixa de saída validada com sucesso');
        } catch (error) {
            console.error('❌ Erro ao validar movimentação fixa de saída:', error.message);
        }
        
        // Criar movimentações aleatórias adicionais (30-40 registros)
        for (let i = 0; i < 40; i++) {
            const tipo = tipos[Math.floor(Math.random() * tipos.length)];
            const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
            const produto = produtos[Math.floor(Math.random() * produtos.length)];
            
            // Encontrar dados do fornecedor
            const fornecedorId = produto.id_fornecedor;
            let nomeFornecedor = 'Fornecedor';
            
            // Buscar nome do fornecedor baseado no id
            for (const fornecedor of fornecedores) {
                // Extrair parte do ID do fornecedor para comparar
                if (fornecedor._id && typeof fornecedor._id.toString === 'function') {
                    const tempId = fornecedor._id.toString().substring(0, 8);
                    const tempNumeric = parseInt(tempId, 16) % 1000;
                    if (tempNumeric === fornecedorId) {
                        nomeFornecedor = fornecedor.nome_fornecedor;
                        break;
                    }
                }
            }
            
            // Não gerar quantidade muito alta para não esgotar estoque nas saídas
            const quantidade = Math.floor(Math.random() * 5) + 1;
            
            let movimentacaoValida = false;
            let tentativa = 0;
            let movimentacaoFake;
            
            // Tentativas para criar movimentação válida
            while (!movimentacaoValida && tentativa < 3) {
                try {
                    const dataMovimentacao = new Date();
                    dataMovimentacao.setDate(dataMovimentacao.getDate() - Math.floor(Math.random() * 30)); // Data aleatória nos últimos 30 dias
                    
                    movimentacaoFake = {
                        tipo: tipo,
                        destino: tipo === 'entrada' ? 'Estoque' : 'Venda',
                        data_movimentacao: dataMovimentacao,
                        id_produto: produto._id.toString(),
                        id_usuario: usuario._id,
                        nome_usuario: usuario.nome_usuario,
                        produtos: [{
                            produto_ref: produto._id.toString(),
                            id_produto: produto.id_fornecedor * 100 + i,
                            codigo_produto: produto.codigo_produto || `PROD-${i}`,
                            nome_produto: produto.nome_produto,
                            quantidade_produtos: quantidade,
                            preco: produto.preco,
                            custo: produto.custo || (produto.preco * 0.7),
                            id_fornecedor: produto.id_fornecedor,
                            nome_fornecedor: nomeFornecedor
                        }]
                    };
                    
                    // Validar com Zod
                    MovimentacaoSchema.parse(movimentacaoFake);
                    movimentacaoValida = true;
                } catch (error) {
                    tentativa++;
                    console.warn(`Tentativa ${tentativa}: Movimentação inválida: ${error.message}`);
                }
            }
            
            if (movimentacaoValida) {
                movimentacoes.push(movimentacaoFake);
            }
        }
        
        console.log(`Tentando inserir ${movimentacoes.length} movimentações...`);
        const resultado = await Movimentacao.insertMany(movimentacoes);
        console.log(`✅ ${resultado.length} movimentações criadas com sucesso`);
        return resultado;
    } catch (error) {
        console.error('❌ Erro em seedMovimentacao:', error);
        throw error;
    }
}

export default seedMovimentacao;