import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Fornecedor from '../models/Fornecedor.js';
import { FornecedorSchema } from '../utils/validators/FornecedorSchema.js';

async function seedFornecedor() {
    try {
        await Fornecedor.deleteMany({});
        
        // Criar fornecedores fixos que atendem aos requisitos do Zod
        const fornecedores = [
            {
                nome_fornecedor: 'Distribuidora Central Ltda',
                cnpj: '12345678901234',
                telefone: '1112345678',
                email: 'contato@distribuidoracentral.com.br',
                endereco: [{
                    logradouro: 'Av. Paulista, 1000',
                    bairro: 'Bela Vista',
                    cidade: 'São Paulo',
                    estado: 'SP',
                    cep: '01310100'
                }]
            },
            {
                nome_fornecedor: 'Mercado Atacado Brasil',
                cnpj: '98765432109876',
                telefone: '2198765432',
                email: 'vendas@atacadobrasil.com.br',
                endereco: [{
                    logradouro: 'Rua das Mercadorias, 500',
                    bairro: 'Centro',
                    cidade: 'Rio de Janeiro',
                    estado: 'RJ',
                    cep: '20031170'
                }]
            }
        ];
        
        // Validar com Zod antes de inserir
        for (const fornecedor of fornecedores) {
            try {
                FornecedorSchema.parse(fornecedor);
                console.log(`✅ Fornecedor ${fornecedor.nome_fornecedor} validado com sucesso`);
            } catch (error) {
                console.error(`❌ Erro ao validar fornecedor ${fornecedor.nome_fornecedor}:`, error);
            }
        }
        
        const result = await Fornecedor.create(fornecedores);
        console.log(`✅ ${result.length} fornecedores criados com sucesso`);
        return result;
    } catch (error) {
        console.error('❌ Erro em seedFornecedor:', error);
        throw error;
    }
}

export default seedFornecedor;