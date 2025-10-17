import Grupo from '../models/Grupo.js';
import { seedRotas } from './seedRotas.js';
import getGlobalFakeMapping from './globalFakeMapping.js';

// Grupos padrão do sistema
const gruposPadrao = [
    {
        nome: 'Administradores',
        descricao: 'Grupo com acesso completo ao sistema - TODAS as permissões',
        ativo: true,
        permissoes: [
            {
                rota: 'produtos',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'fornecedores',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'usuarios',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'grupos',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'movimentacoes',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'auth',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'logs',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'relatorios',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'dashboard',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'permissoes',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'api-docs',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'swagger',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'perfis',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'configuracoes',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'backups',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'uploads',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'exports',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            },
            {
                rota: 'imports',
                dominio: 'localhost',
                ativo: true,
                buscar: true,    // GET
                enviar: true,    // POST
                substituir: true, // PUT
                modificar: true,  // PATCH
                excluir: true     // DELETE
            }
        ]
    },
    {
        nome: 'Gerentes',
        descricao: 'Grupo com acesso de gerenciamento ao estoque e relatórios',
        ativo: true,
        permissoes: [
            {
                rota: 'produtos',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: true,
                substituir: true,
                modificar: true,
                excluir: false
            },
            {
                rota: 'fornecedores',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: true,
                substituir: true,
                modificar: true,
                excluir: false
            },
            {
                rota: 'usuarios',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            },
            {
                rota: 'relatorios',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            },
            {
                rota: 'dashboard',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            }
        ]
    },
    {
        nome: 'Estoquistas',
        descricao: 'Grupo com acesso básico ao estoque',
        ativo: true,
        permissoes: [
            {
                rota: 'produtos',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: true, // Pode alterar quantidades
                excluir: false
            },
            {
                rota: 'fornecedores',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            },
            {
                rota: 'dashboard',
                dominio: 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                modificar: false,
                excluir: false
            }
        ]
    }
];

/**
 * Seed para criar grupos padrão do sistema
 */
async function seedGrupos() {
    try {
        console.log('🌱 Iniciando seed de grupos...');

        // Primeiro, garantir que as rotas existem
        await seedRotas();

        // Verificar se já existem grupos no banco
        const gruposExistentes = await Grupo.countDocuments();
        
        if (gruposExistentes > 0) {
            console.log('ℹ️  Grupos já existem no banco. Pulando seed...');
            const gruposExistentesData = await Grupo.find({});
            return gruposExistentesData;
        }

        const todasAsRotas = await import('../models/Rotas.js').then(module => module.default);
        const rotasExistentes = await todasAsRotas.find({});
        
        console.log(`📋 Encontradas ${rotasExistentes.length} rotas no sistema para sincronização de permissões`);

        const permissoesAdminCompletas = rotasExistentes.map(rota => ({
            rota: rota.rota,
            dominio: rota.dominio || 'localhost',
            ativo: true,
            buscar: true,    // GET
            enviar: true,    // POST  
            substituir: true, // PUT
            modificar: true,  // PATCH
            excluir: true     // DELETE
        }));

        const permissoesGerenteCompletas = rotasExistentes
            .filter(rota => ['produtos', 'fornecedores', 'usuarios', 'relatorios', 'dashboard'].includes(rota.rota))
            .map(rota => ({
                rota: rota.rota,
                dominio: rota.dominio || 'localhost',
                ativo: true,
                buscar: true,
                // Gerentes podem criar/alterar produtos e fornecedores, mas só consultar usuários
                enviar: ['produtos', 'fornecedores'].includes(rota.rota),
                substituir: ['produtos', 'fornecedores'].includes(rota.rota),
                modificar: ['produtos', 'fornecedores'].includes(rota.rota),
                excluir: false 
            }));

        const permissoesEstoquistaCompletas = rotasExistentes
            .filter(rota => ['produtos', 'fornecedores', 'dashboard'].includes(rota.rota))
            .map(rota => ({
                rota: rota.rota,
                dominio: rota.dominio || 'localhost',
                ativo: true,
                buscar: true,
                enviar: false,
                substituir: false,
                // Estoquistas só podem modificar produtos (alterar quantidades)
                modificar: rota.rota === 'produtos',
                excluir: false
            }));

        const gruposAtualizados = [...gruposPadrao];
        
        const indexAdmin = gruposAtualizados.findIndex(g => g.nome === 'Administradores');
        if (indexAdmin !== -1) {
            gruposAtualizados[indexAdmin].permissoes = permissoesAdminCompletas;
            gruposAtualizados[indexAdmin].descricao = `Grupo com acesso ABSOLUTO - ${permissoesAdminCompletas.length} rotas com TODAS as permissões (GET, POST, PUT, PATCH, DELETE)`;
            console.log(`Grupo Administradores configurado com ${permissoesAdminCompletas.length} permissões completas`);
        }
        
        const indexGerente = gruposAtualizados.findIndex(g => g.nome === 'Gerentes');
        if (indexGerente !== -1) {
            gruposAtualizados[indexGerente].permissoes = permissoesGerenteCompletas;
            gruposAtualizados[indexGerente].descricao = `Grupo com acesso de gerenciamento - ${permissoesGerenteCompletas.length} rotas com permissões limitadas`;
            console.log(`Grupo Gerentes configurado com ${permissoesGerenteCompletas.length} permissões limitadas`);
        }
        
        const indexEstoquista = gruposAtualizados.findIndex(g => g.nome === 'Estoquistas');
        if (indexEstoquista !== -1) {
            gruposAtualizados[indexEstoquista].permissoes = permissoesEstoquistaCompletas;
            gruposAtualizados[indexEstoquista].descricao = `Grupo com acesso básico - ${permissoesEstoquistaCompletas.length} rotas com permissões básicas`;
            console.log(`Grupo Estoquistas configurado com ${permissoesEstoquistaCompletas.length} permissões básicas`);
        }

        const fakeMapping = getGlobalFakeMapping();
        
        const todosGrupos = [...gruposAtualizados];
        
        const gruposDinamicos = gerarGruposDinamicos(fakeMapping, 2);
        todosGrupos.push(...gruposDinamicos);

        const gruposInseridos = await Grupo.insertMany(todosGrupos);
        
        console.log(`✅ ${gruposInseridos.length} grupos criados com sucesso!`);
        console.log('👥 Grupos criados:', gruposInseridos.map(g => g.nome).join(', '));

        const grupoAdminCriado = gruposInseridos.find(g => g.nome === 'Administradores');
        const grupoGerenteCriado = gruposInseridos.find(g => g.nome === 'Gerentes');
        const grupoEstoquistaCriado = gruposInseridos.find(g => g.nome === 'Estoquistas');
        
        if (grupoAdminCriado) {
            console.log(`\n🔑 Grupo Administradores: ${grupoAdminCriado.permissoes.length} permissões COMPLETAS`);
            console.log('   📋 Rotas com acesso total:', grupoAdminCriado.permissoes.map(p => p.rota).join(', '));
        }
        
        if (grupoGerenteCriado) {
            console.log(`\n👔 Grupo Gerentes: ${grupoGerenteCriado.permissoes.length} permissões LIMITADAS`);
            console.log('   📋 Rotas com acesso gerencial:', grupoGerenteCriado.permissoes.map(p => p.rota).join(', '));
        }
        
        if (grupoEstoquistaCriado) {
            console.log(`\n📦 Grupo Estoquistas: ${grupoEstoquistaCriado.permissoes.length} permissões BÁSICAS`);
            console.log('   📋 Rotas com acesso básico:', grupoEstoquistaCriado.permissoes.map(p => p.rota).join(', '));
        }


        gruposInseridos.forEach(grupo => {
            console.log(`\n👥 ${grupo.nome}:`);
            grupo.permissoes.forEach(perm => {
                const acoes = [];
                if (perm.buscar) acoes.push('Consultar');
                if (perm.enviar) acoes.push('Criar');
                if (perm.substituir) acoes.push('Substituir');
                if (perm.modificar) acoes.push('Alterar');
                if (perm.excluir) acoes.push('Excluir');
                
                console.log(`   - ${perm.rota}: ${acoes.join(', ') || 'Nenhuma ação'}`);
            });
        });

        return gruposInseridos;

    } catch (error) {
        console.error('❌ Erro ao criar grupos padrão:', error);
        throw error;
    }
}

