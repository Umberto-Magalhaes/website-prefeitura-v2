// ==========================================================
// OUVIA - NÚCLEO COGNITIVO
// Sistema Inteligente de Apoio à Gestão Pública
// ==========================================================

const motorPriorizacao = require("../motores/motorPriorizacao");

const {
    gerarAlertas
} = require("../motores/motorAlertas");

const {
    gerarRecomendacoes
} = require("../motores/motorRecomendacoes");

const {
    analisarEvolucao
} = require("../motores/motorEvolucao");

const {
    gerarRespostaExecutiva
} = require("../services/orquestradorExecutivo");

const inteligenciaRepository =
    require("../repositories/inteligenciaRepository");

// ----------------------------------------------------------
// EXECUÇÃO DO NÚCLEO COGNITIVO
// ----------------------------------------------------------

async function executar(db, prefeituraId = null) {
    const resultadoPriorizacao =
        await motorPriorizacao.executar(db, prefeituraId);

    const prioridades =
    resultadoPriorizacao?.rankingCompleto || [];

if (
    prioridades.length > 0 &&
    resultadoPriorizacao?.nivelPressao
) {
    prioridades[0] = {
        ...prioridades[0],
        nivelPressao: resultadoPriorizacao.nivelPressao
    };
}

    const alertasResultado =
        await gerarAlertas(db);

    const alertas =
        alertasResultado?.alertas || [];

   const recomendacoes =
    await gerarRecomendacoes(
        db,
        resultadoPriorizacao,
        alertas
    );
        const evolucao =
    await inteligenciaRepository.buscarEvolucaoAdministrativa(
        db,
        prefeituraId
    );

    const analiseEvolucao =
    analisarEvolucao(evolucao);

    const situacaoEquipes =
    await inteligenciaRepository.buscarSituacaoEquipes(db);

    const impedimentosAtivos =
    await inteligenciaRepository.buscarImpedimentosAtivos(db);

    const respostaExecutiva =
        await gerarRespostaExecutiva({
            diagnostico: null,
            prioridades,
            alertas,
            recomendacoes,
            evolucao: analiseEvolucao,
            situacaoEquipes,
            impedimentosAtivos
        });

    return {
        dataAnalise: new Date(),
        priorizacao: resultadoPriorizacao,
        prioridades,
        alertas,
        recomendacoes,
        diagnostico: null,
        evolucao,
        analiseEvolucao,
        situacaoEquipes,
        impedimentosAtivos,
 respostaExecutiva
    };
}

module.exports = {
    executar
};