import { z } from 'zod';
import mongoose from 'mongoose';

export const UsuarioQuerySchema = z.object({
    // Aceitar ambos os campos para compatibilidade
    nome: z.string().min(1, "O nome para busca deve conter pelo menos 1 caractere").optional(),
    nome_usuario: z.string().min(1, "O nome para busca deve conter pelo menos 1 caractere").optional(),
    matricula: z.string().optional(),
    cargo: z.string().optional(),
    email: z.string().email("Email inválido").optional(),
    data_cadastro_inicio: z.string().optional(),
    data_cadastro_fim: z.string().optional(),
    page: z.string().optional(),
    limite: z.string().optional()
});

export const UsuarioIdSchema = z.string().refine(id => {
    return mongoose.Types.ObjectId.isValid(id);
}, {
    message: 'ID do usuário inválido'
});

// função para ativar/desativar usuarios por matricula (OBS: em desenvolvimento)
export const UsuarioMatriculaSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{4}[0-9]{3}$/, {
    message: 'Matrícula deve seguir o padrão TEST001'
  });
