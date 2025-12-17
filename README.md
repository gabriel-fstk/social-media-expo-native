# Social Feed - Clone do Instagram

Aplicação mobile inspirada no Instagram, desenvolvida com React Native e Expo. Conecta-se à API em https://simple-api-ngvw.onrender.com para gerenciamento de usuários e posts.

## Funcionalidades Implementadas

### Autenticação
- **Cadastro de Usuário**: Tela para criar nova conta com nome, e-mail e senha (POST /users)
- **Login**: Tela de autenticação com e-mail e senha (POST /login)
- **Persistência**: Token JWT armazenado localmente com AsyncStorage
- **Navegação Protegida**: Rotas protegidas que redirecionam para login quando não autenticado

### Feed de Posts (Estilo Instagram)
- **Feed Principal**: Exibição de posts em formato de feed (GET /posts)
- **Criação de Post**: Formulário para criar post com título e conteúdo (POST /posts)
- **Exclusão de Post**: Apenas o autor pode excluir seus próprios posts (DELETE /posts/{id})
- **Interações**: Botões de curtir, comentar e compartilhar (visual)
- **Paginação**: Carregamento incremental com scroll infinito
- **Pull to Refresh**: Atualização da lista ao puxar para baixo

### Descobrir Usuários
- **Listagem de Usuários**: Exibição de todos os usuários cadastrados (GET /users)
- **Botão Seguir**: Interface para seguir usuários (visual)
- **Paginação**: Carregamento incremental de usuários
- **Pull to Refresh**: Atualização da lista

### Perfil do Usuário
- **Informações**: Avatar, nome, e-mail e data de cadastro
- **Estatísticas**: Posts, seguidores e seguindo (visual)
- **Editar Perfil**: Botão para edição (visual)
- **Logout**: Opção para sair da conta com confirmação

## Design Inspirado no Instagram

- **Paleta de Cores**:
  - Azul Instagram: #0095f6
  - Texto Principal: #262626
  - Texto Secundário: #8e8e8e
  - Bordas: #dbdbdb
  - Vermelho para ações destrutivas: #ed4956

- **Componentes**:
  - Cards de posts com avatar, nome de usuário e timestamp
  - Botões de ação (curtir, comentar, compartilhar, salvar)
  - Avatares circulares coloridos
  - Headers limpos e minimalistas
  - Transições suaves

## Tecnologias Utilizadas

- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma de desenvolvimento
- **Expo Router** - Navegação baseada em arquivos
- **TypeScript** - Tipagem estática
- **Context API** - Gerenciamento de estado global
- **AsyncStorage** - Armazenamento local do token JWT
- **Lucide React Native** - Ícones

## Estrutura do Projeto

```
app/
├── (tabs)/                    # Rotas protegidas (requer autenticação)
│   ├── _layout.tsx           # Layout de tabs com ícones
│   ├── index.tsx             # Feed de posts (estilo Instagram)
│   ├── users.tsx             # Descobrir usuários
│   ├── create-post.tsx       # Criar novo post
│   └── profile.tsx           # Perfil do usuário
├── _layout.tsx               # Layout raiz com AuthProvider
├── index.tsx                 # Rota inicial (redireciona)
├── login.tsx                 # Tela de login
└── register.tsx              # Tela de cadastro

contexts/
└── AuthContext.tsx           # Context de autenticação

services/
└── api.ts                    # Cliente da API com todos os endpoints
```

## Instalação e Execução

1. Instalar dependências:
```bash
npm install
```

2. Iniciar o servidor de desenvolvimento:
```bash
npm run dev
```

3. Executar typecheck:
```bash
npm run typecheck
```

## Endpoints da API

A aplicação consome os seguintes endpoints da API:

| Método | Endpoint | Descrição | Autenticação | Formato |
|--------|----------|-----------|--------------|---------|
| GET | /healthcheck | Verificar status da API | Não | - |
| POST | /users | Criar novo usuário (registro) | Não | JSON |
| POST | /login | Autenticar usuário | Não | JSON |
| GET | /users | Listar todos os usuários (paginado) | Sim | JSON |
| GET | /users/{id} | Buscar usuário por ID | Sim | JSON |
| GET | /posts | Listar todos os posts (paginado) | Não/Sim | JSON |
| POST | /posts | Criar novo post | Sim | JSON |
| DELETE | /posts/{id} | Excluir post | Sim | - |

**Nota**: O endpoint POST /posts aceita apenas JSON com `title` e `content`. Não há upload de imagem.

## Fluxo de Navegação

1. **Não Autenticado**: Usuário é redirecionado para a tela de login
2. **Login/Cadastro**: Após autenticação, usuário é redirecionado para os tabs
3. **Tabs**:
   - **Feed**: Visualizar posts de todos os usuários
   - **Descobrir**: Ver lista de usuários cadastrados
   - **Novo Post**: Criar novo post com título e conteúdo
   - **Perfil**: Ver informações pessoais e fazer logout
4. **Logout**: Retorna para a tela de login

## Segurança

- Token JWT armazenado com segurança no AsyncStorage
- Requisições autenticadas incluem o token no header Authorization
- Validação de propriedade de posts antes de permitir exclusão
- Confirmações para ações destrutivas

## Funcionalidades Visuais

As seguintes funcionalidades estão implementadas visualmente (UI) mas não conectadas a endpoints:
- Curtir posts
- Comentar posts
- Compartilhar posts
- Salvar posts
- Seguir usuários
- Contador de seguidores/seguindo
- Editar perfil

## Screenshots

A interface foi desenhada seguindo os padrões do Instagram:
- Feed com posts em formato de card
- Cabeçalho de post com avatar e informações do usuário
- Botões de ação estilo Instagram
- Perfil com estatísticas e informações
- Lista de usuários com botões de seguir
