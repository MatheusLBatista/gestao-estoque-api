// src/app-test.js
// Versão do app.js específica para testes de integração

import express from "express";
import routes from "./routes/index.js";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import errorHandler from './utils/helpers/errorHandler.js';
import CommonResponse from './utils/helpers/CommonResponse.js';

const app = express();

// Middleware para logs de debug de todas as requisições (apenas no desenvolvimento)
if (process.env.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
        console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
        console.log(`📍 Headers:`, req.headers);
        console.log(`📦 Body:`, req.body);
        console.log(`🔍 Query:`, req.query);
        console.log(`📋 Params:`, req.params);
        next();
    });
}

// Middlewares de segurança
app.use(helmet());

// Habilitando CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Habilitando a compressão de respostas
app.use(compression());

// Habilitando o uso de json pelo express
app.use(express.json());

// Habilitando o uso de urlencoded pelo express
app.use(express.urlencoded({ extended: true }));

// Passando para o arquivo de rotas o app
routes(app);

// Middleware para lidar com rotas não encontradas (404)
app.use((err, req, res, next) => {
    console.error(err);
    
    if (req.path.startsWith('/produtos')) {
      return res.status(404).json({
        message: "Rota de produto não encontrada",
        path: req.originalUrl
      });
    }
    
    if (err.name === 'NotFoundError' || err.statusCode === 404) {
      return res.status(404).json({
        message: err.message || "Recurso não encontrado"
      });
    }
    
    res.status(err.statusCode || 500).json({
      message: err.message || "Erro interno do servidor"
    });
});

// Listener para erros não tratados (apenas no desenvolvimento)
if (process.env.NODE_ENV !== 'test') {
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception thrown:', error);
    });
}

// Middleware de Tratamento de Erros (deve ser adicionado após as rotas)
app.use(errorHandler);

// exportando para os testes usarem
export default app;
