import { z } from 'zod';
import mongoose from 'mongoose';

export const ProdutoQuerySchema = z.object({
    nome_produto: z.string().optional(),
    categoria: z.string().optional(),
    codigo_produto: z.string().optional(),
    id_fornecedor: z.string().optional(),
    nome_fornecedor: z.string().optional(),
    page: z.string().optional(),
    limite: z.string().optional(),
    preco_min: z.string().optional(),
    preco_max: z.string().optional(),
    estoque_min: z.string().optional(),
    id_fornecedor: z.string().optional(),
    status: z.string().optional(),
    page: z.string().optional(),
    limite: z.string().optional()
}).refine(data => {
    // Pelo menos um dos parâmetros de busca deve estar presente
    return data.nome_produto || data.categoria || data.codigo_produto || data.id_fornecedor || data.nome_fornecedor;
}, {
    message: 'Ao menos um parâmetro de busca deve ser fornecido: nome_produto, categoria, codigo_produto, id_fornecedor ou nome_fornecedor',
    path: ['query']
});

export const ProdutoIdSchema = z.string().refine(id => {
    return mongoose.Types.ObjectId.isValid(id);
}, {
    message: 'ID do produto inválido'
});