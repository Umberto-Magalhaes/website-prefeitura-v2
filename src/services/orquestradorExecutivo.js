// ============================================
// ORQUESTRADOR EXECUTIVO DA OUVIA
// ============================================

const {
    identificarPerfil,
    gerarNarrativaPorPerfil
} = require("./narrativaExecutiva");

function montarBriefingExecutivo({
    situacaoGeral,
    principalPrioridade,
    principalAlerta,
    principalRecomendacao
}) {

    const partes = [];
    
    if (situacaoGeral) {
        partes.push(situacaoGeral);
    }

    if (principalPrioridade) {
    partes.push(
        `É recomendável dedicar atenção prioritária ao serviço de ${principalPrioridade}, por concentrar o maior volume de ocorrências registradas no período analisado.`
    );
}

   if (principalAlerta) {
    partes.push(
        `Ponto de atenção: ${principalAlerta}`
    );
}

   if (principalRecomendacao) {
    partes.push(
        `Recomendação estratégica: ${principalRecomendacao}`
    );
}

    return partes.join(" ");
}

function gerarSinteseExecutiva({
    diagnostico,
    prioridades,
    alertas,
    recomendacoes,
    perfil,
    situacaoEquipes,
    impedimentosAtivos = []
}) {

    const situacao =
    perfil === "CRITICO"
        ? "existe uma situação operacional crítica que requer intervenção gerencial prioritária"
        : perfil === "ATENCAO"
        ? "existe um cenário operacional que merece acompanhamento gerencial"
        : diagnostico?.resumo ||
          diagnostico?.situacaoGeral ||
          diagnostico?.situacao ||
          "a situação operacional apresenta estabilidade no período analisado";

    const principalPrioridade =
        prioridades?.[0]?.servico ||
        prioridades?.[0]?.principalServico ||
        null;

    const alertaRelevante =
        Array.isArray(alertas)
            ? alertas.find(alerta => {
                const nivel =
                    String(alerta?.nivel || "")
                        .trim()
                        .toLowerCase();

                return (
                    nivel === "crítico" ||
                    nivel === "critico" ||
                    nivel === "alto" ||
                    nivel === "atenção" ||
                    nivel === "atencao"
                );
            })
            : null;

   const existeRecomendacao =
    Array.isArray(recomendacoes) &&
    recomendacoes.length > 0;

const equipeCritica =
    situacaoEquipes?.equipesCriticas?.[0] || null;

    const impedimentoEquipeCritica =
    equipeCritica && Array.isArray(impedimentosAtivos)
        ? impedimentosAtivos.find(impedimento =>
            Number(impedimento?.protocoloId) ===
            Number(equipeCritica?.protocoloId)
          ) || null
        : null;

const impedimentoEquipeCriticaValido =
    impedimentoEquipeCritica &&
    impedimentoEquipeCritica.status === "ATIVO" &&
    (
        !impedimentoEquipeCritica.previsaoSolucao ||
        new Date(impedimentoEquipeCritica.previsaoSolucao) >= new Date()
    );

const textoEquipeCritica =
    equipeCritica
        ? impedimentoEquipeCriticaValido
            ? `A ${equipeCritica.equipe} possui uma demanda em situação crítica, em acompanhamento há aproximadamente ${Math.round(equipeCritica.horas)} horas. A permanência dessa demanda está associada a impedimento administrativo do tipo ${impedimentoEquipeCritica.tipoImpedimento}, com a seguinte justificativa: ${impedimentoEquipeCritica.justificativa}`
            : `A ${equipeCritica.equipe} possui uma demanda em situação crítica, em acompanhamento há aproximadamente ${Math.round(equipeCritica.horas)} horas, indicando necessidade de intervenção gerencial prioritária.`
        : null;

const equipeEmAtencao =
    situacaoEquipes?.equipesEmAtencao?.[0] || null;

const textoEquipeEmAtencao =
    equipeEmAtencao
        ? `A ${equipeEmAtencao.equipe} possui uma demanda em acompanhamento há aproximadamente ${Math.round(equipeEmAtencao.horas)} horas, classificada em nível de atenção e recomendando acompanhamento gerencial preventivo.`
        : null;        

const partes = [];

    // 1. CONTEXTO E DIAGNÓSTICO
    partes.push(
        `A análise integrada dos indicadores operacionais demonstra que ${situacao.charAt(0).toLowerCase()}${situacao.slice(1)}.`
    );

 if (textoEquipeCritica && (perfil === "CRITICO" || impedimentoEquipeCritica)) {
    partes.push(textoEquipeCritica);
}

if (perfil === "ATENCAO" && textoEquipeEmAtencao && !impedimentoEquipeCritica) {
    partes.push(textoEquipeEmAtencao);
}

    // 2. EVIDÊNCIA PRINCIPAL
    if (principalPrioridade) {
        partes.push(
            `Entre os serviços monitorados, observa-se maior concentração de protocolos relacionados a ${principalPrioridade}, caracterizando um ponto específico de atenção para a administração municipal.`
        );
    } else {
        partes.push(
            "Os dados disponíveis não indicam concentração relevante de protocolos em um serviço específico."
        );
    }

    // 3. AVALIAÇÃO DOS ALERTAS
    if (alertaRelevante) {
        const descricaoAlerta =
            alertaRelevante.descricao ||
            alertaRelevante.titulo ||
            "foi identificado um ponto que merece acompanhamento gerencial";

        partes.push(
            `Nesse contexto, ${descricaoAlerta.charAt(0).toLowerCase()}${descricaoAlerta.slice(1)} Esse comportamento recomenda acompanhamento mais próximo, embora não represente, isoladamente, comprometimento de toda a operação municipal.`
        );
    } else {
    const existeEquipeCritica =
        situacaoEquipes &&
        Number(situacaoEquipes.situacaoCritica || 0) > 0;

    if (perfil === "CRITICO") {
        partes.push(
            "Embora não haja alerta sistêmico crítico registrado, a situação operacional exige intervenção gerencial prioritária em razão dos demais indicadores analisados."
        );
    } else if (existeEquipeCritica) {
        partes.push(
            "Embora não haja alerta sistêmico crítico registrado, foi identificada demanda vinculada a equipe em situação crítica, condição que merece acompanhamento gerencial específico."
        );
    } else {
        partes.push(
            "Ainda assim, não foram identificados alertas críticos capazes de comprometer a continuidade da prestação dos serviços públicos neste momento."
        );
    }
}

    // 4. CONCLUSÃO E ORIENTAÇÃO ESTRATÉGICA
if (perfil === "CRITICO") {
    partes.push(
        "Diante desse cenário, recomenda-se intervenção gerencial prioritária sobre a condição crítica identificada, com avaliação imediata da capacidade operacional da equipe responsável e adoção das medidas necessárias para reduzir o tempo de atendimento e preservar a continuidade dos serviços públicos."
    );
} else if (perfil === "ESTAVEL") {
    partes.push(
        "Diante desse cenário, recomenda-se preservar a estratégia operacional vigente, mantendo o acompanhamento contínuo dos serviços com maior concentração de protocolos e observando preventivamente qualquer alteração relevante nos indicadores."
    );
} else if (perfil === "ATENCAO") {
    partes.push(
        "Diante desse cenário, recomenda-se manter acompanhamento gerencial preventivo das condições identificadas, observando a evolução das demandas, dos impedimentos registrados e da capacidade operacional das equipes."
    );
} else if (existeRecomendacao || principalPrioridade) {
    partes.push(
        "Diante desse cenário, recomenda-se manter atenção especial aos serviços com maior concentração de protocolos e acompanhar preventivamente a evolução dos indicadores operacionais."
    );
} else {
    partes.push(
        "Diante desse cenário, recomenda-se preservar a estratégia atual e manter o acompanhamento contínuo dos indicadores operacionais."
    );
}

    return partes.join(" ");
}

