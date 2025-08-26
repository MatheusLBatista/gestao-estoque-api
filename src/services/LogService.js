import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Compatibilidade com Jest/testes
let __filename, __dirname;
try {
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(__filename);
} catch (e) {
    // Em ambiente de teste, usar valores padrão
    __filename = 'LogService.js';
    __dirname = process.cwd();
}

class LogService {
    constructor() {
        this.logsBasePath = path.join(process.cwd(), 'logs');
        this.ensureLogsDirectory();
    }

    /**
     * Garante que o diretório de logs existe
     */
    ensureLogsDirectory() {
        if (!fs.existsSync(this.logsBasePath)) {
            fs.mkdirSync(this.logsBasePath, { recursive: true });
        }
    }

    /**
     * Cria o diretório do usuário se não existir
     */
    ensureUserDirectory(userId) {
        // Converte ObjectId para string se necessário
        const userIdString = userId.toString();
        const userDir = path.join(this.logsBasePath, userIdString);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        return userDir;
    }

    /**
     * Extrai informações do sistema operacional a partir do user-agent
     */
    extractOSFromUserAgent(userAgent) {
        if (!userAgent) return 'Desconhecido';

        if (userAgent.includes('Windows NT 10.0')) return 'Windows 10/11';
        if (userAgent.includes('Windows NT 6.3')) return 'Windows 8.1';
        if (userAgent.includes('Windows NT 6.1')) return 'Windows 7';
        if (userAgent.includes('Windows')) return 'Windows';
        if (userAgent.includes('Macintosh')) return 'macOS';
        if (userAgent.includes('Linux')) return 'Linux';
        if (userAgent.includes('Android')) return 'Android';
        if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';

        return 'Desconhecido';
    }

    /**
     * Extrai informações do navegador a partir do user-agent
     */
    extractBrowserFromUserAgent(userAgent) {
        if (!userAgent) return 'Desconhecido';

        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
        if (userAgent.includes('Edg')) return 'Edge';
        if (userAgent.includes('Opera')) return 'Opera';

        return 'Desconhecido';
    }

    /**
     * Obtém informações da requisição
     */
    extractRequestInfo(req) {
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
            || req.headers['x-real-ip']
            || req.socket.remoteAddress
            || 'IP não identificado';

        const userAgent = req.headers['user-agent'] || 'User-Agent não identificado';
        const sistemaOperacional = this.extractOSFromUserAgent(userAgent);
        const navegador = this.extractBrowserFromUserAgent(userAgent);

        return {
            ip,
            userAgent,
            sistemaOperacional,
            navegador,
            metodo: req.method,
            rota: req.originalUrl || req.url,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Cria um novo arquivo de sessão
     */
    createSessionFile(userId, sessionInfo) {
        // Converte ObjectId para string se necessário
        const userIdString = userId.toString();
        const userDir = this.ensureUserDirectory(userIdString);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const sessionFileName = `session_${timestamp}.log`;
        const sessionFilePath = path.join(userDir, sessionFileName);

        const sessionHeader = {
            inicioSessao: new Date().toISOString(),
            usuario: {
                id: userIdString,
                matricula: sessionInfo.matricula || 'N/A',
                nome: sessionInfo.nome || 'N/A',
                perfil: sessionInfo.perfil || 'N/A'
            },
            informacaoSistema: {
                ip: sessionInfo.ip,
                sistemaOperacional: sessionInfo.sistemaOperacional,
                navegador: sessionInfo.navegador,
                userAgent: sessionInfo.userAgent
            },
            eventos: []
        };

        fs.writeFileSync(sessionFilePath, JSON.stringify(sessionHeader, null, 2));
        return sessionFilePath;
    }

    /**
     * Adiciona um evento ao arquivo de sessão atual
     */
    logEvent(sessionFilePath, eventType, eventData, req = null) {
        try {
            if (!fs.existsSync(sessionFilePath)) {
                console.warn(`Arquivo de sessão não encontrado: ${sessionFilePath}`);
                return;
            }

            const sessionData = JSON.parse(fs.readFileSync(sessionFilePath, 'utf8'));

            const requestInfo = req ? this.extractRequestInfo(req) : {};

            const event = {
                timestamp: new Date().toISOString(),
                tipo: eventType,
                ...requestInfo,
                dados: eventData
            };

            sessionData.eventos.push(event);

            fs.writeFileSync(sessionFilePath, JSON.stringify(sessionData, null, 2));
        } catch (error) {
            console.error('Erro ao registrar evento no log:', error);
        }
    }

    /**
     * Finaliza uma sessão
     */
    endSession(sessionFilePath) {
        try {
            if (!fs.existsSync(sessionFilePath)) {
                return;
            }

            const sessionData = JSON.parse(fs.readFileSync(sessionFilePath, 'utf8'));
            sessionData.fimSessao = new Date().toISOString();

            const inicio = new Date(sessionData.inicioSessao);
            const fim = new Date(sessionData.fimSessao);
            sessionData.duracaoSessao = Math.round((fim - inicio) / 1000); // em segundos

            fs.writeFileSync(sessionFilePath, JSON.stringify(sessionData, null, 2));
        } catch (error) {
            console.error('Erro ao finalizar sessão no log:', error);
        }
    }

    /**
     * Busca logs de um usuário específico
     */
    getUserLogs(userId, limit = 10) {
        // Converte ObjectId para string se necessário
        const userIdString = userId.toString();
        const userDir = path.join(this.logsBasePath, userIdString);

        if (!fs.existsSync(userDir)) {
            return [];
        }

        const files = fs.readdirSync(userDir)
            .filter(file => file.startsWith('session_') && file.endsWith('.log'))
            .sort((a, b) => b.localeCompare(a)) // Mais recentes primeiro
            .slice(0, limit);

        return files.map(file => {
            const filePath = path.join(userDir, file);
            try {
                return JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (error) {
                console.error(`Erro ao ler arquivo de log: ${file}`, error);
                return null;
            }
        }).filter(log => log !== null);
    }

    /**
     * Busca eventos específicos em todos os logs
     */
    searchEvents(eventType, startDate = null, endDate = null) {
        const results = [];

        if (!fs.existsSync(this.logsBasePath)) {
            return results;
        }

        const userDirs = fs.readdirSync(this.logsBasePath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const userId of userDirs) {
            const userDir = path.join(this.logsBasePath, userId);
            const logFiles = fs.readdirSync(userDir)
                .filter(file => file.startsWith('session_') && file.endsWith('.log'));

            for (const logFile of logFiles) {
                try {
                    const logData = JSON.parse(fs.readFileSync(path.join(userDir, logFile), 'utf8'));

                    const matchingEvents = logData.eventos.filter(event => {
                        if (event.tipo !== eventType) return false;

                        if (startDate && new Date(event.timestamp) < new Date(startDate)) return false;
                        if (endDate && new Date(event.timestamp) > new Date(endDate)) return false;

                        return true;
                    });

                    if (matchingEvents.length > 0) {
                        results.push({
                            usuario: logData.usuario,
                            sessao: logFile,
                            eventos: matchingEvents
                        });
                    }
                } catch (error) {
                    console.error(`Erro ao processar arquivo: ${logFile}`, error);
                }
            }
        }

        return results;
    }
}

export default LogService;
