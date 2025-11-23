import { z } from "zod";
import mongoose from "mongoose";

export const UsuarioQuerySchema = z.object({
  // Aceitar ambos os campos para compatibilidade
  nome: z
    .string()
    .min(1, "O nome para busca deve conter pelo menos 1 caractere")
    .optional(),
  nome_usuario: z
    .string()
    .min(1, "O nome para busca deve conter pelo menos 1 caractere")
    .optional(),
  matricula: z.string().optional(),
  cargo: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  data_cadastro_inicio: z.string().optional(),
  data_cadastro_fim: z.string().optional(),
  page: z.string().optional(),
  limite: z.string().optional(),
});

export const UsuarioIdSchema = z.string().refine(
  (id) => {
    return mongoose.Types.ObjectId.isValid(id);
  },
  {
    message: "ID do usuário inválido",
  }
);

// função para ativar/desativar usuarios por matricula
export const UsuarioMatriculaSchema = z
  .string()
  .trim()
  .min(1, "Matrícula é obrigatória")
  .max(20, "Matrícula deve ter no máximo 20 caracteres");
