import { z } from "zod";
import mongoose from 'mongoose';

export const RotaIdSchema = z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "ID inválido",
});

export const RotaQuerySchema = z.object({
    rota: z
        .string()
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Rota não pode ser vazia",
        })
        .transform((val) => val?.trim()),
    dominio: z
        .string()
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Domínio não pode ser vazio",
        }),
    ativo: z
        .string()
        .optional()
        .refine((value) => !value || value === "true" || value === "false", {
            message: "Ativo deve ser 'true' ou 'false'",
        }),
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 100) : 1))
        .refine((val) => Number.isInteger(val) && val > 0, {
            message: "Page deve ser um número inteiro maior que 0",
        }),
    limite: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => Number.isInteger(val) && val > 0 && val <= 100, {
            message: "Limite deve ser um número inteiro entre 1 e 100",
        }),
});
