const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const db = new PrismaClient();
const PORTA = 3000;

app.use(cors());
app.use(express.json());


// ==========================================
// ROTA INICIAL
// ==========================================

app.get("/", (req, res) => {

  res.json({

    mensagem: "API EasyFood funcionando!",

    rotas: [
      "GET /api/restaurantes",
      "POST /api/restaurantes",
      "GET /api/restaurantes/:id",
      "PUT /api/restaurantes/:id",
      "DELETE /api/restaurantes/:id"
    ]

  });

});


// ==========================================
// LISTAR RESTAURANTES
// ==========================================

app.get("/api/restaurantes", async (req, res) => {

  try {

    const restaurantes =
      await db.restaurant.findMany({

        orderBy: {
          name: "asc"
        }

      });

    res.status(200).json(restaurantes);

  } catch (erro) {

    console.error(
      "Falha ao listar restaurantes:",
      erro.message
    );

    res.status(500).json({
      erro: "Não foi possível consultar os restaurantes."
    });

  }

});


// ==========================================
// BUSCAR RESTAURANTE PELO ID
// ==========================================

app.get("/api/restaurantes/:id", async (req, res) => {

  const id = Number(req.params.id);


  if (!Number.isInteger(id) || id <= 0) {

    return res.status(400).json({
      erro: "O ID informado é inválido."
    });

  }


  try {

    const restaurante =
      await db.restaurant.findUnique({

        where: {
          id
        }

      });


    if (!restaurante) {

      return res.status(404).json({
        erro: "Restaurante não encontrado."
      });

    }


    res.status(200).json(restaurante);

  } catch (erro) {

    console.error(
      "Falha ao buscar restaurante:",
      erro.message
    );

    res.status(500).json({
      erro: "Não foi possível consultar o restaurante."
    });

  }

});


// ==========================================
// CADASTRAR RESTAURANTE
// ==========================================

app.post("/api/restaurantes", async (req, res) => {

  const {
    name,
    category,
    rating
  } = req.body;


  if (!name || !category) {

    return res.status(400).json({
      erro: "Nome e categoria são obrigatórios."
    });

  }


  const nota =
    rating === undefined ||
    rating === null ||
    rating === ""
      ? 0
      : Number(rating);


  if (
    !Number.isFinite(nota) ||
    nota < 0 ||
    nota > 5
  ) {

    return res.status(400).json({
      erro: "A avaliação deve ser um número entre 0 e 5."
    });

  }


  try {

    const restaurante =
      await db.restaurant.create({

        data: {

          name: String(name).trim(),

          category: String(category).trim(),

          rating: nota

        }

      });


    res.status(201).json(restaurante);

  } catch (erro) {

    console.error(
      "Falha ao cadastrar restaurante:",
      erro.message
    );

    res.status(500).json({
      erro: "Não foi possível cadastrar o restaurante."
    });

  }

});


// ==========================================
// EDITAR RESTAURANTE
// ==========================================

app.put("/api/restaurantes/:id", async (req, res) => {

  const id = Number(req.params.id);

  const {
    name,
    category,
    rating
  } = req.body;


  // Verificar ID

  if (!Number.isInteger(id) || id <= 0) {

    return res.status(400).json({
      erro: "O ID informado é inválido."
    });

  }


  // Verificar nome e categoria

  if (!name || !category) {

    return res.status(400).json({
      erro: "Nome e categoria são obrigatórios."
    });

  }


  // Converter avaliação

  const nota =
    rating === undefined ||
    rating === null ||
    rating === ""
      ? 0
      : Number(rating);


  // Validar avaliação

  if (
    !Number.isFinite(nota) ||
    nota < 0 ||
    nota > 5
  ) {

    return res.status(400).json({
      erro: "A avaliação deve ser um número entre 0 e 5."
    });

  }


  try {

    const restaurante =
      await db.restaurant.update({

        where: {
          id
        },

        data: {

          name: String(name).trim(),

          category: String(category).trim(),

          rating: nota

        }

      });


    res.status(200).json(restaurante);

  } catch (erro) {

    // Restaurante não encontrado

    if (erro.code === "P2025") {

      return res.status(404).json({
        erro: "Restaurante não encontrado."
      });

    }


    console.error(
      "Falha ao editar restaurante:",
      erro.message
    );

    res.status(500).json({
      erro: "Não foi possível editar o restaurante."
    });

  }

});


// ==========================================
// EXCLUIR RESTAURANTE
// ==========================================

app.delete("/api/restaurantes/:id", async (req, res) => {

  const id = Number(req.params.id);


  if (!Number.isInteger(id) || id <= 0) {

    return res.status(400).json({
      erro: "O ID informado é inválido."
    });

  }


  try {

    await db.restaurant.delete({

      where: {
        id
      }

    });


    res.status(200).json({
      mensagem: "Restaurante excluído com sucesso."
    });

  } catch (erro) {

    if (erro.code === "P2025") {

      return res.status(404).json({
        erro: "Restaurante não encontrado."
      });

    }


    console.error(
      "Falha ao excluir restaurante:",
      erro.message
    );

    res.status(500).json({
      erro: "Não foi possível excluir o restaurante."
    });

  }

});


// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORTA, () => {

  console.log(
    `EasyFood API funcionando na porta ${PORTA}`
  );

});