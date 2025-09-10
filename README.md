# Assist Diretrix Help

Sistema de gerenciamento de chamados e suporte técnico desenvolvido para a Diretrix.

## 📋 Sobre o Projeto

O **Assist Diretrix Help** é uma aplicação web moderna para gerenciamento de chamados de suporte técnico. O sistema permite que usuários criem, visualizem e gerenciem tickets de suporte, com diferentes níveis de acesso para administradores e clientes.

### ✨ Funcionalidades

- **Sistema de Autenticação**: Login seguro com diferentes níveis de acesso
- **Dashboard Administrativo**: Visão geral completa dos chamados com estatísticas
- **Dashboard do Cliente**: Interface simplificada para clientes
- **Criação de Chamados**: Formulário intuitivo para criação de novos tickets
- **Gerenciamento de Status**: Controle de status dos chamados (Aberto, Em andamento, Concluído)
- **Filtros e Busca**: Sistema avançado de filtros por tipo, status e busca textual
- **Tipos de Chamados**: Suporte para Dúvidas e Bugs
- **Interface Responsiva**: Design moderno e responsivo para todos os dispositivos

### 🎯 Tipos de Usuários

- **Administradores**: Acesso completo ao sistema, visualização de todos os chamados e gerenciamento
- **Clientes**: Criação de chamados e visualização do próprio dashboard

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Roteamento**: React Router DOM
- **Estado**: React Context API
- **Formulários**: React Hook Form + Zod
- **Ícones**: Lucide React
- **Storage**: LocalStorage (para demonstração)

## 📦 Instalação e Execução

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

### Passos para instalação

1. **Clone o repositório**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd assist-diretrix-help
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Execute o projeto em modo de desenvolvimento**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. **Acesse a aplicação**
   Abra seu navegador e acesse `http://localhost:5173`

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run build:dev` - Gera build de desenvolvimento
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter ESLint

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de UI (shadcn/ui)
│   ├── AdminRoute.tsx  # Rota protegida para administradores
│   └── ProtectedRoute.tsx # Rota protegida para usuários autenticados
├── context/            # Contextos React
│   └── AuthContext.tsx # Contexto de autenticação
├── hooks/              # Hooks customizados
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação
│   ├── Dashboard.tsx   # Dashboard administrativo
│   ├── ClientDashboard.tsx # Dashboard do cliente
│   ├── CreateTicket.tsx # Criação de chamados
│   ├── TicketDetails.tsx # Detalhes do chamado
│   ├── Login.tsx       # Página de login
│   └── NotFound.tsx    # Página 404
├── types/              # Definições de tipos TypeScript
│   └── ticket.ts       # Tipos relacionados aos tickets
└── assets/             # Recursos estáticos
```

## 🔐 Sistema de Autenticação

O sistema utiliza um contexto de autenticação simples baseado em localStorage para demonstração. Em um ambiente de produção, recomenda-se integrar com um backend real e sistema de autenticação robusto.

### Credenciais de Demonstração

- **Administrador**: 
  - Usuário: `admin`
  - Senha: `admin123`

- **Cliente**: 
  - Usuário: `cliente`
  - Senha: `cliente123`

## 📱 Responsividade

A aplicação foi desenvolvida com foco na responsividade, funcionando perfeitamente em:
- 📱 Dispositivos móveis
- 📱 Tablets
- 💻 Desktops
- 🖥️ Telas grandes

## 🎨 Design System

O projeto utiliza o **shadcn/ui** como base para os componentes, garantindo:
- Consistência visual
- Acessibilidade
- Customização fácil
- Performance otimizada

## 🚀 Deploy

Para fazer deploy da aplicação:

1. **Gere o build de produção**
   ```bash
   npm run build
   ```

2. **Os arquivos estarão na pasta `dist/`**

3. **Faça upload para seu servidor de hospedagem**

### Plataformas Recomendadas

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas sobre o projeto, entre em contato através dos canais oficiais da Diretrix.

---

**Desenvolvido com ❤️ para a Diretrix**