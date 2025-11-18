import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Produto from '../models/Produto.js';
import Fornecedor from '../models/Fornecedor.js';
import FornecedorRepository from '../repositories/fornecedorRepository.js';
import getGlobalFakeMapping from './globalFakeMapping.js';
import { ProdutoSchema } from '../utils/validators/schemas/zod/ProdutoSchema.js';

async function seedProduto(fornecedores = []) {
    try {
        await Produto.deleteMany({});

        const produtos = [];
        const fakeMapping = getGlobalFakeMapping();

        if (fornecedores.length === 0) {
            throw new Error("Não há fornecedores disponíveis para criar produtos relacionados");
        }

        const fornecedor1 = await Fornecedor.findOne({ nome_fornecedor: "Mercado Atacado Brasil" });
        const fornecedor2 = await Fornecedor.findOne({ nome_fornecedor: "Distribuidora Central Ltda" }) || fornecedores[0];

        if (!fornecedor1 || !fornecedor2) {
            throw new Error("Um ou mais fornecedores não encontrados no banco de dados. Por favor, crie os fornecedores necessários antes de rodar a seed de produtos.");
        }

        // Definir quantidades por categoria para melhor distribuição
        const quantidadePorCategoria = {
            'A': 20,  // Categoria A: 20 produtos
            'B': 40,  // Categoria B: 40 produtos
            'C': 40   // Categoria C: 40 produtos
        };

        let contadorProdutos = 0;

        // Cria produtos validados pelo Zod para cada categoria
        for (const [categoria, quantidade] of Object.entries(quantidadePorCategoria)) {
            for (let i = 0; i < quantidade; i++) {
                let produtoValido = false;
                let tentativa = 0;
                let produtoFake;
                
                while (!produtoValido && tentativa < 5) {
                    try {
                        // Gerar preço baseado na categoria desejada
                        let preco;
                        if (categoria === 'A') {
                            // Categoria A: R$ 1.001,00 - R$ 10.000,00
                            preco = Math.random() * 8999 + 1001;
                        } else if (categoria === 'B') {
                            // Categoria B: R$ 500,00 - R$ 1.000,00
                            preco = Math.random() * 500 + 500;
                        } else {
                            // Categoria C: R$ 10,00 - R$ 499,00
                            preco = Math.random() * 489 + 10;
                        }
                        
                        preco = Math.round(preco * 100) / 100; // Arredonda para 2 casas decimais
                        
                        produtoFake = {
                            nome_produto: fakeMapping.produto.nome_produto()+` Cat${categoria}-${i}`,
                            descricao: fakeMapping.produto.descricao(),
                            preco: preco,
                            marca: fakeMapping.produto.marca(),
                            custo: Math.round(preco * 0.7 * 100) / 100, // Custo como 70% do preço
                            categoria: categoria,
                            estoque: Math.floor(Math.random() * 100) + 10, // Inteiro positivo
                            estoque_min: 10, // Valor fixo por simplicidade
                            data_ultima_entrada: new Date(),
                            // status: true,
                            fornecedores: Math.random() < 0.5 ? fornecedor1._id.toString() : fornecedor2._id.toString(),
                            codigo_produto: `${fornecedores[0].nome_fornecedor.substring(0,3).toUpperCase()}-${categoria}${Math.floor(Math.random() * 10000)}-${contadorProdutos}`,
                        };
                        
                        // Validar com Zod
                        ProdutoSchema.parse(produtoFake);
                        produtoValido = true;
                    } catch (error) {
                        tentativa++;
                        console.warn(`Tentativa ${tentativa}: Produto inválido: ${error.message}`);
                    }
                }
                
                if (produtoValido) {
                    produtos.push(produtoFake);
                    contadorProdutos++;
                }
            }
        }

        console.log(`📊 Produtos criados por categoria:`);
        console.log(`   Categoria A: ${produtos.filter(p => p.categoria === 'A').length} produtos`);
        console.log(`   Categoria B: ${produtos.filter(p => p.categoria === 'B').length} produtos`);
        console.log(`   Categoria C: ${produtos.filter(p => p.categoria === 'C').length} produtos`);

        const resultado = await Produto.insertMany(produtos);
        console.log(`✅ ${resultado.length} produtos criados com sucesso`);
        return resultado;
    } catch (error) {
        console.error('❌ Erro em seedProduto:', error);
        throw error;
    }
}

export default seedProduto;