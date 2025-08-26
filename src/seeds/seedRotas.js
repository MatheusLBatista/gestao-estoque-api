import Rota from '../models/Rotas.js';
import mongoose from 'mongoose';
import getGlobalFakeMapping from './globalFakeMapping.js';

// Rotas padrão do sistema de gestão de estoque
const rotasPadrao = [
    {
        rota: 'produtos',
        dominio: 'localhost',
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: 'fornecedores',
        dominio: 'localhost',
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: 'usuarios',
        dominio: 'localhost',
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: 'grupos',
        dominio: 'localhost',
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: 'movimentacoes',
        dominio: 'localhost',
        ativo: true,
        buscar: true,
        enviar: true,
        substituir: true,
        modificar: true,
        excluir: true
    },
    {
        rota: 'auth',
        dominio: 'localhost',
        ativo: true,
        buscar: true,    // Para endpoints que precisam de GET
        enviar: true,    // Para login, logout, etc
        substituir: true, // Para permitir operações completas
        modificar: true, // Para alteração de senha
        excluir: true    // Para permitir revogação de tokens
    },
    {
        rota: 'logs',
        dominio: 'localhost',
        ativo: true,
        buscar: true,    // Para visualizar logs
        enviar: true,    // Para criar logs se necessário
        substituir: true, // Para operações completas
        modificar: true, // Para modificar logs se necessário
        excluir: true    // Para limpar logs antigos
    },
    {
        rota: 'relatorios',
        dominio: 'localhost',
        ativo: true,
        buscar: true,    // Para visualizar relatórios
        enviar: true,    // Para gerar relatórios
        substituir: true, // Para operações completas
        modificar: true, // Para modificar relatórios
        excluir: true    // Para excluir relatórios
    },
    {
        rota: 'dashboard',
        dominio: 'localhost',
        ativo: true,
        buscar: true,    // Para visualizar dashboard
        enviar: true,    // Para criar widgets do dashboard
        substituir: true, // Para operações completas
        modificar: true, // Para modificar dashboard
        excluir: true    // Para excluir widgets
    }
];

/**
 * Seed para criar rotas padrão do sistema
 * @param {boolean} incluirDinamicas - Se deve incluir rotas dinâmicas
 */
async function seedRotas(incluirDinamicas = false) {
    try {
        console.log('🌱 Iniciando seed de rotas...');

        // Verificar se já existem rotas no banco
        const rotasExistentes = await Rota.countDocuments();
        
        if (rotasExistentes > 0) {
            console.log('ℹ️  Rotas já existem no banco. Pulando seed...');
            const rotasExistentesData = await Rota.find({});
            return rotasExistentesData;
        }

        let todasRotas = [...rotasPadrao];
        
        // Opcionalmente adicionar rotas dinâmicas
        if (incluirDinamicas) {
            const fakeMapping = getGlobalFakeMapping();
            const rotasDinamicas = gerarRotasDinamicas(fakeMapping, 2);
            todasRotas.push(...rotasDinamicas);
            console.log('📝 Incluindo rotas dinâmicas geradas pelo globalFakeMapping...');
        }

        // Inserir rotas padrão e opcionalmente dinâmicas
        const rotasInseridas = await Rota.insertMany(todasRotas);
        
        console.log(`✅ ${rotasInseridas.length} rotas criadas com sucesso!`);
        console.log('📋 Rotas criadas:', rotasInseridas.map(r => r.rota).join(', '));
        
        return rotasInseridas;

    } catch (error) {
        console.error('❌ Erro ao criar rotas padrão:', error);
        throw error;
    }
}

/**
 * Função para adicionar uma nova rota ao sistema
 * @param {Object} dadosRota - Dados da nova rota
 */
async function adicionarRota(dadosRota) {
    try {
        const novaRota = new Rota(dadosRota);
        const rotaSalva = await novaRota.save();
        
        console.log(`✅ Nova rota '${rotaSalva.rota}' adicionada com sucesso!`);
        return rotaSalva;
    } catch (error) {
        if (error.code === 11000) {
            console.error(`❌ Rota '${dadosRota.rota}' já existe no domínio '${dadosRota.dominio}'`);
        }
        console.error('❌ Erro ao adicionar nova rota:', error);
        throw error;
    }
}

/**
 * Função para listar todas as rotas ativas
 */
async function listarRotasAtivas() {
    try {
        const rotas = await Rota.find({ ativo: true }).sort({ rota: 1 });
        
        console.log('📋 Rotas ativas no sistema:');
        rotas.forEach(rota => {
            const acoes = [];
            if (rota.buscar) acoes.push('GET');
            if (rota.enviar) acoes.push('POST');
            if (rota.substituir) acoes.push('PUT');
            if (rota.modificar) acoes.push('PATCH');
            if (rota.excluir) acoes.push('DELETE');
            
            console.log(`  - ${rota.rota} (${rota.dominio}): ${acoes.join(', ')}`);
        });
        
        return rotas;
    } catch (error) {
        console.error('❌ Erro ao listar rotas ativas:', error);
        throw error;
    }
}

/**
 * Função para gerar rotas dinâmicas usando globalFakeMapping
 * @param {Object} fakeMapping - Mapeamento global de dados fake
 * @param {number} quantidade - Quantidade de rotas a serem criadas
 */
function gerarRotasDinamicas(fakeMapping, quantidade = 3) {
    const rotas = [];
    
    for (let i = 0; i < quantidade; i++) {
        const rota = {
            rota: `${fakeMapping.rota.rota()}_custom_${i + 1}`,
            dominio: fakeMapping.rota.dominio(),
            ativo: fakeMapping.rota.ativo(),
            buscar: fakeMapping.rota.buscar(),
            enviar: fakeMapping.rota.enviar(),
            substituir: fakeMapping.rota.substituir(),
            modificar: fakeMapping.rota.modificar(),
            excluir: fakeMapping.rota.excluir(),
            createdAt: fakeMapping.rota.createdAt(),
            updatedAt: fakeMapping.rota.updatedAt()
        };
        
        rotas.push(rota);
    }
    
    return rotas;
}

export {
    seedRotas,
    adicionarRota,
    listarRotasAtivas,
    rotasPadrao,
    gerarRotasDinamicas
};

export default seedRotas;
