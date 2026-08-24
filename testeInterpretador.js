const {
    interpretarPergunta
} = require("./src/services/interpretadorPerguntas");

const perguntas = [
    "Qual o principal problema da cidade?",
    "O município está melhorando?",
    "Existem alertas críticos?",
    "Como está a coleta de lixo?",
    "Quanto tempo demora o atendimento?",
    "O que você recomenda?",
    "Como está a situação da cidade?"
];

for (const pergunta of perguntas) {
    console.log("--------------------------------");
    console.log(pergunta);

    console.dir(
        interpretarPergunta(pergunta),
        { depth: null }
    );
}