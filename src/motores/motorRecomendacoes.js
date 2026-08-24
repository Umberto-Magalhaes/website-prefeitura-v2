function classificarNaturezaAcao({
    nivelPressao = null,
    principalAlerta = null
}) {
    const pressaoNormalizada =
        String(nivelPressao || "")
            .trim()
            .toUpperCase();

    const nivelAlerta =
        String(principalAlerta?.nivel || "")
            .trim()
            .toUpperCase();

    if (
        pressaoNormalizada === "CRÍTICO" ||
        nivelAlerta === "CRÍTICO" ||
        nivelAlerta === "URGENTE"
    ) {
        return "URGENTE";
    }

    if (
        pressaoNormalizada === "ALTO" ||
        principalAlerta
    ) {
        return "INTERVENÇÃO";
    }

    return "ACOMPANHAMENTO";
}

async function gerarRecomendacoes(
    db,
    resultadoPriorizacao = null,
    alertas = []
) {
    const recomendacoes = [];

    const alertasOperacionais = Array.isArray(alertas)
    ? alertas.filter(alerta => {
          const nivel = String(alerta?.nivel || "")
              .trim()
              .toLowerCase();

          return nivel !== "informativo" &&
                 nivel !== "normal";
      })
    : [];

const principalAlerta =
    alertasOperacionais.length > 0
        ? alertasOperacionais[0]
        : null;

    const principalServico =
        resultadoPriorizacao?.principalServico || null;

    const quantidade =
        resultadoPriorizacao?.quantidade ?? null;

    const nivelPressao =
        resultadoPriorizacao?.nivelPressao || null;

        const naturezaAcao =
    classificarNaturezaAcao({
        nivelPressao,
        principalAlerta
    });

    if (principalServico && quantidade !== null) {
        let descricaoPrincipal;

     
       if (principalAlerta) {
    descricaoPrincipal =
        `É recomendável acompanhar ${principalServico}, atualmente com ${quantidade} protocolos ` +
        `e nível de pressão ${nivelPressao || "não classificado"}. ` +
        `Além disso, foi identificado o alerta "${principalAlerta.titulo}": ` +
        `${principalAlerta.descricao}`;
} else if (
    nivelPressao === "ALTO" ||
    nivelPressao === "CRÍTICO"
) {
    descricaoPrincipal =
        `É recomendável priorizar capacidade operacional para ${principalServico}, ` +
        `que apresenta ${quantidade} protocolos e nível de pressão ${nivelPressao}.`;
} else {
    descricaoPrincipal =
        `É recomendável manter acompanhamento de ${principalServico}, ` +
        `atualmente com ${quantidade} protocolos e nível de pressão ${nivelPressao || "não classificado"}.`;
}

recomendacoes.push({
    titulo: `Acompanhar ${principalServico}`,
    descricao: descricaoPrincipal,
    naturezaAcao,
    prioridade:
        nivelPressao === "CRÍTICO"
            ? "Crítica"
            : nivelPressao === "ALTO"
                ? "Alta"
                : "Média"
});
    } else {
        recomendacoes.push({
            titulo: "Acompanhar demandas prioritárias",
            descricao:
                "É recomendável acompanhar os serviços com maior volume de protocolos.",
            naturezaAcao: "ACOMPANHAMENTO",
                prioridade: "Média"
        });
    }

    recomendacoes.push({
        titulo: "Monitorar indicadores",
        descricao:
            "É recomendável realizar o acompanhamento diário dos indicadores operacionais para identificar alterações relevantes em tempo oportuno.",
        prioridade: "Média"
    });

    recomendacoes.push({
        titulo: "Avaliar desempenho das equipes",
        descricao:
            "É recomendável verificar a distribuição das equipes e considerar eventuais realocações quando houver concentração de demandas.",
        prioridade: "Baixa"
    });

    return recomendacoes;
}

module.exports = {
    gerarRecomendacoes
};