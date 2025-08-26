#!/usr/bin/env node

/**
 * Script para atualizar as permissões do usuário admin0001 (ADM0001)
 * Garante que ele tenha acesso a todas as rotas com todos os métodos HTTP
 */

import "dotenv/config";
import mongoose from "mongoose";
import DbConnect from "./src/config/DbConnect.js";
import Usuario from "./src/models/Usuario.js";
import Grupo from "./src/models/Grupo.js";
import Rota from "./src/models/Rotas.js";

async function updateAdminPermissions() {
    try {
        console.log("🚀 Iniciando atualização das permissões do administrador...");
        
        // Conectar ao banco de dados
        await DbConnect.conectar();
        console.log("✅ Conexão com o banco de dados estabelecida.");
        
        // Buscar o usuário admin0001
        const adminUser = await Usuario.findOne({ matricula: 'ADM0001' });
        if (!adminUser) {
            console.log("❌ Usuário ADM0001 não encontrado!");
            return;
        }
        
        console.log(`👤 Usuário encontrado: ${adminUser.nome_usuario} (${adminUser.email})`);
        
        // Buscar o grupo Administradores
        let grupoAdmin = await Grupo.findOne({ nome: 'Administradores' });
        
        if (!grupoAdmin) {
            console.log("⚠️  Grupo 'Administradores' não encontrado. Criando...");
            
            // Buscar todas as rotas existentes
            const todasRotas = await Rota.find({});
            console.log(`📋 Encontradas ${todasRotas.length} rotas no sistema`);
            
            // Criar permissões completas para todas as rotas
            const permissoesCompletas = todasRotas.map(rota => ({
                rota: rota.rota,
                dominio: rota.dominio || 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            }));
            
            // Adicionar rotas que podem não estar na base mas são importantes
            const rotasEssenciais = [
                'produtos', 'fornecedores', 'usuarios', 'grupos', 
                'movimentacoes', 'auth', 'logs', 'relatorios', 'dashboard'
            ];
            
            for (const nomeRota of rotasEssenciais) {
                const jaExiste = permissoesCompletas.find(p => p.rota === nomeRota);
                if (!jaExiste) {
                    permissoesCompletas.push({
                        rota: nomeRota,
                        dominio: 'localhost',
                        ativo: true,
                        buscar: true,    // GET
                        enviar: true,    // POST
                        substituir: true, // PUT
                        modificar: true,  // PATCH
                        excluir: true     // DELETE
                    });
                }
            }
            
            grupoAdmin = new Grupo({
                nome: 'Administradores',
                descricao: 'Grupo com acesso completo ao sistema - TODAS as permissões (GET, POST, PUT, PATCH, DELETE)',
                ativo: true,
                permissoes: permissoesCompletas
            });
            
            await grupoAdmin.save();
            console.log(`✅ Grupo 'Administradores' criado com ${permissoesCompletas.length} permissões completas`);
        } else {
            console.log("📋 Atualizando permissões do grupo 'Administradores'...");
            
            // Buscar todas as rotas existentes
            const todasRotas = await Rota.find({});
            console.log(`📋 Encontradas ${todasRotas.length} rotas no sistema`);
            
            // Criar permissões completas para todas as rotas
            const permissoesCompletas = todasRotas.map(rota => ({
                rota: rota.rota,
                dominio: rota.dominio || 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            }));
            
            // Adicionar rotas essenciais que podem não estar na base
            const rotasEssenciais = [
                'produtos', 'fornecedores', 'usuarios', 'grupos', 
                'movimentacoes', 'auth', 'logs', 'relatorios', 'dashboard'
            ];
            
            for (const nomeRota of rotasEssenciais) {
                const jaExiste = permissoesCompletas.find(p => p.rota === nomeRota);
                if (!jaExiste) {
                    permissoesCompletas.push({
                        rota: nomeRota,
                        dominio: 'localhost',
                        ativo: true,
                        buscar: true,    // GET
                        enviar: true,    // POST
                        substituir: true, // PUT
                        modificar: true,  // PATCH
                        excluir: true     // DELETE
                    });
                }
            }
            
            // Atualizar as permissões do grupo
            grupoAdmin.permissoes = permissoesCompletas;
            grupoAdmin.descricao = 'Grupo com acesso completo ao sistema - TODAS as permissões (GET, POST, PUT, PATCH, DELETE)';
            await grupoAdmin.save();
            
            console.log(`✅ Grupo 'Administradores' atualizado com ${permissoesCompletas.length} permissões completas`);
        }
        
        // Garantir que o usuário está no grupo Administradores
        if (!adminUser.grupos.includes(grupoAdmin._id)) {
            adminUser.grupos.push(grupoAdmin._id);
            await adminUser.save();
            console.log("✅ Usuário ADM0001 adicionado ao grupo 'Administradores'");
        } else {
            console.log("ℹ️  Usuário ADM0001 já está no grupo 'Administradores'");
        }
        
        // Mostrar resumo das permissões
        console.log("\n📊 RESUMO DAS PERMISSÕES DO USUÁRIO ADM0001:");
        console.log(`👤 Nome: ${adminUser.nome_usuario}`);
        console.log(`📧 Email: ${adminUser.email}`);
        console.log(`🎫 Matrícula: ${adminUser.matricula}`);
        console.log(`👥 Grupos: ${grupoAdmin.nome}`);
        console.log(`🔐 Permissões no grupo: ${grupoAdmin.permissoes.length} rotas`);
        
        console.log("\n🔓 ROTAS COM ACESSO COMPLETO (GET, POST, PUT, PATCH, DELETE):");
        grupoAdmin.permissoes.forEach((perm, index) => {
            const metodos = [];
            if (perm.buscar) metodos.push('GET');
            if (perm.enviar) metodos.push('POST');
            if (perm.substituir) metodos.push('PUT');
            if (perm.modificar) metodos.push('PATCH');
            if (perm.excluir) metodos.push('DELETE');
            
            console.log(`   ${index + 1}. /${perm.rota} - [${metodos.join(', ')}]`);
        });
        
        console.log("\n✅ Usuário admin0001 (ADM0001) agora tem ACESSO COMPLETO a todas as rotas!");
        console.log("🎯 Pode realizar: GET, POST, PUT, PATCH, DELETE em todas as rotas do sistema");
        
    } catch (error) {
        console.error("❌ Erro ao atualizar permissões:", error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Conexão com o banco de dados fechada.");
    }
}

// Executar o script
updateAdminPermissions()
    .then(() => {
        console.log("🎉 Script concluído com sucesso!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Erro fatal:", error);
        process.exit(1);
    });
