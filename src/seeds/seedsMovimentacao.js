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

    const produtosDb = await Produto.find().limit(2);
    const produto1 = produtosDb[0];
    const produto2 = produtosDb[1] || produtosDb[0];

    console.log(
      `📦 Produto 1 para entrada: ${produto1.nome_produto} (${produto1.codigo_produto}) - Custo: R$ ${produto1.custo}`
    );
    console.log(
      `📦 Produto 2 para saída: ${produto2.nome_produto} (${produto2.codigo_produto}) - Preço: R$ ${produto2.preco}`
    );

    const movEntrada = {
      tipo: "entrada",
      destino: "Estoque",
      id_usuario: adminUser._id,
      produtos: [
        {
          _id: produto1._id,
          codigo_produto: produto1.codigo_produto,
          quantidade_produtos: 30,
          custo: produto1.custo, 
        },
      ],
      observacoes: "Movimentação de entrada fixa - Seed",
    };

    const movSaida = {
      tipo: "saida",
      destino: "Venda",
      id_usuario: adminUser._id,
      produtos: [
        {
          _id: produto2._id,
          codigo_produto: produto2.codigo_produto,
          quantidade_produtos: 15,
          preco: produto2.preco, 
        },
      ],
      observacoes: "Movimentação de saída fixa - Seed",
    };

    movimentacoes.push(movEntrada, movSaida);

    try {
      MovimentacaoSchema.parse(movEntrada);
      console.log("✅ Movimentação fixa de entrada validada com sucesso");
    } catch (error) {
      console.error(
        "❌ Erro ao validar movimentação fixa de entrada:",
        error.message
      );
    }

    try {
      MovimentacaoSchema.parse(movSaida);
      console.log("✅ Movimentação fixa de saída validada com sucesso");
    } catch (error) {
      console.error(
        "❌ Erro ao validar movimentação fixa de saída:",
        error.message
      );
    }

    for (let i = 0; i < 20; i++) {
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
      const produto = produtos[Math.floor(Math.random() * produtos.length)];

      const dataMovimentacao = new Date();
      dataMovimentacao.setDate(
        dataMovimentacao.getDate() - Math.floor(Math.random() * 30)
      );

      const movimentacaoFake = {
        tipo,
        destino: tipo === "entrada" ? "Estoque" : "Venda",
        data_movimentacao: dataMovimentacao,
        id_usuario: usuario._id.toString(),
        produtos: [
          {
            _id: produto._id.toString(),
            codigo_produto: produto.codigo_produto,
            quantidade_produtos: Math.floor(Math.random() * 20) + 1,
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
        observacoes: `Movimentação ${
          tipo === "entrada" ? "de entrada" : "de saída"
        } - Seed ${i + 1}`,
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
            `Tentativa ${tentativa}: Movimentação inválida: ${error.message}`
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
          `❌ Movimentação ${i + 1} não pôde ser validada após 3 tentativas`
        );
      }
    }

    console.log(`Tentando inserir ${movimentacoes.length} movimentações...`);

    // Log das movimentações que serão inseridas
    movimentacoes.forEach((mov, index) => {
      console.log(`📋 Movimentação ${index + 1}:`);
      console.log(`   Tipo: ${mov.tipo}`);
      console.log(`   Destino: ${mov.destino}`);
      console.log(`   Produtos: ${mov.produtos.length} item(s)`);
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
