import dotenv from "dotenv";
import mongoose from "mongoose";
import Movimentacao from "../models/Movimentacao.js";
import Produto from "../models/Produto.js";
import { MovimentacaoSchema } from "../utils/validators/schemas/zod/MovimentacaoSchema.js";

async function seedMovimentacao(usuarios = [], produtos = []) {
  try {
    await Movimentacao.deleteMany({});

    if (usuarios.length === 0 || produtos.length === 0) {
      throw new Error(
        "Dados insuficientes para criar movimentações relacionadas"
      );
    }

    const movimentacoes = [];
    const tipos = ["entrada", "saida"];

    const adminUser =
      usuarios.find(
        (u) =>
          u.nome_usuario === "Administrador" || u.perfil === "administrador"
      ) || usuarios[0];

    // Criar uma movimentação de ENTRADA para CADA produto criado no seed
    console.log(
      `📦 Criando movimentação de entrada inicial para ${produtos.length} produtos...`
    );

    for (let i = 0; i < produtos.length; i++) {
      const produto = produtos[i];

      // Data de movimentação variando nos últimos 6 meses
      const dataMovimentacao = new Date();
      const diasAtras = Math.floor(Math.random() * 180); // 0 a 180 dias atrás (6 meses)
      dataMovimentacao.setDate(dataMovimentacao.getDate() - diasAtras);

      const numeroNF = 100000 + i; // Número de nota fiscal sequencial
      const serie = (i % 3) + 1; // Serie 1, 2 ou 3

      const movEntrada = {
        tipo: "entrada",
        destino: "Estoque",
        data_movimentacao: dataMovimentacao,
        id_usuario: adminUser._id.toString(),
        produtos: [
          {
            _id: produto._id.toString(),
            codigo_produto: produto.codigo_produto,
            quantidade_produtos: Math.floor(Math.random() * 50) + 20, // 20 a 69 unidades
            custo: produto.custo,
          },
        ],
        nota_fiscal: {
          numero: numeroNF.toString().padStart(9, "0"),
          serie: serie.toString(),
          chave: `352007142001660001875500${serie}0000${numeroNF}1234567890`,
          data_emissao: dataMovimentacao,
        },
        observacoes: `Entrada inicial - Produto ${produto.nome_produto} (Categoria ${produto.categoria})`,
      };

      try {
        MovimentacaoSchema.parse(movEntrada);
        movimentacoes.push(movEntrada);
      } catch (error) {
        console.error(
          `❌ Erro ao validar movimentação de entrada para produto ${produto.codigo_produto}:`,
          error.message
        );
      }
    }

    console.log(
      `✅ ${movimentacoes.length} movimentações de entrada inicial criadas`
    );

    // Criar movimentações adicionais aleatórias (entradas e saídas)
    console.log(`📦 Criando 50 movimentações adicionais aleatórias...`);

    for (let i = 0; i < 50; i++) {
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
      const produto = produtos[Math.floor(Math.random() * produtos.length)];

      const dataMovimentacao = new Date();
      const diasAtras = Math.floor(Math.random() * 90); // 0 a 90 dias atrás (3 meses)
      dataMovimentacao.setDate(dataMovimentacao.getDate() - diasAtras);

      const numeroNF = Math.floor(Math.random() * 999999) + 200000;
      const serie = Math.floor(Math.random() * 3) + 1;

      const movimentacaoFake = {
        tipo,
        destino: tipo === "entrada" ? "Estoque" : "Venda",
        data_movimentacao: dataMovimentacao,
        id_usuario: usuario._id.toString(),
        produtos: [
          {
            _id: produto._id.toString(),
            codigo_produto: produto.codigo_produto,
            quantidade_produtos: Math.floor(Math.random() * 30) + 5, // 5 a 34 unidades
            // Para entrada: custo obrigatório, preço opcional
            ...(tipo === "entrada" && {
              custo: produto.custo || Math.random() * 50 + 10,
            }),
            // Para saída: preço obrigatório, custo opcional
            ...(tipo === "saida" && {
              preco: produto.preco || Math.random() * 100 + 20,
            }),
          },
        ],
        ...(tipo === "entrada" && {
          nota_fiscal: {
            numero: numeroNF.toString().padStart(9, "0"),
            serie: serie.toString(),
            chave: `352007142001660001875500${serie}0000${numeroNF}1234567890`,
            data_emissao: dataMovimentacao,
          },
        }),
        observacoes: `Movimentação ${
          tipo === "entrada" ? "de entrada" : "de saída"
        } adicional - Produto Cat${produto.categoria}${
          tipo === "entrada" ? ` (NF: ${numeroNF})` : ""
        }`,
      };

      // Validar movimentação antes de adicionar
      let movimentacaoValida = false;
      let tentativa = 0;

      while (!movimentacaoValida && tentativa < 3) {
        try {
          MovimentacaoSchema.parse(movimentacaoFake);
          movimentacaoValida = true;
          movimentacoes.push(movimentacaoFake);
        } catch (error) {
          tentativa++;
          console.warn(
            `Tentativa ${tentativa}: Movimentação adicional inválida: ${error.message}`
          );

          // Regenerar valores se inválido
          if (tipo === "entrada" && !movimentacaoFake.produtos[0].custo) {
            movimentacaoFake.produtos[0].custo = Math.random() * 50 + 10;
          }
          if (tipo === "saida" && !movimentacaoFake.produtos[0].preco) {
            movimentacaoFake.produtos[0].preco = Math.random() * 100 + 20;
          }
        }
      }

      if (!movimentacaoValida) {
        console.error(
          `❌ Movimentação adicional ${
            i + 1
          } não pôde ser validada após 3 tentativas`
        );
      }
    }

    console.log(`Tentando inserir ${movimentacoes.length} movimentações...`);

    movimentacoes.forEach((mov, index) => {
      console.log(`📋 Movimentação ${index + 1}:`);
      console.log(`   Tipo: ${mov.tipo}`);
      console.log(`   Destino: ${mov.destino}`);
      console.log(`   Produtos: ${mov.produtos.length} item(s)`);

      if (mov.nota_fiscal) {
        console.log(`   📄 Nota Fiscal:`);
        console.log(`     Número: ${mov.nota_fiscal.numero}`);
        console.log(`     Série: ${mov.nota_fiscal.serie}`);
        console.log(`     Chave: ${mov.nota_fiscal.chave}`);
        console.log(
          `     Data Emissão: ${mov.nota_fiscal.data_emissao?.toLocaleDateString(
            "pt-BR"
          )}`
        );
      } else {
        console.log(`   � Nota Fiscal: Não informada`);
      }

      mov.produtos.forEach((prod, i) => {
        console.log(
          `     Produto ${i + 1}: ${prod.codigo_produto} - Qtd: ${
            prod.quantidade_produtos
          }`
        );
        if (mov.tipo === "entrada")
          console.log(`       Custo: R$ ${prod.custo || "N/A"}`);
        if (mov.tipo === "saida")
          console.log(`       Preço: R$ ${prod.preco || "N/A"}`);
      });
      console.log(`   Observações: ${mov.observacoes}`);
      console.log("─".repeat(50));
    });

    const resultado = await Movimentacao.insertMany(movimentacoes);
    console.log(`✅ ${resultado.length} movimentações criadas com sucesso`);

    return resultado;
  } catch (error) {
    console.error("❌ Erro em seedMovimentacao:", error);
    throw error;
  }
}

export default seedMovimentacao;
