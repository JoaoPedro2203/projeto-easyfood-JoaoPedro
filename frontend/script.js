const API_URL = "http://localhost:3000/api/restaurantes";

const form = document.getElementById("formRestaurante");
const lista = document.getElementById("listaRestaurantes");
const pesquisa = document.getElementById("pesquisa");
const mostrarTodos = document.getElementById("mostrarTodos");
const botoesCategoria = document.querySelectorAll(".categoria");

let restaurantes = [];

let restauranteEditandoId = null;


// ==========================================
// NORMALIZAR TEXTO
// ==========================================

function normalizarTexto(texto) {

    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

}


// ==========================================
// CARREGAR RESTAURANTES DA API
// ==========================================

async function carregarRestaurantes() {

    try {

        const resposta = await fetch(API_URL);

        if (!resposta.ok) {

            throw new Error(
                "Erro ao consultar a API."
            );

        }

        restaurantes = await resposta.json();

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

        const card =
            document.createElement("div");


        card.classList.add(
            "card-restaurante"
        );


        const emoji =
            escolherEmoji(
                restaurante.category
            );


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
                    ${restaurante.category}
                </p>


                <div class="card-avaliacao">

                    <span>
                        ⭐
                    </span>

                    <strong>
                        ${Number(
                            restaurante.rating
                        ).toFixed(1)}
                    </strong>

                    <span class="avaliacao-texto">
                        Avaliação
                    </span>

                </div>


                <div class="botoes-restaurante">

                    <button
                        class="botao-editar"
                        onclick="editarRestaurante(${restaurante.id})"
                    >
                        ✏️ Editar
                    </button>


                    <button
                        class="botao-excluir"
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


    if (
        categoriaNormalizada.includes("pizza")
    ) {

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
        categoriaNormalizada.includes("japonesa") ||
        categoriaNormalizada.includes("sushi")
    ) {

        return "🍣";

    }


    if (
        categoriaNormalizada.includes("acai")
    ) {

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

pesquisa.addEventListener(
    "input",
    () => {

        const texto =
            normalizarTexto(
                pesquisa.value
            );


        const resultados =
            restaurantes.filter(
                (restaurante) => {

                    const nome =
                        normalizarTexto(
                            restaurante.name
                        );


                    const categoria =
                        normalizarTexto(
                            restaurante.category
                        );


                    return (
                        nome.includes(texto) ||
                        categoria.includes(texto)
                    );

                }
            );


        mostrarRestaurantes(
            resultados
        );

    }
);


// ==========================================
// FILTRAR CATEGORIAS
// ==========================================

botoesCategoria.forEach(
    (botao) => {

        botao.addEventListener(
            "click",
            () => {

                botoesCategoria.forEach(
                    (item) => {

                        item.classList.remove(
                            "ativa"
                        );

                    }
                );


                botao.classList.add(
                    "ativa"
                );


                const categoriaSelecionada =
                    normalizarTexto(
                        botao.dataset.categoria
                    );


                const resultados =
                    restaurantes.filter(
                        (restaurante) => {

                            const categoria =
                                normalizarTexto(
                                    restaurante.category
                                );


                            if (
                                categoriaSelecionada === "japonesa" ||
                                categoriaSelecionada === "japones"
                            ) {

                                return (
                                    categoria.includes("japones") ||
                                    categoria.includes("japonesa") ||
                                    categoria.includes("sushi")
                                );

                            }


                            return categoria.includes(
                                categoriaSelecionada
                            );

                        }
                    );


                mostrarRestaurantes(
                    resultados
                );

            }
        );

    }
);


// ==========================================
// MOSTRAR TODOS
// ==========================================

mostrarTodos.addEventListener(
    "click",
    () => {

        pesquisa.value = "";


        botoesCategoria.forEach(
            (botao) => {

                botao.classList.remove(
                    "ativa"
                );

            }
        );


        mostrarRestaurantes(
            restaurantes
        );

    }
);


// ==========================================
// CADASTRAR
// ==========================================

form.addEventListener(
    "submit",
    async (evento) => {

        evento.preventDefault();


        const nome =
            document
                .getElementById("nome")
                .value
                .trim();


        const categoria =
            document
                .getElementById("categoria")
                .value
                .trim();


        const avaliacao =
            document
                .getElementById("avaliacao")
                .value;


        try {

            const resposta =
                await fetch(
                    API_URL,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name: nome,

                            category: categoria,

                            rating: avaliacao

                        })

                    }
                );


            const resultado =
                await resposta.json();


            if (!resposta.ok) {

                alert(
                    resultado.erro
                );

                return;

            }


            alert(
                "Restaurante cadastrado com sucesso! 🍔"
            );


            form.reset();


            await carregarRestaurantes();


            document
                .getElementById(
                    "restaurantes"
                )
                .scrollIntoView({
                    behavior: "smooth"
                });

        } catch (erro) {

            console.error(
                "Erro ao cadastrar:",
                erro
            );


            alert(
                "Não foi possível cadastrar o restaurante."
            );

        }

    }
);


