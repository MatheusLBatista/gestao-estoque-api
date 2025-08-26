// import i18n from '../config/i18nConfig.js';
import mongoose from 'mongoose';
import CustomError from './helpers/CustomError.js';


class Validator {
    constructor(locale = 'pt') {
        // i18n.setLocale(locale);
        this._erro = null;
    }

    get erro() {
        return this._erro;
    }

    // Método privado que retorna a instância atual para permitir encadeamento
    // _validar(condicao, mensagemKey, placeholders = {}) {
    //     if (this._erro === null && condicao()) {
    //         let mensagem = i18n.__(`validation.${mensagemKey}`, placeholders);
    //         this._erro = mensagem;
    //     }
    //     return this;
    // }

    // validarCampoObrigatorio(valor, campoNome) {
    //     return this._validar(
    //         () => valor === null || valor === undefined || valor.toString().trim() === '',
    //         'required',
    //         { campoNome }
    //     );
    // }

    // validarComprimento(valor, min, max, campoNome) {
    //     return this
    //         ._validar(
    //             () => valor === null || valor === undefined || valor.toString().trim() === '',
    //             'notEmpty',
    //             { campoNome }
    //         )
    //         ._validar(
    //             () => valor !== null && valor.length < min,
    //             'minLength',
    //             { campoNome, min }
    //         )
    //         ._validar(
    //             () => max !== null && valor !== null && valor.length > max,
    //             'maxLength',
    //             { campoNome, max }
    //         );
    // }

    // validarNomeProprio(nome, campoNome) {
    //     const nomeProprioRegex = /^[A-Za-zÀ-ú\s.]+$/;
    //     return this
    //         ._validar(
    //             () => nome === null || nome === undefined || nome.trim() === '',
    //             'required',
    //             { campoNome }
    //         )
    //         ._validar(
    //             () => nome !== null && !nomeProprioRegex.test(nome),
    //             'invalidName',
    //             { campoNome }
    //         );
    // }

    // validarTextoSemCaracteresEspeciais(texto, campoNome) {
    //     const textoRegex = /^[\p{L}0-9\s.\-]+$/u;
    //     return this
    //         ._validar(
    //             () => texto === null || texto === undefined || texto.trim() === '',
    //             'notEmpty',
    //             { campoNome }
    //         )
    //         ._validar(
    //             () => texto !== null && !textoRegex.test(texto),
    //             'invalidSpecialChars',
    //             { campoNome }
    //         );
    // }

    // validarAlfanumerico(valor, campoNome) {
    //     const alfanumericoRegex = /^[A-Za-z0-9]+$/;
    //     return this
    //         ._validar(
    //             () => valor === null || valor === undefined || valor.toString().trim() === '',
    //             'required',
    //             { campoNome }
    //         )
    //         ._validar(
    //             () => valor !== null && !alfanumericoRegex.test(valor),
    //             'alphanumeric',
    //             { campoNome }
    //         );
    // }

    // validarCPF(cpf, campoNome) {
    //     const cpfRegex = /^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/;
    //     return this
    //         ._validar(
    //             () => cpf === null || cpf === undefined || cpf.trim() === '',
    //             'required',
    //             { campoNome }
    //         )
    //         ._validar(
    //             () => cpf !== null && !cpfRegex.test(cpf),
    //             'invalidCPF',
    //             { campoNome }
    //         )
    //         ._validar(
    //             () => cpf !== null && !this._validarCPFLogic(cpf),
    //             'invalidCPF',
    //             { campoNome }
    //         );
    // }

    // // Lógica de validação de CPF
    // _validarCPFLogic(cpf) {
    //     const numeros = cpf.replace(/\D/g, '');
    //     if (numeros.length !== 11 || /^(\d)\1+$/.test(numeros)) return false;

    //     let soma = 0;
    //     for (let i = 0; i < 9; i++) {
    //         soma += parseInt(numeros.charAt(i)) * (10 - i);
    //     }
    //     let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    //     if (resultado !== parseInt(numeros.charAt(9))) return false;

    //     soma = 0;
    //     for (let i = 0; i < 10; i++) {
    //         soma += parseInt(numeros.charAt(i)) * (11 - i);
    //     }
    //     resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    //     if (resultado !== parseInt(numeros.charAt(10))) return false;

    //     return true;
    // }

    // // Continue adaptando os outros métodos seguindo o mesmo padrão...

    // // Exemplo para validarCNPJ
    // validarCNPJ(cnpj, campoNome) {
    //     const cnpjRegex = /^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}-[0-9]{2}$/;
    //     return this
    //         ._validar(
    //             () => cnpj === null || cnpj === undefined || cnpj.trim() === '',
    //             'required',
    //             { campoNome }
    //         )
    //         ._validar(
    //             () => cnpj !== null && !cnpjRegex.test(cnpj),
    //             'invalidCNPJ',
    //             { campoNome }
    //         )
    //         ._validar(
    //             () => cnpj !== null && !this._validarCNPJLogic(cnpj),
    //             'invalidCNPJ',
    //             { campoNome }
    //         );
    // }

    // // Lógica de validação de CNPJ
    // _validarCNPJLogic(cnpj) {
    //     const numeros = cnpj.replace(/\D/g, '');
    //     if (numeros.length !== 14) return false;

    //     if (/^(\d)\1+$/.test(numeros)) return false;

    //     let tamanho = 12;
    //     let numerosCnpj = numeros.substring(0, tamanho);
    //     const digitos = numeros.substring(tamanho);
    //     let soma = 0;
    //     const pos = tamanho - 7;
    //     for (let i = tamanho; i >= 1; i--) {
    //         soma += numerosCnpj.charAt(tamanho - i) * pos--;
    //         if (pos < 2) pos = 9;
    //     }
    //     let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    //     if (resultado !== parseInt(digitos.charAt(0))) return false;

    //     tamanho = 13;
    //     numerosCnpj = numeros.substring(0, tamanho);
    //     soma = 0;
    //     let pos2 = tamanho - 7;
    //     for (let i = tamanho; i >= 1; i--) {
    //         soma += numerosCnpj.charAt(tamanho - i) * pos2--;
    //         if (pos2 < 2) pos2 = 9;
    //     }
    //     resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    //     if (resultado !== parseInt(digitos.charAt(1))) return false;

    //     return true;
    // }

    // // Continue adaptando os demais métodos seguindo o mesmo padrão...

    // // Método para validar e retornar a primeira mensagem de erro encontrada
    // validar() {
    //     return this._erro;
    // }

    // validarMongoID(id) {
    //     if (!mongoose.Types.ObjectId.isValid(id)) {
    //         throw new CustomError({
    //             statusCode: 400,
    //             errorType: 'validationError',
    //             field: 'id',
    //             details: [],
    //             customMessage: 'ID do produto inválido'
    //         });
    //     }
    // }
}

export default Validator;
