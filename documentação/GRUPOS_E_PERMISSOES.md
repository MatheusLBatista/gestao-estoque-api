# Sistema de Grupos e Permissões 👥🔐

## 📋 Visão Geral

O sistema implementa um controle de acesso baseado em **perfis** e **grupos**, onde cada usuário:

- Possui um **perfil** (administrador, gerente, estoquista)
- É automaticamente associado a um **grupo de permissões** baseado no perfil
- Pode ter **permissões individuais** que sobrescrevem as do grupo

---

## 🎯 Perfis e Grupos Padrão

### Mapeamento Automático

| Perfil          | Grupo Associado   | Descrição                                                    |
| --------------- | ----------------- | ------------------------------------------------------------ |
| `administrador` | **Administrador** | Acesso TOTAL a todas as rotas e operações                    |
| `gerente`       | **Gerente**       | Acesso de gerenciamento (produtos, fornecedores, relatórios) |
| `estoquista`    | **Estoquista**    | Acesso básico apenas para consulta                           |

---

## ⚙️ Funcionamento Automático

### 1️⃣ Ao Cadastrar Usuário

```json
// Requisição
POST /usuarios
{
  "nome_usuario": "João Silva",
  "email": "joao@empresa.com",
  "matricula": "GER0001",
  "telefone": "(69) 99999-9999",
  "perfil": "gerente"
  // ⚠️ Não precisa enviar "grupos" - é automático!
}

// O sistema automaticamente:
// 1. Identifica o perfil: "gerente"
// 2. Busca o grupo "Gerente" no banco
// 3. Adiciona o usuário ao grupo
// 4. Retorna o usuário com grupos: ["<id_do_grupo_gerente>"]
```

### 2️⃣ Ao Atualizar Perfil

```json
// Requisição
PATCH /usuarios/GER0001
{
  "perfil": "administrador"
  // ⚠️ Ao mudar o perfil, o grupo é atualizado automaticamente!
}

// O sistema automaticamente:
// 1. Detecta mudança de perfil: gerente → administrador
// 2. Busca o grupo "Administrador"
// 3. Substitui o grupo antigo pelo novo
// 4. Retorna o usuário com o novo grupo
```

---

## 🔒 Permissões dos Grupos

### Grupo: Administrador

```javascript
✅ TODAS as rotas
✅ TODAS as operações (GET, POST, PUT, PATCH, DELETE)

Rotas incluídas:
- produtos ✅ (Todas operações)
- fornecedores ✅ (Todas operações)
- usuarios ✅ (Todas operações)
- grupos ✅ (Todas operações)
- movimentacoes ✅ (Todas operações)
- logs ✅ (Todas operações)
- dashboard ✅ (Todas operações)
- auth ✅ (Todas operações)
- ... e outras 9+ rotas
```

### Grupo: Gerente

```javascript
✅ Produtos (GET, POST, PUT, PATCH) - ❌ DELETE
✅ Fornecedores (GET, POST, PUT, PATCH) - ❌ DELETE
✅ Movimentações (GET, POST, PUT, PATCH) - ❌ DELETE
✅ Usuários (apenas GET - consulta) - ❌ Criar/Editar/Deletar
✅ Dashboard (apenas GET)
```

### Grupo: Estoquista

```javascript
✅ Produtos (apenas GET - consulta)
✅ Fornecedores (apenas GET - consulta)
✅ Movimentações (apenas GET - consulta)
❌ Usuários (sem acesso)
✅ Dashboard (apenas GET)
```

---

## 💡 Exemplos de Uso

### Exemplo 1: Criar Estoquista

```bash
curl -X POST http://localhost:5011/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token_admin>" \
  -d '{
    "nome_usuario": "Maria Santos",
    "email": "maria@empresa.com",
    "matricula": "EST0001",
    "telefone": "(69) 98888-8888",
    "perfil": "estoquista"
  }'

# ✅ Resultado: Maria será automaticamente adicionada ao grupo "Estoquista"
# ✅ Terá apenas permissões de consulta (GET)
```

### Exemplo 2: Promover Estoquista para Gerente

