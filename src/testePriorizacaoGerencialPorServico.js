require("dotenv").config();

const pool = require("./db/connection");

const {
    calcularPriorizacaoGerencialPorServico
} = require("./services/inteligenciaService");

async function testar() {
    try {
        console.log("\n=== TESTE PRIORIZAÇÃO GERENCIAL POR SERVIÇO ===\n");

        const resultado =
            await calcularPriorizacaoGerencialPorServico(pool);

        console.table(resultado);

        console.log("\n=== RESULTADO COMPLETO ===\n");

        console.dir(resultado, {
            depth: null
        });

    } catch (erro) {
        console.error(
            "ERRO NO TESTE DE PRIORIZAÇÃO GERENCIAL:",
            erro
        );
    }
}

testar();