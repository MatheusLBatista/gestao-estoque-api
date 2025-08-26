import jwt from 'jsonwebtoken';
import PermissionService from '../services/PermissionService.js';
import Rota from '../models/Rotas.js';
import { CustomError, messages } from '../utils/helpers/index.js';

// Certifique-se de que as variáveis de ambiente estejam carregadas
const JWT_SECRET = process.env.JWT_SECRET;

class AuthPermission {
  constructor() {
    this.jwt = jwt;
    this.permissionService = new PermissionService();
    this.Rota = Rota;
    this.JWT_SECRET = JWT_SECRET;
    this.messages = messages;
    
    // Vincula o método handle ao contexto da instância
    this.handle = this.handle.bind(this);
  }

  async handle(req, res, next) {
    try {
      // 1. Extrai o token do cabeçalho Authorization
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new CustomError({
          statusCode: 401,
          errorType: 'authenticationError',
          field: 'Authorization',
          details: [],
          customMessage: 'Token de autenticação não fornecido'
        });
      }

      const token = authHeader.split(' ')[1];

      // 2. Verifica e decodifica o token
      let decoded;
      try {
        decoded = this.jwt.verify(token, this.JWT_SECRET);
      } catch (err) {
        throw new CustomError({
          statusCode: 401,
          errorType: 'authenticationError',
          field: 'Token',
          details: [],
          customMessage: 'Token de autenticação inválido ou expirado'
        });
      }
      const userId = decoded.id;

      /**
       * 3. Determina a rota e o domínio da requisição
       * Usa originalUrl para obter a URL completa e extrai a rota após /api/
       */
      const urlPath = req.originalUrl.split('?')[0]; // Remove query string
      const pathSegments = urlPath.split('/').filter(Boolean); // Remove elementos vazios
      
      // Para URLs como /api/produtos, pega 'produtos' (segundo segmento)
      const rotaReq = pathSegments.length > 1 && pathSegments[0] === 'api' 
        ? pathSegments[1].toLowerCase() 
        : pathSegments[0] ? pathSegments[0].toLowerCase() : '';
      const dominioReq = 'localhost'; // Domínio configurado para desenvolvimento

      // 4. Busca a rota atual no banco de dados
      const rotaDB = await this.Rota.findOne({ 
        rota: rotaReq, 
        dominio: dominioReq 
      });
      
      if (!rotaDB) {
        throw new CustomError({
          statusCode: 404,
          errorType: 'resourceNotFound',
          field: 'Rota',
          details: [],
          customMessage: `Rota '${rotaReq}' não encontrada no sistema`
        });
      }

      // 5. Mapeia o método HTTP para o campo de permissão correspondente
      const metodoMap = {
        'GET': 'buscar',
        'POST': 'enviar',
        'PUT': 'substituir',
        'PATCH': 'modificar',
        'DELETE': 'excluir'
      };

      const metodo = metodoMap[req.method];
      if (!metodo) {
        throw new CustomError({
          statusCode: 405,
          errorType: 'methodNotAllowed',
          field: 'Método',
          details: [],
          customMessage: `Método HTTP '${req.method}' não suportado`
        });
      }

      // 6. Verifica se a rota está ativa e suporta o método
      if (!rotaDB.ativo || !rotaDB[metodo]) {
        throw new CustomError({
          statusCode: 403,
          errorType: 'forbidden',
          field: 'Rota',
          details: [],
          customMessage: `Ação '${req.method}' não permitida na rota '${rotaReq}'`
        });
      }

      // 7. Verifica se o usuário tem permissão através do sistema de grupos/permissões
      const hasPermission = await this.permissionService.hasPermission(
        userId,
        rotaReq,
        dominioReq,
        metodo
      );

      if (!hasPermission) {
        // Buscar informações do usuário para log detalhado
        const userInfo = decoded.matricula || decoded.email || userId;
        
        console.warn(`Acesso negado para usuário ${userInfo} na rota ${rotaReq} com método ${req.method}`);
        
        throw new CustomError({
          statusCode: 403,
          errorType: 'forbidden',
          field: 'Permissão',
          details: [],
          customMessage: `Você não tem permissão para realizar a ação '${req.method}' na rota '${rotaReq}'`
        });
      }

      // 8. Log da autorização bem-sucedida
      console.log(`Autorização concedida para usuário ${decoded.matricula || userId} na rota ${rotaReq} com método ${req.method}`);

      // 9. Anexa informações do usuário ao objeto de requisição para uso posterior
      req.user = { 
        id: userId,
        matricula: decoded.matricula,
        perfil: decoded.perfil
      };
      req.rota = rotaReq;
      req.metodo = metodo;

      // 10. Permite a continuação da requisição
      next();
    } catch (error) {
      // Log do erro para depuração
      console.error('Erro no middleware de autorização:', {
        error: error.message,
        url: req.url,
        method: req.method,
        userId: req.userId || 'não identificado'
      });

      // Retorna resposta de erro padronizada
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.customMessage,
          type: error.errorType,
          field: error.field,
          details: error.details
        });
      }

      // Erro genérico
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao verificar permissões',
        type: 'serverError'
      });
    }
  }
}

// Instanciar e exportar apenas o método 'handle' como função de middleware
export default new AuthPermission().handle;
