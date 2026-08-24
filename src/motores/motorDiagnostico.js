function gerarDiagnostico(dados) {

    const percentual = dados.saudeOperacional.percentual;

    if (percentual >= 85) {

        return {

            situacao: "Excelente",

            nivel: "Baixo",

            resumo:
                "Os indicadores demonstram excelente desempenho operacional do município.",

            recomendacao:
                "É recomendável manter a estratégia atual e acompanhar a evolução dos indicadores."

        };

    }

    if (percentual >= 70) {

        return {

            situacao: "Estável",

            nivel: "Informativo",

            resumo:
                "O município apresenta comportamento operacional estável no período analisado.",

            recomendacao:
                "É recomendável manter acompanhamento dos indicadores e observar possíveis mudanças."

        };

    }

    if (percentual >= 50) {

        return {

            situacao: "Atenção",

            nivel: "Moderado",

            resumo:
                "Os indicadores sugerem perda de desempenho operacional e merecem atenção.",

            recomendacao:
                "É recomendável priorizar os serviços com maior volume de ocorrências."

        };

    }

    return {

        situacao: "Crítica",

        nivel: "Alto",

        resumo:
            "A operação municipal apresenta indicadores críticos que exigem intervenção imediata.",

        recomendacao:
            "É recomendável mobilizar as equipes responsáveis e iniciar plano de resposta prioritário."

    };

}
module.exports = {
    gerarDiagnostico
};