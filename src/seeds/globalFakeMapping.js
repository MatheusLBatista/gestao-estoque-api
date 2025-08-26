import { faker } from '@faker-js/faker/locale/pt_BR';
import { fakerPT_BR } from '@faker-js/faker';
import mongoose from 'mongoose';
// Importe todos os modelos necessários
import Usuario from '../models/Usuario.js';
import Fornecedor from '../models/Fornecedor.js';
import Produto from '../models/Produto.js';
import Movimentacao from '../models/Movimentacao.js';
import Grupo from '../models/Grupo.js';
import Rota from '../models/Rotas.js';

// Função para verificar se um modelo existe e está corretamente definido
function isValidModel(model) {
    return model && model.schema && model.schema.paths;
}

// Função para obter os nomes dos campos de um schema
function getSchemaFieldNames(model) {
    // Adicione verificação para evitar o erro
    if (!isValidModel(model)) {
        console.warn(`Aviso: Modelo ${model?.modelName || 'desconhecido'} não está definido corretamente.`);
        return [];
    }
    
    return Object.keys(model.schema.paths).filter(path => !path.startsWith('_'));
}

// Função para validar o mapeamento contra o modelo
function validateModelMapping(model, mapping) {
    // Pule a validação se o modelo não estiver disponível
    if (!isValidModel(model)) {
        console.warn(`Pulando validação para modelo não disponível`);
        return true;
    }
    
    const schemaFields = getSchemaFieldNames(model);
    const mappingFields = Object.keys(mapping);
    
    // Verifica se todos os campos do mapeamento existem no schema
    const invalidFields = mappingFields.filter(field => !schemaFields.includes(field));
    if (invalidFields.length > 0) {
        console.warn(`Aviso: Campos inválidos no mapeamento: ${invalidFields.join(', ')}`);
    }
    
    return true;
}

// Mapeamento dos modelos para suas funções de geração de dados falsos
const modelMappings = [
    { model: Usuario, mapping: 'usuario' },
    { model: Fornecedor, mapping: 'fornecedor' },
    { model: Produto, mapping: 'produto' },
    { model: Movimentacao, mapping: 'movimentacao' },
    { model: Grupo, mapping: 'grupo' },
    { model: Rota, mapping: 'rota' },
];

function validateAllMappings(fakeMapping) {
    modelMappings.forEach(({ model, mapping }) => {
        // Somente validar se o mapeamento existe
        if (fakeMapping[mapping]) {
            validateModelMapping(model, fakeMapping[mapping]);
        }
    });
}

