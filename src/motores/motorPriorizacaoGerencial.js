// ==========================================================
// OUVIA - MOTOR DE PRIORIZAÇÃO GERENCIAL
// Sistema Inteligente de Apoio à Gestão Pública
// ==========================================================

// ----------------------------------------------------------
// DETERMINAÇÃO DA PRIORIDADE-BASE
// ----------------------------------------------------------

function determinarPrioridadeBase(
    classificacaoSaude,
    tendencia
) {

    const saude =
        String(classificacaoSaude || "")
            .trim()
            .toUpperCase();

    const direcao =
        String(tendencia || "")
            .trim()
            .toUpperCase();

    // ------------------------------------------------------
    // SEM EVIDÊNCIA DE SAÚDE
    // ------------------------------------------------------

    if (!saude || saude === "SEM_DADOS") {
        return "SEM_CLASSIFICACAO";
    }

    // ------------------------------------------------------
    // SAÚDE CRÍTICA
    // ------------------------------------------------------

    if (saude === "CRITICA") {

        if (direcao === "CRESCENTE") {
            return "CRITICA";
        }

        return "ALTA";
    }

    // ------------------------------------------------------
    // SAÚDE EM ATENÇÃO
    // ------------------------------------------------------

    if (saude === "ATENCAO") {

        if (direcao === "CRESCENTE") {
            return "ALTA";
        }

        return "MEDIA";
    }

    // ------------------------------------------------------
    // SAÚDE SATISFATÓRIA
    // ------------------------------------------------------

    if (saude === "SATISFATORIA") {

        if (direcao === "CRESCENTE") {
            return "MEDIA";
        }

        return "BAIXA";
    }

    // ------------------------------------------------------
    // SAÚDE BOA
    // ------------------------------------------------------

    if (saude === "BOA") {

        if (direcao === "CRESCENTE") {
            return "MEDIA";
        }

        return "BAIXA";
    }

    // ------------------------------------------------------
    // CLASSIFICAÇÃO DE SAÚDE NÃO RECONHECIDA
    // ------------------------------------------------------

    return "SEM_CLASSIFICACAO";
}

// ----------------------------------------------------------
// COMPARAÇÃO INICIAL ENTRE SERVIÇOS
// ----------------------------------------------------------

function compararPrioridades(a, b) {

    const ordemSaude = {
        CRITICA: 4,
        ATENCAO: 3,
        SATISFATORIA: 2,
        BOA: 1,
        SEM_DADOS: 0
    };

    const ordemTendencia = {
        CRESCENTE: 3,
        ESTAVEL: 2,
        DECRESCENTE: 1,
        SEM_DADOS: 0
    };

    const ordemEvidencia = {
        MUITO_ALTA: 5,
        ALTA: 4,
        MODERADA: 3,
        BAIXA: 2,
        MUITO_BAIXA: 1,
        SEM_DADOS: 0
    };

    const ordemPadraoCriticidade = {
    PADRAO_CRITICO_SISTEMICO: 5,
    CRITICIDADE_RELEVANTE: 4,
    INDICIO_DE_CRITICIDADE: 3,
    OCORRENCIA_CRITICA_ISOLADA: 2,
    SEM_CRITICIDADE_RELEVANTE: 1
};

    const saudeA =
        String(a?.classificacaoSaude || "SEM_DADOS")
            .trim()
            .toUpperCase();

    const saudeB =
        String(b?.classificacaoSaude || "SEM_DADOS")
            .trim()
            .toUpperCase();

    // 1. Gravidade da saúde
if (ordemSaude[saudeA] !== ordemSaude[saudeB]) {
    return ordemSaude[saudeB] - ordemSaude[saudeA];
}



const totalAbertasA =
    Number(a?.totalAbertas) || 0;

const totalAbertasB =
    Number(b?.totalAbertas) || 0;

const criticoA =
    Number(a?.critico) || 0;

const criticoB =
    Number(b?.critico) || 0;

const taxaCriticaA =
    totalAbertasA > 0
        ? criticoA / totalAbertasA
        : 0;

const taxaCriticaB =
    totalAbertasB > 0
        ? criticoB / totalAbertasB
        : 0;

const nivelEvidenciaA =
    classificarNivelEvidencia(totalAbertasA);

const nivelEvidenciaB =
    classificarNivelEvidencia(totalAbertasB);

    const padraoCriticidadeA =
    classificarPadraoCriticidade({
        totalAbertas: totalAbertasA,
        critico: criticoA,
        taxaCritica: taxaCriticaA * 100,
        nivelEvidencia: nivelEvidenciaA
    });

    
const padraoCriticidadeB =
    classificarPadraoCriticidade({
        totalAbertas: totalAbertasB,
        critico: criticoB,
        taxaCritica: taxaCriticaB * 100,
        nivelEvidencia: nivelEvidenciaB
    });

    // 2. Padrão de criticidade
if (
    ordemPadraoCriticidade[padraoCriticidadeA] !==
    ordemPadraoCriticidade[padraoCriticidadeB]
) {
    return (
        ordemPadraoCriticidade[padraoCriticidadeB] -
        ordemPadraoCriticidade[padraoCriticidadeA]
    );
}

// 3. Força da evidência
if (
    ordemEvidencia[nivelEvidenciaA] !==
    ordemEvidencia[nivelEvidenciaB]
) {
    return (
        ordemEvidencia[nivelEvidenciaB] -
        ordemEvidencia[nivelEvidenciaA]
    );
}


// 4. Proporção de demandas críticas
if (taxaCriticaA !== taxaCriticaB) {
    return taxaCriticaB - taxaCriticaA;
}

const tendenciaA =
    String(a?.tendencia || "SEM_DADOS")
        .trim()
        .toUpperCase();

const tendenciaB =
    String(b?.tendencia || "SEM_DADOS")
        .trim()
        .toUpperCase();

    // 5. Direção da tendência
    if (
        ordemTendencia[tendenciaA] !==
        ordemTendencia[tendenciaB]
    ) {
        return (
            ordemTendencia[tendenciaB] -
            ordemTendencia[tendenciaA]
        );
    }

    // 6. Desempate final pelo volume observado
    if (totalAbertasA !== totalAbertasB) {
        return totalAbertasB - totalAbertasA;
    }

    return 0;
}

