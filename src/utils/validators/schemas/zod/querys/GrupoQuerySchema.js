import { z } from 'zod';
import mongoose from 'mongoose';

// Schema para validação de ID de grupo
export const GrupoIdSchema = z.string().refine(id => {
    return mongoose.Types.ObjectId.isValid(id);
}, {
    message: 'ID do grupo inválido'
});

// Schema para query parameters de listagem de grupos
export const GrupoQuerySchema = z.object({
    nome: z.string()
        .min(1, "Nome para busca deve conter pelo menos 1 caractere")
        .optional(),
    ativo: z.enum(['true', 'false'])
        .optional(),
    page: z.string()
        .regex(/^\d+$/, "Página deve ser um número")
        .optional(),
    limite: z.string()
        .regex(/^\d+$/, "Limite deve ser um número")
        .optional()
});

export default {
    GrupoIdSchema,
    GrupoQuerySchema
};
