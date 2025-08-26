// src/utils/logger.js

import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

class Logger {
    constructor() {
        // Configurações iniciais
        this.logDirectory = path.resolve(process.cwd(), 'logs');

        // Refatoração da Linha 15
        if (process.env.LOG_MAX_SIZE_GB !== undefined) {
            this.logMaxSizeGB = parseFloat(process.env.LOG_MAX_SIZE_GB);
        } else {
            this.logMaxSizeGB = 50;
        }

        if (isNaN(this.logMaxSizeGB) || this.logMaxSizeGB <= 0) { // Linha 20
            console.log('Linha 20: logMaxSizeGB inválido');
            throw new Error('LOG_MAX_SIZE_GB deve ser um número positivo');
        }

        this.maxLogSize = this.logMaxSizeGB * 1024 * 1024 * 1024;

        // Refatoração da Linha 22
        if (process.env.LOG_ENABLED !== undefined) {
            this.logEnabled = process.env.LOG_ENABLED === 'true';
        } else {
            console.log('Linha 33: logEnabled padrão true');
            this.logEnabled = true; // Linha 33
        }

        // Inicializa o logger
        this.logger = this.createLoggerInstance();

        // Configura os event listeners
        this.setupExceptionHandlers();

        // Inicia o intervalo de verificação de tamanho dos logs
        this.startLogSizeInterval();
    }

    createLoggerInstance() {
        const loggerTransports = [];
        if (this.logEnabled) {
            if (!fs.existsSync(this.logDirectory)) {
                fs.mkdirSync(this.logDirectory, { recursive: true });
            }

            loggerTransports.push(
                new transports.Console({
                    format: format.combine(format.colorize(), format.simple())
                }),
                new DailyRotateFile({
                    filename: path.join(this.logDirectory, 'error-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    level: 'error',
                    maxFiles: '30d',
                }),
                new DailyRotateFile({
                    filename: path.join(this.logDirectory, 'combined-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '30d',
                }),
            );
        }

        return createLogger({
            // Linha 60 permanece a mesma
            level: process.env.LOG_LEVEL || 'info',
            format: format.combine(
                format.timestamp(),
                format.errors({ stack: true }),
                format.splat(),
                format.json()
            ),
            defaultMeta: { service: 'usuario-service' },
            transports: loggerTransports,
        });
    }

    getTotalLogSize(directory) {
        if (!fs.existsSync(directory)) return 0;
        return fs.readdirSync(directory).reduce((totalSize, file) => {
            const filePath = path.join(directory, file);
            return totalSize + fs.statSync(filePath).size;
        }, 0);
    }

    ensureLogSizeLimit(directory, maxSizeInBytes) {
        let totalSize = this.getTotalLogSize(directory);

        if (totalSize > maxSizeInBytes) {
            const files = fs.readdirSync(directory)
                .map((file) => ({
                    file,
                    time: fs.statSync(path.join(directory, file)).mtime.getTime(),
                }))
                .sort((a, b) => a.time - b.time);

            for (const { file } of files) {
                if (totalSize <= maxSizeInBytes) break;

                const filePath = path.join(directory, file);
                const stats = fs.statSync(filePath);
                fs.unlinkSync(filePath);
                totalSize -= stats.size;
            }
        }
    }

    setupExceptionHandlers() {
        if (this.logEnabled && !global.loggerListenersSet && process.env.NODE_ENV !== 'test') {
            process.on('uncaughtException', (err) => {
                this.logger.error('Uncaught Exception:', err);
                process.exit(1);
            });

            process.on('unhandledRejection', (reason, promise) => {
                this.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
            });

            global.loggerListenersSet = true;
        }
    }

    startLogSizeInterval() {
        if (this.logEnabled && process.env.NODE_ENV !== 'test') {
            this.logIntervalId = setInterval(() => this.ensureLogSizeLimit(this.logDirectory, this.maxLogSize), 60 * 1000);
        }
    }
}

const loggerInstance = new Logger();

export default loggerInstance.logger;
export const getTotalLogSize = loggerInstance.getTotalLogSize.bind(loggerInstance);
export const ensureLogSizeLimit = loggerInstance.ensureLogSizeLimit.bind(loggerInstance);
export const logIntervalId = loggerInstance.logIntervalId;
export const maxLogSize = loggerInstance.maxLogSize;
