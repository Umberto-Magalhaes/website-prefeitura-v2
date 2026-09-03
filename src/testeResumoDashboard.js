require("dotenv").config();

const db = require("./db/connection");

const {
    gerarResumoDashboard
} = require("./services/inteligenciaService");

async function testarResumoDashboard() {

    try {

        console.log("\n==========================================");
        console.log(" OUVIA - TESTE DE INTEGRAÇÃO DO RESUMO");
        console.log("==========================================\n");

        const resultado = await gerarResumoDashboard(db);

        console.log("\n==========================================");
        console.log(" TENDÊNCIA POR SERVIÇO NO RESUMO");
        console.log("==========================================\n");

        console.dir(
            resultado.tendenciaPorServico,
            { depth: null }
        );

        console.log("\n==========================================");
console.log(" SAÚDE POR SERVIÇO NO DIAGNÓSTICO");
console.log("==========================================\n");

console.dir(
    resultado.diagnostico?.saudePorServico,
    { depth: null }
);

console.log("\n==========================================");
console.log(" PRIORIZAÇÃO GERENCIAL POR SERVIÇO NO RESUMO");
console.log("==========================================\n");

console.dir(
    resultado.priorizacaoGerencialPorServico,
    { depth: null }
);

        console.log("\n==========================================");
        console.log(" FIM DO TESTE");
        console.log("==========================================\n");

    } catch (erro) {

        console.error(
            "ERRO AO TESTAR RESUMO DO DASHBOARD:",
            erro
        );
    }
}

testarResumoDashboard();