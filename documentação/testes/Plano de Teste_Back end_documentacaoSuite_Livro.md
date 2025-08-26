# 📘 Documentação de Testes - Modelo Livro

## 🆔 Identificação
- **Módulo testado**: Livro
- **Ferramentas utilizadas**: Jest, MongoDB Memory Server, Mongoose
- **Responsável**: [Seu Nome]

---

## 🎯 Objetivo
Verificar se o modelo `Livro` realiza corretamente as operações CRUD com persistência no MongoDB e se lida adequadamente com erros (IDs inválidos, livros inexistentes, etc.).

---

## ⚙️ Ambiente de Teste
- Banco de dados: MongoDB in-memory (`mongodb-memory-server`)
- Framework de testes: Jest
- Comando de execução: `npm test`
- Local dos testes: `tests/livro.test.js`

---

## ✅ Casos de Teste Implementados

| ID   | Descrição                                      | Método testado             | Resultado Esperado                         |
|------|------------------------------------------------|----------------------------|--------------------------------------------|
| TC01 | Criar livro válido                             | `Livro.prototype.save`     | Livro salvo com `_id`, `createdAt`         |
| TC02 | Listar todos os livros                         | `Livro.find()`             | Array com os livros salvos                 |
| TC03 | Atualizar um livro existente                   | `Livro.findByIdAndUpdate`  | Campo alterado e `updatedAt` modificado    |
| TC04 | Erro ao atualizar com ID malformado            | `Livro.findByIdAndUpdate`  | Lançamento de erro                         |
| TC05 | Remover um livro existente                     | `Livro.findByIdAndDelete`  | Livro removido com sucesso                 |
| TC06 | Tentar remover um livro inexistente            | `Livro.findByIdAndDelete`  | Nenhuma alteração, sem erro lançado        |

---

## 📊 Cobertura de Testes
- Cobertura total das operações do modelo `Livro`.
- Casos de sucesso e falha implementados.

---

## 🧪 Execução e Resultados

```bash
PASS  tests/livro.test.js
  ✓ Deve criar um livro válido
  ✓ Deve listar todos os livros
  ✓ Deve atualizar um livro existente
  ✓ Deve lançar erro ao tentar atualizar com ID malformado
  ✓ Deve remover um livro existente
  ✓ Deve tentar remover um livro inexistente
```

---

## ✅ Conclusão
Os testes unitários garantem que o modelo `Livro` está implementado corretamente, atende os requisitos de persistência e manipulação no banco, e lida com falhas de forma segura.

---

## 📁 Histórico
- Criado em: [data de criação]
- Última atualização: [última data]
