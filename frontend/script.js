const API_URL = "http://localhost:3001/api/restaurantes";
const AUTH_URL = "http://localhost:3001/api/auth";
const CARDAPIO_URL = "http://localhost:3001/api/cardapio";

// ELEMENTOS HTML
const formRestaurante = document.getElementById("formRestaurante");
const lista = document.getElementById("listaRestaurantes");
const pesquisa = document.getElementById("pesquisa");
const mostrarTodos = document.getElementById("mostrarTodos");
const botoesCategoria = document.querySelectorAll(".categoria");

const areaAutenticacao = document.getElementById("areaAutenticacao");
const conteudoProtegido = document.getElementById("conteudoProtegido");
const areaUsuario = document.getElementById("areaUsuario");
const nomeUsuario = document.getElementById("nomeUsuario");

const formLogin = document.getElementById("formLogin");
const formCadastroUsuario = document.getElementById("formCadastroUsuario");

const alternarAutenticacao = document.getElementById("alternarAutenticacao");
const botaoSair = document.getElementById("botaoSair");

const tituloAutenticacao = document.getElementById("tituloAutenticacao");
const mensagemAutenticacao = document.getElementById("mensagemAutenticacao");
const textoAlternativo = document.getElementById("textoAlternativo");

const modalEdicao = document.getElementById("modalEdicao");
const formEdicao = document.getElementById("formEdicao");

const modalCardapio = document.getElementById("modalCardapio");
const fecharCardapio = document.getElementById("fecharCardapio");
const formCardapio = document.getElementById("formCardapio");
const listaCardapio = document.getElementById("listaCardapio");
const nomeRestauranteCardapio = document.getElementById("nomeRestauranteCardapio");

let restaurantes = [];
let restauranteEditandoId = null;
let restauranteCardapioId = null;
let itemCardapioEditandoId = null;
let modoCadastro = false;

const botaoEnviarCardapio = formCardapio.querySelector('button[type="submit"]');

const botaoCancelarEdicaoItem = document.createElement("button");
botaoCancelarEdicaoItem.type = "button";
botaoCancelarEdicaoItem.textContent = "Cancelar edição";
botaoCancelarEdicaoItem.className = "botao-cancelar-item";
botaoCancelarEdicaoItem.hidden = true;

formCardapio.appendChild(botaoCancelarEdicaoItem);

// ==========================================
// AUTENTICAÇÃO
// ==========================================

function obterToken() {
    return localStorage.getItem("easyfood_token");
}

function obterCabecalhoAutenticacao() {
    const cabecalhos = {
        "Content-Type": "application/json"
    };

    const token = obterToken();

    if (token) {
        cabecalhos.Authorization = `Bearer ${token}`;
    }

    return cabecalhos;
}

function mostrarAplicacao(usuario = null) {
    areaAutenticacao.hidden = true;
    conteudoProtegido.hidden = false;
    areaUsuario.hidden = false;

    nomeUsuario.textContent = usuario?.name || "Usuário";

    carregarRestaurantes();
}

function mostrarLogin() {
    areaAutenticacao.hidden = false;
    conteudoProtegido.hidden = true;
    areaUsuario.hidden = true;

    formLogin.hidden = false;
    formCadastroUsuario.hidden = true;

    modoCadastro = false;

    tituloAutenticacao.textContent = "Entrar no EasyFood";
    mensagemAutenticacao.textContent =
        "Entre na sua conta para acessar os restaurantes.";

    textoAlternativo.textContent = "Ainda não tem uma conta?";
    alternarAutenticacao.textContent = "Criar conta";
}

function tratarSessaoExpirada() {
    localStorage.removeItem("easyfood_token");
    localStorage.removeItem("easyfood_usuario");

    restaurantes = [];

    fecharModalCardapio();
    mostrarLogin();

    alert("Sua sessão expirou. Entre novamente.");
}

// CADASTRO DE USUÁRIO
formCadastroUsuario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const name = document.getElementById("nomeUsuarioCadastro").value.trim();
    const email = document.getElementById("emailCadastro").value.trim();
    const password = document.getElementById("senhaCadastro").value;

    try {
        const resposta = await fetch(`${AUTH_URL}/cadastro`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.erro || resultado.mensagem ||
                "Não foi possível criar a conta.");
            return;
        }

        alert("Conta criada com sucesso! Agora faça seu login. 💗");

        formCadastroUsuario.reset();
        alternarModoAutenticacao();

    } catch (erro) {
        console.error("Erro no cadastro:", erro);
        alert("Não foi possível conectar ao servidor.");
    }
});

