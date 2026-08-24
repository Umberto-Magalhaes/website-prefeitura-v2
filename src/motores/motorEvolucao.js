// ======================================================
// OUVIA - MOTOR DE EVOLUÇÃO ADMINISTRATIVA
// Interpreta comparações entre o período atual e anterior
// ======================================================

function calcularVariacao(atual, anterior, menorEhMelhor = false) {
    const temAtual =
        atual !== null &&
        atual !== undefined;

    const temAnterior =
        anterior !== null &&
        anterior !== undefined;

    if (!temAtual || !temAnterior) {
        return {
            comparavel: false,
            percentual: null,
            tendencia: 'SEM_HISTORICO'
        };
    }

    if (Number(anterior) === 0) {
        return {
            comparavel: false,
            percentual: null,
            tendencia: 'BASE_ZERO'
        };
    }

    const percentual =
        ((Number(atual) - Number(anterior)) /
            Number(anterior)) *
        100;

    let tendencia = 'ESTAVEL';

    if (percentual > 0) {
        tendencia =
            menorEhMelhor
                ? 'PIORA'
                : 'MELHORA';
    } else if (percentual < 0) {
        tendencia =
            menorEhMelhor
                ? 'MELHORA'
                : 'PIORA';
    }

    return {
        comparavel: true,
        percentual:
            Math.round(Math.abs(percentual)),
        tendencia
    };
}

function analisarEvolucao(evolucao = {}) {
    const protocolos =
        calcularVariacao(
            evolucao.protocolosAtual,
            evolucao.protocolosAnterior,
            false
        );

    const pendentes =
        calcularVariacao(
            evolucao.pendentesAtual,
            evolucao.pendentesAnterior,
            true
        );

    const concluidos =
        calcularVariacao(
            evolucao.concluidosAtual,
            evolucao.concluidosAnterior,
            false
        );

    const tempoMedio =
        calcularVariacao(
            evolucao.tempoMedioAtual,
            evolucao.tempoMedioAnterior,
            true
        );

    const indicadores = {
        protocolos,
        pendentes,
        concluidos,
        tempoMedio
    };

    const comparaveis =
        Object.values(indicadores)
            .filter(item => item.comparavel);

    const melhorias =
        comparaveis.filter(
            item => item.tendencia === 'MELHORA'
        ).length;

    const pioras =
        comparaveis.filter(
            item => item.tendencia === 'PIORA'
        ).length;

    let situacaoGeral = 'SEM_HISTORICO';

    if (comparaveis.length > 0) {
        if (melhorias > pioras) {
            situacaoGeral = 'EVOLUCAO_POSITIVA';
        } else if (pioras > melhorias) {
            situacaoGeral = 'EVOLUCAO_NEGATIVA';
        } else {
            situacaoGeral = 'EVOLUCAO_ESTAVEL';
        }
    }

    // Avalia a confiabilidade estatística da comparação
const amostraAtual = Number(evolucao.concluidosAtual) || 0;
const amostraAnterior = Number(evolucao.concluidosAnterior) || 0;

let confiabilidadeComparacao = 'BAIXA';

if (amostraAtual >= 20 && amostraAnterior >= 20) {
    confiabilidadeComparacao = 'ALTA';
} else if (amostraAtual >= 5 && amostraAnterior >= 5) {
    confiabilidadeComparacao = 'MODERADA';
}

    return {
        situacaoGeral,
        quantidadeComparavel:
            comparaveis.length,
        melhorias,
        pioras,
        confiabilidadeComparacao,
        indicadores
    };
}

module.exports = {
    analisarEvolucao
};