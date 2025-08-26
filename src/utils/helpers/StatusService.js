// src/utils/helpers/StatusService.js

import HttpStatusCodes from './HttpStatusCodes.js';
import messages from './messages.js';

class StatusService {
    /**
     * Retorna a mensagem correspondente ao código HTTP fornecido.
     * @param {number} code - Código de status HTTP.
     * @returns {string} Mensagem correspondente.
     */
    static getHttpCodeMessage(code) {
        const status = Object.values(HttpStatusCodes).find(status => status.code === code);
        return status ? status.message : 'Status desconhecido.';
    }

    /**
     * Retorna a mensagem de erro correspondente ao tipo fornecido.
     * @param {string} type - Tipo de erro.
     * @param {string|null} field - Campo relacionado ao erro, se aplicável.
     * @returns {string} Mensagem de erro correspondente.
     */
    static getErrorMessage(type, field = null) {
        if (messages.error[type]) {
            if (typeof messages.error[type] === 'function') {
                return messages.error[type](field);
            }
            return messages.error[type];
        }
        return "Tipo de erro desconhecido.";
    }
}

export default StatusService;
