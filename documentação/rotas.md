## 1. Autenticação

### 1.1 POST /auth/login
Função de Negócio: Permitir que os usuários entrem no sistema e obtenham acesso às funcionalidades internas.

**Regras de Negócio Envolvidas:**
- Verificação de Credenciais: Validar matrícula e senha.
- Bloqueio de Usuários: Impedir o acesso de usuários sem autorização específica.
- Gestão de Tokens: Gerar e armazenar tokens de acesso e refresh de forma segura, permitindo revogação futura.

**Resultado Esperado:** Acesso à parte interna do sistema com token de autenticação.

### 1.2 POST /auth/logout
**Função de Negócio:** Encerrar a sessão do usuário no sistema.

**Regras de Negócio:**
- Invalidação de Token: Revogar o token de acesso atual.
- Registro de Logout: Registrar horário e origem do logout para fins de auditoria.

**Resultado Esperado:** Sessão encerrada com sucesso e confirmação de logout.

## 2. Produtos

### 2.1 POST /produtos
**Caso de Uso:** Cadastrar um novo produto.

**Regras de Negócio:**
- Validação de Atributos Obrigatórios: Garantir que todos os dados essenciais foram fornecidos.
- Exclusividade de Campos: Assegurar que campos únicos, como o código de peça, não sejam duplicados.

**Resultado:** Registro criado com sucesso, retornando o objeto criado ou seu identificador. Em caso de falha, retorno de erro de validação.

### 2.2 GET /produtos
**Caso de Uso:** Listar todos os produtos existentes, possibilitando a geração de relatórios ou uma visão geral dos dados.

**Regras de Negócio:**
- Filtros e Paginação: Implementar filtros e paginação para evitar sobrecarga em consultas volumosas.
- Políticas de Acesso: Respeitar restrições de visualização de acordo com o perfil do usuário.
- Filtros Específicos: Permitir filtragem por atributos.

**Resultado:** Lista dos registros conforme os filtros aplicados e metadados de paginação.

### 2.3 GET /produtos/{id}

**Caso de Uso:** Obter detalhes de um produto específico pelo critério de ID.

**Regras de Negócio:**
- Validação de Existência: Confirmar se o registro existe e seu status (ativo/inativo).
- Retorno de Relacionamentos: Opcionalmente, incluir estatísticas ou dados relacionados.
- Controle de Permissão: Assegurar que apenas usuários autorizados possam acessar dados sensíveis.

**Resultado:** Detalhamento completo do registro. Retorno de erro se o registro não for encontrado ou o acesso não for permitido.

### 2.4 GET /produtos/busca

**Caso de Uso:** Buscar produtos por nome, código ou datas.

**Regras de Negócio:**
- Filtragem Múltipla: Permitir combinações de critérios de busca.
- Relevância: Ordenar resultados por relevância ou critério relevante ao negócio.

**Resultado:** Lista de produtos que correspondem aos critérios de busca.

### 2.5 PUT /produtos/{id}

**Caso de Uso:** Atualizar informações de um produto.

**Regras de Negócio:**
- Exclusividade de Campos: Manter a unicidade de campos (ex.: código).
- Ações Imediatas em Alterações Críticas: Caso o registro seja marcado como inativo, remover ou limitar o acesso imediatamente.
- Validação de Restrições: Impedir alterações que violem regras de negócio.

**Resultado:** Registro atualizado com as novas informações ou mensagem de erro.

### 2.6 DELETE /produtos/{id}
**Caso de Uso:** Excluir ou inativar um registro que não será mais utilizado.

**Regras de Negócio:**
- Verificação de Impedimentos: Avaliar impedimentos como regras de compliance ou auditoria.
- Registro de Logs: Disparar logs ou notificações para manter um histórico de alterações.
- Respeito aos Relacionamentos: Garantir que a exclusão não viole vínculos críticos.

Resultado: Registro excluído ou inativado conforme a política definida.

### 2.7 GET /produtos/estoque-baixo
**Caso de Uso:** Listar produtos com estoque abaixo do mínimo definido.

**Regras de Negócio:**
- Cálculo de Limiares: Considerar o estoque mínimo definido para cada produto.
- Priorização: Ordenar por criticidade ou nível de estoque.

**Resultado:** Lista de produtos que necessitam reposição de estoque.

