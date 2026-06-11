# API PNCP

API REST para consulta de contratações públicas do PNCP com autenticação JWT.

## Requisitos

- Node.js 18+
- MongoDB Atlas (ou local)

## Instalação

```bash
npm install
```

Configure o arquivo `.env` com suas variáveis.

## Rodar

```bash
npm start
```

## Rotas

### POST /auth/register

Cadastra um novo usuário.

Body:
```json
{
  "nome": "Empresa X",
  "email": "contato@empresa.com",
  "senha": "minimo6chars",
  "cnpj": "12345678000195"
}
```

### POST /auth/login

Autentica e retorna um token JWT.

Body:
```json
{
  "email": "contato@empresa.com",
  "senha": "minimo6chars"
}
```

Resposta:
```json
{ "token": "eyJ..." }
```

### POST /auth/forgot-password

Solicita recuperação de senha. Responde sempre de forma genérica. Em
ambiente que não seja produção, retorna `resetToken` para testes (em
produção deve ser enviado por e-mail).

### POST /auth/reset-password

Redefine a senha com `{ token, novaSenha }`.

### POST /auth/change-password

(Autenticado) Troca a senha com `{ senhaAtual, novaSenha }`.

### POST /auth/logout

(Autenticado) Invalida os tokens emitidos para o usuário.

### GET /users/me

(Autenticado) Retorna os dados pessoais do titular e seus checklists (LGPD).

### PUT /users/me

(Autenticado) Atualiza o nome do usuário (LGPD — retificação).

### DELETE /users/me

(Autenticado) Anonimiza a conta e remove os dados pessoais (LGPD — esquecimento).

### GET /health

Status da aplicação e da conexão com o banco (monitoramento).

### GET /contratacoes?page=1

Lista as contratações paginadas (10 por página). Requer token JWT no header.

Header:
```
Authorization: Bearer <token>
```

Resposta:
```json
{
  "data": [...],
  "page": 1,
  "limit": 10,
  "total": 1500,
  "totalPages": 150
}
```
