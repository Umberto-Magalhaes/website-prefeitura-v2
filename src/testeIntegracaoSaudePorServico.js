require("dotenv").config();

// ============================================================
// OUVIA - TESTE DE INTEGRAÇÃO
// SAÚDE OPERACIONAL POR SERVIÇO
// Consulta dados reais do PostgreSQL.
// NÃO altera o banco de dados.
// ============================================================

const pool = require("./db/connection");

const {
    calcularSaudePorServico
} = require("./services/inteligenciaService");


async function testarIntegracaoSaudePorServico() {

    try {

        console.log("\n==========================================");
        console.log(" OUVIA - SAÚDE OPERACIONAL POR SERVIÇO");
        console.log(" TESTE DE INTEGRAÇÃO COM O BANCO");
        console.log("==========================================\n");

        const resultado =
            await calcularSaudePorServico(pool);

        console.table(resultado);

        console.log("\n==========================================");
        console.log(" RESULTADO COMPLETO");
        console.log("==========================================\n");

        console.dir(resultado, { depth: null });

        console.log("\n==========================================");
        console.log(" FIM DO TESTE");
        console.log("==========================================\n");

    } catch (erro) {

        console.error(
            "ERRO AO TESTAR SAÚDE POR SERVIÇO:",
            erro
        );
    }
}


testarIntegracaoSaudePorServico();