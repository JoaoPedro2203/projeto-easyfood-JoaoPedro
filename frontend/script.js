
const API_URL = "http://localhost:3001/api/restaurantes";
const AUTH_URL = "http://localhost:3001/api/auth";

// ==========================================
// ELEMENTOS HTML
// ==========================================

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

// ==========================================
// VARIÁVEIS
// ==========================================

let restaurantes = [];
let restauranteEditandoId = null;
let modoCadastro = false;

// ==========================================
// AUTENTICAÇÃO
// ==========================================

// Obter token salvo
function obterToken() {
    return localStorage.getItem("easyfood_token");
}

// Cabeçalhos com autenticação
function obterCabecalhoAutenticacao() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${obterToken()}`
    };
}

// Mostrar a aplicação
function mostrarAplicacao(usuario = null) {

    areaAutenticacao.hidden = true;
    conteudoProtegido.hidden = false;
    areaUsuario.hidden = false;

    nomeUsuario.textContent = usuario?.name || "Usuário";

    carregarRestaurantes();
}

// Mostrar login
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

// Sessão expirada
function tratarSessaoExpirada() {

    localStorage.removeItem("easyfood_token");
    localStorage.removeItem("easyfood_usuario");

    restaurantes = [];

    mostrarLogin();

    alert("Sua sessão expirou. Entre novamente.");
}

// ==========================================
// CADASTRO DE USUÁRIO
// ==========================================

formCadastroUsuario.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    const name = document
        .getElementById("nomeUsuarioCadastro")
        .value
        .trim();

    const email = document
        .getElementById("emailCadastro")
        .value
        .trim();

    const password = document
        .getElementById("senhaCadastro")
        .value;

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

            alert(
                resultado.erro ||
                resultado.mensagem ||
                "Não foi possível criar a conta."
            );

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

// ==========================================
// LOGIN
// ==========================================

formLogin.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    const email = document
        .getElementById("emailLogin")
        .value
        .trim();

    const password = document
        .getElementById("senhaLogin")
        .value;

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

            alert(
                resultado.erro ||
                resultado.mensagem ||
                "E-mail ou senha incorretos."
            );

            return;
        }

        if (!resultado.token) {

            alert("O servidor não retornou o token de autenticação.");

            return;
        }

        // Salvar token
        localStorage.setItem(
            "easyfood_token",
            resultado.token
        );

        // Salvar usuário
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

// ==========================================
// ALTERNAR LOGIN E CADASTRO
// ==========================================

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

alternarAutenticacao.addEventListener(
    "click",
    alternarModoAutenticacao
);

// ==========================================
// SAIR DA CONTA
// ==========================================

botaoSair.addEventListener("click", () => {

    localStorage.removeItem("easyfood_token");
    localStorage.removeItem("easyfood_usuario");

    restaurantes = [];

    mostrarLogin();

    alert("Você saiu da sua conta.");

});

// ==========================================
// VERIFICAR SESSÃO
// ==========================================

function verificarSessao() {

    const token = obterToken();

    if (!token) {

        mostrarLogin();

        return;
    }

    let usuario = null;

    try {

        const usuarioSalvo = localStorage.getItem("easyfood_usuario");

        usuario = usuarioSalvo
            ? JSON.parse(usuarioSalvo)
            : null;

    } catch {

        usuario = null;

    }

    mostrarAplicacao(usuario);

}

// ==========================================
// NORMALIZAR TEXTO
// ==========================================

function normalizarTexto(texto) {

    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

}

// ==========================================
// CARREGAR RESTAURANTES
// ==========================================

async function carregarRestaurantes() {

    try {

        const resposta = await fetch(API_URL, {

            headers: obterCabecalhoAutenticacao()

        });

        if (
            resposta.status === 401 ||
            resposta.status === 403
        ) {

            tratarSessaoExpirada();

            return;
        }

        const resultado = await resposta.json();

        if (!resposta.ok) {

            throw new Error(
                resultado.erro || "Erro ao consultar a API."
            );

        }

        restaurantes = resultado;

        mostrarRestaurantes(restaurantes);

    } catch (erro) {

        console.error(
            "Erro ao carregar restaurantes:",
            erro
        );

        lista.innerHTML = `
            <p class="mensagem-vazia">
                Não foi possível carregar os restaurantes.
                <br>
                Verifique se o servidor está funcionando.
            </p>
        `;

    }

}

// ==========================================
// MOSTRAR RESTAURANTES
// ==========================================

function mostrarRestaurantes(listaRestaurantes) {

    lista.innerHTML = "";

    if (listaRestaurantes.length === 0) {

        lista.innerHTML = `
            <p class="mensagem-vazia">
                Nenhum restaurante encontrado 🍽️
            </p>
        `;

        return;
    }

    listaRestaurantes.forEach((restaurante) => {

        const card = document.createElement("div");

        card.classList.add("card-restaurante");

        const emoji = escolherEmoji(restaurante.category);

        card.innerHTML = `

            <div class="card-imagem">

                <span class="emoji-restaurante">
                    ${emoji}
                </span>

            </div>

            <div class="card-conteudo">

                <h3>
                    ${restaurante.name}
                </h3>

                <p class="card-categoria">
                    ${restaurante.category || "Sem categoria"}
                </p>

                <div class="card-avaliacao">

                    <span>⭐</span>

                    <strong>
                        ${Number(restaurante.rating || 0).toFixed(1)}
                    </strong>

                    <span class="avaliacao-texto">
                        Avaliação
                    </span>

                </div>

                <div class="botoes-restaurante">

                    <button
                        class="botao-editar"
                        type="button"
                        onclick="editarRestaurante(${restaurante.id})"
                    >
                        ✏️ Editar
                    </button>

                    <button
                        class="botao-excluir"
                        type="button"
                        onclick="excluirRestaurante(${restaurante.id})"
                    >
                        🗑️ Excluir
                    </button>

                </div>

            </div>

        `;

        lista.appendChild(card);

    });

}

// ==========================================
// ESCOLHER EMOJI
// ==========================================

function escolherEmoji(categoria) {

    const categoriaNormalizada =
        normalizarTexto(categoria);

    if (categoriaNormalizada.includes("pizza")) {
        return "🍕";
    }

    if (
        categoriaNormalizada.includes("hamburg") ||
        categoriaNormalizada.includes("burger")
    ) {
        return "🍔";
    }

    if (
        categoriaNormalizada.includes("japones") ||
        categoriaNormalizada.includes("sushi")
    ) {
        return "🍣";
    }

    if (categoriaNormalizada.includes("acai")) {
        return "🍧";
    }

    if (
        categoriaNormalizada.includes("sobremesa") ||
        categoriaNormalizada.includes("doce")
    ) {
        return "🍰";
    }

    if (
        categoriaNormalizada.includes("bebida") ||
        categoriaNormalizada.includes("cafe")
    ) {
        return "🥤";
    }

    return "🍽️";

}

// ==========================================
// PESQUISAR
// ==========================================

pesquisa.addEventListener("input", () => {

    const texto = normalizarTexto(pesquisa.value);

    const resultados = restaurantes.filter((restaurante) => {

        const nome = normalizarTexto(restaurante.name);

        const categoria = normalizarTexto(restaurante.category);

        return (
            nome.includes(texto) ||
            categoria.includes(texto)
        );

    });

    mostrarRestaurantes(resultados);

});

// ==========================================
// FILTRAR CATEGORIAS
// ==========================================

botoesCategoria.forEach((botao) => {

    botao.addEventListener("click", () => {

        botoesCategoria.forEach((item) => {

            item.classList.remove("ativa");

        });

        botao.classList.add("ativa");

        const categoriaSelecionada =
            normalizarTexto(botao.dataset.categoria);

        const resultados = restaurantes.filter((restaurante) => {

            const categoria =
                normalizarTexto(restaurante.category);

            if (categoriaSelecionada === "japonesa") {

                return (
                    categoria.includes("japones") ||
                    categoria.includes("sushi")
                );

            }

            return categoria.includes(categoriaSelecionada);

        });

        mostrarRestaurantes(resultados);

    });

});

// ==========================================
// MOSTRAR TODOS
// ==========================================

mostrarTodos.addEventListener("click", () => {

    pesquisa.value = "";

    botoesCategoria.forEach((botao) => {

        botao.classList.remove("ativa");

    });

    mostrarRestaurantes(restaurantes);

});

// ==========================================
// CADASTRAR RESTAURANTE
// ==========================================

formRestaurante.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    const nome = document
        .getElementById("nome")
        .value
        .trim();

    const categoria = document
        .getElementById("categoria")
        .value
        .trim();

    const avaliacao = Number(
        document.getElementById("avaliacao").value || 0
    );

    if (!nome || !categoria) {

        alert("Nome e categoria são obrigatórios.");

        return;
    }

    if (
        !Number.isFinite(avaliacao) ||
        avaliacao < 0 ||
        avaliacao > 5
    ) {

        alert("A avaliação deve ser um número entre 0 e 5.");

        return;
    }

    try {

        const resposta = await fetch(API_URL, {

            method: "POST",

            headers: obterCabecalhoAutenticacao(),

            body: JSON.stringify({

                name: nome,

                category: categoria,

                rating: avaliacao

            })

        });

        const resultado = await resposta.json();

        if (
            resposta.status === 401 ||
            resposta.status === 403
        ) {

            tratarSessaoExpirada();

            return;
        }

        if (!resposta.ok) {

            alert(
                resultado.erro ||
                "Não foi possível cadastrar o restaurante."
            );

            return;
        }

        alert("Restaurante cadastrado com sucesso! 🍔");

        formRestaurante.reset();

        await carregarRestaurantes();

        document
            .getElementById("restaurantes")
            .scrollIntoView({
                behavior: "smooth"
            });

    } catch (erro) {

        console.error("Erro ao cadastrar:", erro);

        alert("Não foi possível cadastrar o restaurante.");

    }

});

// ==========================================
// EDITAR RESTAURANTE
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

    document.getElementById("modalEdicao").style.display = "flex";

}

// ==========================================
// FECHAR MODAL
// ==========================================

function fecharModal() {

    document.getElementById("modalEdicao").style.display = "none";

    restauranteEditandoId = null;

}

document
    .getElementById("fecharModal")
    .addEventListener("click", fecharModal);

document
    .getElementById("cancelarEdicao")
    .addEventListener("click", fecharModal);

// ==========================================
// SALVAR EDIÇÃO
// ==========================================

document
    .getElementById("formEdicao")
    .addEventListener("submit", async (evento) => {

        evento.preventDefault();

        if (restauranteEditandoId === null) {
            return;
        }

        const nome = document
            .getElementById("editarNome")
            .value
            .trim();

        const categoria = document
            .getElementById("editarCategoria")
            .value
            .trim();

        const avaliacao = Number(
            document.getElementById("editarAvaliacao").value
        );

        if (!nome || !categoria) {

            alert("Nome e categoria são obrigatórios.");

            return;
        }

        if (
            !Number.isFinite(avaliacao) ||
            avaliacao < 0 ||
            avaliacao > 5
        ) {

            alert("A avaliação deve ser um número entre 0 e 5.");

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

                        rating: avaliacao

                    })

                }
            );

            const resultado = await resposta.json();

            if (
                resposta.status === 401 ||
                resposta.status === 403
            ) {

                tratarSessaoExpirada();

                return;
            }

            if (!resposta.ok) {

                alert(
                    resultado.erro ||
                    "Não foi possível editar o restaurante."
                );

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

// ==========================================
// EXCLUIR RESTAURANTE
// ==========================================

async function excluirRestaurante(id) {

    const confirmar = confirm(
        "Deseja realmente excluir este restaurante?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const resposta = await fetch(
            `${API_URL}/${id}`,
            {

                method: "DELETE",

                headers: obterCabecalhoAutenticacao()

            }
        );

        const resultado = await resposta.json();

        if (
            resposta.status === 401 ||
            resposta.status === 403
        ) {

            tratarSessaoExpirada();

            return;
        }

        if (!resposta.ok) {

            alert(
                resultado.erro ||
                "Não foi possível excluir o restaurante."
            );

            return;
        }

        alert("Restaurante excluído com sucesso! 🗑️");

        await carregarRestaurantes();

    } catch (erro) {

        console.error("Erro ao excluir:", erro);

        alert("Não foi possível excluir o restaurante.");

    }

}

// ==========================================
// INICIAR A APLICAÇÃO
// ==========================================

verificarSessao();
