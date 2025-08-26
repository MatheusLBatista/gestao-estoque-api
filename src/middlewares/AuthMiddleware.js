import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = async (req, res, next) => {
    try {
        // Obter o token do cabeçalho
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Token de autenticação não fornecido',
                type: 'authError'
            });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Verificar o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
        const Usuario = (await import('../models/Usuario.js')).default;
        // Usar select para incluir o campo accesstoken que normalmente está oculto
        const usuario = await Usuario.findById(decoded.id).select('+accesstoken');

        // Verificar se o usuário existe e tem um token válido no banco
        if(!usuario) {
            return res.status(401).json ({
                message: 'Usuário não encontrado',
                type: 'authError'
            });
        }

        // Verificar se o token usado na requisição é o mesmo que está armazenado no banco
        // Isso garante que tokens revogados não funcionem mesmo que ainda sejam válidos em termos de JWT
        if (token !== usuario.accesstoken) {
            return res.status(401).json({
                message: 'Token foi revogado ou é inválido',
                type: 'authError'
            });
        }
        
        // Adicionar dados do usuário à requisição
        req.userId = decoded.id;
        req.userMatricula = decoded.matricula;
        req.userPerfil = decoded.perfil;
        
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Token inválido ou expirado',
            type: 'authError'
        });
    }
};

// Middleware para verificar permissões
export const permissaoMiddleware = (perfisPermitidos) => {
    return (req, res, next) => {
        if (!req.userPerfil) {
            return res.status(401).json({
                message: 'Usuário não autenticado',
                type: 'authError'
            });
        }
        
        if (!perfisPermitidos.includes(req.userPerfil)) {
            return res.status(403).json({
                message: 'Acesso negado. Perfil sem permissões suficientes',
                type: 'permissionError'
            });
        }
        
        next();
    };
};

export default authMiddleware;