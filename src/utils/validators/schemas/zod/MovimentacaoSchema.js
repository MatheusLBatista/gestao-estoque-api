import { z } from "zod";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createProdutoMovimentacaoSchema = (tipo) => {
  return z.object({
    _id: z
      .string()
      .refine(isValidObjectId, {
        message: "ID do produto inválido",
      })
      .optional(),
    codigo_produto: z
      .string({
        required_error: "Código do produto é obrigatório",
      })
      .min(1, "Código do produto não pode estar vazio"),
    quantidade_produtos: z
      .number({
        required_error: "Quantidade é obrigatória",
        invalid_type_error: "Quantidade deve ser um número",
      })
      .positive({
        message: "Quantidade deve ser maior que zero",
      })
      .int({
        message: "Quantidade deve ser um número inteiro",
      }),
    preco:
      tipo === "saida"
        ? z
            .number({
              required_error: "Preço é obrigatório para movimentações de saída",
              invalid_type_error: "Preço deve ser um número",
            })
            .positive({
              message: "Preço deve ser maior que zero",
            })
        : z
            .number({
              invalid_type_error: "Preço deve ser um número",
            })
            .nonnegative()
            .optional(),
    preco_total: z.number().nonnegative().optional(),
    custo:
      tipo === "entrada"
        ? z
            .number({
              required_error:
                "Custo é obrigatório para movimentações de entrada",
              invalid_type_error: "Custo deve ser um número",
            })
            .positive({
              message: "Custo deve ser maior que zero",
            })
        : z
            .number({
              invalid_type_error: "Custo deve ser um número",
            })
            .nonnegative()
            .optional(),
    custo_total: z.number().nonnegative().optional(),
  });
};

const ProdutoMovimentacaoSchema = z.object({
  _id: z
    .string()
    .refine(isValidObjectId, {
      message: "ID do produto inválido",
    })
    .optional(),
  codigo_produto: z
    .string({
      required_error: "Código do produto é obrigatório",
    })
    .min(1, "Código do produto não pode estar vazio"),
  quantidade_produtos: z
    .number({
      required_error: "Quantidade é obrigatória",
      invalid_type_error: "Quantidade deve ser um número",
    })
    .positive({
      message: "Quantidade deve ser maior que zero",
    })
    .int({
      message: "Quantidade deve ser um número inteiro",
    }),
  preco: z
    .number({
      invalid_type_error: "Preço deve ser um número",
    })
    .nonnegative({
      message: "Preço não pode ser negativo",
    })
    .optional(),
  preco_total: z.number().nonnegative().optional(),
  custo: z
    .number({
      invalid_type_error: "Custo deve ser um número",
    })
    .nonnegative({
      message: "Custo não pode ser negativo",
    })
    .optional(),
  custo_total: z.number().nonnegative().optional(),
});

export const MovimentacaoSchema = z
  .object({
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
    data_movimentacao: z.preprocess(
      (arg) =>
        arg === undefined
          ? undefined
          : arg instanceof Date
          ? arg
          : new Date(arg),
      z.date().optional()
    ),
    id_usuario: z
      .string()
      .refine(isValidObjectId, {
        message: "ID do usuário inválido",
      })
      .optional(),
    status: z.boolean().optional().default(true),
    nota_fiscal: z
      .object({
        numero: z.string().optional(),
        serie: z.string().optional(),
        chave: z.string().optional(),
        data_emissao: z.preprocess(
          (arg) =>
            arg === undefined
              ? undefined
              : arg instanceof Date
              ? arg
              : new Date(arg),
          z.date().optional()
        ),
      })
      .optional(),
    observacoes: z.string().optional(),
    produtos: z
      .array(ProdutoMovimentacaoSchema, {
        required_error: "Produtos são obrigatórios",
        invalid_type_error: "Produtos deve ser um array",
      })
      .min(1, {
        message: "A movimentação deve ter pelo menos um produto",
      }),
  })

  .superRefine((data, ctx) => {
    data.produtos.forEach((produto, index) => {
      if (data.tipo === "saida") {
        // Para saídas, preço é obrigatório
        if (produto.preco === undefined || produto.preco === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Preço é obrigatório para movimentações de saída`,
            path: ["produtos", index, "preco"],
          });
        } else if (produto.preco <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Preço deve ser maior que zero`,
            path: ["produtos", index, "preco"],
          });
        }
      } else if (data.tipo === "entrada") {
        // Para entradas, custo é obrigatório
        if (produto.custo === undefined || produto.custo === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Custo é obrigatório para movimentações de entrada`,
            path: ["produtos", index, "custo"],
          });
        } else if (produto.custo <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Custo deve ser maior que zero`,
            path: ["produtos", index, "custo"],
          });
        }
      }
    });
  });

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
    data_movimentacao: z.preprocess(
      (arg) =>
        arg === undefined
          ? undefined
          : arg instanceof Date
          ? arg
          : new Date(arg),
      z.date().optional()
    ),
    id_usuario: z
      .string()
      .refine(isValidObjectId, {
        message: "ID do usuário inválido",
      })
      .optional(),
    status: z.boolean().optional(),
    nota_fiscal: z
      .object({
        numero: z.string().optional(),
        serie: z.string().optional(),
        chave: z.string().optional(),
        data_emissao: z.preprocess(
          (arg) =>
            arg === undefined
              ? undefined
              : arg instanceof Date
              ? arg
              : new Date(arg),
          z.date().optional()
        ),
      })
      .optional(),
    observacoes: z.string().optional(),
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
