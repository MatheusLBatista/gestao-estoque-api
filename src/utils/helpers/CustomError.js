// src/utils/helpers/CustomError.js

/**
 * Classe CustomError para manipulação de erros customizados.
 * Permite definir propriedades adicionais que auxiliam no tratamento
 * de erros específicos, como por exemplo o erro de token expirado.
 *
 * @param {string} message - Mensagem principal do erro.
 * @param {Object} options - Parâmetros adicionais do erro.
 * @param {number} options.statusCode - Código de status HTTP.
 * @param {string} options.errorType - Tipo do erro para mapeamento (ex: 'tokenExpired').
 * @param {string|null} [options.field=null] - Campo relacionado ao erro, se aplicável.
 * @param {array} [options.details=[]] - Detalhes adicionais sobre o erro.
 * @param {string|null} [options.customMessage=null] - Mensagem de erro personalizada.
 *
 * @example
 * new CustomError('Session expired', {
 *   statusCode: 401,
 *   errorType: 'tokenExpired',
 *   customMessage: 'Seu token expirou. Faça login novamente.'
 * });
 */
class CustomError extends Error {
    constructor({ statusCode, errorType, field = null, details = [], customMessage = null } = {}) {
      // Usa a mensagem passada ou, se ausente, usa a customMessage ou uma mensagem padrão
      super(customMessage || 'An error occurred');
      this.name = 'CustomError';
      this.statusCode = statusCode;
      this.errorType = errorType;
      this.field = field;
      this.details = details;
      this.customMessage = customMessage;
      // Marca o erro como operacional para diferenciá-lo de erros internos inesperados
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export default CustomError;
  