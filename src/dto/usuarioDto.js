export class criarUsuarioDto {
    constructor(nome_usuario, matricula, senha, cargo, data_cadastro, data_ultima_atualizacao) {
        this.nome_usuario = nome_usuario;
        this.matricula = matricula;
        this.senha = senha;
        this.cargo = cargo;
        this.data_cadastro = data_cadastro;
        this.data_ultima_atualizacao = data_ultima_atualizacao;
    }
}


export class atualizarUsuarioDto {
    constructor({
        nome_usuario,
        matricula,
        senha,
        cargo,
        data_cadastro,
        data_ultima_atualizacao
    } = {}) {
        if (nome_usuario !== undefined) this.nome_usuario = nome_usuario;
        if (matricula !== undefined) this.matricula = matricula;
        if (senha !== undefined) this.senha = senha;
        if (cargo !== undefined) this.cargo = cargo;
        if (data_cadastro !== undefined) this.data_cadastro = data_cadastro;
        if (data_ultima_atualizacao !== undefined) this.data_ultima_atualizacao = data_ultima_atualizacao;
    }
}

// export class 