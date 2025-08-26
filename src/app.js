// src/app.js

import express from "express";
import routes from "./routes/index.js";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import DbConect from './config/DbConnect.js';
import errorHandler from './utils/helpers/errorHandler.js';
// import logger from './utils/logger.js';
import CommonResponse from './utils/helpers/CommonResponse.js';

const app = express();

// Configura o middleware express-fileupload
// app.use(fileUpload({
//     createParentPath: true, // Cria diretórios automaticamente se não existirem
//     limits: { fileSize: 5 * 1024 * 1024 }, // Limita o tamanho do arquivo a 5MB (ajuste conforme necessário)
//     abortOnLimit: true, // Aborta a requisição se o limite for excedido
//     responseOnLimit: 'Tamanho do arquivo excede o limite permitido.' // Mensagem de resposta quando o limite é excedido
// }));


// Conectando ao banco de dados
await DbConect.conectar();

// Middleware para logs de debug de todas as requisições
app.use((req, res, next) => {
    console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    console.log(`📍 Headers:`, req.headers);
    console.log(`📦 Body:`, req.body);
    console.log(`🔍 Query:`, req.query);
    console.log(`📋 Params:`, req.params);
    next();
});

// Middlewares de segurança
app.use(helmet());

// Habilitando CORS
// app.use(cors());
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


// Listener para erros não tratados (opcional, mas recomendado)
process.on('unhandledRejection', (reason, promise) => {
    // logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Não finalizar o processo para evitar interrupção da API
});

process.on('uncaughtException', (error) => {
    // logger.error('Uncaught Exception thrown:', error);
    // Não finalizar o processo para evitar interrupção da API
    // Considerar reiniciar a aplicação em caso de exceções críticas
});

// Middleware de Tratamento de Erros (deve ser adicionado após as rotas)
app.use(errorHandler);

// exportando para o server.js fazer uso
export default app;