// LOGIN
formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const email = document.getElementById("emailLogin").value.trim();
    const password = document.getElementById("senhaLogin").value;

    try {
        const resposta = await fetch(`${AUTH_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.erro || resultado.mensagem ||
                "E-mail ou senha incorretos.");
            return;
        }

        if (!resultado.token) {
            alert("O servidor não retornou o token de autenticação.");
            return;
        }

        localStorage.setItem("easyfood_token", resultado.token);

        if (resultado.usuario) {
            localStorage.setItem(
                "easyfood_usuario",
                JSON.stringify(resultado.usuario)
            );
        }

        formLogin.reset();

        mostrarAplicacao(resultado.usuario);

    } catch (erro) {
        console.error("Erro no login:", erro);
        alert("Não foi possível conectar ao servidor.");
    }
});

// ALTERNAR LOGIN E CADASTRO
function alternarModoAutenticacao() {
    modoCadastro = !modoCadastro;

    formLogin.hidden = modoCadastro;
    formCadastroUsuario.hidden = !modoCadastro;

    if (modoCadastro) {
        tituloAutenticacao.textContent = "Criar sua conta";
        mensagemAutenticacao.textContent =
            "Cadastre-se para aproveitar o EasyFood.";

        textoAlternativo.textContent = "Já tem uma conta?";
        alternarAutenticacao.textContent = "Fazer login";

    } else {
        tituloAutenticacao.textContent = "Entrar no EasyFood";
        mensagemAutenticacao.textContent =
            "Entre na sua conta para acessar os restaurantes.";

        textoAlternativo.textContent = "Ainda não tem uma conta?";
        alternarAutenticacao.textContent = "Criar conta";
    }
}

alternarAutenticacao.addEventListener("click", alternarModoAutenticacao);

// SAIR
botaoSair.addEventListener("click", () => {
    localStorage.removeItem("easyfood_token");
    localStorage.removeItem("easyfood_usuario");

    restaurantes = [];

    fecharModalCardapio();
    mostrarLogin();

    alert("Você saiu da sua conta.");
});

function verificarSessao() {
    const token = obterToken();

    if (!token) {
        mostrarLogin();
        return;
    }

    let usuario = null;

    try {
        const salvo = localStorage.getItem("easyfood_usuario");
        usuario = salvo ? JSON.parse(salvo) : null;
    } catch {
        usuario = null;
    }

    mostrarAplicacao(usuario);
}

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function normalizarTexto(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function validarImagem(url) {
    if (!url || !url.trim()) {
        return true;
    }

    try {
        const endereco = new URL(url.trim());

        return endereco.protocol === "http:" ||
            endereco.protocol === "https:";

    } catch {
        return false;
    }
}

function criarImagem(url, classe, emoji, alt) {
    const container = document.createElement("div");
    container.className = classe;

    if (url && validarImagem(url)) {
        const imagem = document.createElement("img");

        imagem.src = url.trim();
        imagem.alt = alt || "Imagem";
        imagem.loading = "lazy";

        imagem.onerror = () => {
            container.replaceChildren();
            container.textContent = emoji;
            container.classList.add("imagem-fallback");
        };

        container.appendChild(imagem);

    } else {
        container.textContent = emoji;
        container.classList.add("imagem-fallback");
    }

    return container;
}

function escolherEmoji(categoria) {
    const cat = normalizarTexto(categoria);

    if (cat.includes("pizza")) return "🍕";
    if (cat.includes("hamburg") || cat.includes("burger")) return "🍔";
    if (cat.includes("japones") || cat.includes("sushi")) return "🍣";
    if (cat.includes("acai")) return "🍧";
    if (cat.includes("sobremesa") || cat.includes("doce")) return "🍰";
    if (cat.includes("bebida") || cat.includes("cafe")) return "🥤";

    return "🍽️";
}

// ==========================================
// RESTAURANTES
// ==========================================

async function carregarRestaurantes() {
    try {
        const resposta = await fetch(API_URL, {
            headers: obterCabecalhoAutenticacao()
        });

        if (resposta.status === 401 || resposta.status === 403) {
            tratarSessaoExpirada();
            return;
        }

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Erro ao consultar a API.");
        }

        if (!Array.isArray(resultado)) {
            throw new Error("A API retornou uma lista inválida.");
        }

        restaurantes = resultado;

        mostrarRestaurantes(restaurantes);

    } catch (erro) {
        console.error("Erro ao carregar restaurantes:", erro);

        lista.innerHTML = `
            <p class="mensagem-vazia">
                Não foi possível carregar os restaurantes.<br>
                Verifique se o servidor está funcionando.
            </p>
        `;
    }
}

// MOSTRAR RESTAURANTES COM IMAGENS
function mostrarRestaurantes(listaRestaurantes) {
    lista.innerHTML = "";

    if (!listaRestaurantes.length) {
        lista.innerHTML = `
            <p class="mensagem-vazia">
                Nenhum restaurante encontrado 🍽️
            </p>
        `;
        return;
    }

    listaRestaurantes.forEach((restaurante) => {
        const card = document.createElement("div");
        card.className = "card-restaurante";

        const imagem = criarImagem(
            restaurante.imageUrl,
            "card-imagem",
            escolherEmoji(restaurante.category),
            `Imagem de ${restaurante.name}`
        );

        card.appendChild(imagem);

        const conteudo = document.createElement("div");
        conteudo.className = "card-conteudo";

        conteudo.innerHTML = `
            <h3></h3>

            <p class="card-categoria"></p>

            <div class="card-avaliacao">
                <span>⭐</span>
                <strong>${Number(restaurante.rating || 0).toFixed(1)}</strong>
                <span class="avaliacao-texto">Avaliação</span>
            </div>

            <div class="botoes-restaurante">
                <button class="botao-cardapio" type="button">
                    🍽️ Ver cardápio
                </button>

                <button class="botao-editar" type="button">
                    ✏️ Editar
                </button>

                <button class="botao-excluir" type="button">
                    🗑️ Excluir
                </button>
            </div>
        `;

        conteudo.querySelector("h3").textContent = restaurante.name;

        conteudo.querySelector(".card-categoria").textContent =
            restaurante.category || "Sem categoria";

        conteudo.querySelector(".botao-cardapio").addEventListener(
            "click",
            () => abrirCardapio(restaurante.id)
        );

        conteudo.querySelector(".botao-editar").addEventListener(
            "click",
            () => editarRestaurante(restaurante.id)
        );

        conteudo.querySelector(".botao-excluir").addEventListener(
            "click",
            () => excluirRestaurante(restaurante.id)
        );

        card.appendChild(conteudo);
        lista.appendChild(card);
    });
}

// PESQUISA
pesquisa.addEventListener("input", () => {
    const texto = normalizarTexto(pesquisa.value);

    const resultados = restaurantes.filter((restaurante) =>
        normalizarTexto(restaurante.name).includes(texto) ||
        normalizarTexto(restaurante.category).includes(texto)
    );

    mostrarRestaurantes(resultados);
});

// FILTROS DE CATEGORIA
botoesCategoria.forEach((botao) => {
    botao.addEventListener("click", () => {
        botoesCategoria.forEach((item) =>
            item.classList.remove("ativa")
        );

        botao.classList.add("ativa");

        const selecionada = normalizarTexto(botao.dataset.categoria);

        const resultados = restaurantes.filter((restaurante) => {
            const categoria = normalizarTexto(restaurante.category);

            if (selecionada === "japonesa") {
                return categoria.includes("japones") ||
                    categoria.includes("sushi");
            }

            return categoria.includes(selecionada);
        });

        mostrarRestaurantes(resultados);
    });
});

// MOSTRAR TODOS
mostrarTodos.addEventListener("click", () => {
    pesquisa.value = "";

    botoesCategoria.forEach((botao) =>
        botao.classList.remove("ativa")
    );

    mostrarRestaurantes(restaurantes);
});

// CADASTRAR RESTAURANTE
formRestaurante.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const categoria = document.getElementById("categoria").value.trim();

    const avaliacao = Number(
        document.getElementById("avaliacao").value || 0
    );

    const imageUrl = document.getElementById("imagemRestaurante")
        .value.trim();

    if (!nome || !categoria) {
        alert("Nome e categoria são obrigatórios.");
        return;
    }

    if (!Number.isFinite(avaliacao) ||
        avaliacao < 0 || avaliacao > 5) {
        alert("A avaliação deve ser um número entre 0 e 5.");
        return;
    }

    if (!validarImagem(imageUrl)) {
        alert("Informe um link de imagem válido (HTTP ou HTTPS).");
        return;
    }

    try {
        const resposta = await fetch(API_URL, {
            method: "POST",

            headers: obterCabecalhoAutenticacao(),

            body: JSON.stringify({
                name: nome,
                category: categoria,
                rating: avaliacao,
                imageUrl: imageUrl || null
            })
        });

        const resultado = await resposta.json();

        if (resposta.status === 401 || resposta.status === 403) {
            tratarSessaoExpirada();
            return;
        }

        if (!resposta.ok) {
            alert(resultado.erro ||
                "Não foi possível cadastrar o restaurante.");
            return;
        }

        alert("Restaurante cadastrado com sucesso! 🍔");

        formRestaurante.reset();

        await carregarRestaurantes();

        document.getElementById("restaurantes")
            .scrollIntoView({ behavior: "smooth" });

    } catch (erro) {
        console.error("Erro ao cadastrar:", erro);
        alert("Não foi possível cadastrar o restaurante.");
    }
});

// ==========================================
// EDITAR RESTAURANTES
// ==========================================

function editarRestaurante(id) {
    const restaurante = restaurantes.find(
        (item) => item.id === id
    );

    if (!restaurante) {
        alert("Restaurante não encontrado.");
        return;
    }

    restauranteEditandoId = id;

    document.getElementById("editarNome").value =
        restaurante.name;

    document.getElementById("editarCategoria").value =
        restaurante.category || "";

    document.getElementById("editarAvaliacao").value =
        restaurante.rating ?? 0;

    document.getElementById("editarImagemRestaurante").value =
        restaurante.imageUrl || "";

    modalEdicao.style.display = "flex";
}

function fecharModal() {
    modalEdicao.style.display = "none";
    restauranteEditandoId = null;
}

document.getElementById("fecharModal")
    .addEventListener("click", fecharModal);

document.getElementById("cancelarEdicao")
    .addEventListener("click", fecharModal);

// SALVAR EDIÇÃO
formEdicao.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (restauranteEditandoId === null) return;

    const nome = document.getElementById("editarNome").value.trim();

    const categoria = document.getElementById("editarCategoria")
        .value.trim();

    const avaliacao = Number(
        document.getElementById("editarAvaliacao").value
    );

    const imageUrl = document.getElementById("editarImagemRestaurante")
        .value.trim();

    if (!nome || !categoria) {
        alert("Nome e categoria são obrigatórios.");
        return;
    }

    if (!Number.isFinite(avaliacao) ||
        avaliacao < 0 || avaliacao > 5) {
        alert("A avaliação deve ser um número entre 0 e 5.");
        return;
    }

    if (!validarImagem(imageUrl)) {
        alert("Informe um link de imagem válido (HTTP ou HTTPS).");
        return;
    }

    try {
        const resposta = await fetch(
            `${API_URL}/${restauranteEditandoId}`,
            {
                method: "PUT",

                headers: obterCabecalhoAutenticacao(),

                body: JSON.stringify({
                    name: nome,
                    category: categoria,
                    rating: avaliacao,
                    imageUrl: imageUrl || null
                })
            }
        );

        const resultado = await resposta.json();

        if (resposta.status === 401 || resposta.status === 403) {
            tratarSessaoExpirada();
            return;
        }

        if (!resposta.ok) {
            alert(resultado.erro ||
                "Não foi possível editar o restaurante.");
            return;
        }

        fecharModal();

        alert("Restaurante atualizado com sucesso! ✏️");

        await carregarRestaurantes();

    } catch (erro) {
        console.error("Erro ao editar:", erro);
        alert("Não foi possível editar o restaurante.");
    }
});

// EXCLUIR RESTAURANTE
async function excluirRestaurante(id) {
    if (!confirm("Deseja realmente excluir este restaurante?")) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: obterCabecalhoAutenticacao()
        });

        const resultado = await resposta.json();

        if (resposta.status === 401 || resposta.status === 403) {
            tratarSessaoExpirada();
            return;
        }

        if (!resposta.ok) {
            alert(resultado.erro ||
                "Não foi possível excluir o restaurante.");
            return;
        }

        if (restauranteCardapioId === id) {
            fecharModalCardapio();
        }

        alert("Restaurante excluído com sucesso! 🗑️");

        await carregarRestaurantes();

    } catch (erro) {
        console.error("Erro ao excluir:", erro);
        alert("Não foi possível excluir o restaurante.");
    }
}

// ==========================================
// CARDÁPIO
// ==========================================

async function abrirCardapio(id) {
    const restaurante = restaurantes.find(
        (item) => item.id === id
    );

    if (!restaurante) {
        alert("Restaurante não encontrado.");
        return;
    }

    restauranteCardapioId = id;

    nomeRestauranteCardapio.textContent =
        `Cardápio de ${restaurante.name}`;

    cancelarEdicaoItem();

    modalCardapio.classList.add("aberto");

    await carregarCardapio();
}

function fecharModalCardapio() {
    if (!modalCardapio) return;

    modalCardapio.classList.remove("aberto");

    restauranteCardapioId = null;

    cancelarEdicaoItem();
}

fecharCardapio.addEventListener("click", fecharModalCardapio);

modalCardapio.addEventListener("click", (evento) => {
    if (evento.target === modalCardapio) {
        fecharModalCardapio();
    }
});

// CARREGAR CARDÁPIO
async function carregarCardapio() {
    if (restauranteCardapioId === null) return;

    listaCardapio.innerHTML =
        `<p class="carregando">Carregando cardápio...</p>`;

    try {
        const resposta = await fetch(
            `${API_URL}/${restauranteCardapioId}/cardapio`,
            {
                method: "GET",
                headers: obterCabecalhoAutenticacao()
            }
        );

        if (resposta.status === 401 || resposta.status === 403) {
            tratarSessaoExpirada();
            return;
        }

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro ||
                resultado.mensagem ||
                "Não foi possível carregar o cardápio."
            );
        }

        mostrarItensCardapio(resultado);

    } catch (erro) {
        console.error("Erro ao carregar cardápio:", erro);

        listaCardapio.innerHTML = `
            <p class="mensagem-vazia">
                Não foi possível carregar os itens do cardápio.
            </p>
        `;
    }
}

// MOSTRAR PRODUTOS COM IMAGENS
function mostrarItensCardapio(itens) {
    listaCardapio.innerHTML = "";

    if (!Array.isArray(itens) || itens.length === 0) {
        listaCardapio.innerHTML = `
            <p class="mensagem-vazia">
                Este restaurante ainda não possui produtos cadastrados.
            </p>
        `;
        return;
    }

    itens.forEach((item) => {
        const card = document.createElement("div");
        card.className = "item-cardapio";

        const imagem = criarImagem(
            item.imageUrl,
            "imagem-item-cardapio",
            "🍽️",
            `Imagem de ${item.name}`
        );

        card.appendChild(imagem);

        const titulo = document.createElement("h4");
        titulo.textContent = item.name;

        const descricao = document.createElement("p");
        descricao.textContent =
            item.description || "Sem descrição disponível.";

        const categoria = document.createElement("p");
        categoria.textContent =
            `Categoria: ${item.category || "Sem categoria"}`;

        const preco = document.createElement("strong");

        preco.textContent = Number(item.price).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

        const botoes = document.createElement("div");
        botoes.className = "botoes-item-cardapio";

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.className = "botao-editar-item";
        botaoEditar.textContent = "✏️ Editar";

        botaoEditar.addEventListener("click", () => {
            editarItemCardapio(item);
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.className = "botao-excluir-item";
        botaoExcluir.textContent = "🗑️ Excluir";

        botaoExcluir.addEventListener("click", () => {
            excluirItemCardapio(item.id);
        });

        botoes.append(botaoEditar, botaoExcluir);

        card.append(
            titulo,
            descricao,
            categoria,
            preco,
            botoes
        );

        listaCardapio.appendChild(card);
    });
}

// EDITAR ITEM DO CARDÁPIO
function editarItemCardapio(item) {
    itemCardapioEditandoId = item.id;

    document.getElementById("nomeItem").value =
        item.name;

    document.getElementById("descricaoItem").value =
        item.description || "";

    document.getElementById("precoItem").value =
        item.price;

    document.getElementById("categoriaItem").value =
        item.category || "";

    document.getElementById("imagemItem").value =
        item.imageUrl || "";

    botaoEnviarCardapio.textContent = "Salvar alterações";

    botaoCancelarEdicaoItem.hidden = false;

    formCardapio.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// CANCELAR EDIÇÃO DO ITEM
function cancelarEdicaoItem() {
    itemCardapioEditandoId = null;

    if (formCardapio) {
        formCardapio.reset();
    }

    if (botaoEnviarCardapio) {
        botaoEnviarCardapio.textContent =
            "+ Adicionar ao cardápio";
    }

    if (botaoCancelarEdicaoItem) {
        botaoCancelarEdicaoItem.hidden = true;
    }
}

botaoCancelarEdicaoItem.addEventListener(
    "click",
    cancelarEdicaoItem
);

// CADASTRAR OU ATUALIZAR ITEM
formCardapio.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (restauranteCardapioId === null) {
        alert("Selecione um restaurante primeiro.");
        return;
    }

    const name = document.getElementById("nomeItem").value.trim();

    const description = document.getElementById("descricaoItem")
        .value.trim();

    const price = Number(
        document.getElementById("precoItem").value
    );

    const category = document.getElementById("categoriaItem")
        .value.trim();

    const imageUrl = document.getElementById("imagemItem")
        .value.trim();

    if (!name) {
        alert("Informe o nome do produto.");
        return;
    }

    if (!Number.isFinite(price) || price < 0) {
        alert("Informe um preço válido.");
        return;
    }

    if (!validarImagem(imageUrl)) {
        alert("Informe um link de imagem válido (HTTP ou HTTPS).");
        return;
    }

    const editando = itemCardapioEditandoId !== null;

    const url = editando
        ? `${CARDAPIO_URL}/${itemCardapioEditandoId}`
        : `${API_URL}/${restauranteCardapioId}/cardapio`;

    const metodo = editando ? "PUT" : "POST";

    try {
        const resposta = await fetch(url, {
            method: metodo,

            headers: obterCabecalhoAutenticacao(),

            body: JSON.stringify({
                name,
                description,
                price,
                category,
                imageUrl: imageUrl || null
            })
        });

        const resultado = await resposta.json();

        if (resposta.status === 401 || resposta.status === 403) {
            tratarSessaoExpirada();
            return;
        }

        if (!resposta.ok) {
            alert(resultado.erro ||
                resultado.mensagem ||
                "Não foi possível salvar o item.");
            return;
        }

        alert(
            editando
                ? "Produto atualizado com sucesso! ✏️"
                : "Item cadastrado no cardápio com sucesso! 🍔"
        );

        cancelarEdicaoItem();

        await carregarCardapio();

    } catch (erro) {
        console.error("Erro ao salvar item:", erro);
        alert("Não foi possível salvar o item.");
    }
});

// EXCLUIR ITEM
async function excluirItemCardapio(id) {
    if (!confirm("Deseja realmente excluir este item do cardápio?")) {
        return;
    }

    try {
        const resposta = await fetch(`${CARDAPIO_URL}/${id}`, {
            method: "DELETE",
            headers: obterCabecalhoAutenticacao()
        });

        const resultado = await resposta.json();

        if (resposta.status === 401 || resposta.status === 403) {
            tratarSessaoExpirada();
            return;
        }

        if (!resposta.ok) {
            alert(resultado.erro ||
                resultado.mensagem ||
                "Não foi possível excluir o item.");
            return;
        }

        if (itemCardapioEditandoId === id) {
            cancelarEdicaoItem();
        }

        alert("Item excluído do cardápio! 🗑️");

        await carregarCardapio();

    } catch (erro) {
        console.error("Erro ao excluir item:", erro);
        alert("Não foi possível excluir o item.");
    }
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

verificarSessao();