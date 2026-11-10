
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const db = new PrismaClient();

const PORTA = 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// MIDDLEWARE DE AUTENTICAÇÃO JWT
// ==========================================

function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      mensagem: "Token não fornecido!"
    });
  }

  const partes = authHeader.split(" ");
  const [tipo, token] = partes;

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({
      mensagem: "Formato de token inválido!"
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      mensagem: "JWT_SECRET não configurado no .env"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuarioId = decoded.id;

    next();

  } catch (erro) {
    return res.status(401).json({
      mensagem: "Token inválido ou expirado!"
    });
  }
}

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
      "DELETE /api/restaurantes/:id",
      "POST /api/auth/cadastro",
      "POST /api/auth/login"
    ]
  });
});

// ==========================================
// CADASTRO DE USUÁRIOS
// ==========================================

app.post("/api/auth/cadastro", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      erro: "Nome, e-mail e senha são obrigatórios."
    });
  }

  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      erro: "A senha deve ter pelo menos 8 caracteres."
    });
  }

  try {
    const emailFormatado = String(email).trim().toLowerCase();

    if (!emailFormatado.includes("@")) {
      return res.status(400).json({
        erro: "Informe um e-mail válido."
      });
    }

    const senhaCriptografada = await bcrypt.hash(password, 10);

    const usuario = await db.user.create({
      data: {
        name: String(name).trim(),
        email: emailFormatado,
        password: senhaCriptografada
      }
    });

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",

      usuario: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email
      }
    });

  } catch (erro) {
    if (erro.code === "P2002") {
      return res.status(409).json({
        erro: "Este e-mail já está cadastrado."
      });
    }

    console.error("Erro no cadastro:", erro.message);

    res.status(500).json({
      erro: "Não foi possível cadastrar o usuário."
    });
  }
});

// ==========================================
// LOGIN DE USUÁRIOS
// ==========================================

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      erro: "E-mail e senha são obrigatórios."
    });
  }

  try {
    const emailFormatado = String(email).trim().toLowerCase();

    const usuario = await db.user.findUnique({
      where: {
        email: emailFormatado
      }
    });

    if (!usuario) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos."
      });
    }

    const senhaCorreta = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "E-mail ou senha incorretos."
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET não configurado no .env");
    }

    const token = jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      mensagem: "Login realizado com sucesso!",

      token,

      usuario: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email
      }
    });

  } catch (erro) {
    console.error("Erro no login:", erro.message);

    res.status(500).json({
      erro: "Não foi possível realizar o login."
    });
  }
});

// ==========================================
// LISTAR RESTAURANTES
// ==========================================

app.get("/api/restaurantes", autenticarToken, async (req, res) => {
  try {
    const restaurantes = await db.restaurant.findMany({
      orderBy: {
        name: "asc"
      }
    });

    res.status(200).json(restaurantes);

  } catch (erro) {
    console.error("Falha ao listar restaurantes:", erro.message);

    res.status(500).json({
      erro: "Não foi possível consultar os restaurantes."
    });
  }
});

// ==========================================
// BUSCAR RESTAURANTE PELO ID
// ==========================================

app.get("/api/restaurantes/:id", autenticarToken, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "O ID informado é inválido."
    });
  }

  try {
    const restaurante = await db.restaurant.findUnique({
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
    console.error("Falha ao buscar restaurante:", erro.message);

    res.status(500).json({
      erro: "Não foi possível consultar o restaurante."
    });
  }
});

// ==========================================
// CADASTRAR RESTAURANTE
// ==========================================

app.post("/api/restaurantes", autenticarToken, async (req, res) => {
  const { name, category, rating } = req.body;

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

  if (!Number.isFinite(nota) || nota < 0 || nota > 5) {
    return res.status(400).json({
      erro: "A avaliação deve ser um número entre 0 e 5."
    });
  }

  try {
    const restaurante = await db.restaurant.create({
      data: {
        name: String(name).trim(),
        category: String(category).trim(),
        rating: nota
      }
    });

    res.status(201).json(restaurante);

  } catch (erro) {
    console.error("Falha ao cadastrar restaurante:", erro.message);

    res.status(500).json({
      erro: "Não foi possível cadastrar o restaurante."
    });
  }
});

// ==========================================
// EDITAR RESTAURANTE
// ==========================================

app.put("/api/restaurantes/:id", autenticarToken, async (req, res) => {
  const id = Number(req.params.id);

  const { name, category, rating } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "O ID informado é inválido."
    });
  }

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

  if (!Number.isFinite(nota) || nota < 0 || nota > 5) {
    return res.status(400).json({
      erro: "A avaliação deve ser um número entre 0 e 5."
    });
  }

  try {
    const restaurante = await db.restaurant.update({
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
    if (erro.code === "P2025") {
      return res.status(404).json({
        erro: "Restaurante não encontrado."
      });
    }

    console.error("Falha ao editar restaurante:", erro.message);

    res.status(500).json({
      erro: "Não foi possível editar o restaurante."
    });
  }
});

// ==========================================
// EXCLUIR RESTAURANTE
// ==========================================

app.delete("/api/restaurantes/:id", autenticarToken, async (req, res) => {
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

    console.error("Falha ao excluir restaurante:", erro.message);

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
