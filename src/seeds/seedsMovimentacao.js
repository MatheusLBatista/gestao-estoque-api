import dotenv from "dotenv";
import mongoose from "mongoose";
import Movimentacao from "../models/Movimentacao.js";
import Produto from "../models/Produto.js";

async function seedMovimentacao(usuarios = [], produtos = []) {
  try {
    await Movimentacao.deleteMany({});

    if (usuarios.length === 0 || produtos.length === 0) {
      throw new Error("Dados insuficientes para criar movimentações relacionadas");
    }

    const movimentacoes = [];
    const tipos = ["entrada", "saida"];

    const adminUser =
      usuarios.find(
        (u) =>
          u.nome_usuario === "Administrador" || u.perfil === "administrador"
      ) || usuarios[0];

    // Pega dois produtos para criar movimentações fixas
    const produtosDb = await Produto.find().limit(2);
    const produto1 = produtosDb[0];
    const produto2 = produtosDb[1] || produtosDb[0];

    // Movimentação de entrada fixa
    const movEntrada = {
      tipo: "entrada",
      destino: "Estoque",
      id_usuario: adminUser._id,
      produtos: {
        _id: [produto1._id],
        codigo_produto: produto1.codigo_produto,
        quantidade_produtos: 30,
        custo: produto1.custo * 30,
        preco: produto1.preco * 30,
      },
    };

    // Movimentação de saída fixa
    const movSaida = {
      tipo: "saida",
      destino: "Venda",
      id_usuario: adminUser._id,
      produtos: {
        _id: [produto2._id],
        codigo_produto: produto2.codigo_produto,
        quantidade_produtos: 15,
        custo: produto2.custo * 15,
        preco: produto2.preco * 15,
      },
    };

    movimentacoes.push(movEntrada, movSaida);

    // Criar movimentações aleatórias
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
        id_usuario: usuario._id,
        produtos: {
          _id: [produto._id],
          codigo_produto: produto.codigo_produto,
          quantidade_produtos: Math.floor(Math.random() * 20) + 1,
          custo:
            tipo === "entrada"
              ? produto.custo * (Math.floor(Math.random() * 20) + 1)
              : 0,
          preco:
            tipo === "saida"
              ? produto.preco * (Math.floor(Math.random() * 20) + 1)
              : 0,
        },
        // Armazenar apenas o ID do usuário para evitar dados sensíveis
        usuario: { _id: usuario._id }
      };

      movimentacoes.push(movimentacaoFake);
    }

    console.log(`Tentando inserir ${movimentacoes.length} movimentações...`);
    const resultado = await Movimentacao.insertMany(movimentacoes);
    console.log(`✅ ${resultado.length} movimentações criadas com sucesso`);

    return resultado;
  } catch (error) {
    console.error("❌ Erro em seedMovimentacao:", error);
    throw error;
  }
}

export default seedMovimentacao;