function getGlobalFakeMapping() {
    
    const fakeMapping = {
        usuario: {
            nome_usuario: () => fakerPT_BR.person.fullName(),
            email: () => fakerPT_BR.internet.email(),
            matricula: () => fakerPT_BR.string.alphanumeric(6).toUpperCase(),
            senha: () => fakerPT_BR.internet.password(15),
            perfil: () => fakerPT_BR.helpers.arrayElement(['administrador', 'gerente', 'vendedor', 'estoquista']),
            ativo: () => fakerPT_BR.datatype.boolean(0.9),
            online: () => fakerPT_BR.datatype.boolean(0.3),
            data_cadastro: () => fakerPT_BR.date.past(),
            data_ultima_atualizacao: () => fakerPT_BR.date.recent(),
            // Novos campos para o sistema de permissões
            grupos: () => [], // Array de ObjectIds - será preenchido nas seeds
            permissoes: () => {
                // Permissões individuais aleatórias (sem duplicatas)
                const recursos = ['produtos', 'fornecedores', 'usuarios', 'grupos', 'logs'];
                const acoes = ['buscar', 'enviar', 'substituir', 'modificar', 'excluir'];
                const permissoes = [];
                const permissoesUnicas = new Set(); // Para evitar duplicatas
                
                // Gera algumas permissões aleatórias
                const numPermissoes = fakerPT_BR.number.int({ min: 0, max: 3 });
                for (let i = 0; i < numPermissoes; i++) {
                    const recurso = fakerPT_BR.helpers.arrayElement(recursos);
                    const chaveUnica = `${recurso}_localhost`; // rota + domínio
                    
                    // Evita duplicatas
                    if (!permissoesUnicas.has(chaveUnica)) {
                        permissoesUnicas.add(chaveUnica);
                        
                        // Gera ações aleatórias para esta rota
                        const acaoAleatoria = fakerPT_BR.helpers.arrayElement(acoes);
                        const permissao = {
                            rota: recurso,
                            dominio: 'localhost',
                            ativo: true,
                            buscar: false,
                            enviar: false,
                            substituir: false,
                            modificar: false,
                            excluir: false
                        };
                        
                        // Ativa apenas a ação selecionada
                        permissao[acaoAleatoria] = true;
                        
                        permissoes.push(permissao);
                    }
                }
                
                return permissoes;
            }
        },
        fornecedor: {
            nome_fornecedor: () => fakerPT_BR.company.name(),
            cnpj: () => fakerPT_BR.string.numeric(14),
            telefone: () => fakerPT_BR.phone.number('##-####-####'),
            email: () => fakerPT_BR.internet.email(),
            endereco: [
                {
                    logradouro: () => fakerPT_BR.location.street(),
                    bairro: () => fakerPT_BR.location.streetName(),
                    cidade: () => fakerPT_BR.location.city(),
                    estado: () => fakerPT_BR.location.state(),
                    cep: () => fakerPT_BR.location.zipCode(),
                },
            ],
        },
        produto: {
            nome_produto: () => fakerPT_BR.commerce.productName(),
            descricao: () => fakerPT_BR.commerce.productDescription(),
            preco: () => parseFloat(fakerPT_BR.commerce.price({min: 15, max: 10000})),
            marca: () => fakerPT_BR.company.name(),
            custo: () => parseFloat(fakerPT_BR.commerce.price({ min: 5, max: 8000 })),
            categoria: function() {
                if (this.preco >= 1001.00) {
                    return 'A';
                }
                else if (this.preco >= 500.00) {
                    return 'B';
                }
                else {
                    return 'C';
                }
            },
            estoque: () => fakerPT_BR.number.int({ min: 0, max: 1000 }),
            estoque_min: () => fakerPT_BR.number.int({ min: 5, max: 50 }),
            data_ultima_entrada: () => fakerPT_BR.date.recent(),
            status: () => fakerPT_BR.datatype.boolean(),
            id_fornecedor: () => fakerPT_BR.number.int({ min: 1, max: 100 }),
            codigo_produto: () => fakerPT_BR.string.alphanumeric(10).toUpperCase(),
        },
        movimentacao: {
            tipo: () => fakerPT_BR.helpers.arrayElement(['entrada', 'saida']),
            destino: () => fakerPT_BR.company.name(),
            data_movimentacao: () => fakerPT_BR.date.recent(),
            id_usuario: () => new mongoose.Types.ObjectId(),
            nome_usuario: () => fakerPT_BR.internet.userName(),
            produtos: {
                produto_ref: () => new mongoose.Types.ObjectId(),
                id_produto: () => fakerPT_BR.number.int({ min: 1, max: 1000 }),
                codigo_produto: () => fakerPT_BR.string.alphanumeric(10).toUpperCase(),
                nome_produto: () => fakerPT_BR.commerce.productName(),
                quantidade_produtos: () => fakerPT_BR.number.int({ min: 1, max: 100 }),
                preco: () => parseFloat(fakerPT_BR.commerce.price()),
                custo: () => parseFloat(fakerPT_BR.commerce.price({ min: 50, max: 200 })),
                id_fornecedor: () => fakerPT_BR.number.int({ min: 1, max: 100 }),
                nome_fornecedor: () => fakerPT_BR.company.name(),
            }
        },
        grupo: {
            nome: () => fakerPT_BR.helpers.arrayElement([
                'Administradores', 'Gerentes', 'Estoquistas', 'Auditores', 
                'Vendedores', 'Supervisores', 'Operadores', 'Consultores'
            ]),
            descricao: () => fakerPT_BR.lorem.sentence(),
            ativo: () => fakerPT_BR.datatype.boolean(0.9), // 90% chance de estar ativo
            data_criacao: () => fakerPT_BR.date.past(),
            data_atualizacao: () => fakerPT_BR.date.recent(),
            permissoes: () => {
                const rotas = ['produtos', 'fornecedores', 'usuarios', 'grupos', 'logs', 'relatorios', 'dashboard'];
                const rotaAleatoria = fakerPT_BR.helpers.arrayElement(rotas);
                return {
                    rota: rotaAleatoria,
                    dominio: 'localhost',
                    ativo: true,
                    buscar: fakerPT_BR.datatype.boolean(0.8),
                    enviar: fakerPT_BR.datatype.boolean(0.6),
                    substituir: fakerPT_BR.datatype.boolean(0.5),
                    modificar: fakerPT_BR.datatype.boolean(0.7),
                    excluir: fakerPT_BR.datatype.boolean(0.3)
                };
            }
        },
        rota: {
            rota: () => fakerPT_BR.helpers.arrayElement([
                'produtos', 'fornecedores', 'usuarios', 'grupos', 'movimentacoes',
                'auth', 'logs', 'relatorios', 'dashboard', 'configuracoes'
            ]),
            dominio: () => fakerPT_BR.helpers.arrayElement(['localhost', 'sistema.com', 'app.sistema.com']),
            ativo: () => fakerPT_BR.datatype.boolean(0.95), // 95% chance de estar ativo
            buscar: () => fakerPT_BR.datatype.boolean(0.9),
            enviar: () => fakerPT_BR.datatype.boolean(0.7),
            substituir: () => fakerPT_BR.datatype.boolean(0.6),
            modificar: () => fakerPT_BR.datatype.boolean(0.8),
            excluir: () => fakerPT_BR.datatype.boolean(0.4),
            createdAt: () => fakerPT_BR.date.past(),
            updatedAt: () => fakerPT_BR.date.recent()
        },
    };

    // Valide os mapeamentos, ignorando erros
    try {
        validateAllMappings(fakeMapping);
    } catch (error) {
        console.warn('Aviso: Erro na validação do mapeamento:', error.message);
    }
    
    return fakeMapping;
}

export default getGlobalFakeMapping;