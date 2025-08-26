import LogService from '../services/LogService.js';
import fs from 'fs';
import path from 'path';

class LogMiddleware {
    constructor() {
        this.logService = new LogService();
        this.userSessions = new Map(); // Armazena o caminho do arquivo de sessão para cada usuário
    }

    /**
     * Middleware para capturar e registrar atividades
     */
    log(eventType = 'REQUEST') {
        return (req, res, next) => {
            try {
                // Só registra se o usuário estiver autenticado
                if (req.userId) {
                    const sessionFilePath = this.userSessions.get(req.userId);

                    if (sessionFilePath) {
                        // Dados específicos baseados no tipo de evento
                        let eventData = {
                            metodo: req.method,
                            rota: req.originalUrl || req.url,
                            params: req.params,
                            query: req.query
                        };

                        // Adiciona dados específicos para diferentes tipos de operações
                        if (eventType === 'ESTOQUE_MOVIMENTO' && req.body) {
                            eventData.produto = req.body.produto || req.params.id;
                            eventData.quantidade = req.body.quantidade;
                            eventData.tipo_movimentacao = req.body.tipo;
                        }

                        if (eventType === 'USUARIO_ACAO' && req.body) {
                            eventData.acao = req.method;
                            eventData.dados_alterados = Object.keys(req.body);
                        }

                        this.logService.logEvent(sessionFilePath, eventType, eventData, req);
                    }
                }
            } catch (error) {
                console.error('Erro no middleware de log:', error);
            }

            next();
        };
    }

    /**
     * Inicia uma nova sessão de log para o usuário
     */
    startSession(userId, userInfo, req) {
        try {
            // Garante que userId seja string
            const userIdString = userId.toString();

            const requestInfo = this.logService.extractRequestInfo(req);

            const sessionInfo = {
                ...userInfo,
                ...requestInfo
            };

            const sessionFilePath = this.logService.createSessionFile(userIdString, sessionInfo);
            this.userSessions.set(userIdString, sessionFilePath);

            // Registra o evento de login
            this.logService.logEvent(sessionFilePath, 'LOGIN', {
                tipo: 'login_sucesso',
                matricula: userInfo.matricula
            }, req);

            return sessionFilePath;
        } catch (error) {
            console.error('Erro ao iniciar sessão de log:', error);
            return null;
        }
    }

    /**
     * Finaliza a sessão de log do usuário
     */
    endSession(userId, logoutType = 'manual') {
        try {
            const sessionFilePath = this.userSessions.get(userId);

            if (sessionFilePath) {
                // Registra o evento de logout
                this.logService.logEvent(sessionFilePath, 'LOGOUT', {
                    tipo: logoutType // 'manual', 'token_expirado', 'revogado'
                });

                this.logService.endSession(sessionFilePath);
                this.userSessions.delete(userId);
            }
        } catch (error) {
            console.error('Erro ao finalizar sessão de log:', error);
        }
    }

    /**
     * Registra tentativas de login falhadas
     */
    logFailedLogin(matricula, reason, req) {
        try {
            const requestInfo = this.logService.extractRequestInfo(req);

            // Para tentativas falhadas, cria um log temporário ou usa um arquivo geral de segurança
            const securityDir = this.logService.ensureUserDirectory('SECURITY');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const securityFile = path.join(securityDir, `failed_login_${timestamp}.log`);

            const failedLoginData = {
                timestamp: new Date().toISOString(),
                matricula,
                motivo: reason,
                ...requestInfo
            };

            fs.writeFileSync(securityFile, JSON.stringify(failedLoginData, null, 2));
        } catch (error) {
            console.error('Erro ao registrar tentativa de login falhada:', error);
        }
    }

    /**
     * Registra eventos críticos (movimentações de estoque, alterações importantes)
     */
    logCriticalEvent(userId, eventType, eventData, req) {
        try {
            const sessionFilePath = this.userSessions.get(userId);

            if (sessionFilePath) {
                this.logService.logEvent(sessionFilePath, eventType, {
                    ...eventData,
                    prioridade: 'CRITICA'
                }, req);
            }
        } catch (error) {
            console.error('Erro ao registrar evento crítico:', error);
        }
    }

    /**
     * Obtém logs de um usuário
     */
    getUserLogs(userId, limit = 10) {
        return this.logService.getUserLogs(userId, limit);
    }

    /**
     * Busca eventos específicos
     */
    searchEvents(eventType, startDate = null, endDate = null) {
        return this.logService.searchEvents(eventType, startDate, endDate);
    }
}

// Exporta uma instância única (singleton)
export default new LogMiddleware();