## 3. Usuários

### 3.1 POST /usuarios
**Caso de Uso:** Cadastrar um novo usuário (funcionário).

**Regras de Negócio:**
- Validação de Atributos Obrigatórios: Garantir que todos os dados essenciais foram fornecidos.
- Exclusividade de Campos: Assegurar que campos únicos, como a matrícula de usuário, não sejam duplicados.

**Resultado:** Registro criado com sucesso ou erro de validação.

### 3.2 GET /usuarios
**Caso de Uso:** Listar todos os usuários cadastrados.

**Regras de Negócio:**
- Políticas de Acesso: Respeitar restrições de visualização de acordo com o perfil.
- Filtros e Paginação: Implementar controles para grandes volumes de dados.

**Resultado:** Lista de usuários conforme permissões e filtros aplicados.

### 3.3 GET /usuarios/{id}
**Caso de Uso:** Obter detalhes de um usuário específico pelo ID.

**Regras de Negócio:**
- Retorno de Relacionamentos: Incluir dados relacionados conforme necessário.
- Controle de Permissão: Assegurar acesso apenas a usuários autorizados.

**Resultado:** Detalhamento completo do registro ou erro de acesso/inexistência.

### 3.4 GET /usuarios/busca
Caso de Uso: Buscar usuários por nome ou matrícula.

**Regras de Negócio:**
- Busca Parcial: Permitir correspondências parciais para facilitar a busca.
- Ordenação: Apresentar resultados em ordem relevante.

**Resultado:** Lista de usuários que correspondem aos critérios de busca.

### 3.5 PUT /usuarios/{id}
**Caso de Uso:** Editar informações de um usuário.

**Regras de Negócio:**
- Exclusividade de Campos: Manter a unicidade de campos.
- Ações Imediatas em Alterações Críticas: Atualizar permissões e acessos.
- Validação de Restrições: Impedir alterações proibidas.

**Resultado:** Registro atualizado ou mensagem de erro.

### 3.6 DELETE /usuarios/{id}
**Caso de Uso:** Remover ou inativar um usuário.

**Regras de Negócio:**
- Verificação de Impedimentos: Avaliar possíveis bloqueios à remoção.
- Registro de Logs: Manter histórico de alterações.
- Respeito aos Relacionamentos: Preservar integridade dos dados.

**Resultado:** Registro excluído/inativado ou mensagem de erro.

### 3.7 GET /usuarios/{id}/foto
**Caso de Uso:** Exibir a foto ou arquivo associado a um usuário.

**Regras de Negócio:**
- Verificação de Existência: Retornar imagem padrão se não existir.
- Controle de Acesso: Verificar permissões de visualização.
- Otimização do Download: Ajustar formato para exibição.

**Resultado:** Arquivo de imagem ou mensagem de erro.

## 4. Fornecedores

### 4.1 GET /fornecedores
**Caso de Uso:** Listar todos os fornecedores cadastrados.

**Regras de Negócio:**
- Paginação e Filtros: Permitir consultas eficientes.
- Ordenação: Apresentar fornecedores em ordem útil ao negócio.

**Resultado:** Lista de fornecedores com metadados de paginação.

### 4.2 GET /fornecedores/{id}
**Caso de Uso:** Obter detalhes de um fornecedor específico.

**Regras de Negócio:**
- Inclusão de Relacionamentos: Mostrar produtos associados e histórico.
- Validação de Existência: Verificar se o fornecedor existe.

**Resultado:** Dados detalhados do fornecedor ou erro.

### 4.3 GET /fornecedores/busca
**Caso de Uso:** Buscar fornecedores por nome ou ID.

**Regras de Negócio:**
- Correspondência Parcial: Permitir buscas por termos parciais.
- Filtragem Múltipla: Combinar critérios de busca.

**Resultado:** Lista de fornecedores que correspondem aos critérios.

### 4.4 POST /fornecedores
**Caso de Uso:** Cadastrar novo fornecedor.

**Regras de Negócio:**
- Validação de Dados: Verificar CNPJ e outras informações críticas.
- Unicidade: Impedir duplicação de cadastros.

**Resultado:** Registro criado com sucesso ou mensagem de erro.

### 4.5 PUT /fornecedores/{id}
**Caso de Uso:** Editar informações de fornecedor.

