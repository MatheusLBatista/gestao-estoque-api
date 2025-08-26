import "dotenv/config";
import mongoose from "mongoose";
import DbConnect from "../config/DbConnect.js";
import seedRotas from "./seedRotas.js";
import seedGrupos from "./seedGrupos.js";
import Rota from "../models/Rotas.js";
import Grupo from "../models/Grupo.js";
import Usuario from "../models/Usuario.js";

async function main() {
    try {
        console.log("🔄 Iniciando limpeza e re-seed das permissões...");
        await DbConnect.conectar();
        console.log("✅ Conexão com o banco de dados estabelecida.");
        
        // Limpar dados existentes
        console.log("🧹 Limpando dados existentes...");
        await Usuario.deleteMany({});
        await Grupo.deleteMany({});
        await Rota.deleteMany({});
        console.log("✅ Dados limpos com sucesso!");
        
        // Seed das rotas do sistema (incluindo dinâmicas para teste)
        const rotas = await seedRotas(true); // true para incluir rotas dinâmicas
        console.log(`✅ Seed de ${rotas.length} rotas concluído.`);
        
        // Seed dos grupos de permissão (incluindo dinâmicos)
        const grupos = await seedGrupos();
        console.log(`✅ Seed de ${grupos.length} grupos concluído.`);
        
        console.log("✅ Re-seed das permissões concluído com sucesso!");
    } catch (erro) {
        console.error("❌ Erro ao executar re-seed das permissões:", erro);
    } finally {
        await mongoose.connection.close();
        console.log("ℹ️ Conexão com o banco de dados fechada.");
        process.exit(0);
    }
}

main();
