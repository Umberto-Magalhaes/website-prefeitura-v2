// ======================================================
// TESTE CONTROLADO - MOTOR DE TENDÊNCIA OPERACIONAL
// ======================================================

const {
    analisarTendencia
} = require("../motores/motorTendencia");

// ======================================================
// CENÁRIOS CONTROLADOS
// Não acessa nem altera o banco de dados
// ======================================================

const cenarios = [
    {
        nome: "CRESCENTE",
        periodoAtual: 15,
        periodoAnterior: 10,
        variacaoEsperada: 50
    },
    {
        nome: "DECRESCENTE",
        periodoAtual: 8,
        periodoAnterior: 10,
        variacaoEsperada: -20
    },
    {
        nome: "ESTAVEL",
        periodoAtual: 105,
        periodoAnterior: 100,
        variacaoEsperada: 5
    }
];

// ======================================================
// EXECUÇÃO
// ======================================================

console.log("\n============================================");
console.log(" TESTE CONTROLADO - MOTOR DE TENDÊNCIA");
console.log("============================================\n");

for (const cenario of cenarios) {
    const resultado = analisarTendencia(
        cenario.periodoAtual,
        cenario.periodoAnterior
    );

    const tendenciaCorreta =
        resultado.tendencia === cenario.nome;

    const variacaoCorreta =
        resultado.variacaoPercentual === cenario.variacaoEsperada;

    const aprovado =
        tendenciaCorreta && variacaoCorreta;

    console.log(`Cenário esperado: ${cenario.nome}`);
    console.log(`Período atual: ${resultado.periodoAtual}`);
    console.log(`Período anterior: ${resultado.periodoAnterior}`);
    console.log(`Variação calculada: ${resultado.variacaoPercentual}%`);
    console.log(`Variação esperada: ${cenario.variacaoEsperada}%`);
    console.log(`Tendência calculada: ${resultado.tendencia}`);
    console.log(
        `Resultado do teste: ${aprovado ? "APROVADO" : "REPROVADO"}`
    );
    console.log("--------------------------------------------");
}