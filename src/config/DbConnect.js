// src/config/DbConnect.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { URL } from 'url';
// import SendMail from '../utils/SendMail.js'; // Assegure-se de que este caminho está correto
// import logger from '../utils/logger.js';

dotenv.config(); // Carrega as variáveis de ambiente

/**
 * Classe responsável por gerenciar a conexão com o MongoDB.
 */
class DbConnect {
    /**
     * Estabelece a conexão com o MongoDB.
     */
    static async conectar() {
        try {
            const mongoUri = process.env.DB_URL;

            if (!mongoUri) {
                throw new Error("A variável de ambiente DB_URL não está definida.");
            }

            // Log seguro indicando que a URI está definida
            // logger.info('DB_URL está definida.');

            // Configuração de strictQuery baseada no ambiente
            if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
                mongoose.set('strictQuery', false);
            } else {
                mongoose.set('strictQuery', true);
            }

            // Configurações condicional para autoIndex e debug
            if (process.env.NODE_ENV === 'development') {
                mongoose.set('autoIndex', true); // Cria índices automaticamente
                mongoose.set('debug', true); // Ativa logs de debug
                console.log('🔧 Configurações de desenvolvimento ativadas: autoIndex e debug.');
                console.log('📊 NODE_ENV:', process.env.NODE_ENV);
            } else {
                mongoose.set('autoIndex', false); // Desativa criação automática de índices
                mongoose.set('debug', false); // Desativa logs de debug
                console.log('🏭 Configurações de produção ativadas: autoIndex e debug desativados.');
                console.log('📊 NODE_ENV:', process.env.NODE_ENV);
            }

            // FORÇA logs do Mongoose para debug (temporário)
            mongoose.set('debug', true);
            console.log('🐛 Debug do Mongoose FORÇADO para true');

            // Adiciona listeners para eventos do Mongoose
            mongoose.connection.on('connected', () => {
                // logger.info('Mongoose conectado ao MongoDB.');
            });

            mongoose.connection.on('error', (err) => {
                // logger.error(`Mongoose erro: ${err}`);
                if (process.env.NODE_ENV !== 'test') {
                    // SendMail.enviaEmailErrorDbConect(err, new URL(import.meta.url).pathname, new Date());
                }
            });

            mongoose.connection.on('disconnected', () => {
                // logger.info('Mongoose desconectado do MongoDB.');
            });

            // Conexão com opções configuráveis via variáveis de ambiente
            await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS
                    ? parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS)
                    : 5000,
                socketTimeoutMS: process.env.MONGO_SOCKET_TIMEOUT_MS
                    ? parseInt(process.env.MONGO_SOCKET_TIMEOUT_MS)
                    : 45000,
                connectTimeoutMS: process.env.MONGO_CONNECT_TIMEOUT_MS
                    ? parseInt(process.env.MONGO_CONNECT_TIMEOUT_MS)
                    : 10000,
                retryWrites: true,
                maxPoolSize: process.env.MONGO_MAX_POOL_SIZE
                    ? parseInt(process.env.MONGO_MAX_POOL_SIZE)
                    : 10,
            });

            // logger.info('Conexão com o banco estabelecida!');
        } catch (error) {
            // logger.error(`Erro na conexão com o banco de dados em ${new Date().toISOString()}: ${error.message}`);
            if (process.env.NODE_ENV !== 'test') {
                // SendMail.enviaEmailErrorDbConect(error, new URL(import.meta.url).pathname, new Date());
            }
            throw error; // Re-lança o erro para permitir que o aplicativo lide com a falha de conexão
        }
    }

    /**
     * Desconecta do MongoDB.
     */
    static async desconectar() {
        try {
            await mongoose.disconnect();
            // logger.info('Conexão com o banco encerrada!');
        } catch (error) {
            // logger.error(`Erro ao desconectar do banco de dados em ${new Date().toISOString()}: ${error.message}`);
            if (process.env.NODE_ENV !== 'test') {
                // SendMail.enviaEmailErrorDbConect(error, new URL(import.meta.url).pathname, new Date());
            }
            throw error; // Re-lança o erro para permitir que o aplicativo lide com a falha de desconexão
        }
    }
}

export default DbConnect;
