
# Plano de Teste

**Projeto XXXX**

*versão 1.0*

## Histórico das alterações 

   Data    | Versão |    Descrição   | Autor(a)
-----------|--------|----------------|-----------------
09/05/2025 |  1.0   | Primeira Versão Da API | Wesley Jhonnes Ramos Rolim


## 1 - Introdução

O presente sistema tem como objetivo informatizar a gestão de uma biblioteca, oferecendo funcionalidades que abrangem o cadastro de livros, controle de empréstimos e devoluções, gerenciamento de usuários (alunos, funcionários e administradores), e aplicação de regras específicas como limite de empréstimos e cálculo de multas por atraso.

Este plano de teste descreve os cenários, critérios de aceitação e verificações que serão aplicados sobre as principais funcionalidades do sistema, visando garantir o correto funcionamento das regras de negócio, a integridade dos dados e a experiência do usuário.


## 2 - Arquitetura da API

A aplicação adota uma arquitetura modular em camadas, implementada com as tecnologias Node.js, Express, MongoDB (via Mongoose), Zod para validação de dados, JWT para autenticação e Swagger para documentação interativa da API. O objetivo é garantir uma estrutura clara, escalável e de fácil manutenção, com separação de responsabilidades e aderência a boas práticas de desenvolvimento backend.

### Camadas;

**Routes**: Responsável por definir os endpoints da aplicação e encaminhar as requisições para os controllers correspondentes. Cada recurso do sistema possui um arquivo de rotas dedicado.

**Controllers**: Gerenciam a entrada das requisições HTTP, realizam a validação de dados com Zod e invocam os serviços adequados. Também são responsáveis por formatar e retornar as respostas.

**Services**: Esta camada centraliza as regras de negócio do sistema. Ela abstrai a lógica do domínio, orquestra operações e valida fluxos antes de interagir com a base de dados.

**Repositories**: Encapsulam o acesso aos dados por meio dos modelos do Mongoose, garantindo que a manipulação do banco esteja isolada da lógica de negócio.

**Models**: Definem os esquemas das coleções do MongoDB, com o uso de Mongoose, representando as entidades principais do sistema como livros, leitores e empréstimos.

**Validations**: Utiliza Zod para garantir que os dados recebidos nas requisições estejam no formato esperado, aplicando validações personalizadas e mensagens de erro claras.

**Middlewares**: Implementam funcionalidades transversais, como autenticação de usuários com JWT, tratamento global de erros, e controle de permissões por tipo de perfil.

Existe um documento demonstrando quando e como aplicar as validações link: https://docs.google.com/document/d/1m2Ns1rIxpUzG5kRsgkbaQFdm7od0e7HSHfaSrrwegmM/edit?usp=sharing

## 3 - Categorização  dos  Requisitos  em  Funcionais  x  Não Funcionais

| Código | Requisito Funcional                                                                                   | Regra de Negócio Associada                                                                                  |
| ------ | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| RF001  | O sistema deve permitir o cadastro de novos livros no acervo.                                         | Um livro deve conter obrigatoriamente título, autor e pelo menos um exemplar para ser cadastrado.           |
| RF002  | O sistema deve permitir a edição das informações de um livro cadastrado.                              | Apenas funcionários autenticados podem editar dados de livros.                                              |
| RF003  | O sistema deve permitir a exclusão de livros do acervo.                                               | Um livro só pode ser excluído se não houver empréstimos ativos vinculados a ele.                            |
| RF004  | O sistema deve listar todos os livros cadastrados.                                                    | A listagem deve exibir apenas livros que ainda tenham exemplares no acervo.                                 |
| RF005  | O sistema deve permitir a pesquisa de livros por título, autor, gênero ou ano.                        | A busca deve ser tolerante a maiúsculas/minúsculas e aceitar correspondência parcial.                       |
| RF006  | O sistema deve permitir registrar múltiplos exemplares de um mesmo livro.                             | Cada exemplar possui um código único e estado de conservação.                                               |
| RF007  | O sistema deve controlar a disponibilidade de livros para empréstimo.                                 | Um livro só é considerado disponível se ao menos um exemplar não estiver emprestado.                        |
| RF008  | O sistema deve permitir o cadastro de leitores.                                                       | Leitores devem ter CPF único no sistema e estar ativos para realizar empréstimos.                           |
| RF009  | O sistema deve permitir a edição dos dados dos leitores.                                              | Apenas administradores podem alterar dados sensíveis como CPF ou status de ativação.                        |
| RF010  | O sistema deve permitir a exclusão de leitores.                                                       | Um leitor só pode ser removido se não tiver empréstimos em aberto.                                          |
| RF011  | O sistema deve registrar novos empréstimos de livros para leitores.                                   | Um leitor só pode emprestar um livro se estiver ativo e sem pendências.                                     |
| RF012  | O sistema deve registrar a devolução de livros emprestados.                                           | A data de devolução deve ser registrada, e o exemplar marcado como disponível.                              |
| RF013  | O sistema deve verificar se o livro está disponível antes de permitir um empréstimo.                  | Não é permitido realizar empréstimo se todos os exemplares do livro estiverem em uso.                       |
| RF014  | O sistema deve exibir os empréstimos ativos.                                                          | A listagem deve incluir data de empréstimo, data prevista de devolução e status.                            |
| RF015  | O sistema deve listar o histórico de empréstimos de um leitor.                                        | Devem ser exibidos todos os empréstimos realizados, inclusive os já devolvidos.                             |
| RF016  | O sistema deve calcular o atraso na devolução com base na data prevista de retorno.                   | A multa deve ser aplicada conforme o número de dias em atraso, se previsto nas regras da instituição.       |
| RF017  | O sistema deve permitir o login de funcionários.                                                      | O login deve ser validado com autenticação segura (ex: hash de senha).                                      |
| RF018  | O sistema deve restringir funcionalidades com base no perfil de acesso do usuário.                    | Apenas administradores podem cadastrar livros, excluir registros e acessar relatórios completos.            |
| RF019  | O sistema deve emitir relatórios de livros mais emprestados.                                          | Os relatórios devem ser ordenados por quantidade de empréstimos dentro de um período.                       |
| RF020  | O sistema deve emitir relatórios de leitores mais ativos.                                             | O sistema deve contar a quantidade de empréstimos finalizados por leitor.                                   |
| RF021  | O sistema deve emitir relatórios de empréstimos por período.                                          | O usuário deve selecionar um intervalo de datas para gerar o relatório.                                     |
| RF022  | O sistema deve listar livros em atraso.                                                               | A listagem deve incluir leitor, exemplar, data de devolução prevista e dias de atraso.                      |
| RF023  | O sistema deve permitir o envio de notificações de devolução próxima ou atrasada (caso implementado). | O sistema deve calcular automaticamente a data de devolução e enviar alertas com antecedência configurável. |


