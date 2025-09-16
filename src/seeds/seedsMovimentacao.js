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

        // Movimentação de entrada fixa
        const movEntrada = {
            tipo: 'entrada',
            destino: 'Estoque',
            id_usuario: adminUser._id.toString(),
            produtos: [{
                produto_ref: produto1._id.toString(),
                codigo_produto: produto1.codigo_produto || 'COD-001',
                quantidade_produtos: 50,
                preco: produto1.preco,
                custo: produto1.custo || (produto1.preco * 0.7)
            }]
        };

        // Movimentação de saída fixa
        const movSaida = {
            tipo: 'saida',
            destino: 'Venda',
            id_usuario: adminUser._id.toString(),
            produtos: [{
                produto_ref: produto2._id.toString(),
                codigo_produto: produto2.codigo_produto || 'COD-002',
                quantidade_produtos: 10,
                preco: produto2.preco,
                custo: produto2.custo || (produto2.preco * 0.7)
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
        for (let i = 0; i < 20; i++) {
            const tipo = tipos[Math.floor(Math.random() * tipos.length)];
            const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
            const produto = produtos[Math.floor(Math.random() * produtos.length)];
        
            // Não gerar quantidade muito alta para não esgotar estoque nas saídas
            const quantidade = Math.floor(Math.random() * 5) + 1;
            
            let movimentacaoValida = false;
            let tentativa = 0;
            let movimentacaoFake;
            
                try {
                    const dataMovimentacao = new Date();
                    dataMovimentacao.setDate(dataMovimentacao.getDate() - Math.floor(Math.random() * 30)); // Data aleatória nos últimos 30 dias
                    
                    movimentacaoFake = {
                        tipo: tipo,
                        destino: tipo === 'entrada' ? 'Estoque' : 'Venda',
                        data_movimentacao: dataMovimentacao,
                        id_usuario: usuario._id.toString(),
                        produtos: [{
                            produto_ref: produto._id.toString(),
                            codigo_produto: produto.codigo_produto || `PROD-${i}`,
                            quantidade_produtos: quantidade,
                            preco: produto.preco,
                            custo: produto.custo || (produto.preco * 0.7)
                        }]
                    };
                    
                    // Validar com Zod
                    MovimentacaoSchema.parse(movimentacaoFake);
                    movimentacaoValida = true;
                    movimentacoes.push(movimentacaoFake);
                } catch (error) {
                    tentativa++;
                    console.warn(`Tentativa ${tentativa}: Movimentação inválida: ${error.message}`);
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