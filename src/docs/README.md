# Refatoração da Documentação Swagger

## 📁 Nova Estrutura

A documentação do Swagger foi completamente refatorada e agora está centralizada na pasta `src/docs/`, seguindo uma estrutura mais organizada e modular.

```
src/docs/
├── index.js                    # Configuração principal do Swagger
├── schemas/                    # Schemas organizados por módulo
│   ├── common.js              # Schemas comuns (respostas, erros, paginação)
│   ├── auth.js                # Schemas de autenticação
│   ├── usuario.js             # Schemas de usuário
│   ├── produto.js             # Schemas de produto
│   ├── fornecedor.js          # Schemas de fornecedor
│   ├── movimentacao.js        # Schemas de movimentação
│   └── grupo.js               # Schemas de grupo
└── routes/                    # Documentação das rotas
    ├── auth.js                # Rotas de autenticação
    ├── usuarios.js            # Rotas de usuários
    ├── produtos.js            # Rotas de produtos
    ├── fornecedores.js        # Rotas de fornecedores
    ├── movimentacoes.js       # Rotas de movimentações
    ├── logs.js                # Rotas de logs
    └── grupos.js              # Rotas de grupos
```

## 🚀 Vantagens da Nova Estrutura

### ✅ **Organização**
- Todo código Swagger centralizado em uma pasta
- Separação clara entre schemas e rotas
- Estrutura modular por funcionalidade

### ✅ **Manutenibilidade**
- Fácil de encontrar e editar documentação
- Sem código Swagger espalhado pelos arquivos de rota
- Reutilização de schemas comuns

### ✅ **Escalabilidade**
- Estrutura preparada para novos módulos
- Facilita adição de novas rotas e schemas
- Sistema de importação modular

### ✅ **Profissionalismo**
- Documentação rica com descrições detalhadas
- Exemplos práticos para cada endpoint
- CSS customizado para melhor apresentação

## 🔧 Como Usar

### Configuração Principal
O arquivo `src/docs/index.js` é o ponto central que:
- Importa todos os schemas e rotas
- Configura o Swagger UI
- Define informações gerais da API
- Aplica estilos customizados

### Adicionando Nova Documentação

#### 1. **Novo Schema**
```javascript
// src/docs/schemas/meuModulo.js
const meuModuloSchemas = {
    MeuModelo: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            nome: { type: 'string' }
        }
    }
};

export default meuModuloSchemas;
```

#### 2. **Nova Rota**
```javascript
// src/docs/routes/meuModulo.js
const meuModuloRoutes = {
    "/api/meu-modulo": {
        get: {
            tags: ["Meu Módulo"],
            summary: "Listar itens",
            responses: {
                200: { description: "Lista retornada" }
            }
        }
    }
};

export default meuModuloRoutes;
```

#### 3. **Atualizar Configuração**
```javascript
// src/docs/index.js
import meuModuloSchemas from "./schemas/meuModulo.js";
import meuModuloRoutes from "./routes/meuModulo.js";

// Adicionar aos schemas e rotas
schemas: {
    ...commonSchemas,
    ...meuModuloSchemas
},
paths: {
    ...authRoutes,
    ...meuModuloRoutes
}
```

## 📚 Funcionalidades Implementadas

### **Sistema de Cadastro sem Senha**
- Documentação completa do novo fluxo
- Exemplos de uso detalhados
- Casos de erro documentados
- Integração com sistema de recuperação

### **Autenticação Robusta**
- Login com validações
- Sistema de refresh tokens
- Recuperação de senha por código
- Primeira definição de senha

### **Schemas Reutilizáveis**
- Respostas padronizadas
- Validações comuns
- Estruturas de paginação
- Tratamento de erros

## 🎨 Personalização Visual

O Swagger UI foi customizado com:
- Remoção da barra superior
- Cores personalizadas
- Favicon customizado
- Layout responsivo

## 📍 Endpoints de Documentação

- **Interface**: `GET /api-docs`
- **JSON Spec**: `GET /api-docs.json`
- **Redirecionamento**: `GET /` → `/api-docs`

## 🔍 Benefícios para Desenvolvedores

1. **Localização Rápida**: Toda documentação em um lugar
2. **Consistência**: Padrões definidos e reutilizáveis
3. **Produtividade**: Menos tempo procurando, mais tempo desenvolvendo
4. **Qualidade**: Documentação rica e detalhada
5. **Colaboração**: Estrutura clara para toda a equipe

## 🚦 Migração Completa

- ✅ Configuração centralizada
- ✅ Schemas organizados
- ✅ Rotas documentadas
- ✅ Sistema de cadastro sem senha
- ✅ Remoção de código Swagger das rotas
- ✅ CSS customizado
- ✅ Estrutura escalável

A documentação agora é mais profissional, organizada e fácil de manter! 🎉
