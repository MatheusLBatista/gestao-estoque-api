import UsuarioService from "../services/usuarioService.js";
import EmailService from "../services/EmailService.js";
import { CommonResponse, CustomError, HttpStatusCodes } from "../utils/helpers/index.js";
import { UsuarioSchema, UsuarioUpdateSchema } from "../utils/validators/schemas/zod/UsuarioSchema.js";
import { UsuarioQuerySchema, UsuarioIdSchema, UsuarioMatriculaSchema } from "../utils/validators/schemas/zod/querys/UsuarioQuerySchema.js";
import LogMiddleware from '../middlewares/LogMiddleware.js';

class UsuarioController {
    constructor() {
        this.service = new UsuarioService();
    }

    // Função utilitária para validação com erro customizado
    validateId(id, fieldName = 'id', action = 'processar') {
        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: fieldName,
                details: [],
                customMessage: `ID do usuário é obrigatório para ${action}.`
            });
        }

        UsuarioIdSchema.parse(id);
    }

    async listarUsuarios(req, res) {
        console.log('Estou no listarUsuarios em UsuarioController');

        const { id } = req.params || {};
        if (id) {
            UsuarioIdSchema.parse(id);
        }

        const query = req.query || {};
        if (Object.keys(query).length !== 0) {
            await UsuarioQuerySchema.parseAsync(query);
        }

        const data = await this.service.listarUsuarios(req);

        // Verificar se a lista está vazia
        if (data.docs && data.docs.length === 0) {
            return CommonResponse.error(
                res,
                404,
                'resourceNotFound',
                'Usuario',
                [],
                'Nenhum usuário encontrado com os critérios informados.'
            );
        }

        return CommonResponse.success(res, data);
    }

    async buscarUsuarioPorID(req, res) {
        console.log('Estou no buscarUsuarioPorID em UsuarioController');

        const { id } = req.params || {};

        UsuarioIdSchema.parse(id);
        const data = await this.service.buscarUsuarioPorID(id);
        return CommonResponse.success(res, data, 200, 'Usuário encontrado com sucesso.');
    }

    async buscarUsuarioPorMatricula(req, res) {
        console.log('Estou no buscarUsuarioPorMatricula em UsuarioController');

        const { matricula } = req.params;
        if (!matricula) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'matricula',
                details: [],
                customMessage: 'A matrícula é obrigatória para esta busca.'
            });
        }

        const data = await this.service.buscarUsuarioPorMatricula(matricula);
        return CommonResponse.success(res, data, 200, 'Usuário encontrado com sucesso.');
    }

    async cadastrarUsuario(req, res) {
        console.log('Estou no cadastrarUsuario em UsuarioController');

        const parsedData = UsuarioSchema.parse(req.body);

        // Se não há senha, será criado usuário para definir senha no primeiro login
        if (!parsedData.senha) {
            console.log('Criando usuário sem senha - será enviado código de segurança');

            // Gerar código de segurança (6 dígitos)
            const codigoSeguranca = Math.random().toString().slice(2, 8);

            // Definir expiração do código (24 horas)
            const dataExpiracao = new Date();
            dataExpiracao.setHours(dataExpiracao.getHours() + 24);

            // Preparar dados do usuário sem senha
            parsedData.senha = null;
            parsedData.ativo = false; // Usuário inativo até definir senha
            parsedData.codigo_recuperacao = codigoSeguranca;
            parsedData.data_expiracao_codigo = dataExpiracao;
            parsedData.senha_definida = false;

            const data = await this.service.cadastrarUsuario(parsedData);

            // Tentar enviar email de primeiro acesso
            const emailResult = await EmailService.enviarCodigoCadastro(data, codigoSeguranca);

            // Registra evento crítico de criação de usuário sem senha
            LogMiddleware.logCriticalEvent(req.userId, 'USUARIO_CRIADO_SEM_SENHA', {
                usuario_criado: data._id,
                matricula: data.matricula,
                perfil: data.perfil,
                criado_por: req.userMatricula,
                codigo_gerado: true,
                email_enviado: emailResult.sentViaEmail
            }, req);

            // Resposta baseada no resultado do envio do email
            const responseMessage = emailResult.sentViaEmail
                ? `Usuário cadastrado com sucesso! Código de acesso enviado para ${data.email}. Código: ${codigoSeguranca}`
                : `Usuário cadastrado com sucesso. Código de segurança: ${codigoSeguranca}`;

            const responseInstructions = emailResult.sentViaEmail
                ? `O usuário deve verificar o email ${data.email} para encontrar o código de acesso e a matrícula ${data.matricula}. Código também disponível aqui para referência.`
                : `O usuário deve usar este código na endpoint '/auth/redefinir-senha/codigo' para definir sua senha. Código válido por 24 horas.`;

            return CommonResponse.created(
                res,
                {
                    ...data.toObject(),
                    message: responseMessage,
                    instrucoes: responseInstructions,
                    email_enviado: emailResult.sentViaEmail,
                    motivo_email_nao_enviado: emailResult.sentViaEmail ? null : emailResult.reason
                },
                HttpStatusCodes.CREATED.code,
                'Usuário cadastrado com sucesso sem senha.'
            );
        } else {
            // Cadastro com senha (caso especial do admin)
            const data = await this.service.cadastrarUsuario(parsedData);

            // Registra evento crítico de criação de usuário
            LogMiddleware.logCriticalEvent(req.userId, 'USUARIO_CRIADO', {
                usuario_criado: data._id,
                matricula: data.matricula,
                perfil: data.perfil,
                criado_por: req.userMatricula
            }, req);

            return CommonResponse.created(
                res,
                data,
                HttpStatusCodes.CREATED.code,
                'Usuário cadastrado com sucesso.'
            );
        }
    }


    async atualizarUsuario(req, res) {
        console.log('Estou no atualizarUsuario em UsuarioController');

        const { id } = req.params;
        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário é obrigatório.'
            });
        }

        UsuarioIdSchema.parse(id);

        const dadosAtualizacao = req.body;
        if (Object.keys(dadosAtualizacao).length === 0) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'body',
                details: [],
                customMessage: 'Nenhum dado fornecido para atualização.'
            });
        }

        await UsuarioUpdateSchema.parseAsync(dadosAtualizacao);
        const usuarioAtualizado = await this.service.atualizarUsuario(id, dadosAtualizacao);
        return CommonResponse.success(res, usuarioAtualizado, 200, 'Usuário atualizado com sucesso.');
    }

    async deletarUsuario(req, res) {
        console.log('Estou no deletarUsuario em UsuarioController');

        const { matricula } = req.params; // Certifique-se de usar 'matricula'
        if (!matricula) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'matricula',
                details: [],
                customMessage: 'Matrícula do usuário é obrigatória.'
            });
        }

        const data = await this.service.deletarUsuario(matricula);
        return CommonResponse.success(res, data, 200, 'Usuário excluído com sucesso.');
    }

    async desativarUsuario(req, res) {
        console.log('Estou no desativarUsusario em UsuarioController');

        const { id } = req.params || {};
        this.validateId(id, 'id', 'desativar');

        const data = await this.service.desativarUsuario(id);
        return CommonResponse.success(res, data, 200, 'Usuario desativado com sucesso.');
    }

    async reativarUsuario(req, res) {
        console.log('Estou no reativarUsusario em UsuarioController');

        const { id } = req.params || {};
        this.validateId(id, 'id', 'reativar');

        const data = await this.service.reativarUsuario(id);
        return CommonResponse.success(res, data, 200, 'Usuario reativado com sucesso.');
    }

    async criarComSenha(req, res) {
        const { nome, email, senha, perfil } = req.body;

        // Validar dados
        if (!nome || !email || !senha) {
            return res.status(400).json({
                message: 'Nome, email e senha são obrigatórios',
                type: 'validationError'
            });
        }

        // Verificar se o email já existe
        const emailExiste = await this.service.verificarEmailExistente(email);
        if (emailExiste) {
            return res.status(400).json({
                message: 'Este email já está em uso',
                type: 'validationError'
            });
        }

        // Criar usuário
        const usuario = await this.service.criarUsuario({
            nome,
            email,
            senha,
            perfil: perfil || 'estoquista', // Perfil padrão se não for especificado
            ativo: true
        });

        // Remover a senha do objeto de resposta
        const usuarioSemSenha = {
            id: usuario._id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
            ativo: usuario.ativo
        };

        return res.status(201).json({
            message: 'Usuário criado com sucesso',
            usuario: usuarioSemSenha
        });
    }

    /**
     * Adiciona usuário a um grupo
     */
    async adicionarUsuarioAoGrupo(req, res) {
        console.log('Estou no adicionarUsuarioAoGrupo em UsuarioController');

        const { usuarioId, grupoId } = req.body;

        if (!usuarioId || !grupoId) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'body',
                details: [],
                customMessage: 'ID do usuário e ID do grupo são obrigatórios.'
            });
        }

        const data = await this.service.adicionarUsuarioAoGrupo(usuarioId, grupoId);

        // Registra evento crítico
        LogMiddleware.logCriticalEvent(req.userId, 'USUARIO_ADICIONADO_GRUPO', {
            usuario_id: usuarioId,
            grupo_id: grupoId,
            adicionado_por: req.userMatricula
        }, req);

        return CommonResponse.success(res, data, 200, 'Usuário adicionado ao grupo com sucesso.');
    }

    /**
     * Remove usuário de um grupo
     */
    async removerUsuarioDoGrupo(req, res) {
        console.log('Estou no removerUsuarioDoGrupo em UsuarioController');

        const { usuarioId, grupoId } = req.body;

        if (!usuarioId || !grupoId) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'body',
                details: [],
                customMessage: 'ID do usuário e ID do grupo são obrigatórios.'
            });
        }

        const data = await this.service.removerUsuarioDoGrupo(usuarioId, grupoId);

        // Registra evento crítico
        LogMiddleware.logCriticalEvent(req.userId, 'USUARIO_REMOVIDO_GRUPO', {
            usuario_id: usuarioId,
            grupo_id: grupoId,
            removido_por: req.userMatricula
        }, req);

        return CommonResponse.success(res, data, 200, 'Usuário removido do grupo com sucesso.');
    }

    /**
     * Adiciona permissão individual a um usuário
     */
    async adicionarPermissaoAoUsuario(req, res) {
        console.log('Estou no adicionarPermissaoAoUsuario em UsuarioController');

        const { id } = req.params;
        const permissao = req.body;

        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário é obrigatório.'
            });
        }

        const data = await this.service.adicionarPermissaoAoUsuario(id, permissao);

        // Registra evento crítico
        LogMiddleware.logCriticalEvent(req.userId, 'PERMISSAO_INDIVIDUAL_ADICIONADA', {
            usuario_id: id,
            permissao_adicionada: {
                rota: permissao.rota,
                dominio: permissao.dominio
            },
            adicionado_por: req.userMatricula
        }, req);

        return CommonResponse.success(res, data, 200, 'Permissão adicionada ao usuário com sucesso.');
    }

    /**
     * Remove permissão individual de um usuário
     */
    async removerPermissaoDoUsuario(req, res) {
        console.log('Estou no removerPermissaoDoUsuario em UsuarioController');

        const { id } = req.params;
        const { rota, dominio } = req.body;

        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário é obrigatório.'
            });
        }

        if (!rota) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'rota',
                details: [],
                customMessage: 'Nome da rota é obrigatório.'
            });
        }

        const data = await this.service.removerPermissaoDoUsuario(id, rota, dominio);

        // Registra evento crítico
        LogMiddleware.logCriticalEvent(req.userId, 'PERMISSAO_INDIVIDUAL_REMOVIDA', {
            usuario_id: id,
            permissao_removida: {
                rota: rota,
                dominio: dominio || 'localhost'
            },
            removido_por: req.userMatricula
        }, req);

        return CommonResponse.success(res, data, 200, 'Permissão removida do usuário com sucesso.');
    }

    /**
     * Obtém permissões efetivas de um usuário
     */
    async obterPermissoesUsuario(req, res) {
        console.log('Estou no obterPermissoesUsuario em UsuarioController');

        const { id } = req.params;

        if (!id) {
            throw new CustomError({
                statusCode: HttpStatusCodes.BAD_REQUEST.code,
                errorType: 'validationError',
                field: 'id',
                details: [],
                customMessage: 'ID do usuário é obrigatório.'
            });
        }

        const data = await this.service.obterPermissoesUsuario(id);

        return CommonResponse.success(res, data, 200, 'Permissões do usuário obtidas com sucesso.');
    }
}

export default UsuarioController;