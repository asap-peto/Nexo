# NEXUS

App pessoal para acompanhar **sono, estudo, alimentação e treino** — acessível de iPad, celular e
computador, instalável como PWA e hospedado no GitHub Pages. Cada campo mapeia uma ação concreta
já decidida (ex.: "tela desligada 30min antes"), o check-in diário leva menos de 30 segundos, e o
peso é registrado **semanalmente** (nunca diário).

Visual **neobrutalista** em tons de azul: a tela inicial é uma **visão geral** (histórico, stats,
gráficos que traçam relações entre sono/estudo/descanso/treino) com um botão grande que abre a
tela dedicada de **check-in do dia**.

## O que dá pra registrar

- **Sono:** horas, tela desligada 30min antes, li antes de dormir, e se sente descansado.
- **Estudo:** horas e se fez todos os Ankis do dia.
- **Alimentação:** se comeu conforme o planejado (sem julgamento, sem contagem de calorias).
- **Treino:** vários por dia — minutos, calorias queimadas e estilo (musculação, natação, corrida
  ou outro). *(Calorias aqui são as QUEIMADAS no treino — não é contagem de dieta.)*
- **Peso:** semanal.
- **Receitas:** lista curada embutida + você pode **adicionar, editar e excluir as suas próprias**.

## Stack

- React + TypeScript + Vite
- Supabase (Postgres gerenciado, plano gratuito) para sincronizar os 3 dispositivos
- PWA (manifest + service worker) instalável na tela de início do iPad/iPhone/Android
- Deploy estático via GitHub Actions → GitHub Pages

## Rodar localmente

```bash
npm install
npm run dev
```

Sem as variáveis do Supabase (abaixo), o app roda em **modo local**: os dados ficam só no
`localStorage` daquele navegador, sem sincronização. Útil para testar a UI. Ao preencher as
variáveis, o Supabase passa a ser a fonte de verdade e o sync entre dispositivos é ativado.

Outros comandos: `npm run build` (gera `dist/`), `npm run preview` (serve o build), `npm run typecheck`.

## Configurar o Supabase (ativa o sync)

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No **SQL Editor** do projeto, cole e execute o conteúdo de [`supabase/schema.sql`](supabase/schema.sql).
3. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.
4. Crie um arquivo `.env` na raiz (baseado em `.env.example`):

   ```
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key
   ```

## Autenticação: código pessoal (login real, múltiplos perfis)

Não há Google. Cada pessoa entra com um **código pessoal**; se o código ainda não existe, ele
**cria um perfil novo** na hora. Por baixo, o código vira um usuário de verdade do Supabase Auth
(o código é usado como e-mail interno + senha), então cada perfil tem dados **isolados por RLS**
(`auth.uid() = user_id`) — ninguém acessa o perfil de outro, e o mesmo código em vários aparelhos
vê os mesmos dados (sync).

Configuração necessária (uma vez, no painel do Supabase):

1. **Authentication → Providers → Email:** deixe o provider **ativado** e **DESLIGUE** a opção
   *Confirm email* (senão o cadastro não devolve sessão e o login pelo código não conclui).
2. **Authentication → Providers** (ou *Settings*): mantenha *Allow new users to sign up* **ligado**.

O código precisa ter no mínimo **6 caracteres** (é a senha do perfil). Anote em lugar seguro — sem
ele não dá pra recuperar os dados.

⚠️ **Trade-off:** quem souber o seu código consegue entrar no seu perfil (o código é a única
credencial). Diferente do modelo antigo, porém, a RLS por `auth.uid()` impede que alguém liste ou
leia os dados de outros perfis mesmo tendo a anon key — o isolamento é real.

> Em desenvolvimento sem as variáveis do Supabase, o mesmo formulário funciona em modo local
> (perfil por código guardado só no navegador, sem sync).

## Deploy no GitHub Pages

1. Suba o repositório no GitHub com o nome **`Nexo`** (o `base` do Vite está configurado como
   `/Nexo/` em [`vite.config.ts`](vite.config.ts)).
2. Em **Settings → Pages**, defina **Source = GitHub Actions**.
3. Em **Settings → Secrets and variables → Actions**, adicione dois secrets (sem eles o app fica
   em modo local e **não sincroniza**):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Faça push na branch `main`. O workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
   builda e publica automaticamente. A URL será `https://SEU-USUARIO.github.io/Nexo/`.

## Instalar como app (PWA)

- **iPad/iPhone (Safari):** abra a URL → botão Compartilhar → *Adicionar à Tela de Início*.
- **Android (Chrome):** menu → *Instalar app* / *Adicionar à tela inicial*.
- **Computador:** funciona direto no navegador; o Chrome também oferece "Instalar".

Entre com a **mesma conta Google** em todos os dispositivos para ver o mesmo histórico.

## Receitas

Há duas fontes: a **lista curada** embutida em [`src/data/recipes.ts`](src/data/recipes.ts) (para
acrescentar uma fixa, adicione um item ao array) e as **suas receitas**, criadas/editadas direto na
UI (card "Ideias de refeição" → *+ Nova receita*). As suas ficam na tabela `custom_recipes` do
Supabase (ou no `localStorage` no modo local).

## Calibração

Os limiares de "foco cumprido", streak e as frases de insight (ex.: meta de sono 7h30) ficam
centralizados em [`src/lib/stats.ts`](src/lib/stats.ts) — ajuste ali sem mexer na UI.
