# ISJC-Cifras - Gerenciador de Cifras Musicais

Aplicação web para gerenciamento de cifras musicais para ministérios de louvor.

## 🚀 Tecnologias

- **Next.js 15** (App Router)
- **TypeScript**
- **Supabase** (PostgreSQL + Auth)
- **Tailwind CSS v4**
- **Framer Motion**

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais do Supabase

# Executar em desenvolvimento
npm run dev
```

## 🔑 Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

## ✨ Funcionalidades

- ✅ Autenticação com Supabase Auth
- ✅ Dashboard com busca de cifras
- ✅ Editor de cifras com preview em tempo real
- ✅ Transposição de tons (+1/-1 semitom)
- ✅ Sistema de favoritos
- ✅ Compartilhamento entre músicos do mesmo ministério
- ✅ RLS (Row Level Security) para isolamento de dados
- ✅ Design responsivo (mobile-first)

## 📖 Como Usar

1. **Criar conta**: Acesse `/register` e crie sua conta
2. **Entrar em um ministério**: Use o código **`9CZUJE5E`** (Ministério de Louvor ISJC) ou deixe em branco para criar um novo
3. **Adicionar cifras**: Clique em "Nova Cifra" e preencha os dados
4. **Transpor tons**: Na visualização da cifra, use os botões +1/-1
5. **Favoritar**: Clique na ⭐ para marcar como favorito

## 🗄️ Schema do Banco

- `ministries` - Ministérios/grupos
- `profiles` - Perfis de usuários
- `chords` - Cifras musicais
- `favorites` - Favoritos dos usuários

## 🔒 Segurança

- Row Level Security (RLS) em todas as tabelas
- Middleware de proteção de rotas
- Isolamento de dados por ministério
- Apenas autores podem editar/deletar suas cifras

## 🧪 Testes Automatizados

O projeto conta com uma suíte de testes unitários e de integração utilizando **Vitest** e **React Testing Library**.

### Executando os testes

```bash
# Rodar todos os testes
npm test

# Rodar testes em modo watch (desenvolvimento)
npm test -- --watch

# Rodar testes com cobertura
npm test -- --coverage
```

### Escopo dos Testes

- **Unitários**: Componentes de UI (Logo, Buttons), Utilitários.
- **Backend**: Server Actions (`createMinistry`) com mocks do Supabase.
- **Integração**: Fluxos de página (Login, Dashboard).

Consulte o arquivo [TEST_PLAN.md](./TEST_PLAN.md) para mais detalhes sobre a estratégia de testes.

## 📱 Deploy

### Vercel

```bash
vercel
```

Configure as variáveis de ambiente na Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📄 Licença

MIT

## 👥 Autor

Desenvolvido para músicos de ministérios de louvor.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
