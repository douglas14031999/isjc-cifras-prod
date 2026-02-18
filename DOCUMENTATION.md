# 🎵 ISJC-Cifras - Sistema Completo de Gerenciamento Musical

## 📋 Visão Geral do Projeto

**ISJC-Cifras** é uma plataforma web moderna e completa para gerenciamento de cifras musicais, escalas de músicos, repertórios e administração de ministérios de louvor. Desenvolvido com tecnologias de ponta, oferece uma experiência premium tanto para músicos quanto para administradores.

---

## 🏗️ Arquitetura Técnica

### Stack Principal
- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estilização**: Tailwind CSS v4 + Design System "Pro Max++"
- **Animações**: Framer Motion
- **UI Components**: Shadcn/ui + Radix UI
- **Testes**: Vitest + React Testing Library

### Padrões de Design
- **Design System**: "Pro Max++" - Estética premium com glassmorphism, micro-interações e paleta Zinc/Slate
- **Responsividade**: Mobile-first com breakpoints otimizados
- **Acessibilidade**: WCAG 2.1 AA compliant
- **Performance**: Core Web Vitals otimizados, lazy loading, code splitting

---

## 🎯 Funcionalidades Principais

### 1. 🔐 Autenticação e Onboarding

#### `/login` - Página de Login
- Login com email/senha via Supabase Auth
- Validação em tempo real com feedback visual
- Redirecionamento inteligente pós-login
- Design minimalista com gradientes sutis

#### `/register` - Registro de Usuários
- Criação de conta com validação de campos
- **Opção 1**: Entrar em ministério existente (código de 8 caracteres)
- **Opção 2**: Criar novo ministério automaticamente
- Sistema de convites com códigos únicos
- Verificação de email duplicado

#### `/deactivated` - Conta Desativada
- Página informativa para usuários desativados
- Instruções para reativação via administrador
- Design empático e profissional

---

### 2. 📊 Dashboard Principal

#### `/dashboard` - Central de Comando
**Visão Geral:**
- Cards estatísticos com animações de entrada
- Contadores de cifras, membros e favoritos
- Lista de cifras recentes com preview
- Busca em tempo real com debounce
- Filtros por favoritos e autor

**Componentes:**
- **Sidebar**: Navegação principal com ícones e badges
- **Stats Cards**: Métricas visuais com gradientes
- **Quick Actions**: Botões de ação rápida (Nova Cifra, Novo Repertório)
- **Recent Activity**: Timeline de atividades recentes

**Funcionalidades:**
- ⭐ Sistema de favoritos com toggle instantâneo
- 🔍 Busca fuzzy com destaque de resultados
- 📱 Layout responsivo com menu mobile
- 🎨 Modo escuro/claro automático

---

### 3. 🎼 Gerenciamento de Cifras

#### `/chords` - Lista de Cifras
**Recursos:**
- Tabela sortável por título, artista, tom, autor
- Busca global com filtros avançados
- Indicadores visuais de favoritos
- Ações rápidas (Visualizar, Editar, Deletar)
- Paginação inteligente

**Informações Exibidas:**
- Título da música
- Artista/Compositor
- Tom original
- Autor da cifra
- Status de favorito
- Data de criação

#### `/chords/[id]` - Visualizador de Cifras (⭐ DESTAQUE)
**Interface Premium:**
- **Toolbar Flutuante**: Controles sempre acessíveis
  - Transposição de tom (+/- semitons)
  - Ajuste de tamanho de fonte (12-32px)
  - Toggle de colunas (1 ou 2)
  - **🆕 Modo Graus Harmônicos** (Notas ↔ Graus Romanos)
  - Auto-scroll com velocidade ajustável (1-10)
  - Favoritar/Desfavoritar
  - Imprimir (otimizado para A4)

**Visualização de Acordes:**
- Detecção automática de acordes via regex robusto
- Destaque visual com cores e bordas
- Suporte a acordes complexos (7M, sus4, dim, aug, slash chords)
- Fonte monoespaçada para alinhamento perfeito

**🎨 Modo Graus Harmônicos (EXCLUSIVO):**
- **Conversão Inteligente**: Transforma acordes em graus romanos (I, IIm, V7, etc.)
- **Paleta de Cores Funcional**:
  - 🔵 **I e VI** (Azul) - Tônica e Relativa
  - 🟢 **II e IV** (Verde) - Subdominante
  - 🔴 **III e V** (Vermelho) - Dominante
  - ⚪ **VII°** (Cinza) - Diminuto
- **Negrito Pro Max**: Fonte ultra-bold para máxima legibilidade
- **Bordas Adaptativas**: Contornos coloridos coordenados
- **Transposição Dinâmica**: Graus se ajustam automaticamente ao tom

