# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Segurança

### Configuração obrigatória (Edge Functions)

A chave secreta da PaySuite **não pode** estar no frontend (fica visível no JavaScript).

1. A `createPayment` já está disponível em `https://atjsosdryvdfpdsmukio.supabase.co/functions/v1/createPayment`.
2. Variáveis de ambiente (Supabase Dashboard → Edge Functions → Secrets):
   - `PAYSUITE_KEY` — chave secreta da PaySuite (obrigatória)
   - `WEBHOOK_SECRET` — segredo partilhado para validar o webhook
3. No painel da PaySuite, apontar o webhook para `https://PROJETO.supabase.co/functions/v1/paysuite-webhook` e enviar o `WEBHOOK_SECRET` no header `x-webhook-secret` (ou adaptar conforme a doc real da PaySuite).
4. Se fizer alterações à `paysuite-webhook`, fazer deploy: `supabase functions deploy paysuite-webhook`.

### DNS (a fazer no registrador/hospedagem — não dá para fazer em código)

- **DNSSEC** — ativar no registrador para impedir DNS spoofing
- **SPF + DKIM + DMARC** — criar registos de email para impedir emails falsos em nome do domínio
- **HSTS preload** — depois de HTTPS estável, submeter em https://hstspreload.org (o header está já configurado)

### Banco de dados

- Ativar **Row Level Security (RLS)** na tabela `purchases` e criar políticas: clientes podem inserir `status = 'pending'`; só o webhook (service role) pode marcar como `paid`.

### Recomendações

- Ativar **2FA** na conta do GitHub/Supabase/PaySuite (mitiga phishing de credenciais)
- Os headers de segurança para produção estão em `vercel.json` (HSTS, nosniff, frame-ancestors, etc.); o CSP é injetado no build pelo `vite.config.ts`. Manter ambos em sincronia quando adicionares bibliotecas externas.
- Quando adicionar bibliotecas externas (CDN), usar **SRI** (`integrity`)

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
