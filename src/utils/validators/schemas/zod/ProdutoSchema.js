import { z } from 'zod';

export const ProdutoSchema = z.object({
    nome_produto: z.string().min(3, 'Nome do produto deve ter pelo menos 3 caracteres'),
    descricao: z.string().optional(),
    preco: z.number().positive('Preço deve ser um valor positivo'),
    marca: z.string().optional(), 
    custo: z.number().positive('Custo deve ser um valor positivo'),
    categoria: z.string().min(1, 'Categoria é obrigatória'),
    estoque: z.number().int('Estoque deve ser um número inteiro').nonnegative('Estoque não pode ser negativo'),
    estoque_min: z.number().int('Estoque mínimo deve ser um número inteiro').nonnegative('Estoque mínimo não pode ser negativo'),
    data_ultima_entrada: z.preprocess(
        (arg) => arg === undefined ? undefined : arg instanceof Date ? arg : new Date(arg),
        z.date().optional()
    ),
    status: z.boolean().optional(),
    id_fornecedor: z.number().int('ID do fornecedor deve ser um número inteiro').positive('ID do fornecedor deve ser um número inteiro positivo'),
    codigo_produto: z.string().min(3, 'Código do produto deve ter pelo menos 3 caracteres')
});

export const ProdutoUpdateSchema = ProdutoSchema.partial();