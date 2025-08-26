// src/utils/validators/schemas/zod/PermissaoValidation.js
import { z } from 'zod';
import { BaseRotaSchema } from './BaseRotaSchema.js';

// Schema para validação de permissões
const PermissaoSchema = BaseRotaSchema.omit({ dominio: true }).extend({
    dominio: z.string().min(1, 'O campo domínio é obrigatório.').optional(),
    ativo: z.boolean().optional(),
    buscar: z.boolean().optional(),
    enviar: z.boolean().optional(),
    substituir: z.boolean().optional(),
    modificar: z.boolean().optional(),
    excluir: z.boolean().optional(),
});

// Verifica se as permissões são únicas dentro do array
const PermissoesArraySchema = z.array(PermissaoSchema).refine((permissoes) => {
    const combinacoes = permissoes.map(p => `${p.rota}_${p.dominio || 'undefined'}`);
    const setCombinacoes = new Set(combinacoes);
    return combinacoes.length === setCombinacoes.size;
}, {
    message: 'Permissões duplicadas: rota + domínio devem ser únicos dentro do array.',
    path: ['permissoes'],
});

export { PermissaoSchema, PermissoesArraySchema };
