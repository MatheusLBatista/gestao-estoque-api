import "dotenv/config";
import mongoose from "mongoose";
import DbConnect from "../config/DbConnect.js";
import seedUsuario from "./seedsUsuario.js";
import seedFornecedor from "./seedsFornecedor.js";
import seedProduto from "./seedsProduto.js";
import seedMovimentacao from "./seedsMovimentacao.js";
import seedRotas from "./seedRotas.js";
import seedGrupos from "./seedGrupos.js";

async function main() {
    try {
        console.log("🔄 Iniciando processo de seed no banco de dados...");
        await DbConnect.conectar();
        console.log("✅ Conexão com o banco de dados estabelecida.");
        
        // Seed das rotas do sistema (deve ser executado primeiro)
        const rotas = await seedRotas();
        console.log(`✅ Seed de ${rotas.length} rotas concluído.`);
        
        // Seed dos grupos de permissão (deve ser executado após as rotas)
        const grupos = await seedGrupos();
        console.log(`✅ Seed de ${grupos.length} grupos concluído.`);
        
        const usuarios = await seedUsuario();
        console.log(`✅ Seed de ${usuarios.length} usuários concluído.`);
        
        const fornecedores = await seedFornecedor();
        console.log(`✅ Seed de ${fornecedores.length} fornecedores concluído.`);
        
        const produtos = await seedProduto(fornecedores);
        console.log(`✅ Seed de ${produtos.length} produtos concluído.`);
        
        const movimentacoes = await seedMovimentacao(usuarios, produtos, fornecedores);
        console.log(`✅ Seed de ${movimentacoes.length} movimentações concluído.`);
        
        console.log("✅ Todos os dados inseridos com sucesso!");
    } catch (erro) {
        console.error("❌ Erro ao inserir dados:", erro);
    } finally {
        await mongoose.connection.close();
        console.log("ℹ️ Conexão com o banco de dados fechada.");
        process.exit(0);
    }
}

main();