| Código | Requisito Não Funcional                                                                                     |
| ------ | ----------------------------------------------------------------------------------------------------------- |
| RNF001 | O sistema deve ser acessível por meio de navegadores modernos (Chrome, Firefox, Edge).                      |
| RNF002 | O sistema deve ter tempo de resposta inferior a 2 segundos para operações comuns (listar, cadastrar, etc.). |
| RNF003 | O sistema deve armazenar os dados em um banco de dados persistente e seguro.                                |
| RNF004 | O sistema deve seguir boas práticas de segurança, como criptografia de senhas e controle de sessões.        |
| RNF005 | O sistema deve estar disponível 99,5% do tempo, exceto em períodos programados de manutenção.               |
| RNF006 | O sistema deve ser compatível com dispositivos móveis (responsivo).                                         |
| RNF007 | O sistema deve permitir backup e recuperação de dados.                                                      |
| RNF008 | O sistema deve registrar logs de atividades administrativas e de empréstimos.                               |
| RNF009 | O sistema deve ser desenvolvido com código modular e testável, seguindo princípios de boas práticas.        |
| RNF010 | A interface do sistema deve ser intuitiva e amigável para os usuários.                                      |



## 4 - Casos de Teste
Os casos de teste serão implementados ao longo do desenvolvimento, organizados em arquivos complementares. De forma geral, serão considerados cenários de sucesso, cenários de falha e as regras de negócio associadas a cada funcionalidade.


## 5 - Estratégia de Teste

A estratégia de teste adotada neste projeto busca garantir a qualidade funcional e estrutural do sistema da biblioteca por meio da aplicação de testes em múltiplos níveis, alinhados ao ciclo de desenvolvimento.

Serão executados testes em todos os níveis conforme a descrição abaixo.

**Testes Unitários**: Focados em verificar o comportamento isolado das funções, serviços e regras de negócio, o código terá uma cobertura de 70% de testes unitários, que são de responsabilidade dos desenvolvedores.

**Testes de Integração**: Verificarão a interação entre diferentes camadas (ex: controller + service + repository) e a integração com o banco de dados, serão executados testes de integração em todos os endpoints, e esses testes serão dos desenvolvedores.

**Testes Manuais**: Realizados pontualmente na API por meio do Swagger ou Postman, com o objetivo de validar diferentes fluxos de uso e identificar comportamentos inesperados durante o desenvolvimento. A execução desses testes é de responsabilidade dos desenvolvedores, tanto durante quanto após a implementação das funcionalidades.

Os testes serão implementados de forma incremental, acompanhando o desenvolvimento das funcionalidades. Cada funcionalidade terá seu próprio plano de teste específico, com os casos detalhados, critérios de aceitação e cenários de sucesso e falha.


## 6 -	Ambiente e Ferramentas

Os testes serão feitos do ambiente de desenvolvimento, e contém as mesmas configurações do ambiente de produção.

As seguintes ferramentas serão utilizadas no teste:

Ferramenta | 	Time |	Descrição 
-----------|--------|--------
POSTMAN, Swagger UI 	| Desenvolvimento|	Ferramenta para realização de testes manuais de API
Jest|	Desenvolvimento |Framework utilizada para testes unitários e integração
Supertest|	Desenvolvimento|	Framework utilizada para testes de endpoints REST
MongoDB Memory Server|	Desenvolvimento|	Para testes com banco em memória, garantindo isolamento dos dados


## 7 - Classificação de Bugs

Os Bugs serão classificados com as seguintes severidades:

ID 	|Nivel de Severidade |	Descrição 
-----------|--------|--------
1	|Blocker |	●	Bug que bloqueia o teste de uma função ou feature causa crash na aplicação. <br>●	Botão não funciona impedindo o uso completo da funcionalidade. <br>●	Bloqueia a entrega. 
2	|Grave |	●	Funcionalidade não funciona como o esperado <br>●	Input incomum causa efeitos irreversíveis
3	|Moderada |	●	Funcionalidade não atinge certos critérios de aceitação, mas sua funcionalidade em geral não é afetada <br>●	Mensagem de erro ou sucesso não é exibida
4	|Pequena |	●	Quase nenhum impacto na funcionalidade porém atrapalha a experiência  <br>●	Erro ortográfico<br>● Pequenos erros de UI


### 8 - 	Definição de Pronto 
Será considerada pronta as funcionalidades que passarem pelas verificações e testes descritas nos casos de teste, não apresentarem bugs com a severidade acima de moderada, e passarem por uma validação da equipe.
