import { z } from "zod";
import mongoose from "mongoose";

// Validador para ObjectId do MongoDB
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Schema para produto na movimentação
const ProdutoMovimentacaoSchema = z.object({
  produto_ref: z.string().refine(isValidObjectId, {
    message: "ID do produto inválido",
  }),
  id_produto: z.number({
    required_error: "ID do produto é obrigatório",
    invalid_type_error: "ID do produto deve ser um número",
  }),
  codigo_produto: z.string({
    required_error: "Código do produto é obrigatório",
  }),
  nome_produto: z.string({
    required_error: "Nome do produto é obrigatório",
  }),
  quantidade_produtos: z
    .number({
      required_error: "Quantidade é obrigatória",
      invalid_type_error: "Quantidade deve ser um número",
    })
    .positive({
      message: "Quantidade deve ser maior que zero",
    }),
  preco: z
    .number({
      required_error: "Preço é obrigatório",
      invalid_type_error: "Preço deve ser um número",
    })
    .nonnegative({
      message: "Preço não pode ser negativo",
    }),
  custo: z
    .number({
      required_error: "Custo é obrigatório",
      invalid_type_error: "Custo deve ser um número",
    })
    .nonnegative({
      message: "Custo não pode ser negativo",
    }),
  id_fornecedor: z.number().optional(),
  nome_fornecedor: z.string().optional(),
});

// Schema completo para criação de movimentação
export const MovimentacaoSchema = z.object({
  tipo: z.enum(["entrada", "saida"], {
    required_error: "Tipo é obrigatório",
    invalid_type_error: 'Tipo deve ser "entrada" ou "saida"',
  }),
  destino: z
    .string({
      required_error: "Destino é obrigatório",
    })
    .min(3, {
      message: "Destino deve ter no mínimo 3 caracteres",
    }),
  data_movimentacao: z.date().optional().default(() => new Date()),
  id_produto: z.string().refine(isValidObjectId, {
    message: "ID do produto inválido",
  }),
  nome_usuario: z.string({
    required_error: "Nome do usuário é obrigatório",
  }),
  produtos: z
    .array(ProdutoMovimentacaoSchema, {
      required_error: "Produtos são obrigatórios",
      invalid_type_error: "Produtos deve ser um array",
    })
    .min(1, {
      message: "A movimentação deve ter pelo menos um produto",
    }),
});

// Schema para atualização de movimentação (todos os campos são opcionais)
export const MovimentacaoUpdateSchema = z
  .object({
    tipo: z
      .enum(["entrada", "saida"], {
        invalid_type_error: 'Tipo deve ser "entrada" ou "saida"',
      })
      .optional(),
    destino: z
      .string()
      .min(3, {
        message: "Destino deve ter no mínimo 3 caracteres",
      })
      .optional(),
    data_movimentacao: z
      .date({
        invalid_type_error: "Data da movimentação deve ser uma data válida",
      })
      .optional(),
    id_usuario: z
      .string()
      .refine(isValidObjectId, {
        message: "ID do usuário inválido",
      })
      .optional(),
    nome_usuario: z.string().optional(),
    produtos: z
      .array(ProdutoMovimentacaoSchema)
      .min(1, {
        message: "A movimentação deve ter pelo menos um produto",
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser fornecido para atualização",
  });

export default {
  MovimentacaoSchema,
  MovimentacaoUpdateSchema,
};
