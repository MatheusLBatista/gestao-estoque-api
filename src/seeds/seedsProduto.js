import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Produto from '../models/Produto.js';
import getGlobalFakeMapping from './globalFakeMapping.js';
import { ProdutoSchema } from '../utils/validators/schemas/zod/ProdutoSchema.js';

async function seedProduto(fornecedores = []) {
    try {
        await Produto.deleteMany();

        const produtos = [];
        const fakeMapping = getGlobalFakeMapping();

        if (fornecedores.length === 0) {
            throw new Error("Não há fornecedores disponíveis para criar produtos relacionados");
        }

        // Cria produtos validados pelo Zod
        for (let i = 0; i < 500; i++) {
            const fornecedor = fornecedores[Math.floor(Math.random() * fornecedores.length)];
            
            const fornecedorId = fornecedor._id.toString().substring(0, 8);
            const idNumerico = parseInt(fornecedorId, 16) % 1000;
            
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
                        nome_produto: fakeMapping.produto.nome_produto(),
                        descricao: fakeMapping.produto.descricao(),
                        preco: preco,
                        marca: fakeMapping.produto.marca(),
                        custo: preco * 0.7, // Custo como 70% do preço
                        categoria: categoria,
                        estoque: Math.floor(Math.random() * 100) + 10, // Inteiro positivo
                        estoque_min: 10, // Valor fixo por simplicidade
                        data_ultima_entrada: new Date(),
                        status: true,
                        id_fornecedor: idNumerico,
                        codigo_produto: `${fornecedor.nome_fornecedor.substring(0,3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`
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