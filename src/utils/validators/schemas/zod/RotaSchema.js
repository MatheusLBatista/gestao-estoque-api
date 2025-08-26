// src/utils/validators/schemas/zod/RotaSchema.js
import { z } from 'zod';
import { BaseRotaSchema } from './BaseRotaSchema.js';

const RotaSchema = BaseRotaSchema.extend({
    ativo: z.boolean().default(true),
    buscar: z.boolean().default(false),
    enviar: z.boolean().default(false),
    substituir: z.boolean().default(false),
    modificar: z.boolean().default(false),
    excluir: z.boolean().default(false),
});

const RotaUpdateSchema = RotaSchema.partial();

export { RotaSchema, RotaUpdateSchema };
