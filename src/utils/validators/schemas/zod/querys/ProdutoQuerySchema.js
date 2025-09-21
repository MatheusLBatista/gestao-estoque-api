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
    preco_minimo: z.string().optional(),
    preco_maximo: z.string().optional(),
    estoque_min: z.string().optional(),
    id_fornecedor: z.string().optional(),
    status: z.string().optional(),
    page: z.string().optional(),
    limite: z.string().optional()
});

export const ProdutoIdSchema = z.string().refine(id => {
    return mongoose.Types.ObjectId.isValid(id);
}, {
    message: 'ID do produto inválido'
});