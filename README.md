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
