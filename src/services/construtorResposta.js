/**
 * ==========================================================
 * CONSTRUTOR DE RESPOSTAS — OUVIA
 * ==========================================================
 * Responsabilidade:
 * Produzir respostas gerenciais a partir da intenção
 * identificada e dos dados inteligentes da OUVIA.
 * ==========================================================
 */

function formatarNumero(valor, casasDecimais = 1) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return null;
    }

    return numero.toFixed(casasDecimais);
}

function construirResposta(resultadoInterpretacao = {}, dados = {}) {
    const {
        intencao = "DESCONHECIDA",
        servico = null
    } = resultadoInterpretacao;

    const prioridades = Array.isArray(dados.prioridades)
        ? dados.prioridades
        : [];

    const alertas = Array.isArray(dados.alertas)
        ? dados.alertas
        : [];

    const recomendacoes = Array.isArray(dados.recomendacoes)
        ? dados.recomendacoes
        : [];

    const evolucao = dados.evolucao || null;

    switch (intencao) {
        case "CONSULTA_GERAL":
            return (
                dados.resumoExecutivo ||
                dados.respostaExecutiva?.situacaoGeral ||
                dados.respostaConversacional ||
                "Ainda não existem dados suficientes para elaborar uma análise geral do município."
            );

        case "CONSULTA_PRIORIDADE": {
            const prioridadePrincipal = prioridades[0];

            if (!prioridadePrincipal) {
                return "Não foram identificadas prioridades gerenciais no momento.";
            }

            const quantidade = Number(prioridadePrincipal.quantidade) || 0;
            const nivelPressao =
                prioridadePrincipal.nivelPressao ||
                prioridadePrincipal.nivel_pressao ||
                null;

            let resposta =
                `Neste momento, o serviço que merece maior acompanhamento gerencial é ` +
                `${prioridadePrincipal.servico}, com ${quantidade} ` +
                `${quantidade === 1 ? "protocolo registrado" : "protocolos registrados"}.`;

            if (nivelPressao) {
                resposta += ` O nível de pressão identificado é ${nivelPressao.toLowerCase()}.`;
            }

            return resposta;
        }

        case "CONSULTA_ALERTAS": {
            const alertasRelevantes = alertas.filter(alerta => {
                const nivel = String(alerta?.nivel || "")
                    .trim()
                    .toLowerCase();

                return (
                    nivel !== "" &&
                    nivel !== "normal" &&
                    nivel !== "informativo"
                );
            });

            if (alertasRelevantes.length === 0) {
                return (
                    alertas[0]?.descricao ||
                    "Não foram identificados alertas gerenciais relevantes no momento."
                );
            }

            return alertasRelevantes
                .map(alerta => {
                    const titulo = alerta.titulo
                        ? `${alerta.titulo}. `
                        : "";

                    return `${titulo}${alerta.descricao || ""}`.trim();
                })
                .join(" ");
        }

        case "CONSULTA_EVOLUCAO": {
            if (!evolucao) {
                return "Ainda não existem informações suficientes para avaliar a evolução administrativa.";
            }

            const atual = Number(evolucao.protocolosAtual) || 0;
            const anterior = Number(evolucao.protocolosAnterior) || 0;
            const pendentesAtual = Number(evolucao.pendentesAtual) || 0;
            const pendentesAnterior = Number(evolucao.pendentesAnterior) || 0;
            const concluidosAtual = Number(evolucao.concluidosAtual) || 0;
            const concluidosAnterior = Number(evolucao.concluidosAnterior) || 0;
            const confiabilidadeComparacao =
                  evolucao?.confiabilidadeComparacao || "BAIXA";

            let observacaoConfiabilidade = "";

if (confiabilidadeComparacao === "ALTA") {
    observacaoConfiabilidade =
        " A comparação possui alta confiabilidade, pois há quantidade consistente de dados históricos.";
} else if (confiabilidadeComparacao === "MODERADA") {
    observacaoConfiabilidade =
        " A comparação possui confiabilidade moderada, pois a quantidade de dados históricos ainda é intermediária.";
} else {
    observacaoConfiabilidade =
        " A comparação possui baixa confiabilidade, pois ainda há quantidade limitada de dados históricos. A tendência deve ser interpretada com cautela.";
}      

           return (
    `No período atual, foram registrados ${atual} protocolos, ` +
    `em comparação com ${anterior} no período anterior. ` +
    `As demandas pendentes passaram de ${pendentesAnterior} para ${pendentesAtual}, ` +
    `enquanto as concluídas passaram de ${concluidosAnterior} para ${concluidosAtual}.` +
    observacaoConfiabilidade
);
        }

        case "CONSULTA_RECOMENDACOES":
            if (recomendacoes.length === 0) {
                return (
                    dados.respostaExecutiva?.narrativa?.recomendacao ||
                    dados.diagnostico?.recomendacao ||
                    "Não existem recomendações estratégicas disponíveis no momento."
                );
            }

            return recomendacoes
                .map((item, indice) => {
                    const titulo = item.titulo
                        ? `${indice + 1}. ${item.titulo}: `
                        : `${indice + 1}. `;

                    return `${titulo}${item.descricao || ""}`.trim();
                })
                .join(" ");

        case "CONSULTA_TEMPO_MEDIO": {
            const tempoMedioAtual = formatarNumero(
                evolucao?.tempoMedioAtual
            );

            if (tempoMedioAtual === null) {
                return "Ainda não existem informações suficientes para calcular o tempo médio de atendimento.";
            }

            const tempoMedioAnterior = formatarNumero(
                evolucao?.tempoMedioAnterior
            );

            const confiabilidadeComparacao =
    evolucao?.confiabilidadeComparacao || "BAIXA";

            if (tempoMedioAnterior === null) {
                return (
                    `O tempo médio atual de atendimento é de ` +
                    `${tempoMedioAtual} dias. Ainda não há dados anteriores suficientes para comparação.`
                );
            }

            let observacaoConfiabilidade = "";

if (confiabilidadeComparacao === "ALTA") {
    observacaoConfiabilidade =
        " A comparação possui alta confiabilidade, pois há quantidade consistente de dados históricos.";
} else if (confiabilidadeComparacao === "MODERADA") {
    observacaoConfiabilidade =
        " A comparação possui confiabilidade moderada, pois a quantidade de dados históricos ainda é intermediária.";
} else {
    observacaoConfiabilidade =
        " A comparação possui baixa confiabilidade, pois ainda há quantidade limitada de dados históricos. A tendência deve ser interpretada com cautela.";
}

return (
    `O tempo médio atual de atendimento é de ${tempoMedioAtual} dias. ` +
    `No período anterior, era de ${tempoMedioAnterior} dias.` +
    observacaoConfiabilidade
);
        }

        case "CONSULTA_SERVICO": {
            if (!servico) {
                return "Não foi possível identificar o serviço mencionado na pergunta.";
            }

            const servicoNormalizado = String(servico).toLowerCase();

            const prioridadeEncontrada = prioridades.find(item =>
                String(item.servico || "")
                    .toLowerCase()
                    .includes(servicoNormalizado)
            );

            if (!prioridadeEncontrada) {
                return (
                    `Não foram encontradas informações específicas sobre ` +
                    `${servico} entre as prioridades atuais.`
                );
            }

            const quantidade =
                Number(prioridadeEncontrada.quantidade) || 0;

            return (
                `O serviço de ${prioridadeEncontrada.servico} possui atualmente ` +
                `${quantidade} ${quantidade === 1 ? "protocolo registrado" : "protocolos registrados"}.`
            );
        }

       default:
    return (
        "Ainda não consegui identificar com precisão o assunto da pergunta. " +
        "Reformule-a mencionando situação geral, prioridades, alertas, evolução, " +
        "recomendações, tempo médio ou algum serviço municipal."
    );
    }
}

module.exports = {
    construirResposta
};