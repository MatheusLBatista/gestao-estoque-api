// src/utils/FornecedorFilterBuilder.js

class FornecedorFilterBuilder {
    constructor() {
        this.filtros = {};
    }

    // Filtro por nome do fornecedor (busca parcial e case-insensitive)
    comNome(nome) {
        if (nome) {
            this.filtros.nome_fornecedor = { $regex: nome, $options: 'i' };
        }
        return this;
    }

    // Filtro por CNPJ (busca exata)
    comCNPJ(cnpj) {
        if (cnpj) {
            this.filtros.cnpj = cnpj;
        }
        return this;
    }

    // Filtro por e-mail de um dos endereços
    comEmail(email) {
        if (email) {
            this.filtros['endereco.email'] = { $regex: email, $options: 'i' };
        }
        return this;
    }

    // Filtro por telefone de um dos endereços
    comTelefone(telefone) {
        if (telefone) {
            this.filtros['endereco.telefone'] = { $regex: telefone, $options: 'i' };
        }
        return this;
    }

    // Método para escapar regex (evita erros em entradas de usuário)
    escapeRegex(texto) {
        return texto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    build() {
        return this.filtros;
    }
}

export default FornecedorFilterBuilder;