/**
 * Função para obter o ID de um grupo pelo nome
 * @param {String} nomeGrupo - Nome do grupo
 * @returns {String|null} - ID do grupo ou null se não encontrar
 */
async function obterIdGrupoPorNome(nomeGrupo) {
    try {
        const grupo = await Grupo.findOne({ nome: nomeGrupo }).lean();
        return grupo ? grupo._id.toString() : null;
    } catch (error) {
        console.error(`❌ Erro ao buscar grupo '${nomeGrupo}':`, error);
        return null;
    }
}

/**
 * Função para listar todos os grupos e suas permissões
 */
async function listarGruposEPermissoes() {
    try {
        const grupos = await Grupo.find({ ativo: true }).sort({ nome: 1 });
        
        console.log('👥 Grupos ativos no sistema:');
        grupos.forEach(grupo => {
            console.log(`\n📋 ${grupo.nome} - ${grupo.descricao}`);
            console.log(`   Total de permissões: ${grupo.permissoes.length}`);
            
            const rotasComPermissao = grupo.permissoes.map(p => p.rota).join(', ');
            console.log(`   Rotas com permissão: ${rotasComPermissao}`);
        });
        
        return grupos;
    } catch (error) {
        console.error('❌ Erro ao listar grupos e permissões:', error);
        throw error;
    }
}

/**
 * Função para gerar grupos dinamicamente usando globalFakeMapping
 */
function gerarGruposDinamicos(fakeMapping, quantidade = 3) {
    const grupos = [];
    
    for (let i = 0; i < quantidade; i++) {
        const grupo = {
            nome: `${fakeMapping.grupo.nome()}_${i + 1}`,
            descricao: fakeMapping.grupo.descricao(),
            ativo: fakeMapping.grupo.ativo(),
            data_criacao: fakeMapping.grupo.data_criacao(),
            data_atualizacao: fakeMapping.grupo.data_atualizacao(),
            permissoes: []
        };
        
        // Gera permissões aleatórias para o grupo
        const numPermissoes = Math.floor(Math.random() * 5) + 2; // 2-6 permissões
        for (let j = 0; j < numPermissoes; j++) {
            grupo.permissoes.push(fakeMapping.grupo.permissoes());
        }
        
        grupos.push(grupo);
    }
    
    return grupos;
}

export {
    seedGrupos,
    obterIdGrupoPorNome,
    listarGruposEPermissoes,
    gruposPadrao,
    gerarGruposDinamicos
};

export default seedGrupos;
