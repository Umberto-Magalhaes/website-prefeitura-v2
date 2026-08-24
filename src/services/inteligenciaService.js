// ========================================
// CENTRAL DE INTELIGÊNCIA DA OUVIA
// ========================================

const {
    gerarDiagnostico
} = require('../motores/motorDiagnostico');

const { gerarRecomendacoes } = require('../motores/motorRecomendacoes');

const {
    gerarRespostaExecutiva
} = require("./orquestradorExecutivo");

const nucleoCognitivo = require("../inteligencia/nucleoCognitivo");

const inteligenciaRepository =
    require("../repositories/inteligenciaRepository");



// ----------------------------------------
// SAÚDE OPERACIONAL
// ----------------------------------------

async function calcularSaudeOperacional(pool) {

    const dados = await inteligenciaRepository.buscarDadosSaudeOperacional(pool);
console.log("DADOS REAIS SAÚDE OPERACIONAL:", dados);

const referencias =
    await inteligenciaRepository.buscarReferenciasOperacionais(pool);

console.log(
    "REFERÊNCIAS OPERACIONAIS DOS SERVIÇOS:",
    referencias
);

const classificacaoTemporal =
    await inteligenciaRepository.buscarClassificacaoTemporalDemandas(pool);

console.log(
    "CLASSIFICAÇÃO TEMPORAL DAS DEMANDAS:",
    classificacaoTemporal
);

    return {
        classificacao: "Boa",
        cor: "verde",
        percentual: 82,
       detalhes: {
    atrasadas: dados.atrasadas,
    abertas: dados.abertas,
    tempoMedio: dados.tempoMedioAbertas
}
    };

}

// ----------------------------------------
// PRINCIPAL GARGALO
// ----------------------------------------
async function calcularPrincipalGargalo(pool) {

}

// ----------------------------------------
// TENDÊNCIA
// ----------------------------------------
async function calcularTendencia(pool) {

}

// ----------------------------------------
// RECOMENDAÇÃO GERENCIAL
// ----------------------------------------
async function calcularRecomendacaoGerencial(pool) {

}

// ========================================

// =========================================================
// DIAGNÓSTICO EXECUTIVO
// =========================================================

async function gerarDiagnosticoExecutivo(db) {

    const saude = await calcularSaudeOperacional(db);

    const diagnostico = gerarDiagnostico({
        saudeOperacional: saude
    });

    return {

        dataGeracao: new Date(),

        saudeOperacional: saude,

        situacaoGeral: diagnostico.resumo,

       principalAtencao: null,

        servicoCritico: diagnostico.nivel,

        recomendacao: diagnostico.recomendacao,

        mensagemFinal: diagnostico.resumo

    };

}

// ==========================================================
// PRESSÃO OPERACIONAL POR INTENÇÃO
// Organiza as demandas por tipo de serviço, da maior
// concentração de protocolos para a menor.
// ==========================================================


        
//=====================================================
// RESUMO DO DASHBOARD
//=====================================================

async function gerarResumoDashboard(db) {

    const resultado = await db.query(`
        SELECT
            COUNT(*) FILTER (
                WHERE data_abertura::date = CURRENT_DATE
            ) AS protocolos_hoje,

            COUNT(*) FILTER (
                WHERE UPPER(COALESCE(status_atual, ''))
                      LIKE '%EXECU%'
            ) AS em_execucao,

            COUNT(*) FILTER (
                WHERE UPPER(COALESCE(status_atual, ''))
                      LIKE '%CONCLU%'
                  AND data_encerramento::date = CURRENT_DATE
            ) AS concluidos_hoje,

            COUNT(*) FILTER (
                WHERE UPPER(COALESCE(status_atual, ''))
                      NOT LIKE '%CONCLU%'
                  AND data_abertura < CURRENT_TIMESTAMP - INTERVAL '3 days'
            ) AS atencao_imediata

        FROM protocolos
    `);

    const dados = resultado.rows[0];

    const resultadoCognitivo =
    await nucleoCognitivo.executar(db);

    const diagnostico =
    await gerarDiagnosticoExecutivo(db);

    const recomendacoes =
    await gerarRecomendacoes(db);

    const respostaExecutiva =
    resultadoCognitivo?.respostaExecutiva || null;
    
    console.log("=== TESTE RESPOSTA EXECUTIVA ===");
    console.dir(respostaExecutiva, { depth: null });

   return {
    protocolosHoje:
        Number(dados.protocolos_hoje),

    emExecucao:
        Number(dados.em_execucao),

    concluidosHoje:
        Number(dados.concluidos_hoje),

    atencaoImediata:
        Number(dados.atencao_imediata),

    diagnostico,

    prioridades:
        resultadoCognitivo?.prioridades || [],

    alertas:
        resultadoCognitivo?.alertas || [],

    recomendacoes,

    evolucao:
        resultadoCognitivo?.evolucao || null,

    respostaExecutiva: resultadoCognitivo?.respostaExecutiva || respostaExecutiva,

    resumoExecutivo:
    resultadoCognitivo?.respostaExecutiva?.resumoExecutivo ||
    resultadoCognitivo?.respostaExecutiva?.situacaoGeral ||
    respostaExecutiva?.resumoExecutivo ||
    respostaExecutiva?.situacaoGeral ||
    null,

respostaConversacional:
    resultadoCognitivo?.respostaExecutiva?.respostaConversacional ||
    respostaExecutiva?.respostaConversacional ||
    null,

    resultadoCognitivo
};
}

module.exports = {

    calcularSaudeOperacional,
    calcularPrincipalGargalo,
    calcularTendencia,
    calcularRecomendacaoGerencial,
    gerarDiagnosticoExecutivo,
    gerarResumoDashboard

};