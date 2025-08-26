

# Plano de Teste para Model (Srint 2) 

| Funcionalidade          | Comportamento Esperado                                                          | Verificações                                                  | Critérios de Aceite                                                          |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Cadastro de livro       | Um livro só pode ser cadastrado se possuir título e autor                       | Tentar salvar livro sem `titulo` ou `autor`                   | A operação deve falhar com erro de validação (`required`)                    |
| Cadastro válido         | Um livro com título, autor e demais campos válidos deve ser salvo com sucesso   | Inserir um livro com todos os campos preenchidos corretamente | O livro é salvo e retornado com `_id`, `createdAt` e `updatedAt`             |
| Valor padrão disponível | Ao cadastrar um livro sem informar `disponivel`, o valor padrão deve ser `true` | Cadastrar um livro sem o campo `disponivel`                   | O campo `disponivel` deve estar como `true` no documento salvo               |
| Registro de timestamps  | O sistema deve registrar automaticamente as datas de criação e atualização      | Cadastrar um livro e verificar `createdAt` e `updatedAt`      | Os campos `createdAt` e `updatedAt` existem e são preenchidos corretamente   |
| Leitura de livros       | O sistema deve retornar todos os livros cadastrados                             | Fazer find() Verificar leitura dos dados inseridos            | A resposta contém um array com os livros cadastrados                         |
| Atualização de livro    | Deve ser possível atualizar informações de um livro válido                      | Fazer updateOne() / findByIdAndUpdate()                       | O livro deve refletir os dados alterados e o `updatedAt` deve ser atualizado |
| Remoção de livro        | Um livro existente pode ser removido do sistema                                 | Fazer deleteOne() / findByIdAndDelete()                       | O livro é removido e não aparece mais na listagem                            |




# Plano de Teste Controller (Sprint X)

# Plano de Teste Server (Sprint X)

# Plano de Teste Repository (Sprint X)

# Plano de Teste ENDPOINT (Sprint X)
