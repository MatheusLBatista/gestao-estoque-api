import { z } from 'zod';
import mongoose from 'mongoose';

// Validador para ObjectId do MongoDB
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Validador para data
const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

// Schema para ID de movimentação
export const MovimentacaoIdSchema = z.string().refine(isValidObjectId, {
    message: 'ID da movimentação inválido'
});

// Schema para query parameters
export const MovimentacaoQuerySchema = z.object({
    tipo: z.enum(['entrada', 'saida'], {
        invalid_type_error: 'Tipo deve ser "entrada" ou "saida"'
    }).optional(),
    
    data_inicio: z.string().refine(isValidDate, {
        message: 'Data de início inválida. Use o formato YYYY-MM-DD'
    }).optional(),
    
    data_fim: z.string().refine(isValidDate, {
        message: 'Data de fim inválida. Use o formato YYYY-MM-DD'
    }).optional(),
    
    produto: z.string().optional(),
    
    usuario: z.string().optional(),
    
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