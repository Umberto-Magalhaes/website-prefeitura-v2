// ==========================================================
// OUVIA - MOTOR OP-001
// MOTOR DE PRESSÃO OPERACIONAL
// Identifica o serviço com maior concentração de demandas.
// ==========================================================

const inteligenciaRepository = require("../repositories/inteligenciaRepository");

function calcularNivelPressao(quantidade) {

    if (quantidade >= 20) {
        return 'CRÍTICO';
    }

    if (quantidade >= 10) {
        return 'ALTO';
    }

    if (quantidade >= 5) {
        return 'MODERADO';
    }

    return 'BAIXO';
}

async function executar(db, prefeituraId = null) {

    const rankingCompleto =
        await inteligenciaRepository.buscarPressaoPorIntencao(
            db,
            prefeituraId
        );

    if (rankingCompleto.length === 0) {

        return {
            motor: 'OP-001',
            dataAnalise: new Date(),
            principalServico: null,
            quantidade: 0,
            nivelPressao: 'SEM DADOS',
            justificativa:
                'Não existem protocolos disponíveis para análise.',
            rankingCompleto: []
        };

    }

    const principal = rankingCompleto[0];

    const nivelPressao =
        calcularNivelPressao(principal.quantidade);

    return {
        motor: 'OP-001',
        dataAnalise: new Date(),
        principalServico: principal.servico,
        quantidade: principal.quantidade,
        nivelPressao,
        justificativa:
            `${principal.servico} concentra atualmente o maior volume de solicitações registradas.`,
        rankingCompleto
    };

}

module.exports = {
    executar
};