// ==========================================
// CRIAR MODAL DE EDIÇÃO
// ==========================================

function criarModalEdicao() {

    const modal =
        document.createElement("div");


    modal.id = "modalEdicao";


    modal.classList.add(
        "modal"
    );


    modal.innerHTML = `

        <div class="modal-conteudo">

            <button
                id="fecharModal"
                class="fechar-modal"
                type="button"
            >
                ×
            </button>


            <h2>
                ✏️ Editar restaurante
            </h2>


            <p>
                Altere as informações do restaurante.
            </p>


            <form id="formEdicao">

                <div class="campo">

                    <label for="editarNome">
                        Nome do restaurante
                    </label>

                    <input
                        type="text"
                        id="editarNome"
                        required
                    >

                </div>


                <div class="campo">

                    <label for="editarCategoria">
                        Categoria
                    </label>

                    <input
                        type="text"
                        id="editarCategoria"
                        required
                    >

                </div>


                <div class="campo">

                    <label for="editarAvaliacao">
                        Avaliação
                    </label>

                    <input
                        type="number"
                        id="editarAvaliacao"
                        min="0"
                        max="5"
                        step="0.1"
                        required
                    >

                </div>


                <div class="botoes-modal">

                    <button
                        type="button"
                        id="cancelarEdicao"
                        class="botao-cancelar"
                    >
                        Cancelar
                    </button>


                    <button
                        type="submit"
                        class="botao-salvar"
                    >
                        💾 Salvar alterações
                    </button>

                </div>

            </form>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    document
        .getElementById("fecharModal")
        .addEventListener(
            "click",
            fecharModal
        );


    document
        .getElementById("cancelarEdicao")
        .addEventListener(
            "click",
            fecharModal
        );


    document
        .getElementById("formEdicao")
        .addEventListener(
            "submit",
            salvarEdicao
        );


    modal.addEventListener(
        "click",
        (evento) => {

            if (
                evento.target === modal
            ) {

                fecharModal();

            }

        }
    );

}


// ==========================================
// ABRIR MODAL
// ==========================================

function editarRestaurante(id) {

    const restaurante =
        restaurantes.find(
            (item) =>
                item.id === id
        );


    if (!restaurante) {

        alert(
            "Restaurante não encontrado."
        );

        return;

    }


    restauranteEditandoId =
        id;


    document
        .getElementById("editarNome")
        .value =
        restaurante.name;


    document
        .getElementById("editarCategoria")
        .value =
        restaurante.category;


    document
        .getElementById("editarAvaliacao")
        .value =
        restaurante.rating;


    const modal =
        document.getElementById(
            "modalEdicao"
        );


    modal.classList.add(
        "aberto"
    );

}


// ==========================================
// FECHAR MODAL
// ==========================================

function fecharModal() {

    const modal =
        document.getElementById(
            "modalEdicao"
        );


    modal.classList.remove(
        "aberto"
    );


    restauranteEditandoId =
        null;

}


// ==========================================
// SALVAR EDIÇÃO
// ==========================================

async function salvarEdicao(evento) {

    evento.preventDefault();


    if (
        restauranteEditandoId === null
    ) {

        return;

    }


    const nome =
        document
            .getElementById("editarNome")
            .value
            .trim();


    const categoria =
        document
            .getElementById("editarCategoria")
            .value
            .trim();


    const avaliacao =
        document
            .getElementById("editarAvaliacao")
            .value;


    const nota =
        Number(avaliacao);


    if (
        !nome ||
        !categoria
    ) {

        alert(
            "Nome e categoria são obrigatórios."
        );

        return;

    }


    if (
        !Number.isFinite(nota) ||
        nota < 0 ||
        nota > 5
    ) {

        alert(
            "A avaliação deve ser um número entre 0 e 5."
        );

        return;

    }


    try {

        const resposta =
            await fetch(
                `${API_URL}/${restauranteEditandoId}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name: nome,

                        category: categoria,

                        rating: nota

                    })

                }
            );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            alert(
                resultado.erro
            );

            return;

        }


        fecharModal();


        alert(
            "Restaurante atualizado com sucesso! ✏️"
        );


        await carregarRestaurantes();

    } catch (erro) {

        console.error(
            "Erro ao editar:",
            erro
        );


        alert(
            "Não foi possível editar o restaurante."
        );

    }

}


// ==========================================
// EXCLUIR
// ==========================================

async function excluirRestaurante(id) {

    const confirmar =
        confirm(
            "Deseja realmente excluir este restaurante?"
        );


    if (!confirmar) {

        return;

    }


    try {

        const resposta =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            alert(
                resultado.erro
            );

            return;

        }


        alert(
            "Restaurante excluído com sucesso! 🗑️"
        );


        await carregarRestaurantes();

    } catch (erro) {

        console.error(
            "Erro ao excluir:",
            erro
        );


        alert(
            "Não foi possível excluir o restaurante."
        );

    }

}


// ==========================================
// INICIAR
// ==========================================

criarModalEdicao();

carregarRestaurantes();