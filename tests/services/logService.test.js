import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Configurar os mocks primeiro
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
    readFileSync: jest.fn(),
    readdirSync: jest.fn()
}));

jest.mock('path', () => ({
    join: jest.fn((...args) => args.join('/')),
    dirname: jest.fn(() => '/test/dir')
}));

// Mock process.cwd antes de importar LogService
const originalCwd = process.cwd;
process.cwd = jest.fn(() => '/app');

import LogService from '../../src/services/LogService.js';
import fs from 'fs';
import path from 'path';

describe('LogService', () => {
    let logService;
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn();
        console.warn = jest.fn();
        
        // Create spy for console.error
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        logService = new LogService();
    });

    afterEach(() => {
        if (consoleErrorSpy) {
            consoleErrorSpy.mockRestore();
        }
    });

    afterAll(() => {
        process.cwd = originalCwd;
    });

    describe('extractOSFromUserAgent', () => {
        it('should detect operating systems correctly', () => {
            expect(logService.extractOSFromUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('Windows 10/11');
            expect(logService.extractOSFromUserAgent('Mozilla/5.0 (Windows NT 6.3; Win64; x64)')).toBe('Windows 8.1');
            expect(logService.extractOSFromUserAgent('Mozilla/5.0 (Windows NT 6.1; Win64; x64)')).toBe('Windows 7');
            expect(logService.extractOSFromUserAgent('Windows something')).toBe('Windows');
            expect(logService.extractOSFromUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('macOS');
            expect(logService.extractOSFromUserAgent('Mozilla/5.0 (X11; Linux x86_64)')).toBe('Linux');
            expect(logService.extractOSFromUserAgent('Mozilla/5.0 (Android 10; SM-G975F)')).toBe('Android');
            expect(logService.extractOSFromUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)')).toBe('iOS');
            expect(logService.extractOSFromUserAgent('Mozilla/5.0 (iPad; CPU OS 14_7_1)')).toBe('iOS');
            expect(logService.extractOSFromUserAgent()).toBe('Desconhecido');
            expect(logService.extractOSFromUserAgent('')).toBe('Desconhecido');
            expect(logService.extractOSFromUserAgent('Unknown Browser/1.0')).toBe('Desconhecido');
        });
    });

    describe('extractBrowserFromUserAgent', () => {
        it('should detect browsers correctly', () => {
            expect(logService.extractBrowserFromUserAgent('Mozilla/5.0 Chrome/91.0')).toBe('Chrome');
            expect(logService.extractBrowserFromUserAgent('Mozilla/5.0 Firefox/89.0')).toBe('Firefox');
            expect(logService.extractBrowserFromUserAgent('Mozilla/5.0 Safari/605.1.15')).toBe('Safari');
            expect(logService.extractBrowserFromUserAgent('Mozilla/5.0 Chrome/91.0 Edg/91.0')).toBe('Edge');
            expect(logService.extractBrowserFromUserAgent('Mozilla/5.0 Opera/77.0')).toBe('Opera');
            expect(logService.extractBrowserFromUserAgent()).toBe('Desconhecido');
            expect(logService.extractBrowserFromUserAgent('')).toBe('Desconhecido');
            expect(logService.extractBrowserFromUserAgent('Unknown')).toBe('Desconhecido');
        });
    });

    describe('extractRequestInfo', () => {
        it('should extract request information correctly', () => {
            const mockReq = {
                method: 'GET',
                originalUrl: '/api/test',
                headers: {
                    'x-forwarded-for': '192.168.1.1, 10.0.0.1',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0'
                },
                socket: { remoteAddress: '127.0.0.1' }
            };

            const result = logService.extractRequestInfo(mockReq);
            expect(result.ip).toBe('192.168.1.1');
            expect(result.metodo).toBe('GET');
            expect(result.rota).toBe('/api/test');
            expect(result).toHaveProperty('timestamp');
        });

        it('should handle missing headers', () => {
            const mockReq = {
                method: 'POST',
                url: '/api/fallback',
                headers: {},
                socket: { remoteAddress: '127.0.0.1' }
            };

            const result = logService.extractRequestInfo(mockReq);
            expect(result.ip).toBe('127.0.0.1');
            expect(result.userAgent).toBe('User-Agent não identificado');
        });

        it('should handle missing socket', () => {
            const mockReq = {
                method: 'GET',
                originalUrl: '/test',
                headers: {},
                socket: {}
            };

            const result = logService.extractRequestInfo(mockReq);
            expect(result.ip).toBe('IP não identificado');
        });

        it('should handle x-real-ip header', () => {
            const mockReq = {
                method: 'GET',
                originalUrl: '/test',
                headers: { 'x-real-ip': '10.0.0.1' },
                socket: {}
            };

            const result = logService.extractRequestInfo(mockReq);
            expect(result.ip).toBe('10.0.0.1');
        });
    });

    describe('ensureUserDirectory', () => {
        it('should create and return user directory', () => {
            fs.existsSync.mockReturnValue(false);
            
            const result = logService.ensureUserDirectory('user123');
            
            expect(fs.mkdirSync).toHaveBeenCalled();
            expect(result).toBe('/app/logs/user123');
        });

        it('should handle ObjectId', () => {
            const mockObjectId = { toString: () => 'objectid123' };
            fs.existsSync.mockReturnValue(true);
            
            const result = logService.ensureUserDirectory(mockObjectId);
            expect(result).toBe('/app/logs/objectid123');
        });
    });

    describe('createSessionFile', () => {
        it('should create session file', () => {
            const sessionInfo = {
                matricula: 'MAT123',
                nome: 'Test User',
                ip: '192.168.1.1'
            };

            fs.existsSync.mockReturnValue(false);
            
            const result = logService.createSessionFile('user123', sessionInfo);
            
            expect(fs.writeFileSync).toHaveBeenCalled();
            expect(result).toContain('session_');
            expect(result).toContain('.log');
        });
    });

    describe('logEvent', () => {
        it('should log event to existing file', () => {
            const sessionData = {
                inicioSessao: '2023-01-01T00:00:00.000Z',
                usuario: { id: 'user123' },
                eventos: []
            };

            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(sessionData));

            logService.logEvent('/path/to/session.log', 'login', { success: true });

            expect(fs.writeFileSync).toHaveBeenCalled();
        });

        it('should handle missing file', () => {
            fs.existsSync.mockReturnValue(false);

            logService.logEvent('/path/to/nonexistent.log', 'test', {});

            expect(console.warn).toHaveBeenCalled();
        });

        it('should handle file errors', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockImplementation(() => {
                throw new Error('File read error');
            });

            logService.logEvent('/path/to/session.log', 'test', {});

            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('endSession', () => {
        it('should end session successfully', () => {
            const sessionData = {
                inicioSessao: '2023-01-01T00:00:00.000Z',
                usuario: { id: 'user123' },
                eventos: []
            };

            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(sessionData));

            logService.endSession('/path/to/session.log');

            expect(fs.writeFileSync).toHaveBeenCalled();
        });

        it('should handle missing file', () => {
            fs.existsSync.mockReturnValue(false);
            logService.endSession('/path/to/nonexistent.log');
            // Should not throw
        });

        it('should handle file errors', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockImplementation(() => {
                throw new Error('File error');
            });

            logService.endSession('/path/to/session.log');

            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('getUserLogs', () => {
        it('should return user logs', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['session_2023-01-01.log']);
            fs.readFileSync.mockReturnValue('{"inicioSessao": "2023-01-01T00:00:00.000Z"}');

            const result = logService.getUserLogs('user123', 5);

            expect(result).toHaveLength(1);
        });

        it('should return empty for nonexistent user', () => {
            fs.existsSync.mockReturnValue(false);

            const result = logService.getUserLogs('nonexistent');

            expect(result).toEqual([]);
        });

        it('should handle file read errors', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['session_1.log', 'session_2.log']);
            fs.readFileSync
                .mockReturnValueOnce('{"valid": "json"}')
                .mockImplementationOnce(() => {
                    throw new Error('Corrupt file');
                });

            const result = logService.getUserLogs('user123');

            expect(result).toHaveLength(1);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });

    describe('searchEvents', () => {
        it('should search events across users', () => {
            // Mock fs.readdirSync for withFileTypes call
            const mockUserDirs = [
                { name: 'user1', isDirectory: () => true },
                { name: 'file.txt', isDirectory: () => false }
            ];
            const mockLogData = {
                usuario: { id: 'user1' },
                eventos: [
                    { tipo: 'login', timestamp: '2023-01-01T10:00:00.000Z' },
                    { tipo: 'logout', timestamp: '2023-01-01T11:00:00.000Z' }
                ]
            };

            fs.existsSync.mockReturnValue(true);
            fs.readdirSync
                .mockReturnValueOnce(mockUserDirs) // First call with withFileTypes
                .mockReturnValue(['session_1.log']); // Second call without withFileTypes
            fs.readFileSync.mockReturnValue(JSON.stringify(mockLogData));

            const result = logService.searchEvents('login');

            expect(result).toHaveLength(1);
            expect(result[0].eventos).toHaveLength(1);
            expect(result[0].eventos[0].tipo).toBe('login');
        });

        it('should filter by date range', () => {
            const mockUserDirs = [{ name: 'user1', isDirectory: () => true }];
            const mockLogData = {
                usuario: { id: 'user1' },
                eventos: [
                    { tipo: 'login', timestamp: '2023-01-01T08:00:00.000Z' },
                    { tipo: 'login', timestamp: '2023-01-01T10:00:00.000Z' },
                    { tipo: 'login', timestamp: '2023-01-01T12:00:00.000Z' }
                ]
            };

            fs.existsSync.mockReturnValue(true);
            fs.readdirSync
                .mockReturnValueOnce(mockUserDirs)
                .mockReturnValue(['session_1.log']);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockLogData));

            const result = logService.searchEvents('login', '2023-01-01T09:00:00.000Z', '2023-01-01T10:30:00.000Z');

            expect(result[0].eventos).toHaveLength(1);
            expect(result[0].eventos[0].timestamp).toBe('2023-01-01T10:00:00.000Z');
        });

        it('should return empty if no logs directory', () => {
            fs.existsSync.mockReturnValue(false);

            const result = logService.searchEvents('login');

            expect(result).toEqual([]);
        });

        it('should handle file processing errors', () => {
            const mockUserDirs = [{ name: 'user1', isDirectory: () => true }];

            fs.existsSync.mockReturnValue(true);
            fs.readdirSync
                .mockReturnValueOnce(mockUserDirs) // First call with withFileTypes
                .mockReturnValue(['session_1.log']); // Second call without withFileTypes
            fs.readFileSync.mockImplementation(() => {
                throw new Error('Corrupt file');
            });

            const result = logService.searchEvents('login');

            expect(result).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
    });
});
