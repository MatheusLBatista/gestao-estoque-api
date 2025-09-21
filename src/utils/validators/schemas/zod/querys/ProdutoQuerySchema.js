import { z } from 'zod';
import mongoose from 'mongoose';

export const CategoriaEnum = z.enum(["A", "B", "C", 'a', 'b', 'c']).transform((val) => val.toUpperCase());
export const EstoqueBaixoEnum = z.enum(["true", "false"]).transform((val) => val.toLowerCase());

export const ProdutoQuerySchema = z.object({
    nome_produto: z.string().optional(),
    categoria: CategoriaEnum.optional(),
    codigo_produto: z.string().optional(),
    id_fornecedor: z.string().optional(),
    nome_fornecedor: z.string().optional(),
    page: z.string().optional(),
    limite: z.string().optional(),
    preco_minimo: z.string().optional(),
    preco_maximo: z.string().optional(),
    estoque_minimo: z.string().optional(),
    estoque_maximo: z.string().optional(),
    estoque_baixo: EstoqueBaixoEnum.optional(),
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