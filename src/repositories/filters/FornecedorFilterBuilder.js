// src/utils/FornecedorFilterBuilder.js

class FornecedorFilterBuilder {
  constructor() {
    this.filtros = {};
  }

  // Filtro por nome do fornecedor (busca parcial e case-insensitive)
  comNome(nome) {
    if (nome) {
      const termo = this.escapeRegex(String(nome));
      this.filtros.$or = [
        { nome_fornecedor: { $regex: termo, $options: "i" } },
        { cnpj: { $regex: termo, $options: "i" } },
      ];
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
      this.filtros["endereco.email"] = { $regex: email, $options: "i" };
    }
    return this;
  }

  // Filtro por telefone de um dos endereços
  comTelefone(telefone) {
    if (telefone) {
      this.filtros["endereco.telefone"] = { $regex: telefone, $options: "i" };
    }
    return this;
  }

  // Filtro por status (ativo/inativo)
  comStatus(status) {
    if (status !== undefined && status !== null && status !== "") {
      // Converte string para boolean se necessário
      const statusBoolean =
        status === true || status === "true" || status === "1";
      this.filtros.status = statusBoolean;
    }
    return this;
  }

  // Método para escapar regex (evita erros em entradas de usuário)
  escapeRegex(texto) {
    return texto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }

  build() {
    return this.filtros;
  }
}

export default FornecedorFilterBuilder;
