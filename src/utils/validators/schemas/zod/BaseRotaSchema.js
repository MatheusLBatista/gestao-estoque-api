// src/utils/validators/schemas/zod/BaseRotaSchema.js
import { z } from 'zod';
import ObjectID from './ObjectIdSchema.js';

export const BaseRotaSchema = z.object({
    _id: ObjectID.optional(),
    rota: z.string().min(1,'O campo rota é obrigatório.'),
    dominio: z.string().min(1,'O campo domínio é obrigatório.'),
});
