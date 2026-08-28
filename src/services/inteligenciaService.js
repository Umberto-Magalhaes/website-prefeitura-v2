// ========================================
// CENTRAL DE INTELIGÊNCIA DA OUVIA
// ========================================

const {
    gerarDiagnostico
} = require('../motores/motorDiagnostico');

const { gerarRecomendacoes } = require('../motores/motorRecomendacoes');

const {
    analisarTendencia
} = require("../motores/motorTendencia");

const { gerarRespostaExecutiva
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

    referenciasOperacionais: referencias,
    classificacaoTemporal,

    detalhes: {
        atrasadas: dados.atrasadas,
        abertas: dados.abertas,
        tempoMedio: dados.tempoMedioAbertas
    }
};

}

// ----------------------------------------
// SAÚDE OPERACIONAL POR SERVIÇO
// ----------------------------------------

async function calcularSaudePorServico(pool) {

    const classificacoes =
        await inteligenciaRepository.buscarClassificacaoTemporalDemandas(pool);

    const agrupado = {};

    for (const item of classificacoes) {

        const chave = item.intencaoId;

        if (!agrupado[chave]) {
            agrupado[chave] = {
                intencaoId: item.intencaoId,
                servico: item.servico,
                totalAbertas: 0,
                normal: 0,
                referenciaExcedida: 0,
                atencao: 0,
                critico: 0
            };
        }

        const grupo = agrupado[chave];

        grupo.totalAbertas++;

        if (item.classificacaoTemporal === "NORMAL") {
            grupo.normal++;
        } else if (item.classificacaoTemporal === "REFERENCIA_EXCEDIDA") {
            grupo.referenciaExcedida++;
        } else if (item.classificacaoTemporal === "ATENCAO") {
            grupo.atencao++;
        } else if (item.classificacaoTemporal === "CRITICO") {
            grupo.critico++;
        }
    }

    return Object.values(agrupado).map((grupo) => {

        const pontuacao =
            (
                grupo.normal * 1.00 +
                grupo.referenciaExcedida * 0.75 +
                grupo.atencao * 0.45 +
                grupo.critico * 0.10
            ) / grupo.totalAbertas;

        const percentualSaude =
            Number((pontuacao * 100).toFixed(2));

        let classificacaoSaude = "CRITICA";

        if (percentualSaude >= 85) {
            classificacaoSaude = "BOA";
        } else if (percentualSaude >= 70) {
            classificacaoSaude = "SATISFATORIA";
        } else if (percentualSaude >= 50) {
            classificacaoSaude = "ATENCAO";
        }

        return {
            ...grupo,
            percentualSaude,
            classificacaoSaude
        };
    });
}

// ----------------------------------------
// PRINCIPAL GARGALO
// ----------------------------------------

async function calcularPrincipalGargalo(pool) {

    const saudePorServico =
        await calcularSaudePorServico(pool);

    if (!saudePorServico || saudePorServico.length === 0) {
        return null;
    }

    const ranking = [...saudePorServico].sort((a, b) => {

    if (a.percentualSaude !== b.percentualSaude) {
        return a.percentualSaude - b.percentualSaude;
    }

    if (b.critico !== a.critico) {
        return b.critico - a.critico;
    }

    if (b.atencao !== a.atencao) {
        return b.atencao - a.atencao;
    }

    return b.totalAbertas - a.totalAbertas;
});

    const principal = ranking[0];

    return {
        intencaoId: principal.intencaoId,
        servico: principal.servico,
        percentualSaude: principal.percentualSaude,
        classificacaoSaude: principal.classificacaoSaude,
        totalAbertas: principal.totalAbertas,
        normal: principal.normal,
        referenciaExcedida: principal.referenciaExcedida,
        atencao: principal.atencao,
        critico: principal.critico
    };
}

// ----------------------------------------
// TENDÊNCIA
// ----------------------------------------

async function calcularTendencia(pool) {

    const resultado = await pool.query(`
        SELECT
            COUNT(*) FILTER (
                WHERE data_abertura >= CURRENT_TIMESTAMP - INTERVAL '7 days'
            )::int AS periodo_atual,

            COUNT(*) FILTER (
                WHERE data_abertura >= CURRENT_TIMESTAMP - INTERVAL '14 days'
                  AND data_abertura < CURRENT_TIMESTAMP - INTERVAL '7 days'
            )::int AS periodo_anterior

        FROM protocolos
    `);

    const periodoAtual = resultado.rows[0]?.periodo_atual || 0;
    const periodoAnterior = resultado.rows[0]?.periodo_anterior || 0;

    return analisarTendencia(
    periodoAtual,
    periodoAnterior
);
}

// =============================================
// TENDÊNCIA POR SERVIÇO
// =============================================

async function calcularTendenciaPorServico(pool) {

    const resultado = await pool.query(`
        SELECT
            p.intencao_id,
            i.nome AS servico,

            COUNT(*) FILTER (
                WHERE p.data_abertura >= CURRENT_TIMESTAMP - INTERVAL '7 days'
            )::int AS periodo_atual,

            COUNT(*) FILTER (
                WHERE p.data_abertura >= CURRENT_TIMESTAMP - INTERVAL '14 days'
                  AND p.data_abertura < CURRENT_TIMESTAMP - INTERVAL '7 days'
            )::int AS periodo_anterior

        FROM protocolos p

        INNER JOIN intencoes i
            ON i.id = p.intencao_id

        WHERE p.intencao_id IS NOT NULL

        GROUP BY
            p.intencao_id,
            i.nome

        ORDER BY
            i.nome
    `);

    return resultado.rows.map((item) => {

        const periodoAtual = Number(item.periodo_atual) || 0;
        const periodoAnterior = Number(item.periodo_anterior) || 0;

        const analise = analisarTendencia(
            periodoAtual,
            periodoAnterior
        );

        return {
            intencaoId: Number(item.intencao_id),
            servico: item.servico,
            ...analise
        };
    });
}

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

    const saudePorServico =
    await calcularSaudePorServico(db);

console.log("=== TESTE SAÚDE POR SERVIÇO ===");
console.dir(saudePorServico, { depth: null });

const principalGargalo =
    await calcularPrincipalGargalo(db);

console.log("=== TESTE PRINCIPAL GARGALO ===");
console.dir(principalGargalo, { depth: null });

    const tendencia =
    await calcularTendencia(db);

    const tendenciaPorServico =
    await calcularTendenciaPorServico(db);

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

    tendencia,

    tendenciaPorServico,

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
    calcularSaudePorServico,
    calcularPrincipalGargalo,
    calcularTendencia,
    calcularTendenciaPorServico,
    gerarDiagnosticoExecutivo,
    gerarResumoDashboard

};