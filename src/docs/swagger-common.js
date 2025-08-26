/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem de erro
 *           example: "Recurso não encontrado"
 *         error:
 *           type: string
 *           description: Tipo do erro
 *           example: "NotFoundError"
 *         statusCode:
 *           type: integer
 *           description: Código de status HTTP
 *           example: 404
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp do erro
 *         path:
 *           type: string
 *           description: Endpoint onde ocorreu o erro
 *           example: "/api/produtos/123"
 *     
 *     ValidationError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem de erro de validação
 *           example: "Dados inválidos"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 description: Campo com erro
 *                 example: "email"
 *               message:
 *                 type: string
 *                 description: Mensagem específica do campo
 *                 example: "Email deve ter formato válido"
 *         statusCode:
 *           type: integer
 *           description: Código de status HTTP
 *           example: 400
 *     
 *     Success:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem de sucesso
 *           example: "Operação realizada com sucesso"
 *         data:
 *           type: object
 *           description: Dados retornados pela operação
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp da resposta
 *     
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         docs:
 *           type: array
 *           items:
 *             type: object
 *           description: Documentos da página atual
 *         totalDocs:
 *           type: integer
 *           description: Total de documentos
 *           example: 150
 *         limit:
 *           type: integer
 *           description: Limite de itens por página
 *           example: 10
 *         page:
 *           type: integer
 *           description: Página atual
 *           example: 1
 *         totalPages:
 *           type: integer
 *           description: Total de páginas
 *           example: 15
 *         hasNextPage:
 *           type: boolean
 *           description: Indica se há próxima página
 *           example: true
 *         hasPrevPage:
 *           type: boolean
 *           description: Indica se há página anterior
 *           example: false
 *         nextPage:
 *           type: integer
 *           nullable: true
 *           description: Número da próxima página
 *           example: 2
 *         prevPage:
 *           type: integer
 *           nullable: true
 *           description: Número da página anterior
 *           example: null
 *     
 *     TokenResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: Token JWT de acesso
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refreshToken:
 *           type: string
 *           description: Token de refresh
 *           example: "refresh_token_string_here"
 *         expiresIn:
 *           type: integer
 *           description: Tempo de expiração em segundos
 *           example: 3600
 *         tokenType:
 *           type: string
 *           description: Tipo do token
 *           example: "Bearer"
 *   
 *   responses:
 *     NotFound:
 *       description: Recurso não encontrado
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     
 *     BadRequest:
 *       description: Requisição inválida
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidationError'
 *     
 *     Unauthorized:
 *       description: Token de acesso inválido ou expirado
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     
 *     Forbidden:
 *       description: Acesso negado - permissões insuficientes
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     
 *     InternalServerError:
 *       description: Erro interno do servidor
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     
 *     Conflict:
 *       description: Conflito - recurso já existe
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *   
 *   parameters:
 *     PageParam:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *       description: Número da página para paginação
 *     
 *     LimitParam:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 10
 *       description: Número de itens por página
 *     
 *     DateStartParam:
 *       in: query
 *       name: data_inicio
 *       schema:
 *         type: string
 *         format: date
 *       description: Data de início para filtros de período
 *       example: "2024-01-01"
 *     
 *     DateEndParam:
 *       in: query
 *       name: data_fim
 *       schema:
 *         type: string
 *         format: date
 *       description: Data de fim para filtros de período
 *       example: "2024-12-31"
 */

/**
 * @swagger
 * tags:
 *   - name: Autenticação
 *     description: Endpoints para autenticação e autorização
 *   - name: Produtos
 *     description: Gerenciamento de produtos do estoque
 *   - name: Fornecedores
 *     description: Gerenciamento de fornecedores
 *   - name: Usuários
 *     description: Gerenciamento de usuários do sistema
 *   - name: Grupos
 *     description: Gerenciamento de grupos e permissões
 *   - name: Movimentações
 *     description: Controle de movimentações de estoque
 *   - name: Logs
 *     description: Auditoria e logs do sistema
 */

export default {};
