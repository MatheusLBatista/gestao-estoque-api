# Plano de Testes - Sistema de Gestão de Estoque Automotivo

## Índice
1. [Introdução](#1-introdução)
2. [Escopo dos Testes](#2-escopo-dos-testes)
3. [Tipos de Testes](#3-tipos-de-testes)
4. [Critérios de Aceitação](#4-critérios-de-aceitação)
5. [Casos de Teste por Módulo](#5-casos-de-teste-por-módulo)
6. [Cenários de Teste Críticos](#6-cenários-de-teste-críticos)
7. [Testes de Performance](#7-testes-de-performance)
8. [Testes de Segurança](#8-testes-de-segurança)
9. [Matriz de Rastreabilidade](#9-matriz-de-rastreabilidade)
10. [Cronograma de Execução](#10-cronograma-de-execução)

---

## 1. Introdução

### 1.1 Objetivo
Este plano de testes tem como objetivo validar todas as funcionalidades do Sistema de Gestão de Estoque Automotivo (H&R), garantindo que atenda aos requisitos funcionais e não funcionais especificados.

### 1.2 Características do Sistema
- **Domínio**: Gestão de estoque de peças automotivas
- **Tecnologia**: Node.js/Express + MongoDB
- **Categorização**: Produtos classificados por valor (A, B, C)
- **Usuários**: Gerente Geral, Gerente de Estoque, Estoquista, Vendedor

### 1.3 Regras de Negócio Principais
- **Controle de Estoque**: Atualização automática após movimentações
- **Alertas**: Produtos com estoque baixo (estoque <= estoque_min)
- **Auditoria**: Log completo de todas as operações com middleware
- **Categorização**: Sistema implementa categorias de produtos (não por valor automático)
- **Permissões**: Sistema de grupos e permissões individuais para usuários
- **Status**: Produtos e fornecedores podem ser ativados/desativados (soft delete)

---

## 2. Escopo dos Testes

### 2.1 Módulos a Serem Testados
- ✅ **Autenticação e Autorização**
- ✅ **Gestão de Usuários**
- ✅ **Gestão de Produtos**
- ✅ **Gestão de Fornecedores**
- ✅ **Movimentações de Estoque**
- ✅ **Sistema de Logs**
- ✅ **Relatórios e Consultas**
- ✅ **Gestão de Grupos e Permissões**

### 2.2 Tipos de Funcionalidades
- CRUD completo para todas as entidades
- Validações de dados
- Regras de negócio específicas
- Integração entre módulos
- Sistema de notificações
- Controle de acesso baseado em perfis

---

## 3. Tipos de Testes

### 3.1 Testes Funcionais
- **Testes de Unidade**: Validação individual de funções
- **Testes de Integração**: Comunicação entre módulos
- **Testes de Sistema**: Funcionalidades end-to-end
- **Testes de Aceitação**: Validação dos requisitos do usuário

### 3.2 Testes Não Funcionais
- **Testes de Performance**: Tempo de resposta e throughput
- **Testes de Segurança**: Autenticação, autorização e validação
- **Testes de Usabilidade**: Interface e experiência do usuário
- **Testes de Confiabilidade**: Estabilidade e recuperação de falhas

---

## 4. Critérios de Aceitação

### 4.1 Critérios Funcionais
- ✅ Todas as operações CRUD funcionam corretamente
- ✅ Validações de dados impedem entradas inválidas
- ✅ Categorização automática de produtos funciona
- ✅ Controle de estoque atualiza automaticamente
- ✅ Sistema de logs registra todas as operações
- ✅ Controle de acesso funciona por perfil de usuário

### 4.2 Critérios de Performance
- ✅ Consultas simples: máximo 2 segundos
- ✅ Relatórios complexos: máximo 10 segundos
- ✅ Suporte a 30 usuários simultâneos
- ✅ Disponibilidade: 99,5% em horário comercial

### 4.3 Critérios de Segurança
- ✅ Senhas criptografadas com bcrypt
- ✅ Tokens JWT para autenticação
- ✅ Validação de entrada em todos os endpoints
- ✅ Logs de segurança para ações críticas

---

## 5. Casos de Teste por Módulo

## 5.1 Módulo de Autenticação

### CT-AUTH-001: Login com Credenciais Válidas
**Objetivo**: Verificar login com email e senha corretos
**Pré-condição**: Usuário cadastrado no sistema
**Dados de Teste**:
```json
{
  "email": "admin@teste.com",
  "senha": "123456"
}
```
**Passos**:
1. Enviar POST para `/auth/login`
2. Verificar resposta com token JWT
3. Verificar dados do usuário retornados
4. Verificar status online atualizado

**Resultado Esperado**: 
- Status 200
- Token JWT válido
- Dados do usuário corretos
- Campo `online: true`

### CT-AUTH-002: Login com Credenciais Inválidas
**Objetivo**: Verificar rejeição de credenciais incorretas
**Dados de Teste**:
```json
{
  "email": "admin@teste.com",
  "senha": "senhaerrada"
}
```
**Resultado Esperado**: 
- Status 401
- Mensagem de erro apropriada
- Nenhum token retornado

### CT-AUTH-003: Login com Usuário Inativo
**Objetivo**: Verificar bloqueio de usuário desativado
**Pré-condição**: Usuário com `ativo: false`
**Resultado Esperado**: 
- Status 403
- Mensagem "Usuário inativo"

### CT-AUTH-004: Refresh Token Válido
**Objetivo**: Verificar renovação de token
**Pré-condição**: Refresh token válido
**Resultado Esperado**: 
- Novo token JWT gerado
- Token anterior invalidado

### CT-AUTH-005: Logout
**Objetivo**: Verificar encerramento de sessão
**Pré-condição**: Usuário autenticado
**Resultado Esperado**: 
- Status online atualizado para false
- Token invalidado

## 5.2 Módulo de Usuários

### CT-USER-001: Criar Usuário Válido
**Objetivo**: Verificar criação de usuário com dados corretos
**Dados de Teste**:
```json
{
  "nome_usuario": "João Silva",
  "email": "joao@teste.com",
  "matricula": "USR001",
  "perfil": "estoquista"
}
```
**Resultado Esperado**: 
- Status 201
- Usuário criado com `senha_definida: false`
- Email de definição de senha enviado

### CT-USER-002: Criar Usuário com Email Duplicado
**Objetivo**: Verificar validação de unicidade de email
**Pré-condição**: Email já existente no sistema
**Resultado Esperado**: 
- Status 409
- Mensagem "Email já cadastrado"

### CT-USER-003: Criar Usuário com Matrícula Duplicada
**Objetivo**: Verificar validação de unicidade de matrícula
**Resultado Esperado**: 
- Status 409
- Mensagem "Matrícula já cadastrada"

### CT-USER-004: Listar Usuários (Paginação)
**Objetivo**: Verificar listagem com paginação
**Parâmetros**: `page=1&limit=10`
**Resultado Esperado**: 
- Lista de usuários paginada
- Metadados de paginação corretos

### CT-USER-005: Buscar Usuário por Matrícula
**Objetivo**: Verificar busca específica
**Endpoint**: `/api/usuarios/matricula/USR001`
**Resultado Esperado**: 
- Usuário correto retornado
- Dados completos (exceto senha)

### CT-USER-006: Atualizar Usuário
**Objetivo**: Verificar atualização de dados
**Dados de Teste**:
```json
{
  "nome_usuario": "João Silva Santos",
  "perfil": "gerente"
}
```
**Resultado Esperado**: 
- Dados atualizados corretamente
- Log de alteração criado

### CT-USER-007: Desativar Usuário
**Objetivo**: Verificar desativação (soft delete)
**Resultado Esperado**: 
- Campo `ativo: false`
- Usuário não consegue fazer login
- Dados preservados

### CT-USER-008: Reativar Usuário
**Objetivo**: Verificar reativação
**Pré-condição**: Usuário desativado
**Resultado Esperado**: 
- Campo `ativo: true`
- Usuário pode fazer login novamente

### CT-USER-009: Definir Senha (Primeiro Acesso)
**Objetivo**: Verificar definição de senha inicial
**Pré-condição**: `senha_definida: false`
**Resultado Esperado**: 
- Senha criptografada salva
- Campo `senha_definida: true`

## 5.3 Módulo de Produtos

### CT-PROD-001: Criar Produto Válido
**Objetivo**: Verificar criação com dados corretos
**Dados de Teste**:
```json
{
  "nome_produto": "Pastilha de Freio Dianteira",
  "categoria": "Freios",
  "codigo_produto": "PF001",
  "preco": 89.90,
  "custo": 45.00,
  "estoque": 25,
  "estoque_min": 5,
  "id_fornecedor": 1,
  "marca": "Bosch",
  "descricao": "Pastilha de freio para veículos nacionais"
}
```
**Resultado Esperado**: 
- Status 201
- Produto criado com sucesso
- Campos obrigatórios validados
- Associação com fornecedor confirmada

### CT-PROD-002: Criar Produto com Dados Completos
**Objetivo**: Verificar criação com todos os campos opcionais
**Dados de Teste**:
```json
{
  "nome_produto": "Amortecedor Traseiro Premium",
  "categoria": "Suspensão",
  "codigo_produto": "AMT001",
  "preco": 1200.00,
  "custo": 800.00,
  "estoque": 8,
  "estoque_min": 3,
  "id_fornecedor": 2,
  "marca": "Monroe",
  "descricao": "Amortecedor traseiro para veículos de passeio"
}
```
**Resultado Esperado**: 
- Status 201
- Produto criado com todos os campos
- Validação de campos obrigatórios e opcionais

### CT-PROD-003: Criar Produto com Preço Baixo
**Objetivo**: Verificar criação de produto de baixo valor
**Dados de Teste**: 
```json
{
  "nome_produto": "Filtro de Óleo",
  "categoria": "Filtros",
  "codigo_produto": "FO001",
  "preco": 25.90,
  "custo": 12.00,
  "estoque": 50,
  "estoque_min": 10,
  "id_fornecedor": 1
}
```
**Resultado Esperado**: 
- Status 201
- Produto criado corretamente
- Preço baixo aceito sem restrições

### CT-PROD-005: Criar Produto com Código Duplicado
**Objetivo**: Verificar validação de unicidade
**Pré-condição**: Código já existente
**Resultado Esperado**: 
- Status 409
- Mensagem "Código do produto já existe"

### CT-PROD-006: Criar Produto com Nome Duplicado
**Objetivo**: Verificar validação de unicidade
**Resultado Esperado**: 
- Status 409
- Mensagem "Nome do produto já existe"

### CT-PROD-007: Listar Produtos com Filtros
**Objetivo**: Verificar filtros de busca
**Parâmetros**: 
- `/api/produtos?categoria=Freios`
- `/api/produtos?marca=Bosch`
- `/api/produtos?preco_min=100&preco_max=500`

**Resultado Esperado**: 
- Produtos filtrados corretamente
- Paginação funcionando

### CT-PROD-008: Buscar Produtos por Nome
**Objetivo**: Verificar busca textual
**Parâmetro**: `nome=pastilha`
**Resultado Esperado**: 
- Busca case-insensitive
- Resultados parciais (like)

### CT-PROD-009: Produtos com Estoque Baixo
**Objetivo**: Verificar alert de estoque crítico
**Endpoint**: `/api/produtos/estoque-baixo`
**Resultado Esperado**: 
- Produtos onde `estoque <= estoque_min`
- Ordenação por urgência

### CT-PROD-010: Atualizar Preço do Produto
**Objetivo**: Verificar atualização de preço
**Dados de Teste**:
```json
{
  "preco": 1500.00,
  "custo": 1000.00
}
```
**Resultado Esperado**: 
- Preço atualizado corretamente
- Margem de lucro recalculada
- Produto retornado com dados atualizados

### CT-PROD-011: Desativar Produto
**Objetivo**: Verificar desativação (soft delete)
**Resultado Esperado**: 
- Campo `status: false`
- Produto não aparece em listagens ativas
- Dados preservados para histórico

### CT-PROD-012: Validar Campos Obrigatórios
**Objetivo**: Verificar validações de entrada
**Testes**:
- Nome vazio
- Preço negativo
- Estoque negativo
- Código vazio
- Fornecedor inexistente

**Resultado Esperado**: 
- Status 400 para cada validação
- Mensagens específicas de erro

## 5.4 Módulo de Fornecedores

### CT-FORN-001: Criar Fornecedor Válido
**Objetivo**: Verificar criação com dados corretos
**Dados de Teste**:
```json
{
  "nome_fornecedor": "Auto Peças Sul",
  "cnpj": "12.345.678/0001-90",
  "telefone": "(11) 99999-9999",
  "email": "contato@autopecassul.com",
  "endereco": "Rua das Peças, 123"
}
```
**Resultado Esperado**: 
- Status 201
- Fornecedor criado corretamente

### CT-FORN-002: Validar CNPJ
**Objetivo**: Verificar validação de CNPJ
**Testes**:
- CNPJ inválido: "123.456.789/0001-00"
- CNPJ duplicado
- CNPJ vazio

**Resultado Esperado**: 
- Validação de formato
- Validação de unicidade
- Mensagens de erro apropriadas

### CT-FORN-003: Buscar Fornecedor por CNPJ
**Objetivo**: Verificar busca específica
**Parâmetro**: `cnpj=12.345.678/0001-90`
**Resultado Esperado**: 
- Fornecedor correto retornado
- Busca exata

### CT-FORN-004: Buscar Fornecedor por Nome
**Objetivo**: Verificar busca textual
**Parâmetro**: `nome_fornecedor=auto peças`
**Resultado Esperado**: 
- Busca case-insensitive
- Resultados parciais

### CT-FORN-005: Listar Fornecedores Ativos
**Objetivo**: Verificar listagem padrão
**Resultado Esperado**: 
- Apenas fornecedores com `ativo: true`
- Ordenação alfabética

### CT-FORN-006: Atualizar Fornecedor
**Objetivo**: Verificar atualização de dados
**Resultado Esperado**: 
- Dados atualizados
- Validações aplicadas
- Log de alteração

### CT-FORN-007: Excluir Fornecedor com Produtos
**Objetivo**: Verificar restrição de integridade
**Pré-condição**: Fornecedor com produtos cadastrados
**Resultado Esperado**: 
- Status 409
- Mensagem "Fornecedor possui produtos cadastrados"

### CT-FORN-008: Excluir Fornecedor sem Produtos
**Objetivo**: Verificar exclusão permitida
**Pré-condição**: Fornecedor sem produtos
**Resultado Esperado**: 
- Status 200
- Fornecedor removido do sistema

## 5.5 Módulo de Movimentações

### CT-MOV-001: Criar Movimentação de Entrada
**Objetivo**: Verificar entrada de produtos
**Dados de Teste**:
```json
{
  "tipo": "entrada",
  "destino": "Estoque Principal",
  "produtos": [{
    "id_produto": 1,
    "codigo_produto": "PF001",
    "nome_produto": "Pastilha de Freio",
    "quantidade_produtos": 10,
    "preco": 89.90,
    "custo": 45.00
  }]
}
```
**Resultado Esperado**: 
- Status 201
- Estoque do produto atualizado (+10)
- Movimentação registrada
- Log de operação criado

### CT-MOV-002: Criar Movimentação de Saída
**Objetivo**: Verificar saída de produtos
**Dados de Teste**:
```json
{
  "tipo": "saida",
  "destino": "Venda - Cliente X",
  "produtos": [{
    "id_produto": 1,
    "quantidade_produtos": 5,
    "preco": 89.90
  }]
}
```
**Resultado Esperado**: 
- Status 201
- Estoque do produto atualizado (-5)
- Movimentação registrada

### CT-MOV-003: Saída com Estoque Insuficiente
**Objetivo**: Verificar validação de estoque
**Cenário**: Tentar saída de 100 unidades com estoque de 10
**Resultado Esperado**: 
- Status 400
- Mensagem "Estoque insuficiente"
- Estoque não alterado

### CT-MOV-004: Movimentação com Múltiplos Produtos
**Objetivo**: Verificar operação em lote
**Dados de Teste**: Array com 3 produtos diferentes
**Resultado Esperado**: 
- Todos os produtos processados
- Estoques atualizados corretamente
- Transação atômica (tudo ou nada)

### CT-MOV-005: Listar Movimentações por Período
**Objetivo**: Verificar filtro por data
**Parâmetros**: `dataInicio=2024-01-01&dataFim=2024-01-31`
**Resultado Esperado**: 
- Movimentações do período retornadas
- Ordenação por data (mais recente primeiro)

### CT-MOV-006: Listar Movimentações por Tipo
**Objetivo**: Verificar filtro por tipo
**Parâmetros**: `tipo=entrada`
**Resultado Esperado**: 
- Apenas movimentações de entrada
- Filtro case-insensitive

### CT-MOV-007: Listar Movimentações por Produto
**Objetivo**: Verificar filtro por produto
**Parâmetros**: `produto=Pastilha`
**Resultado Esperado**: 
- Movimentações contendo o produto
- Busca parcial no nome

### CT-MOV-008: Cancelar Movimentação
**Objetivo**: Verificar cancelamento e reversão
**Pré-condição**: Movimentação existente
**Resultado Esperado**: 
- Status da movimentação: cancelada
- Estoque revertido à situação anterior
- Log de cancelamento criado

### CT-MOV-009: Movimentação com Produto Inativo
**Objetivo**: Verificar restrição para produtos inativos
**Pré-condição**: Produto com `status: false`
**Resultado Esperado**: 
- Status 400
- Mensagem "Produto inativo"

### CT-MOV-010: Relatório de Movimentações
**Objetivo**: Verificar geração de relatório
**Parâmetros**: Filtros diversos
**Resultado Esperado**: 
- Dados consolidados
- Totais por tipo
- Valores financeiros corretos

## 5.6 Módulo de Logs e Auditoria

### CT-LOG-001: Log de Login
**Objetivo**: Verificar registro de autenticação
**Ação**: Usuário faz login
**Resultado Esperado**: 
- Log criado com:
  - Ação: "LOGIN"
  - IP do usuário
  - User-Agent
  - Timestamp
  - Dados da sessão

### CT-LOG-002: Log de Operações CRUD
**Objetivo**: Verificar registro de operações
**Ações**: Create, Update, Delete em qualquer entidade
**Resultado Esperado**: 
- Log detalhado com:
  - Entidade afetada
  - Dados antes/depois (Update)
  - Usuário responsável
  - Timestamp

### CT-LOG-003: Listar Usuários Online
**Objetivo**: Verificar controle de sessões
**Endpoint**: `/api/logs/online-users`
**Resultado Esperado**: 
- Lista de usuários com `online: true`
- Dados atualizados em tempo real

### CT-LOG-004: Buscar Logs por Usuário
**Objetivo**: Verificar auditoria por usuário
**Endpoint**: `/api/logs/usuario/:userId`
**Resultado Esperado**: 
- Histórico completo do usuário
- Ordenação cronológica

### CT-LOG-005: Buscar Eventos Críticos
**Objetivo**: Verificar logs de segurança
**Endpoint**: `/api/logs/critical`
**Resultado Esperado**: 
- Tentativas de login inválidas
- Operações de alto risco
- Acessos não autorizados

### CT-LOG-006: Estatísticas de Uso
**Objetivo**: Verificar métricas do sistema
**Endpoint**: `/api/logs/statistics`
**Resultado Esperado**: 
- Usuários mais ativos
- Operações mais frequentes
- Horários de pico

## 5.7 Sistema de Grupos e Permissões

### CT-PERM-001: Criar Grupo de Permissões
**Objetivo**: Verificar criação de grupo
**Dados de Teste**:
```json
{
  "nome_grupo": "Vendedores",
  "descricao": "Acesso para vendas",
  "permissoes": [
    {"rota": "/api/produtos", "metodos": ["GET"]},
    {"rota": "/api/movimentacoes", "metodos": ["POST"]}
  ]
}
```
**Resultado Esperado**: 
- Grupo criado corretamente
- Permissões associadas

### CT-PERM-002: Associar Usuário a Grupo
**Objetivo**: Verificar associação
**Resultado Esperado**: 
- Usuário herda permissões do grupo
- Acesso controlado por permissões

### CT-PERM-003: Permissão Individual Sobrepõe Grupo
**Objetivo**: Verificar precedência de permissões
**Cenário**: Usuário com permissão individual diferente do grupo
**Resultado Esperado**: 
- Permissão individual tem precedência
- Acesso conforme permissão específica

### CT-PERM-004: Acesso Negado sem Permissão
**Objetivo**: Verificar controle de acesso
**Cenário**: Usuário tenta acessar rota sem permissão
**Resultado Esperado**: 
- Status 403
- Mensagem "Acesso negado"
- Log de tentativa registrado

---

## 6. Cenários de Teste Críticos

### 6.1 Cenário de Integração Completa

**CT-INT-001: Fluxo Completo de Venda**
1. **Pré-condição**: 
   - Usuário vendedor autenticado
   - Produto com estoque 20 unidades
   - Cliente identificado

2. **Passos**:
   - Consultar produto disponível
   - Verificar preço e estoque
   - Registrar movimentação de saída (venda)
   - Confirmar atualização de estoque
   - Gerar comprovante/relatório

3. **Validações**:
   - Produto encontrado corretamente
   - Estoque suficiente confirmado
   - Movimentação criada com sucesso
   - Estoque atualizado para 15 unidades
   - Log de venda registrado
   - Dados do vendedor corretos

**CT-INT-002: Fluxo de Reposição de Estoque**
1. **Pré-condição**:
   - Produto com estoque baixo (abaixo do mínimo)
   - Usuário estoquista autenticado
   - Fornecedor cadastrado

2. **Passos**:
   - Consultar produtos com estoque baixo
   - Selecionar produto para reposição
   - Registrar entrada de mercadoria
   - Confirmar recebimento
   - Atualizar estoque

3. **Validações**:
   - Alert de estoque baixo funcionando
   - Entrada registrada corretamente
   - Estoque atualizado acima do mínimo
   - Custo médio recalculado (se aplicável)
   - Log de entrada criado

### 6.2 Cenários de Falha e Recuperação

**CT-FAIL-001: Falha na Conexão com Banco**
1. **Simulação**: Desconectar banco durante operação
2. **Resultado Esperado**:
   - Erro tratado graciosamente
   - Mensagem amigável ao usuário
   - Dados não corrompidos
   - Reconexão automática

**CT-FAIL-002: Concorrência em Movimentações**
1. **Simulação**: Dois usuários alterando mesmo produto simultaneamente
2. **Resultado Esperado**:
   - Controle de concorrência funciona
   - Dados consistentes
   - Segundo usuário recebe erro apropriado

**CT-FAIL-003: Falha Parcial em Operação em Lote**
1. **Simulação**: Erro em um produto de uma movimentação múltipla
2. **Resultado Esperado**:
   - Transação completamente revertida
   - Nenhum produto processado
   - Estado anterior mantido

---

## 7. Testes de Performance

### 7.1 Testes de Carga

**TP-001: Consulta de Produtos (Carga Normal)**
- **Usuários Simultâneos**: 10
- **Operação**: GET /api/produtos
- **Duração**: 5 minutos
- **Critério**: Tempo médio < 2 segundos

**TP-002: Consulta de Produtos (Carga Máxima)**
- **Usuários Simultâneos**: 30
- **Operação**: GET /api/produtos
- **Duração**: 10 minutos
- **Critério**: 95% requests < 2 segundos

**TP-003: Movimentações Simultâneas**
- **Usuários Simultâneos**: 15
- **Operação**: POST /api/movimentacoes
- **Produtos Diferentes**: Evitar conflitos
- **Critério**: Sucesso 100%, tempo < 3 segundos

### 7.2 Testes de Stress

**TP-004: Limite de Usuários**
- **Objetivo**: Encontrar ponto de quebra
- **Método**: Aumentar usuários gradualmente
- **Monitorar**: CPU, Memória, Tempo de resposta
- **Critério**: Sistema deve degradar graciosamente

**TP-005: Volume de Dados**
- **Produtos**: 10.000 registros
- **Movimentações**: 100.000 registros
- **Usuários**: 1.000 registros
- **Operação**: Consultas complexas com filtros
- **Critério**: Performance dentro dos limites

### 7.3 Testes de Capacidade

**TP-006: Relatórios Complexos**
- **Operação**: Relatório de movimentações (1 ano)
- **Dados**: 50.000+ movimentações
- **Filtros**: Múltiplos (data, produto, usuário)
- **Critério**: Tempo < 10 segundos

---

## 8. Testes de Segurança

### 8.1 Autenticação e Autorização

**TS-001: Tentativas de Força Bruta**
- **Simulação**: 100 tentativas de login incorretas
- **Resultado Esperado**: 
  - Conta bloqueada temporariamente
  - Logs de segurança criados
  - Rate limiting ativo

**TS-002: Token JWT Inválido**
- **Simulação**: Token modificado/expirado
- **Resultado Esperado**: 
  - Acesso negado (401)
  - Nenhuma operação executada

**TS-003: Escalação de Privilégios**
- **Simulação**: Usuário comum tentando operações de admin
- **Resultado Esperado**: 
  - Acesso negado (403)
  - Log de tentativa registrado

### 8.2 Validação de Dados

**TS-004: Injeção NoSQL**
- **Simulação**: Payload malicioso em filtros
- **Exemplo**: `{"$where": "this.password"}`
- **Resultado Esperado**: 
  - Entrada sanitizada
  - Operação rejeitada

**TS-005: XSS (Cross-Site Scripting)**
- **Simulação**: Scripts em campos de texto
- **Exemplo**: `<script>alert('xss')</script>`
- **Resultado Esperado**: 
  - Dados escapados/sanitizados
  - Nenhum script executado

**TS-006: Validação de Tamanho**
- **Simulação**: Campos com tamanho excessivo
- **Resultado Esperado**: 
  - Entrada rejeitada
  - Mensagem de erro apropriada

### 8.3 Controle de Acesso

**TS-007: Acesso Direto a Recursos**
- **Simulação**: URL direta sem autenticação
- **Exemplo**: GET /api/usuarios sem token
- **Resultado Esperado**: 
  - Status 401
  - Nenhum dado retornado

**TS-008: Manipulação de IDs**
- **Simulação**: Alterar ID na URL para acessar dados de outros
- **Resultado Esperado**: 
  - Validação de propriedade
  - Acesso negado se não autorizado

---

## 9. Matriz de Rastreabilidade

| Requisito | Casos de Teste | Prioridade | Status |
|-----------|---------------|------------|--------|
| RF-001 | CT-PROD-001 a CT-PROD-012 | Alta | ⏳ |
| RF-002 | CT-PROD-002, CT-PROD-003, CT-PROD-010 | Alta | ⏳ |
| RF-003 | CT-MOV-001 a CT-MOV-010 | Alta | ⏳ |
| RF-004 | CT-MOV-001, CT-MOV-002, CT-MOV-008 | Alta | ⏳ |
| RF-005 | *Não implementado* | Baixa | ❌ |
| RF-006 | CT-PROD-009 | Média | ⏳ |
| RF-007 | *Não implementado* | Baixa | ❌ |
| RF-008 | CT-PROD-007, CT-PROD-008 | Média | ⏳ |
| RF-009 | CT-MOV-005 a CT-MOV-007, CT-MOV-010 | Média | ⏳ |
| RF-010 | CT-MOV-010 | Média | ⏳ |
| RF-011 | CT-MOV-010 | Média | ⏳ |
| RF-012 | CT-MOV-008 | Média | ⏳ |
| RNF-001 | Testes manuais de UI | Média | ⏳ |
| RNF-002 | Testes de usabilidade | Baixa | ⏳ |
| RNF-003 | TP-002 | Alta | ⏳ |
| RNF-004 | TP-001, TP-002 | Alta | ⏳ |
| RNF-005 | TP-006 | Alta | ⏳ |
| RNF-006 | CT-PERM-001 a CT-PERM-004 | Alta | ⏳ |
| RNF-007 | TS-001, TS-002 | Alta | ⏳ |
| RNF-008 | Testes de disponibilidade | Média | ⏳ |
| RNF-009 | Testes de backup | Média | ⏳ |

**Legenda**: ✅ Concluído | ⏳ Pendente | ❌ Não aplicável

**Observações importantes**:
- Sistema **NÃO** implementa categorização automática por valor (A, B, C)
- Sistema **NÃO** implementa notificações automáticas por email
- Sistema **POSSUI** funcionalidades de grupos e permissões não documentadas
- Sistema **POSSUI** sistema de logs e auditoria implementado
- Modelo de dados difere da documentação em alguns campos

---

## 10. Cronograma de Execução

### Fase 1: Testes Unitários (Semana 1-2)
- ✅ Configuração do ambiente de testes
- ✅ Testes de modelos (validações)
- ✅ Testes de utilitários
- ✅ Testes de middleware

### Fase 2: Testes de Integração (Semana 3-4)
- ⏳ Testes de controllers
- ⏳ Testes de rotas
- ⏳ Testes de autenticação
- ⏳ Testes de autorização

### Fase 3: Testes de Sistema (Semana 5-6)
- ⏳ Fluxos end-to-end
- ⏳ Cenários críticos
- ⏳ Testes de integração entre módulos
- ⏳ Validação de regras de negócio

### Fase 4: Testes de Performance (Semana 7)
- ⏳ Testes de carga
- ⏳ Testes de stress
- ⏳ Otimizações necessárias

### Fase 5: Testes de Segurança (Semana 8)
- ⏳ Testes de penetração
- ⏳ Validação de entrada
- ⏳ Testes de autorização
- ⏳ Auditoria de segurança

### Fase 6: Testes de Aceitação (Semana 9)
- ⏳ Testes com usuários finais
- ⏳ Validação de requisitos
- ⏳ Testes de usabilidade
- ⏳ Documentação final

---

## Anexos

### Anexo A: Dados de Teste

#### Usuários de Teste
```json
[
  {
    "nome_usuario": "Admin Sistema",
    "email": "admin@teste.com",
    "matricula": "ADM001",
    "senha": "123456",
    "perfil": "administrador"
  },
  {
    "nome_usuario": "Gerente Estoque",
    "email": "gerente@teste.com", 
    "matricula": "GER001",
    "perfil": "gerente"
  },
  {
    "nome_usuario": "João Estoquista",
    "email": "joao@teste.com",
    "matricula": "EST001", 
    "perfil": "estoquista"
  }
]
```

#### Produtos de Teste
```json
[
  {
    "nome_produto": "Pastilha Freio Dianteira",
    "codigo_produto": "PFD001",
    "preco": 89.90,
    "custo": 45.00,
    "categoria": "Freios",
    "estoque": 25,
    "estoque_min": 5
  },
  {
    "nome_produto": "Amortecedor Traseiro",
    "codigo_produto": "AMT001", 
    "preco": 1200.00,
    "custo": 800.00,
    "categoria": "Suspensão",
    "estoque": 8,
    "estoque_min": 3
  },
  {
    "nome_produto": "Filtro de Óleo",
    "codigo_produto": "FO001",
    "preco": 25.90,
    "custo": 12.00,
    "categoria": "Filtros", 
    "estoque": 50,
    "estoque_min": 10
  }
]
```

### Anexo B: Scripts de Teste

#### Setup de Ambiente
```bash
# Instalar dependências de teste
npm install --save-dev jest supertest

# Configurar banco de teste
export NODE_ENV=test
export MONGODB_TEST_URI=mongodb://localhost:27017/gestao_estoque_test

# Executar testes
npm test
npm run test:coverage
```

#### Limpeza de Dados
```javascript
// scripts/test-cleanup.js
const mongoose = require('mongoose');

async function cleanupTestData() {
  await mongoose.connection.db.dropDatabase();
  console.log('Test database cleaned');
}
```

---

**Responsável pelo Plano**: Equipe de QA  
**Data de Criação**: Janeiro 2025  
**Versão**: 1.0  
**Próxima Revisão**: Após cada sprint

---

*Este plano de testes é um documento vivo e deve ser atualizado conforme o sistema evolua e novos requisitos sejam identificados.*
