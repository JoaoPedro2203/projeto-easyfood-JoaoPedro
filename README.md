# EasyFood API — versão reformulada

Projeto reformulado a partir da Aula 1 do EasyFood.

## Tecnologias
- Node.js
- Express
- CORS
- Prisma
- PostgreSQL

## Instalação
1. Instale as dependências: `npm install`
2. Copie `.env.example` para `.env` e configure o PostgreSQL.
3. Gere o cliente Prisma: `npx prisma generate`
4. Execute a migration conforme seu banco: `npx prisma migrate dev`
5. Inicie: `npm start`

## Rotas
- `GET /` — verifica a API.
- `GET /api/restaurantes` — lista restaurantes.
- `GET /api/restaurantes/:id` — busca um restaurante.
- `POST /api/restaurantes` — cadastra um restaurante.
- `DELETE /api/restaurantes/:id` — exclui um restaurante.

## Exemplo de POST
```json
{
  "name": "Burger House",
  "category": "Hambúrguer",
  "rating": 4.5
}
```
