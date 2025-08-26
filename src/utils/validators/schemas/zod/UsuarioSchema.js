import { z } from 'zod';

export const LoginSchema = z.object({
    matricula: z.string().min(7, 'Matrícula deve conter no minimo 7 caracteres'),
    senha: z.string().min(7, 'Senha deve ter pelo menos 7 caracteres')
})
/*
// Schema exclusivo para validar apenas a matrícula por parâmetro 
export const UsuarioIdSchema = z
  .string()
  .min(7, 'Matrícula deve conter no mínimo 7 caracteres')
  .max(7, 'Matrícula deve conter no máximo 7 caracteres');
*/

export const UsuarioSchema = z.object({
    nome_usuario: z.string().min(3).regex(/^[A-Za-zÀ-ÿ\s]+$/, 'Nome do usuário deve possuir pelo menos 3 caracteres, não pode conter caracteres especiais ou numeros. Apenas letras.'),
    email: z.string().email('Email inválido').min(5, 'Email deve conter no mínimo 5 caracteres').max(100, 'Email deve conter no máximo 100 caracteres'),
    perfil: z.enum(['administrador', 'gerente', 'vendedor', 'estoquista'], {
        errorMap: () => ({ message: 'Perfil deve ser um dos seguintes: administrador, gerente, vendedor ou estoquista.' })
    }),
    matricula: z.string().min(7, 'Matrícula deve conter no minimo 7 caracteres').max(7, 'Matrícula deve conter no máximo 7 caracteres'),
    senha: z.string()
        .min(7, 'Senha deve ter pelo menos 7 caracteres')
        .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiuscula.')
        .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minuscula.')
        .regex(/[0-9]/, 'Senha deve conter pelo menos um numero.')
        .optional(), // Agora a senha é opcional
    // Grupos opcionais no cadastro
    grupos: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID do grupo deve ser um ObjectId válido'))
        .optional()
        .default([])
        .refine((grupos) => grupos.length <= 10, {
            message: 'Usuário pode pertencer a no máximo 10 grupos'
        }),
    // Permissões individuais opcionais no cadastro
    permissoes: z.array(z.object({
        rota: z.string().min(1, 'Nome da rota é obrigatório'),
        dominio: z.string().default('localhost'),
        ativo: z.boolean().default(true),
        buscar: z.boolean().default(false),
        enviar: z.boolean().default(false),
        substituir: z.boolean().default(false),
        modificar: z.boolean().default(false),
        excluir: z.boolean().default(false)
    })).optional().default([])
});

export const UsuarioUpdateSchema = UsuarioSchema.partial();
