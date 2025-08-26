import { z } from 'zod';

const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

export const LoginSchema = z.object({
    matricula: z.number().min(7, 'matricula deve conter pelo menos 7 caracteres.'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').refine((senha) => {
            return regexSenha.test(senha,)
        }, {
            message: 'Senha deve possuir pelo menos uma letra maiúscula, uma letra minúscula, um número, e no mínimo 8 caracteres.'
        })
});