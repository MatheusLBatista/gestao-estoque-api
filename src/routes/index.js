import express from "express";
import SwaggerConfig from "../docs/index.js";
import authMiddleware from "../middlewares/AuthMiddleware.js";
import authPermission from "../middlewares/AuthPermission.js";
import rotasProdutos from "./produtoRoutes.js";
import rotasFornecedores from "./fornecedorRoutes.js";
import rotasUsuarios from "./usuarioRoutes.js";
import rotasMovimentacoes from './movimentacaoRoutes.js';
import rotasAuth from './authRoutes.js';
import rotasLogs from './logRoutes.js';
import rotasGrupos from './grupoRoutes.js';
import dotenv from "dotenv";

dotenv.config();

const routes = (app) => {
  
  // Configurar Swagger usando a nova estrutura centralizada
  const swaggerConfig = new SwaggerConfig();
  swaggerConfig.setupSwagger(app);
  
  // Rota para encaminhar da raiz para a documentação
  app.get("/", (req, res) => {
    res.redirect("/api-docs");
  });

  // Rotas públicas (não necessitam de autenticação)
  app.use("/auth", express.json(), rotasAuth);
  
  // Rotas protegidas (precisam de autenticação)
  app.use("/api/produtos", express.json(), authMiddleware, authPermission, rotasProdutos);
  app.use("/api/fornecedores", express.json(), authMiddleware, authPermission, rotasFornecedores);
  app.use("/api/usuarios", express.json(), authMiddleware, authPermission, rotasUsuarios);
  app.use("/api/grupos", express.json(), authMiddleware, authPermission, rotasGrupos);
  app.use("/api/movimentacoes", express.json(), authMiddleware, authPermission, rotasMovimentacoes);
  app.use("/api/logs", express.json(), rotasLogs); // Logs já têm authMiddleware internamente

  // Se não é nenhuma rota válida, produz 404
  app.use((req, res) => {
    res.status(404).json({ message: "Rota não encontrada" });
  });
};

export default routes;