```bash
curl -X PATCH http://localhost:5011/usuarios/EST0001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token_admin>" \
  -d '{
    "perfil": "gerente"
  }'

# ✅ Resultado: Maria sai do grupo "Estoquista"
# ✅ É automaticamente adicionada ao grupo "Gerente"
# ✅ Ganha permissões de criar/editar produtos e fornecedores
```

### Exemplo 3: Criar Admin

```bash
curl -X POST http://localhost:5011/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token_admin>" \
  -d '{
    "nome_usuario": "Carlos Admin",
    "email": "carlos@empresa.com",
    "matricula": "ADM0002",
    "telefone": "(69) 97777-7777",
    "perfil": "administrador"
  }'

# ✅ Resultado: Carlos será automaticamente adicionado ao grupo "Administrador"
# ✅ Terá TODAS as permissões do sistema
```

---

## 🔧 Configuração Avançada

### Permissões Individuais (Opcional)

Caso precise dar permissões específicas a um usuário **sem mudar o grupo**:

```json
PATCH /usuarios/EST0001
{
  "permissoes": [
    {
      "rota": "produtos",
      "dominio": "localhost",
      "ativo": true,
      "buscar": true,
      "enviar": true,    // Permite criar produtos
      "modificar": true  // Permite editar produtos
    }
  ]
}

// ⚠️ Estas permissões SOBRESCREVEM as do grupo para esta rota
```

### Adicionar a Grupos Extras (Opcional)

```json
POST /usuarios/grupos/adicionar
{
  "usuario_id": "<id_do_usuario>",
  "grupo_id": "<id_do_grupo_especial>"
}

// ⚠️ Usuário pode pertencer a múltiplos grupos
// ⚠️ Permissões são mescladas (maior privilégio prevalece)
```

---

## 📝 Logs e Auditoria

Todas as operações são logadas:

```javascript
// Ao criar usuário
console.log("✅ Perfil 'gerente' → Grupo 'Gerente' (<grupo_id>)");
console.log(
  "✅ Usuário será adicionado automaticamente ao grupo do perfil 'gerente'"
);

// Ao atualizar perfil
console.log("✅ Grupo atualizado automaticamente para perfil 'administrador'");

// Se grupo não existir
console.warn("⚠️  Grupo 'Gerente' não encontrado para perfil 'gerente'");
```

---

## ⚠️ Importante

1. **Os grupos devem ser criados via seed primeiro:**

   ```bash
   npm run seed
   ```

2. **Nomes dos grupos são case-sensitive:**

   - ✅ "Administrador" (correto)
   - ❌ "administrador" (não funciona)

3. **O campo `perfil` no usuário deve ser:**

   - `"administrador"` (minúsculo)
   - `"gerente"` (minúsculo)
   - `"estoquista"` (minúsculo)

4. **Hierarquia de permissões:**
   ```
   Permissões Individuais > Permissões do Grupo > Sem Permissão
   ```

---

## 🐛 Troubleshooting

### Usuário criado sem grupo

**Causa:** Grupo não existe no banco  
**Solução:** Execute `npm run seed` para criar os grupos padrão

### Usuário não tem permissões esperadas

**Causa:** Perfil não corresponde aos grupos existentes  
**Solução:** Verifique se o perfil está correto (`administrador`, `gerente`, `estoquista`)

### Erro ao atualizar perfil

**Causa:** Grupo correspondente não existe  
**Solução:** Verifique os grupos no banco com:

```javascript
db.grupos.find({ ativo: true }, { nome: 1 });
```

---

## 📊 Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────┐
│  Admin cria usuário com perfil "gerente"            │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Sistema identifica perfil → "gerente"              │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Busca grupo "Gerente" no banco                     │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Adiciona grupo ao array grupos: ["<grupo_id>"]     │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  Usuário criado com permissões do grupo "Gerente"   │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Conclusão

O sistema agora:

- ✅ Associa automaticamente grupos por perfil
- ✅ Atualiza grupos quando perfil muda
- ✅ Valida matrícula e email duplicados
- ✅ Mantém logs detalhados
- ✅ Permite permissões individuais customizadas
- ✅ Suporta múltiplos grupos por usuário
