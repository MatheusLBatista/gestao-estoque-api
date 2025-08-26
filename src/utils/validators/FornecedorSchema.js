import { z } from 'zod';

export const FornecedorSchema = z.object({
    nome_fornecedor: z.string().min(3, 'Nome do fornecedor deve ter pelo menos 3 caracteres'),
    cnpj: z.string().length(14, 'CNPJ deve conter exatamente 14 caracteres').regex(/^\d+$/, 'CNPJ deve conter apenas números'),
    telefone: z.string().length(10, 'Telefone deve conter exatamente 10 caracteres').regex(/^\d+$/, 'Telefone deve conter apenas números'),
    email: z.string().email('Email inválido').min(5, 'Email deve conter no mínimo 5 caracteres').max(100, 'Email deve conter no máximo 100 caracteres'),
    endereco: z.array(z.object({
        logradouro: z.string().min(3, 'Logradouro deve ter pelo menos 3 caracteres'),
        bairro: z.string().min(3, 'Bairro deve ter pelo menos 3 caracteres'),
        cidade: z.string().min(3, 'Cidade deve ter pelo menos 3 caracteres'),
        estado: z.string().length(2, 'Estado deve conter exatamente 2 caracteres'),
        cep: z.string().regex(/^\d+$/, 'CEP deve conter apenas números')
    })).nonempty('Endereço não pode estar vazio')
})