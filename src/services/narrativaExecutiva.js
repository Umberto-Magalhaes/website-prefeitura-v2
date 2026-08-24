function identificarPerfil({
    diagnostico = {},
    prioridades = [],
    alertas = [],
    evolucao = null,
    situacaoEquipes = null,
    impedimentosAtivos = []
}) {

console.log("=== DADOS RECEBIDOS POR identificarPerfil ===");
console.log("diagnostico:", diagnostico);
console.log("prioridades:", prioridades);
console.log("alertas:", alertas);
console.log("evolucao:", evolucao);
console.log("situacaoEquipes:", situacaoEquipes);
console.log("impedimentosAtivos:", impedimentosAtivos);
console.log("=============================================");

    const alertasRelevantes = Array.isArray(alertas)
    ? alertas.filter((alerta) => {
        const nivel = String(alerta?.nivel || "")
            .trim()
            .toLowerCase();

        return (
            nivel !== "normal" &&
            nivel !== "informativo" &&
            nivel !== ""
        );
    })
    : [];

const quantidadeAlertas = alertasRelevantes.length;

console.log("TESTE ATENCAO - quantidadeAlertas:", quantidadeAlertas);
    
    if (quantidadeAlertas >= 3) {
        return "ATENCAO";
    }

   const protocolosCriticos =
    Array.isArray(situacaoEquipes?.equipesCriticas)
        ? situacaoEquipes.equipesCriticas.map(
            item => Number(item.protocoloId)
          )
        : [];

const existeImpedimentoValido =
    Array.isArray(impedimentosAtivos) &&
    impedimentosAtivos.some(impedimento => {

        const pertenceADemandaCritica =
            protocolosCriticos.includes(
                Number(impedimento?.protocoloId)
            );

        if (!pertenceADemandaCritica) {
            return false;
        }

        if (impedimento?.status !== "ATIVO") {
            return false;
        }

        if (!impedimento?.previsaoSolucao) {
            return true;
        }

        const previsao =
            new Date(impedimento.previsaoSolucao);

        return previsao >= new Date();
    });
   
    if (
    situacaoEquipes &&
    Number(situacaoEquipes.situacaoCritica || 0) > 0
) {
    if (existeImpedimentoValido) {
        return "ATENCAO";
    }

    return "CRITICO";
}

if (
    situacaoEquipes &&
    Number(situacaoEquipes.emAtencao || 0) > 0
) {
    return "ATENCAO";
}

    const principalPrioridade =
    Array.isArray(prioridades) && prioridades.length > 0
        ? prioridades[0]
        : null;

const nivelPressao =
    principalPrioridade?.nivelPressao ||
    principalPrioridade?.nivel_pressao ||
    null;

if (
    nivelPressao === "ALTO" ||
    nivelPressao === "CRÍTICO"
) {
    return "PRESSAO";
}

    if (
    evolucao &&
    evolucao.situacaoGeral === "EVOLUCAO_POSITIVA" &&
    evolucao.confiabilidadeComparacao !== "BAIXA"
) {
    return "EVOLUCAO";
}

   return "ESTAVEL";
}

