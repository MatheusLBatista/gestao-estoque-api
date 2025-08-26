import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CategoriaHelper } from '../utils/categoriaHelper.js';
import Produto from '../models/Produto.js';

dotenv.config();

// Função para atualizar categorias dos produtos existentes
async function atualizarCategoriasExistentes() {
    try {
        console.log('🔄 Conectando ao MongoDB...');
        await mongoose.connect(process.env.DB_URL);
        console.log('✅ Conectado ao MongoDB');

        console.log('📦 Buscando produtos existentes...');
        const produtos = await Produto.find({});
        console.log(`📊 Encontrados ${produtos.length} produtos`);

        let atualizados = 0;
        let erros = 0;

        for (const produto of produtos) {
            try {
                const novaCategoria = CategoriaHelper.calcularCategoriaPorValor(produto.preco);
                
                if (produto.categoria !== novaCategoria) {
                    await Produto.findByIdAndUpdate(produto._id, { categoria: novaCategoria });
                    console.log(`✅ ${produto.nome_produto} - Preço: R$ ${produto.preco} -> Categoria: ${novaCategoria}`);
                    atualizados++;
                } else {
                    console.log(`⚪ ${produto.nome_produto} - Categoria já correta: ${novaCategoria}`);
                }
            } catch (error) {
                console.error(`❌ Erro ao atualizar ${produto.nome_produto}:`, error.message);
                erros++;
            }
        }

        console.log('\n📋 RESUMO DA ATUALIZAÇÃO:');
        console.log(`📦 Total de produtos: ${produtos.length}`);
        console.log(`✅ Atualizados: ${atualizados}`);
        console.log(`❌ Erros: ${erros}`);
        
        await mongoose.connection.close();
        console.log('🔌 Conexão fechada');
        
    } catch (error) {
        console.error('❌ Erro na atualização:', error);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
    atualizarCategoriasExistentes();
}

export { atualizarCategoriasExistentes };