**Auto-Scroll:**
- Velocidade configurável (15-150 px/s)
- Controles de play/pause
- Ajuste fino em tempo real
- Botão "Voltar ao Topo" flutuante

**Impressão Otimizada:**
- Layout A4 profissional
- Header estilo "Cifra Club" com logo
- Metadados (Tom, Capo, Data/Hora)
- Suporte a 1 ou 2 colunas
- Paginação automática
- Footer com contador de páginas

**Mobile:**
- Barra inferior flutuante com controles essenciais
- Gestos otimizados
- Botões grandes para toque preciso

#### `/chords/new` - Criar Nova Cifra
**Editor Completo:**
- Campos: Título, Artista, Tom Original, Letra/Cifra
- Preview em tempo real lado a lado
- Detecção automática de acordes
- Validação de campos obrigatórios
- Salvamento com feedback visual

#### `/chords/[id]/edit` - Editar Cifra
- Mesma interface do criador
- Pré-preenchimento de dados
- Controle de permissões (apenas autor)
- Histórico de alterações (futuro)

---

### 4. 📚 Repertórios

#### `/repertoires` - Lista de Repertórios
**Organização:**
- Cards visuais com gradientes
- Contador de músicas por repertório
- Ações: Visualizar, Editar, Deletar
- Criação rápida de novo repertório

#### `/repertoires/[id]` - Visualizar Repertório
**Detalhes:**
- Lista completa de músicas
- Informações de tom e artista
- Botão "Visualizar Cifra" direto
- Adicionar/Remover músicas
- Reordenação drag-and-drop (futuro)

**Integração com Escalas:**
- Vinculação automática com eventos
- Sugestão de transposição por músico
- Exportação para PDF/WhatsApp

#### `/repertoires/new` - Criar Repertório
- Nome do repertório
- Descrição opcional
- Seleção múltipla de cifras
- Tags e categorias (futuro)

---

### 5. 📅 Escalas e Agendamentos

#### `/schedules` - Gerenciamento de Escalas (⭐ DESTAQUE)
**Interface Timeline:**
- **Calendário Lateral**: 
  - Seleção de data
  - Indicadores visuais de eventos (dots coloridos)
  - Navegação mês a mês
  
- **Agenda Principal**:
  - Layout em timeline fluida
  - Cards de eventos com animações Framer Motion
  - Indicadores de tipo (Ensaio, Culto, Reunião)
  - Horário destacado em blocos visuais
  - Link para repertório (quando vinculado)

**Tipos de Eventos:**
- 🔵 **Ensaio** (Azul)
- 🟢 **Culto/Evento** (Esmeralda)
- 🟣 **Reunião** (Índigo)

**Gestão de Músicos:**
- **Grid de Escalados**: Cards individuais por músico
  - Avatar com inicial
  - Nome completo
  - Função/Instrumento
  - Destaque visual se você está escalado
- **Adicionar/Remover**: Interface modal intuitiva
- **Funções**: Guitarra, Baixo, Teclado, Bateria, Vocal, etc.

**Compartilhamento:**
- **Botão "Compartilhar"**: Copia escala formatada para WhatsApp
  - Emojis e formatação markdown
  - Lista de músicos e funções
  - Horário e descrição
  - Pronto para colar no grupo

**Permissões:**
- Administradores: CRUD completo
- Músicos: Visualização apenas

**Empty States:**
- Mensagens inspiracionais
- Ilustrações animadas
- Call-to-action para criar evento

---

### 6. 👥 Gestão de Músicos

#### `/musicians` - Lista de Músicos
**Visualização:**
- Cards com foto de perfil
- Nome e email
- Instrumentos/Funções
- Status (Ativo/Inativo)
- Badges de permissão (Admin, Músico)

**Ações (Admin):**
- Editar perfil
- Ativar/Desativar conta
- Alterar permissões
- Remover do ministério

#### `/musicians/[id]` - Perfil do Músico
- Informações completas
- Histórico de escalas
- Cifras criadas
- Estatísticas de participação

---

### 7. ⚙️ Configurações

#### `/settings` - Configurações do Usuário
**Abas:**
1. **Perfil**:
   - Nome completo
   - Email (não editável)
   - Foto de perfil
   - Bio/Descrição
   - Instrumentos

2. **Ministério**:
   - Nome do ministério
   - Código de convite
   - Membros ativos
   - Configurações gerais

3. **Preferências**:
   - Tema (Claro/Escuro/Auto)
   - Notificações
   - Idioma
   - Tamanho de fonte padrão

#### `/profile` - Perfil Público
- Visualização pública do perfil
- Cifras criadas
- Repertórios compartilhados

---

### 8. 👑 Painel Administrativo

#### `/admin` - Dashboard Admin
**Métricas:**
- Total de usuários
- Cifras cadastradas
- Eventos agendados
- Atividade recente

