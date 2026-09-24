// Lista de restaurantes
const restaurantes = [
    {
        nome: "Burger House",
        categoria: "Hambúrguer",
        avaliacao: 4.8,
        imagem: "🍔"
    },

    {
        nome: "Pizza Bella",
        categoria: "Pizza",
        avaliacao: 4.7,
        imagem: "🍕"
    },

    {
        nome: "Sushi World",
        categoria: "Japonesa",
        avaliacao: 4.9,
        imagem: "🍣"
    },

    {
        nome: "Açaí Tropical",
        categoria: "Açaí",
        avaliacao: 4.6,
        imagem: "🍧"
    },

    {
        nome: "Cantinho da Massa",
        categoria: "Massas",
        avaliacao: 4.5,
        imagem: "🍝"
    }
];


// Área onde os cards serão exibidos
const listaRestaurantes = document.getElementById("listaRestaurantes");


// Função para mostrar os restaurantes
function mostrarRestaurantes(lista) {

    // Limpa a área antes de adicionar os cards
    listaRestaurantes.innerHTML = "";


    // Percorre todos os restaurantes
    lista.forEach(restaurante => {

        // Cria o card
        const card = document.createElement("div");

        // Adiciona a classe CSS
        card.classList.add("card-restaurante");


        // Conteúdo do card
        card.innerHTML = `
            <div class="imagem-restaurante">
                ${restaurante.imagem}
            </div>

            <div class="informacoes-restaurante">

                <h3>
                    ${restaurante.nome}
                </h3>

                <p class="categoria-restaurante">
                    ${restaurante.categoria}
                </p>

                <p class="avaliacao-restaurante">
                    ⭐ ${restaurante.avaliacao}
                </p>

                <button class="botao-restaurante">
                    Ver restaurante
                </button>

            </div>
        `;


        // Adiciona o card na página
        listaRestaurantes.appendChild(card);

    });
}


// Mostra os restaurantes quando a página carrega
mostrarRestaurantes(restaurantes);
