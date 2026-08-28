require("dotenv").config();

// ======================================================
// OUVIA - TESTE DO MOTOR DE TENDÊNCIA POR SERVIÇO
// ======================================================

const pool = require("./db/connection");

const {
    calcularTendenciaPorServico
} = require("./services/inteligenciaService");

async function testarTendenciaPorServico() {

    try {

        console.log("\n========================================");
        console.log("OUVIA - TENDÊNCIA POR SERVIÇO");
        console.log("========================================\n");

        const resultado = await calcularTendenciaPorServico(pool);

        console.table(resultado);

        console.log("\n========================================");
        console.log("FIM DO TESTE");
        console.log("========================================\n");

    } catch (erro) {

        console.error(
            "ERRO AO TESTAR TENDÊNCIA POR SERVIÇO:",
            erro
        );

    } 

    
}

testarTendenciaPorServico();