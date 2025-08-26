## REQUISITOS FUNCIONAIS
A tabela a seguir contém a relação dos Requisitos Funcionais elicitados, com as colunas: identificador, nome e descrição:

| IDENTIFICADOR | NOME | DESCRIÇÃO |
:---|:---|:---|
|RF-001 |O sistema deve permitir cadastro, edição e exclusão de peças|Sistema completo de CRUD para produtos com validações|
|RF-002 |O sistema deve permitir categorização manual de peças|Sistema permite definir categoria manualmente no cadastro|
|RF-003 |O sistema deve registrar entrada e saída de peças do estoque|Sistema de movimentações com múltiplos produtos por movimento|
|RF-004 |O sistema deve gerar alertas quando o estoque atingir níveis críticos|Endpoint para consultar produtos com estoque baixo|
|RF-005 |O sistema deve integrar-se com o sistema de PDV para registrar vendas|**NÃO IMPLEMENTADO** - Fora do escopo atual|
|RF-006 |O sistema deve integrar-se com o sistema de notas fiscais para emissão de NF-e|**NÃO IMPLEMENTADO** - Fora do escopo atual|
|RF-007 |O sistema deve atualizar o estoque automaticamente após cada venda|**NÃO IMPLEMENTADO** - Fora do escopo atual|
|RF-008 |O sistema deve gerar relatórios de estoque atual|Sistema de listagem e busca de produtos implementado|
|RF-009 |O sistema deve gerar relatórios de movimentação (entradas/saídas)|Sistema de consulta de movimentações com filtros|
|RF-010 |O sistema deve gerar relatórios de vendas por categoria de valor|**NÃO IMPLEMENTADO** - Não há categorização automática|
|RF-011 |O sistema deve gerar relatórios de vendas por Peça|**NÃO IMPLEMENTADO** - Não há integração com PDV|
|RF-012 |O sistema deve permitir gerenciamento de usuários|Sistema completo de usuários com perfis e permissões|
|RF-013 |O sistema deve permitir gerenciamento de fornecedores|Sistema completo de CRUD para fornecedores|
|RF-014 |O sistema deve implementar sistema de grupos e permissões|Sistema avançado de grupos com permissões granulares|
|RF-015 |O sistema deve implementar auditoria e logs|Sistema completo de logs para todas as operações|


## REQUISITOS NÃO FUNCIONAIS
A tabela a seguir contém a relação com os Requisitos Não Funcionais identificados, contendo identificador, nome e descrição:

| IDENTIFICADOR | NOME | DESCRIÇÃO |
|:---|:---|:---|
RNF-001 |O sistema deve possuir interface intuitiva e responsiva|###################|
RNF-002 |O tempo de aprendizado do sistema pelo usuário não deve exceder 4 horas|###################|
RNF-003 |O sistema deve suportar até 30 usuários simultanêos|###################|
RNF-004 |O tempo de resposta para consultas simples nãão deve exceder 2 segundos.|###################|
RNF-005 |O tempo de resposta para relatórios complexos não deve exceder 10 segundos|###################|
RNF-006 |O sistema deve implementar controle de acesso baseado em perfis|###################|
RNF-007 |As senhas dos usuários devem ser armazenadas com criptografia|###################|
RNF-008 |O sistema deve estar disponível 99,5% do tempo em horário comercial|###################|
RNF-009 |O sistema deve realizar backup automático diário dos dados|###################|
RNF-010 |O sistema deve ter mecanismo de recuperação de falhas|###################|
---  


# Milestone 1

- Reuniões com o cliente
- Elicitação de requisitos
- Requisitos funcionais
- Requisitos não funcionais
- Prototipação do figma do 0
- Documentação simples do projeto
- Modelagem do Banco de Dados não relacional (MongoDB)
- Documentar cada rota (incluindo regras de negócio)
