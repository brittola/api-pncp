# Segurança e Conformidade — API PNCP

Este documento mapeia os 6 requisitos do projeto integrado ao que está
implementado na API e ao que depende de configuração externa (banco de dados,
infraestrutura, e-mail, front-end e processos).

---

## 1. Autenticação e gestão de senhas

**Implementado na API:**
- Hash de senha com **bcrypt (12 rounds)** — `src/models/User.js`.
- Campo `senha` com **`select: false`** (nunca retornado por padrão).
- **JWT** com expiração de 8h e **`tokenVersion`** para revogação
  (logout, troca e redefinição de senha invalidam tokens antigos).
- **Política de senha forte** (mín. 8, maiúscula, minúscula, número, símbolo)
  via `isStrongPassword` — `src/routes/auth.routes.js`.
- **Bloqueio de conta** após 5 falhas por 15 min — `src/models/User.js`.
- **Rate limit** estrito no `/auth` (10 req/15 min) — `src/middlewares/rateLimit.js`.
- **Fluxo completo de senha**: `POST /auth/change-password`,
  `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/logout`.
- Mensagens genéricas (anti-enumeração de usuários).

**Externo / a configurar:**
- **Envio de e-mail** do token de recuperação (`forgot-password` gera o token;
  em produção ele deve ser enviado por e-mail, não retornado na resposta).
  Integrar provedor (SendGrid, AWS SES, Resend) no `authController.forgotPassword`.
- **MFA/2FA** (opcional) — exigiria app autenticador + verificação OTP.

---

## 2. Dados em repouso / anonimização

**Implementado na API:**
- Senha protegida em repouso (hash bcrypt, irreversível).
- `select: false` em `senha`, `resetTokenHash`, `resetTokenExpires`.
- Utilitário de **mascaramento de PII** (`src/utils/mask.js`) para e-mail e CNPJ.
- **Anonimização** de conta no direito ao esquecimento (`DELETE /users/me`).

**Externo / a configurar:**
- **Criptografia at-rest do banco**: habilitar *Encryption at Rest* no
  **MongoDB Atlas** (Project → Security → Encryption at Rest) ou, em Mongo
  self-hosted, `--enableEncryption` (WiredTiger). Não é configurável via código.
- **Field-Level Encryption (CSFLE)** para CNPJ/e-mail (opcional): requer
  chave mestra em KMS (AWS/GCP/Azure) e configuração no driver Mongo.
- **Criptografia de disco** do servidor de aplicação (LUKS/EBS encryption).

---

## 3. LGPD

**Implementado na API:**
- **Consentimento** registrado no cadastro (`consentVersion`, `consentAt`).
- **Direito de acesso/portabilidade**: `GET /users/me` (exporta dados + checklists).
- **Direito de retificação**: `PUT /users/me`.
- **Direito ao esquecimento**: `DELETE /users/me` (anonimiza PII, remove checklists,
  invalida tokens).

**Externo / a configurar:**
- **Política de Privacidade e Termos de Uso** (texto jurídico) — exibir no
  **front-end** e versionar (o campo `consentVersion` já referencia a versão aceita).
- **Tela de consentimento** no cadastro (front-end) marcando o aceite.
- **Botão de exportar dados / excluir conta** no front-end (consumindo `/users/me`).
- **ROPA** (Registro das Operações de Tratamento), indicação de **encarregado (DPO)**
  e **plano de resposta a incidentes/notificação à ANPD** — documentos de processo.
- **Política de retenção**: definir prazo e automatizar expurgo/anonimização de
  contas inativas (ex.: cron job — ver seção 5).

---

## 4. Disponibilidade e proteção contra ataques

**Implementado na API:**
- **helmet** (cabeçalhos de segurança) — `src/app.js`.
- **CORS restrito** por lista de origens (`CORS_ORIGINS`) — `src/app.js`.
- **Rate limit global** (300 req/15 min) + estrito no auth.
- **Sanitização NoSQL** (remove `$`/`.`) — `src/middlewares/sanitize.js`.
- **Limite de payload** (`express.json({ limit: '10kb' })`).
- **Validação de entrada** em todas as rotas (`express-validator`).
- **Escape de regex** na busca (anti-ReDoS) — `src/controllers/contratacaoController.js`.
- **Handler de erro genérico** (não vaza stack trace).
- **Log de requisições** (`morgan`, sem corpo para não registrar PII).
- **Validação de env no boot** (`src/config/env.js`).

**Externo / a configurar:**
- **HTTPS/TLS**: terminar TLS em proxy reverso (Nginx/Caddy) ou no provedor
  (Render/Railway/Cloudflare). A API deve rodar atrás dele; habilitar HSTS.
- **WAF / proteção DDoS** (Cloudflare, AWS WAF).
- **Monitoramento/alertas** (UptimeRobot, Datadog) consumindo `GET /health`.
- **Secret management** (não versionar `.env`; usar cofre do provedor).

---

## 5. Backup e continuidade de operação

**Implementado na API:**
- **Health check** `GET /health` (status do app + conexão Mongo).
- **Graceful shutdown** (SIGTERM/SIGINT) — `src/app.js`.
- **Resiliência da conexão** Mongo (eventos + reconexão automática) — `src/config/db.js`.

**Externo / a configurar:**
- **Backup automatizado** do banco:
  - **MongoDB Atlas**: habilitar *Cloud Backups* (snapshots contínuos),
    definir janela e retenção.
  - **Self-hosted**: `mongodump` agendado via cron + armazenamento off-site (S3).
- **Procedimento de restore testado** + definição de **RPO/RTO** (documento).
- **Redundância de processo**: **PM2** (restart automático/cluster) ou réplica
  do serviço; replica set no MongoDB para alta disponibilidade.
- **Plano de Continuidade de Negócio (BCP)/DR** — documento de processo.

---

## 6. Gestão de fornecedores

**Implementado na API (domínio — fornecedor = empresa licitante):**
- Cadastro de fornecedor por **CNPJ validado** (dígitos verificadores) —
  `src/utils/cnpj.js`.
- **Checklist de habilitação** por contratação — `src/constants/checklistItems.js`,
  `src/controllers/checklistController.js`.

**Implementado (segurança — risco de terceiros / supply chain):**
- `package-lock.json` versionado (build reprodutível).
- **`npm audit`** executado e vulnerabilidade corrigida (0 vulnerabilidades).

**Externo / a configurar:**
- **Inventário de fornecedores de TI** (MongoDB Atlas, hospedagem, provedor de
  e-mail) com avaliação de postura de segurança e **DPA** (acordo de tratamento
  de dados) de cada um — documento.
- **SCA contínuo** (Dependabot/Snyk) e política de atualização de dependências.
- **SLAs** e avaliação periódica dos fornecedores críticos — documento.

---

## Variáveis de ambiente

Ver `.env.example`. Em produção, defina obrigatoriamente:
`MONGO_URI`, `JWT_SECRET` (≥ 32 caracteres), `NODE_ENV=production`, `CORS_ORIGINS`.
