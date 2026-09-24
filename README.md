# EasyFood

Sistema para cadastro e consulta de restaurantes.

## Tecnologias utilizadas

- Node.js
- Express
- CORS
- Prisma
- SQLite
- HTML
- CSS
- JavaScript

## Estrutura do projeto

O projeto está dividido em duas partes:

- **Backend:** responsável pela API e pelo banco de dados.
- **Frontend:** responsável pela interface visual do sistema.

## Backend

O backend foi desenvolvido utilizando Node.js e Express.

O Prisma é utilizado para realizar a comunicação entre a aplicação e o banco de dados SQLite.

## Banco de dados

O sistema utiliza SQLite como banco de dados.

O banco é gerenciado pelo Prisma e contém informações dos restaurantes, como:

- ID
- Nome
- Categoria
- Avaliação

## API

A API utiliza a porta `3000`.

### Rotas disponíveis

`GET /`

Verifica se a API está funcionando.

`GET /api/restaurantes`

Lista todos os restaurantes cadastrados.

`GET /api/restaurantes/:id`

Busca um restaurante específico pelo seu ID.

`POST /api/restaurantes`

Cadastra um novo restaurante.

Exemplo:

```json
{
    "name": "Burger House",
    "category": "Hambúrguer",
    "rating": 4.5
}