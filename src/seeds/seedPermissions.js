import "dotenv/config";
import mongoose from "mongoose";
import DbConnect from "../config/DbConnect.js";
import seedRotas from "./seedRotas.js";
import seedGrupos from "./seedGrupos.js";

async function main() {
    try {
        console.log("🔄 Iniciando processo de seed das permissões...");
        await DbConnect.conectar();
        console.log("✅ Conexão com o banco de dados estabelecida.");
        
        // Seed das rotas do sistema (deve ser executado primeiro)
        const rotas = await seedRotas();
        console.log(`✅ Seed de ${rotas.length} rotas concluído.`);
        
        // Seed dos grupos de permissão (deve ser executado após as rotas)
        const grupos = await seedGrupos();
        console.log(`✅ Seed de ${grupos.length} grupos concluído.`);
        
        console.log("✅ Seed das permissões concluído com sucesso!");
    } catch (erro) {
        console.error("❌ Erro ao inserir dados de permissões:", erro);
    } finally {
        await mongoose.connection.close();
        console.log("ℹ️ Conexão com o banco de dados fechada.");
        process.exit(0);
    }
}

main();
