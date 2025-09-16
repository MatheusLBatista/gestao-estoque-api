import { z } from 'zod';
import mongoose from 'mongoose';

// Validador para ObjectId do MongoDB
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Schema para ID de movimentação
export const MovimentacaoIdSchema = z.string().refine(isValidObjectId, {
    message: 'ID da movimentação inválido'
});

// Schema para query parameters
export const MovimentacaoQuerySchema = z.object({
    tipo: z.enum(['entrada', 'saida'], {
        invalid_type_error: 'Tipo deve ser "entrada" ou "saida"'
    }).optional(),

    data_inicio: z.string()
        .regex(/^\d{2}-\d{2}-\d{4}$/, "Formato deve ser DD-MM-YYYY")
        .refine(val => {
            if (!val) return true;
            const [d, m, y] = val.split("-").map(Number);
            const date = new Date(y, m - 1, d);
            return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
        }, "Data inválida")
        .optional(),

    data_fim: z.string()
        .regex(/^\d{2}-\d{2}-\d{4}$/, "Formato deve ser DD-MM-YYYY")
        .refine(val => {
            if (!val) return true;
            const [d, m, y] = val.split("-").map(Number);
            const date = new Date(y, m - 1, d);
            return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
        }, "Data inválida")
        .optional(),
    
    produto: z.string().refine(isValidObjectId, { message: "ID de produto inválido" }).optional(),

    usuario: z.string().refine(isValidObjectId, { message: "ID de usuário inválido" }).optional(),

    nome_usuario: z.string().optional(),

    nome_produto: z.string().optional(),

    codigo_produto: z.string().optional(),

    destino: z.string().optional(),

    page: z.string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1))
        .refine((val) => !isNaN(val) && val > 0, {
            message: 'Página deve ser um número positivo'
        }),
        
    limite: z.string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
            message: 'Limite deve ser um número entre 1 e 100'
        })
}).refine(
    (data) => {
        // Se data_inicio estiver presente, data_fim também deve estar
        if (data.data_inicio && !data.data_fim) return false;
        // Se data_fim estiver presente, data_inicio também deve estar
        if (data.data_fim && !data.data_inicio) return false;
        
        return true;
    },
    {
        message: 'Ambos data_inicio e data_fim devem ser fornecidos juntos',
        path: ['data_inicio', 'data_fim']
    }
);

export default {
    MovimentacaoIdSchema,
    MovimentacaoQuerySchema
};