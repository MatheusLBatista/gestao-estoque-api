import { z } from 'zod';

// Schema para permissão individual
export const PermissaoSchema = z.object({
    rota: z.string()
        .min(1, "Nome da rota é obrigatório")
        .regex(/^[a-z][a-z0-9_-]*$/, "Nome da rota deve conter apenas letras minúsculas, números, hífens e underscores"),
    dominio: z.string()
        .default('localhost')
        .optional(),
    ativo: z.boolean()
        .default(true)
        .optional(),
    buscar: z.boolean()
        .default(false)
        .optional(),
    enviar: z.boolean()
        .default(false)
        .optional(),
    substituir: z.boolean()
        .default(false)
        .optional(),
    modificar: z.boolean()
        .default(false)
        .optional(),
    excluir: z.boolean()
        .default(false)
        .optional()
});

// Schema para array de permissões
export const PermissoesArraySchema = z.array(PermissaoSchema)
    .min(0, "Array de permissões deve ser válido")
    .max(50, "Máximo de 50 permissões por grupo")
    .optional();

// Schema para criação de grupo
export const GrupoSchema = z.object({
    nome: z.string()
        .min(2, "Nome deve ter pelo menos 2 caracteres")
        .max(100, "Nome deve ter no máximo 100 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\s\-_]+$/, "Nome deve conter apenas letras, espaços, hífens e underscores"),
    descricao: z.string()
        .min(5, "Descrição deve ter pelo menos 5 caracteres")
        .max(500, "Descrição deve ter no máximo 500 caracteres"),
    ativo: z.boolean()
        .default(true)
        .optional(),
    permissoes: PermissoesArraySchema
});

// Schema para atualização de grupo
export const GrupoUpdateSchema = GrupoSchema.partial();

// Schema para adicionar/remover permissão individual
export const GrupoPermissaoSchema = z.object({
    rota: z.string()
        .min(1, "Nome da rota é obrigatório"),
    dominio: z.string()
        .default('localhost')
        .optional()
});

// Schema para status do grupo
export const GrupoStatusSchema = z.object({
    ativo: z.boolean()
});

export default {
    GrupoSchema,
    GrupoUpdateSchema,
    GrupoPermissaoSchema,
    GrupoStatusSchema,
    PermissaoSchema,
    PermissoesArraySchema
};
