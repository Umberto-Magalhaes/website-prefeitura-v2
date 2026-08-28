// ======================================================
// OUVIA - MOTOR DE TENDÊNCIA OPERACIONAL
// Sistema Inteligente de Apoio à Gestão Pública
// ======================================================

function analisarTendencia(periodoAtual, periodoAnterior) {
    periodoAtual = Number(periodoAtual) || 0;
    periodoAnterior = Number(periodoAnterior) || 0;

    let variacaoPercentual = null;
    let tendencia = "ESTAVEL";

    if (periodoAnterior === 0) {
        if (periodoAtual > 0) {
            tendencia = "CRESCENTE";
        }
    } else {
        variacaoPercentual = Number(
            (
                ((periodoAtual - periodoAnterior) / periodoAnterior) * 100
            ).toFixed(1)
        );

        if (variacaoPercentual > 10) {
            tendencia = "CRESCENTE";
        } else if (variacaoPercentual < -10) {
            tendencia = "DECRESCENTE";
        }
    }

    return {
        periodoDias: 7,
        periodoAtual,
        periodoAnterior,
        variacaoPercentual,
        tendencia
    };
}

module.exports = {
    analisarTendencia
};