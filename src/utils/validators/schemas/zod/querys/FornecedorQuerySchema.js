import { z } from "zod";

export const FornecedorQuerySchema = z.object({
  nome: z
    .string()
    .min(1, "O nome para busca deve conter pelo menos 1 caractere"),
  categoria: z.string().optional(),
  codigo_produto: z.string().optional(),
  preco_min: z.string().optional(),
  preco_max: z.string().optional(),
  estoque_min: z.string().optional(),
  id_fornecedor: z.string().optional(),
  status: z.string().optional(),
  page: z.string().optional(),
  limite: z.string().optional(),
});

export const FornecedorIdSchema = z.string().refine(
  (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  },
  {
    message: "ID do produto inválido",
  }
);