**Regras de Negócio:**
- Validação de Alterações: Garantir integridade dos dados atualizados.
- Histórico de Mudanças: Registrar alterações significativas.

**Resultado:** Registro atualizado ou mensagem de erro.

### 4.6 DELETE /fornecedores/{id}
**Caso de Uso:** Remover fornecedor do sistema.

**Regras de Negócio:**
- Verificação de Vínculos: Impedir remoção se houver produtos ou pedidos ativos.
- Alternativa de Inativação: Optar por inativar em vez de excluir.

**Resultado:** Fornecedor removido/inativado ou mensagem de erro.

## 5. Movimentações

### 5.1 GET /movimentacoes
**Caso de Uso:** Listar todas as movimentações de estoque.

**Regras de Negócio:**
- Filtros Temporais: Permitir seleção por períodos específicos.
- Paginação Eficiente: Garantir performance em grandes volumes.

**Resultado:** Lista de movimentações conforme filtros aplicados.

### 5.2 GET /movimentacoes/{id}
**Caso de Uso:** Buscar movimentação específica por ID.

**Regras de Negócio:**
- Detalhamento Completo: Incluir produtos, quantidades, responsáveis.
- Validação de Acesso: Verificar permissões do usuário.

**Resultado:** Detalhes completos da movimentação ou erro.

### 5.3 GET /movimentacoes/busca
**Caso de Uso:** Buscar movimentações por ID, data ou tipo.

**Regras de Negócio:**
- Combinação de Filtros: Permitir múltiplos critérios de busca.
- Ordenação Relevante: Apresentar resultados em ordem útil.

**Resultado:** Lista de movimentações que correspondem aos critérios.

### 5.4 POST /movimentacoes
**Caso de Uso:** Registrar nova movimentação (entrada ou saída).

**Regras de Negócio:**
- Validação de Estoque: Verificar disponibilidade para saídas.
- Atualização Automática: Ajustar níveis de estoque dos produtos.
- Registro de Responsável: Identificar quem realizou a movimentação.

**Resultado:** Movimentação registrada e estoque atualizado ou erro.

### 5.5 PUT /movimentacoes/{id}
**Caso de Uso:** Editar movimentação existente (com restrições).

**Regras de Negócio:**
- Limitação Temporal: Permitir alterações apenas em período específico.
- Auditoria Rigorosa: Registrar todas as modificações e motivos.

**Resultado:** Movimentação atualizada ou mensagem de erro.

### 5.6 DELETE /movimentacoes/{id}
**Caso de Uso:** Remover movimentação (com restrições).

**Regras de Negócio:**
- Limitações de Tempo: Restringir remoção após período definido.
- Impacto no Estoque: Reverter alterações no estoque quando aplicável.
- Aprovação Especial: Exigir nível de permissão elevado.

**Resultado:** Movimentação removida e estoque ajustado ou erro.

## 6. Relatórios e Dashboards

### 6.1 GET /relatorios/estoque
**Caso de Uso:** Visualizar status atual do estoque.

**Regras de Negócio:**
- Visão Consolidada: Apresentar níveis atuais, valores e alertas.
- Filtros por Categoria: Permitir visualização por segmentos específicos.

**Resultado:** Dashboard com métricas atualizadas do estoque.

### 6.2 GET /relatorios/movimentacoes
**Caso de Uso:** Relatório de movimentações por período.

**Regras de Negócio:**
- Agregação Temporal: Permitir visualização diária, semanal, mensal.
- Comparativos: Mostrar variações entre períodos.

**Resultado:** Relatório com gráficos e tabelas de movimentação.

### 6.3 GET /relatorios/produtos-populares
**Caso de Uso:** Identificar produtos mais movimentados.

**Regras de Negócio:**
- Ordenação por Volume: Exibir ranking dos mais utilizados/vendidos.
- Categorização: Agrupar por tipos e categorias relevantes.

**Resultado:** Relatório dos produtos com maior movimentação.

### 6.4 GET /relatorios/fornecedores
**Caso de Uso:** Analisar fornecedores e seus produtos.

**Regras de Negócio:**
- Consolidação de Dados: Agrupar produtos por fornecedor.
- Métricas de Performance: Incluir indicadores como prazo de entrega.

**Resultado:** Relatório detalhado sobre fornecedores e seus produtos.
