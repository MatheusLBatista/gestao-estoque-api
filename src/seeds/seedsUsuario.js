import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import DbConnect from "../config/DbConnect.js";
import Usuario from "../models/Usuario.js";
import Grupo from "../models/Grupo.js";
import getGlobalFakeMapping from "./globalFakeMapping.js";
import { seedGrupos } from "./seedGrupos.js";

/**
 * Função principal do seed que cria os usuários no banco com permissões sincronizadas
 */
async function seedUsuario() {
  try {
    // Primeiro, garantir que os grupos existem
    await seedGrupos();

    // Buscar os grupos criados para fazer as associações
    const grupoAdmin = await Grupo.findOne({ nome: "Administradores" });
    const grupoGerente = await Grupo.findOne({ nome: "Gerentes" });
    const grupoEstoquista = await Grupo.findOne({ nome: "Estoquistas" });
    const grupoAuditor = await Grupo.findOne({ nome: "Auditores" });

    const usuarios = [];
    const fakeMapping = getGlobalFakeMapping();

    // Hash da senha do administrador
    const senhaHash = await bcrypt.hash("Admin@123", 10);

    // Hash da senha para os usuários fixos
    const senhaGerente = await bcrypt.hash("Gerente@123", 10);
    const senhaEstoquista = await bcrypt.hash("Estoque@123", 10);

    // 1. Adiciona um usuário administrador fixo com grupo e permissões completas
    usuarios.push({
      nome_usuario: "Administrador Master",
      email: "admin@sistema.com",
      matricula: "ADM0001", // admin0001 equivalente
      senha: senhaHash,
      senha_definida: true,
      perfil: "administrador",
      telefone: "(11) 99999-0001",
      ativo: true,
      online: false,
      grupos: grupoAdmin ? [grupoAdmin._id] : [],
      permissoes: [], // Admin tem TODAS as permissões via grupo Administradores
      data_cadastro: new Date(),
      data_ultima_atualizacao: new Date(),
    });

    // 2. Adiciona um usuário gerente fixo com permissões de gerenciamento
    usuarios.push({
      nome_usuario: "Gerente de Estoque",
      email: "gerente@sistema.com",
      matricula: "GER0001",
      senha: senhaGerente,
      senha_definida: true,
      perfil: "gerente",
      telefone: "(11) 98888-0002",
      ativo: true,
      online: false,
      grupos: grupoGerente ? [grupoGerente._id] : [],
      permissoes: [], // Gerente tem permissões limitadas via grupo Gerentes
      data_cadastro: new Date(),
      data_ultima_atualizacao: new Date(),
    });

    // 3. Adiciona um usuário estoquista fixo com permissões básicas
    usuarios.push({
      nome_usuario: "João Estoquista",
      email: "estoquista@sistema.com",
      matricula: "EST0001",
      senha: senhaEstoquista,
      senha_definida: true,
      perfil: "estoquista",
      telefone: "(11) 97777-0003",
      ativo: true,
      online: false,
      grupos: grupoEstoquista ? [grupoEstoquista._id] : [],
      permissoes: [],
      data_cadastro: new Date(),
      data_ultima_atualizacao: new Date(),
    });

    // Cria usuários fake com grupos baseados no perfil
    for (let i = 0; i < 10; i++) {
      const senhaFake = await bcrypt.hash("Senha123", 10);
      let perfil,
        grupos = [];

      // Define perfil e grupo baseado no índice
      if (i < 2) {
        perfil = "gerente";
        grupos = grupoGerente ? [grupoGerente._id] : [];
      } else if (i < 6) {
        perfil = "estoquista";
        grupos = grupoEstoquista ? [grupoEstoquista._id] : [];
      } else {
        perfil = "estoquista";
        grupos = grupoAuditor ? [grupoAuditor._id] : [];
      }

      // Gera permissões individuais aleatórias para alguns usuários
      const permissoesIndividuais =
        i % 3 === 0 ? fakeMapping.usuario.permissoes() : [];

      usuarios.push({
        nome_usuario: fakeMapping.usuario.nome_usuario(),
        email: `usuario${i + 1}@sistema.com`,
        matricula: `USR${String(i + 1).padStart(4, "0")}`,
        senha: senhaFake,
        senha_definida: true,
        perfil: perfil,
        telefone: `(11) 9${String(6000 + i).padStart(4, "0")}-${String(
          1000 + i
        ).padStart(4, "0")}`,
        ativo: fakeMapping.usuario.ativo(),
        online: fakeMapping.usuario.online(),
        grupos: grupos,
        permissoes: permissoesIndividuais,
        data_cadastro: fakeMapping.usuario.data_cadastro(),
        data_ultima_atualizacao: fakeMapping.usuario.data_ultima_atualizacao(),
      });
    }

    // Limpar usuários existentes antes de criar novos
    await Usuario.deleteMany({});
    console.log("🧹 Usuários existentes removidos");

    // Criar usuários no banco
    const usuariosCriados = await Usuario.create(usuarios);

    console.log(
      `✅ ${usuariosCriados.length} usuários criados com sucesso (incluindo administrador)!`
    );
    console.log("\n👥 Usuários criados com permissões sincronizadas:");

    for (const usuario of usuariosCriados) {
      const gruposNomes = [];
      let totalPermissoes = 0;

      for (const grupoId of usuario.grupos) {
        const grupo = await Grupo.findById(grupoId);
        if (grupo) {
          gruposNomes.push(grupo.nome);
          totalPermissoes += grupo.permissoes.length;

          // Log especial para usuários fixos (Administrador, Gerente, Estoquista)
          if (["ADM0001", "GER0001", "EST0001"].includes(usuario.matricula)) {
            let tipoUsuario = "";
            let descricaoAcesso = "";

            if (usuario.matricula === "ADM0001") {
              tipoUsuario = "🔑 ADMINISTRADOR ABSOLUTO";
              descricaoAcesso = "ACESSO ABSOLUTO (GET,POST,PUT,PATCH,DELETE)";
            } else if (usuario.matricula === "GER0001") {
              tipoUsuario = "👔 GERENTE DE ESTOQUE";
              descricaoAcesso = "ACESSO DE GERENCIAMENTO (limitado)";
            } else if (usuario.matricula === "EST0001") {
              tipoUsuario = "� ESTOQUISTA";
              descricaoAcesso = "ACESSO BÁSICO DE ESTOQUE";
            }

            console.log(`\n${tipoUsuario}:`);
            console.log(`   👤 ${usuario.nome_usuario} (${usuario.perfil})`);
            console.log(`   📧 ${usuario.email}`);
            console.log(`   🎫 Matrícula: ${usuario.matricula}`);
            console.log(
              `   🔐 Senha: ${
                usuario.matricula === "ADM0001"
                  ? "Admin@123"
                  : usuario.matricula === "GER0001"
                  ? "Gerente@123"
                  : "Estoque@123"
              }`
            );
            console.log(`   👥 Grupo: ${grupo.nome}`);
            console.log(
              `   🔓 Total de permissões: ${grupo.permissoes.length} rotas`
            );
            console.log(`   📋 Rotas com ${descricaoAcesso}:`);

            grupo.permissoes.forEach((perm, index) => {
              const metodos = [];
              if (perm.buscar) metodos.push("GET");
              if (perm.enviar) metodos.push("POST");
              if (perm.substituir) metodos.push("PUT");
              if (perm.modificar) metodos.push("PATCH");
              if (perm.excluir) metodos.push("DELETE");
              console.log(
                `      ${index + 1}. /${perm.rota} → [${metodos.join(", ")}]`
              );
            });

            if (usuario.matricula === "ADM0001") {
              console.log(
                `   ✅ ADMINISTRADOR COM ACESSO COMPLETO A TODAS AS ROTAS!`
              );
            } else if (usuario.matricula === "GER0001") {
              console.log(
                `   ✅ GERENTE COM ACESSO DE GERENCIAMENTO AO ESTOQUE!`
              );
            } else if (usuario.matricula === "EST0001") {
              console.log(`   ✅ ESTOQUISTA COM ACESSO BÁSICO AO SISTEMA!`);
            }
            console.log("");
            continue;
          }
        }
      }

      // Log normal para outros usuários (exclui os usuários fixos)
      if (!["ADM0001", "GER0001", "EST0001"].includes(usuario.matricula)) {
        console.log(`   👤 ${usuario.nome_usuario} (${usuario.perfil})`);
        console.log(`      📧 ${usuario.email}`);
        console.log(`      👥 Grupos: ${gruposNomes.join(", ") || "Nenhum"}`);
        console.log(`      🔐 Permissões do grupo: ${totalPermissoes}`);
        console.log(
          `      🔐 Permissões individuais: ${usuario.permissoes.length}`
        );
      }
    }

    // Exibir credenciais dos usuários principais
    console.log("\n🔐 CREDENCIAIS PARA LOGIN:");
    console.log("=========================");
    console.log(
      "👑 admin@sistema.com     | Admin@123    (Administrador - Acesso Total)"
    );
    console.log(
      "👔 gerente@sistema.com   | Gerente@123  (Gerente - Acesso Limitado)"
    );
    console.log(
      "📦 estoquista@sistema.com| Estoque@123  (Estoquista - Acesso Básico)"
    );

    console.log(`\n✅ USUÁRIOS CRIADOS COM PERMISSÕES SINCRONIZADAS!`);
    console.log("🎯 Todas as permissões foram baseadas nos grupos atualizados");

    return usuariosCriados;
  } catch (error) {
    console.error("❌ Erro no seed de usuários:", error);
    throw error;
  }
}

export default seedUsuario;