function gerarRespostaExecutiva({
    diagnostico = null,
    prioridades = [],
    alertas = [],
    recomendacoes = [],
    evolucao = null,
    situacaoEquipes = null,
    impedimentosAtivos = []   
} = {}) {

    const perfil = identificarPerfil({
    diagnostico,
    prioridades,
    alertas,
    evolucao,
    situacaoEquipes,
    impedimentosAtivos
});

const narrativa = gerarNarrativaPorPerfil({
    perfil,
    diagnostico,
    prioridades,
    alertas,
    recomendacoes,
    situacaoEquipes,
    impedimentosAtivos
});

console.log("Perfil narrativo identificado:", perfil);    

    const situacaoGeral =
    narrativa?.texto ||
    diagnostico?.resumo ||
    diagnostico?.situacaoGeral ||
    "A OUVIA ainda não possui dados suficientes para gerar o diagnóstico executivo.";

    const resumoExecutivo =
    narrativa?.texto ||
    diagnostico?.resumo ||
    diagnostico?.mensagemFinal ||
    situacaoGeral;

    const principalPrioridade =
    prioridades?.[0]?.servico ||
    prioridades?.[0]?.principalServico ||
    null;

const principalAlerta =
    alertas?.[0]?.descricao ||
    alertas?.[0]?.titulo ||
    null;

const principalRecomendacao =
    recomendacoes?.[0]?.descricao ||
    recomendacoes?.[0]?.recomendacao ||
    diagnostico?.recomendacao ||
    null;

const respostaConversacional = gerarSinteseExecutiva({
    diagnostico,
    prioridades,
    alertas,
    recomendacoes,
    perfil,
    situacaoEquipes,
    impedimentosAtivos
});

    return {
    situacaoGeral,
    perfil,
    narrativa,
    prioridades,
    alertas,
    recomendacoes,
    evolucao,
    resumoExecutivo,
    respostaConversacional
};
}

module.exports = {
    gerarRespostaExecutiva
};