// ----------------------------------------------------------
// CLASSIFICAÇÃO DO NÍVEL DE EVIDÊNCIA
// ----------------------------------------------------------

function classificarNivelEvidencia(totalAbertas) {

    const quantidade =
        Number(totalAbertas) || 0;

    if (quantidade <= 0) {
        return "SEM_DADOS";
    }

    if (quantidade <= 4) {
        return "MUITO_BAIXA";
    }

    if (quantidade <= 9) {
        return "BAIXA";
    }

    if (quantidade <= 29) {
        return "MODERADA";
    }

    if (quantidade <= 99) {
        return "ALTA";
    }

    return "MUITO_ALTA";
    }

    function calcularLimiteInferiorWilson(sucessos, total, z = 1.96) {

    const n = Number(total) || 0;
    const x = Number(sucessos) || 0;

    if (n <= 0 || x < 0 || x > n) {
        return 0;
    }

    const p = x / n;
    const z2 = z * z;

    const numerador =
        p +
        z2 / (2 * n) -
        z * Math.sqrt(
            (p * (1 - p) + z2 / (4 * n)) / n
        );

    const denominador =
        1 + z2 / n;

    return Number(
        ((numerador / denominador) * 100).toFixed(2)
    );
}

function classificarPadraoCriticidade({
    totalAbertas,
    critico,
    taxaCritica,
    nivelEvidencia
}) {
    const quantidadeAbertas = Number(totalAbertas) || 0;
    const quantidadeCritica = Number(critico) || 0;
    const percentualCritico = Number(taxaCritica) || 0;
    const limiteInferiorWilson =
    calcularLimiteInferiorWilson(
        quantidadeCritica,
        quantidadeAbertas
    );

    if (quantidadeAbertas <= 0 || quantidadeCritica <= 0) {
        return "SEM_CRITICIDADE_RELEVANTE";
    }

    if (nivelEvidencia === "MUITO_BAIXA") {
        return "OCORRENCIA_CRITICA_ISOLADA";
    }

    if (
        nivelEvidencia === "BAIXA" ||
        nivelEvidencia === "MODERADA"
    ) {
        return percentualCritico >= 50
            ? "CRITICIDADE_RELEVANTE"
            : "INDICIO_DE_CRITICIDADE";
    }

   if (
    nivelEvidencia === "ALTA" ||
    nivelEvidencia === "MUITO_ALTA"
) {
    if (limiteInferiorWilson > 50) {
        return "PADRAO_CRITICO_SISTEMICO";
    }

    return percentualCritico >= 50
        ? "CRITICIDADE_RELEVANTE"
        : "INDICIO_DE_CRITICIDADE";
}

    return "INDICIO_DE_CRITICIDADE";
}

// ----------------------------------------------------------
// CONSTRUÇÃO DA EVIDÊNCIA GERENCIAL DO SERVIÇO
// ----------------------------------------------------------

function construirEvidenciaGerencial({
    classificacaoSaude,
    tendencia,
    totalAbertas,
    critico
}) {

    const prioridadeBase =
        determinarPrioridadeBase(
            classificacaoSaude,
            tendencia
        );

    const quantidadeAbertas =
        Number(totalAbertas) || 0;

    const quantidadeCritica =
        Number(critico) || 0;

    const taxaCritica =
        quantidadeAbertas > 0
            ? Number(
                (
                    (quantidadeCritica / quantidadeAbertas) * 100
                ).toFixed(2)
            )
            : 0;

    const nivelEvidencia =
        classificarNivelEvidencia(
            quantidadeAbertas
        );

    const padraoCriticidade =
    classificarPadraoCriticidade({
        totalAbertas: quantidadeAbertas,
        critico: quantidadeCritica,
        taxaCritica,
        nivelEvidencia
    });

    return {
    prioridadeBase,
    taxaCritica,
    nivelEvidencia,
    padraoCriticidade
};
}

module.exports = {
    determinarPrioridadeBase,
    compararPrioridades,
    classificarNivelEvidencia,
    construirEvidenciaGerencial,
    classificarPadraoCriticidade,
    calcularLimiteInferiorWilson
};