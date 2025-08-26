class UsuarioFilterBuilder {
    constructor() {
        this.filters = {};
    }

    comNome(nome) {
        if (nome && nome.trim() !== '') {
            this.filters.nome_usuario = { $regex: nome, $option: 'i'};
        }
        return this;
    }

    comMatricula(matricula) {
        if (matricula && matricula.trim() !== '') {
            this.filters.matricula = { $regex: matricula, $option: 'i'};
        }
        return this;
    }

    comEmail(email) {
        if (email && email.trim() !== '') {
            this.filters.email = { $regex: email, $option: 'i'}
        }
        return this;
    }

    comCargo(cargo) {
        if (cargo && cargo.trim() !== '') {
            this.filters.cargo = { $regex: cargo, $option: 'i'}
        }
        return this;
    }

    comStatus(status) {
        if (status && status.trim() !== '') {
            this.filters.status = { $regex: status, $option: 'i'}
        }
        return this;
    }

    build() {
        return this.filters;
    }
}

export default UsuarioFilterBuilder;