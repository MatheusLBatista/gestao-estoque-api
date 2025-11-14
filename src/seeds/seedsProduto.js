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

        // Cria produtos validados pelo Zod
        for (let i = 0; i < 50; i++) {
            
            let produtoValido = false;
            let tentativa = 0;
            let produtoFake;
            
            while (!produtoValido && tentativa < 5) {
                try {
                    // Gerar o preço primeiro para determinar a categoria
                    const preco = fakeMapping.produto.preco();
                    
                    // Definir categoria baseada no preço
                    let categoria;
                    if (preco >= 1001.00) {
                        categoria = 'A';
                    } else if (preco >= 500.00) {
                        categoria = 'B';
                    } else {
                        categoria = 'C';
                    }
                    
                    produtoFake = {
                        nome_produto: fakeMapping.produto.nome_produto()+` ${i}`,
                        descricao: fakeMapping.produto.descricao(),
                        preco: preco,
                        marca: fakeMapping.produto.marca(),
                        custo: preco * 0.7, // Custo como 70% do preço
                        categoria: categoria,
                        estoque: Math.floor(Math.random() * 100) + 10, // Inteiro positivo
                        estoque_min: 10, // Valor fixo por simplicidade
                        data_ultima_entrada: new Date(),
                        // status: true,
                        fornecedores: Math.random() < 0.5 ? fornecedor1._id.toString() : fornecedor2._id.toString(),
                        codigo_produto: `${fornecedores[0].nome_fornecedor.substring(0,3).toUpperCase()}-${Math.floor(Math.random() * 10000)}${i}`,
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
            }
        }

        const resultado = await Produto.insertMany(produtos);
        console.log(`✅ ${resultado.length} produtos criados com sucesso`);
        return resultado;
    } catch (error) {
        console.error('❌ Erro em seedProduto:', error);
        throw error;
    }
}

export default seedProduto;