function gerarNarrativaPorPerfil({

    perfil,
    diagnostico = {},
    prioridades = [],
    alertas = [],
    recomendacoes = [],
    situacaoEquipes = null,
    impedimentosAtivos = []

}) {
    
    const situacaoPorPerfil = {
    CRITICO: "existe uma situação operacional crítica que requer intervenção gerencial prioritária.",
    ATENCAO: "existe um cenário operacional que merece acompanhamento gerencial.",
    PRESSAO: "há pressão operacional sobre determinados serviços municipais.",
    EVOLUCAO: "há sinais de evolução positiva da operação municipal.",
    ESTAVEL: "a situação operacional apresenta estabilidade no período analisado."
};

const situacao =
    diagnostico?.resumo ||
    diagnostico?.situacaoGeral ||
    diagnostico?.situacao ||
    situacaoPorPerfil[perfil] ||
    "a situação operacional ainda não possui dados suficientes para uma classificação conclusiva.";

    const principalServico =
        prioridades?.[0]?.servico ||
        prioridades?.[0]?.principalServico ||
        null;

     const alertaPrincipalRelevante =
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

const principalAlerta =
    alertaPrincipalRelevante?.descricao ||
    alertaPrincipalRelevante?.titulo ||
    null;

    const principalRecomendacao =
        recomendacoes?.[0]?.descricao ||
        recomendacoes?.[0]?.recomendacao ||
        diagnostico?.recomendacao ||
        null;

   const haEquipeCritica =
    situacaoEquipes &&
    Number(situacaoEquipes.situacaoCritica || 0) > 0;     

const equipeCritica =
    situacaoEquipes?.equipesCriticas?.[0] || null;

    const impedimentoEquipeCritica =
    equipeCritica && Array.isArray(impedimentosAtivos)
        ? impedimentosAtivos.find(impedimento =>
            Number(impedimento?.protocoloId) ===
            Number(equipeCritica?.protocoloId)
          ) || null
        : null;

        const textoImpedimentoEquipeCritica =
    impedimentoEquipeCritica
        ? `A permanência dessa demanda está associada a impedimento administrativo registrado do tipo ${impedimentoEquipeCritica.tipoImpedimento}, com a seguinte justificativa: ${impedimentoEquipeCritica.justificativa}`
        : null;

const textoEquipeCritica =
    equipeCritica
        ? impedimentoEquipeCritica
            ? `A ${equipeCritica.equipe} possui uma demanda com tempo de permanência superior ao limite operacional de referência, em acompanhamento há aproximadamente ${Math.round(equipeCritica.horas)} horas. A demanda aguarda a liberação do impedimento administrativo registrado, permanecendo sob acompanhamento preventivo até que a execução possa ser retomada.`
            : `A ${equipeCritica.equipe} possui uma demanda em situação crítica, em acompanhamento há aproximadamente ${Math.round(equipeCritica.horas)} horas, indicando necessidade de intervenção gerencial prioritária.`
        : "";

    const equipeEmAtencao =
    situacaoEquipes?.equipesEmAtencao?.[0] || null;

const textoEquipeAtencao =
    equipeEmAtencao
        ? `A ${equipeEmAtencao.equipe} possui uma demanda em acompanhamento há aproximadamente ${Math.round(equipeEmAtencao.horas)} horas, classificada em nível de atenção.`
        : "";
   
        switch (perfil) {

        case "CRITICO":
    return {
        perfil,
        titulo: "Situação operacional crítica",
        texto:
            `A análise integrada dos indicadores demonstra a existência de uma situação operacional crítica que requer intervenção gerencial prioritária. ` +
            `${textoEquipeCritica ? `${textoEquipeCritica}. ` : ""}` +
            `${principalAlerta ? `Entre os pontos de maior preocupação, destaca-se: ${principalAlerta}. ` : ""}` +
            `${principalServico ? `O serviço de ${principalServico} apresenta atualmente a maior concentração de protocolos. ` : ""}` +
            `Recomenda-se atuação gerencial imediata sobre a situação identificada, com avaliação da capacidade operacional da equipe envolvida e adoção das medidas necessárias para preservar a continuidade dos serviços públicos.`
    };

        case "ATENCAO":
            return {
                perfil,
                titulo: "Cenário que merece acompanhamento",
                texto:
    `A análise integrada dos indicadores demonstra que ${situacao.charAt(0).toLowerCase()}${situacao.slice(1)} ` +
    
   `${haEquipeCritica && textoEquipeCritica
    ? `${textoEquipeCritica} ${
        textoImpedimentoEquipeCritica
            ? `${textoImpedimentoEquipeCritica} `
            : ""
      }`
    : ""}` +

        `${textoEquipeAtencao ? ` ${textoEquipeAtencao}` : ""}` +

    `${principalAlerta ? `Entre os pontos que merecem acompanhamento, destaca-se: ${principalAlerta}. ` : ""}` +
    `${principalServico ? `Também se observa maior concentração de protocolos no serviço de ${principalServico}. ` : ""}` +
    "Recomenda-se acompanhamento preventivo das áreas envolvidas, com atenção à capacidade operacional das equipes e à continuidade dos serviços públicos.",

principalAtencao:
    equipeCritica
        ? impedimentoEquipeCritica
            ? `A ${equipeCritica.equipe} possui uma demanda em situação crítica, atualmente condicionada ao impedimento administrativo registrado e aguardando sua liberação para que a execução possa ser retomada.`
            : `A ${equipeCritica.equipe} possui uma demanda em situação crítica que requer acompanhamento gerencial prioritário.`
        : equipeEmAtencao
            ? `A ${equipeEmAtencao.equipe} possui uma demanda em nível de atenção e deve permanecer sob acompanhamento gerencial.`
            : principalServico
                ? `O serviço de ${principalServico} concentra atualmente o maior volume de protocolos e merece acompanhamento gerencial.`
                : "Há pontos operacionais que merecem acompanhamento gerencial neste momento."

            };

        case "PRESSAO":
            return {
                perfil,
                titulo: "Pressão operacional identificada",
                texto:
                    `Os indicadores revelam aumento da pressão operacional sobre determinados serviços municipais. ` +
                    `${principalServico ? `A maior concentração de protocolos está relacionada ao serviço de ${principalServico}, indicando necessidade de atenção gerencial específica. ` : ""}` +
                    `${principalRecomendacao ? `${principalRecomendacao} ` : ""}` +
                    "Como orientação institucional, recomenda-se avaliar a distribuição dos recursos disponíveis e acompanhar a evolução do tempo médio de atendimento."
            };

        case "EVOLUCAO":
            return {
                perfil,
                titulo: "Evolução positiva da operação",
                texto:
                    `Os indicadores demonstram evolução favorável da operação municipal no período analisado. ` +
                    `${situacao} ` +
                    "Esse comportamento sugere maior equilíbrio entre a demanda registrada e a capacidade de atendimento. Recomenda-se preservar as práticas que vêm contribuindo para a melhoria dos resultados e manter o acompanhamento contínuo dos indicadores."
            };

        case "ESTAVEL":
        default:
            return {
    perfil: "ESTAVEL",

    titulo: "Situação operacional estável",

    texto:
  `A análise integrada dos indicadores demonstra que ${situacao.charAt(0).toLowerCase()}${situacao.slice(1)} ` +
  "Os indicadores avaliados revelam estabilidade operacional e não apontam comprometimento relevante da prestação dos serviços públicos. " +
  `${principalRecomendacao
    ? `Como orientação estratégica, recomenda-se: ${principalRecomendacao}`
    : "Recomenda-se manter o monitoramento contínuo dos indicadores e preservar a estratégia operacional atualmente adotada."
  }`,
    principalAtencao:
        principalServico
            ? `O serviço de ${principalServico} concentra atualmente o maior volume de protocolos registrados e merece acompanhamento gerencial prioritário.`
            : "Nenhum serviço apresenta concentração suficiente para caracterizar atenção prioritária neste momento.",

    recomendacao:
        principalRecomendacao
            ? principalRecomendacao
            : "Manter o monitoramento contínuo dos indicadores e preservar a estratégia operacional atualmente adotada."
};
    }
}

module.exports = {
    identificarPerfil,
    gerarNarrativaPorPerfil
};