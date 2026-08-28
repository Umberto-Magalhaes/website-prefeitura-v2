// ============================================================
// TESTE CONTROLADO - SAÚDE OPERACIONAL POR SERVIÇO
// Não acessa nem altera o banco de dados.
// ============================================================

function calcularSaudeTeste(classificacoes) {

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
        } else if (
            item.classificacaoTemporal === "REFERENCIA_EXCEDIDA"
        ) {
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


// ============================================================
// CENÁRIOS ARTIFICIAIS
// ============================================================

const cenarios = [

    // Serviço 1:
    // 4 NORMAL = 100%
    {
        intencaoId: 1,
        servico: "SERVICO TESTE - BOA",
        classificacaoTemporal: "NORMAL"
    },
    {
        intencaoId: 1,
        servico: "SERVICO TESTE - BOA",
        classificacaoTemporal: "NORMAL"
    },
    {
        intencaoId: 1,
        servico: "SERVICO TESTE - BOA",
        classificacaoTemporal: "NORMAL"
    },
    {
        intencaoId: 1,
        servico: "SERVICO TESTE - BOA",
        classificacaoTemporal: "NORMAL"
    },


    // Serviço 2:
    // 4 REFERENCIA_EXCEDIDA = 75%
    {
        intencaoId: 2,
        servico: "SERVICO TESTE - SATISFATORIA",
        classificacaoTemporal: "REFERENCIA_EXCEDIDA"
    },
    {
        intencaoId: 2,
        servico: "SERVICO TESTE - SATISFATORIA",
        classificacaoTemporal: "REFERENCIA_EXCEDIDA"
    },
    {
        intencaoId: 2,
        servico: "SERVICO TESTE - SATISFATORIA",
        classificacaoTemporal: "REFERENCIA_EXCEDIDA"
    },
    {
        intencaoId: 2,
        servico: "SERVICO TESTE - SATISFATORIA",
        classificacaoTemporal: "REFERENCIA_EXCEDIDA"
    },


    // Serviço 3:
    // 2 NORMAL + 2 CRITICO
    // (2×1.00 + 2×0.10) / 4 = 55%
    {
        intencaoId: 3,
        servico: "SERVICO TESTE - ATENCAO",
        classificacaoTemporal: "NORMAL"
    },
    {
        intencaoId: 3,
        servico: "SERVICO TESTE - ATENCAO",
        classificacaoTemporal: "NORMAL"
    },
    {
        intencaoId: 3,
        servico: "SERVICO TESTE - ATENCAO",
        classificacaoTemporal: "CRITICO"
    },
    {
        intencaoId: 3,
        servico: "SERVICO TESTE - ATENCAO",
        classificacaoTemporal: "CRITICO"
    },


    // Serviço 4:
    // 4 CRITICO = 10%
    {
        intencaoId: 4,
        servico: "SERVICO TESTE - CRITICA",
        classificacaoTemporal: "CRITICO"
    },
    {
        intencaoId: 4,
        servico: "SERVICO TESTE - CRITICA",
        classificacaoTemporal: "CRITICO"
    },
    {
        intencaoId: 4,
        servico: "SERVICO TESTE - CRITICA",
        classificacaoTemporal: "CRITICO"
    },
    {
        intencaoId: 4,
        servico: "SERVICO TESTE - CRITICA",
        classificacaoTemporal: "CRITICO"
    }
];


// ============================================================
// EXECUÇÃO
// ============================================================

const resultado = calcularSaudeTeste(cenarios);

console.log("\n==========================================");
console.log(" TESTE CONTROLADO - SAÚDE POR SERVIÇO");
console.log("==========================================\n");

console.dir(resultado, { depth: null });

console.log("\n==========================================");
console.log(" RESULTADOS ESPERADOS");
console.log("==========================================");
console.log("Serviço 1 -> 100% -> BOA");
console.log("Serviço 2 -> 75%  -> SATISFATORIA");
console.log("Serviço 3 -> 55%  -> ATENCAO");
console.log("Serviço 4 -> 10%  -> CRITICA");
console.log("==========================================\n");