# Nursia Server

## Extração de prontuários com Workers AI

A extração de imagens usa o modelo aberto `@cf/meta/llama-3.2-11b-vision-instruct`,
hospedado no Cloudflare Workers AI. O contrato HTTP do cliente continua sendo
`POST /ai/extract`.

### Configuração

1. Crie uma conta Cloudflare e habilite o Workers AI.
2. Crie um API Token com permissão para executar Workers AI.
3. Copie `.env.example` para `.env` e informe:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_AUTH_TOKEN`
4. Antes do primeiro uso, aceite a licença da Meta fazendo uma chamada única:

```bash
curl "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run/@cf/meta/llama-3.2-11b-vision-instruct" \
  -X POST \
  -H "Authorization: Bearer $CLOUDFLARE_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"prompt":"agree"}'
```

No Vercel, cadastre as mesmas variáveis nas configurações do projeto e faça um
novo deploy. `CLOUDFLARE_AI_MODEL` é opcional e permite trocar o modelo sem alterar
o código.

### Desenvolvimento

```bash
npm install
npm test
npm run dev
```

O resultado da IA sempre deve ser revisado por um profissional antes de salvar o
prontuário. A franquia gratuita do Workers AI possui limite diário; ao excedê-lo,
a API passa a rejeitar novas extrações até a renovação da cota.