**Ferramentas:**
- Gestão de usuários em massa
- Logs de auditoria
- Backup de dados
- Configurações avançadas

**Permissões:**
- Apenas usuários com role "admin"
- Middleware de proteção
- Logs de ações administrativas

---

### 9. 🎯 Favoritos

#### `/favorites` - Minhas Cifras Favoritas
- Lista filtrada de cifras favoritadas
- Mesma interface da lista principal
- Acesso rápido às músicas mais usadas
- Sincronização em tempo real

---

## 🔒 Segurança e Permissões

### Row Level Security (RLS)
**Políticas Implementadas:**
- `ministries`: Usuários veem apenas seu ministério
- `profiles`: Usuários veem apenas perfis do mesmo ministério
- `chords`: Compartilhamento dentro do ministério
- `favorites`: Privacidade individual
- `events`: Visualização por ministério, edição por admin
- `event_assignments`: Vinculado a eventos

### Middleware de Autenticação
- Proteção de rotas privadas
- Redirecionamento automático
- Refresh de sessão
- Verificação de permissões

### Validação de Dados
- Zod schemas para validação
- Sanitização de inputs
- Proteção contra SQL injection
- XSS prevention

---

## 🎨 Design System "Pro Max++"

### Princípios
1. **Sem Roxo/Violeta**: Paleta focada em Azul, Verde, Vermelho, Zinc
2. **Glassmorphism**: Efeitos de vidro com backdrop-blur
3. **Micro-interações**: Animações sutis em hover/focus
4. **Hierarquia Visual**: Uso estratégico de peso, cor e espaçamento
5. **Densidade de Informação**: Máximo de dados sem poluição visual

### Paleta de Cores
- **Primary**: Blue-600 (Ações principais)
- **Success**: Emerald-600 (Confirmações)
- **Danger**: Red-600 (Alertas)
- **Neutral**: Zinc-50 a Zinc-950 (Backgrounds e textos)
- **Accent**: Amber-500 (Favoritos, destaques)

### Tipografia
- **Headings**: Font-black, tracking-tight
- **Body**: Font-medium, leading-relaxed
- **Mono**: Acordes e códigos
- **Labels**: Font-bold, uppercase, tracking-widest

### Componentes Customizados
- **Cards Premium**: Bordas sutis, sombras profundas, hover lift
- **Buttons**: Rounded-xl, estados bem definidos
- **Inputs**: Focus rings coloridos, validação inline
- **Badges**: Cores semânticas, tamanhos variados
- **Toasts**: Shadcn toast system com animações

---

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Adaptações Mobile
- Menu hamburguer
- Barras flutuantes inferiores
- Cards empilhados
- Fontes ajustadas
- Touch targets maiores (min 44x44px)

---

## 🧪 Testes

### Cobertura
- **Unitários**: Componentes UI, utilitários
- **Integração**: Fluxos de página, Server Actions
- **E2E**: Jornadas críticas (futuro)

### Executar Testes
```bash
npm test              # Rodar todos
npm test -- --watch   # Modo watch
npm test -- --coverage # Com cobertura
```

---

## 🚀 Deploy e Infraestrutura

### Ambiente de Produção
- **Hospedagem**: Vercel
- **Banco de Dados**: Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network
- **SSL**: Automático

### Variáveis de Ambiente
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### CI/CD
- Deploy automático no push para `main`
- Preview deployments em PRs
- Testes automáticos no pipeline

---

## 📊 Métricas e Analytics (Futuro)

- **Cifras mais acessadas**
- **Músicos mais escalados**
- **Repertórios mais usados**
- **Tempo médio de sessão**
- **Taxa de conversão de favoritos**

---

## 🔮 Roadmap

### Curto Prazo
- [ ] Notificações push para escalas
- [ ] Integração com Google Calendar
- [ ] Exportação de repertórios para PDF
- [ ] Sistema de comentários em cifras

### Médio Prazo
- [ ] App mobile nativo (React Native)
- [ ] Modo offline com sync
- [ ] Gravação de áudios de referência
- [ ] Metrônomo integrado

### Longo Prazo
- [ ] IA para sugestão de acordes
- [ ] Transcrição automática de áudio
- [ ] Marketplace de cifras premium
- [ ] Integração com Spotify/YouTube

---

## 👥 Contribuindo

### Como Contribuir
1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Padrões de Código
- ESLint + Prettier configurados
- Commits semânticos (Conventional Commits)
- TypeScript strict mode
- Testes obrigatórios para novas features

---

## 📄 Licença

MIT License - Livre para uso pessoal e comercial.

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ para músicos de ministérios de louvor que desejam uma ferramenta profissional e moderna para gerenciar suas atividades musicais.

**Versão**: 2.0.0  
**Última Atualização**: Fevereiro 2026  
**Autor**: Equipe ISJC-Cifras
