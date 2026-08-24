async function gerarAlertas(pool) {

    const resultado = await pool.query(`

        SELECT
            status_atual,
            COUNT(*) AS quantidade
        FROM protocolos
        GROUP BY status_atual
    `);

const alertas = [];

const totaisPorStatus = {};

for (const item of resultado.rows) {

    const status =
        String(item.status_atual || '')
            .trim()
            .toUpperCase();

    totaisPorStatus[status] =
        Number(item.quantidade || 0);

}

const emAnalise =
    totaisPorStatus['EM ANÁLISE'] || 0;

const emExecucao =
    totaisPorStatus['EM EXECUÇÃO'] || 0;

const concluidos =
    totaisPorStatus['CONCLUÍDO'] || 0;

if (emAnalise >= 5) {

    alertas.push({
        nivel: 'atencao',
        titulo: 'Acúmulo em análise',
        descricao:
            `${emAnalise} protocolos aguardam análise.`
    });

}

if (emExecucao >= 5) {

    alertas.push({
        nivel: 'atencao',
        titulo: 'Volume elevado em execução',
        descricao:
            `${emExecucao} protocolos estão em execução.`
    });

}

if (concluidos === 0) {

    alertas.push({
        nivel: 'informativo',
        titulo: 'Nenhum protocolo concluído',
        descricao:
            'Não há protocolos concluídos no conjunto analisado.'
    });

}

if (alertas.length === 0) {

    alertas.push({
        nivel: 'normal',
        titulo: 'Operação sem alertas relevantes',
        descricao:
            'Os indicadores atuais não ultrapassaram os limites definidos.'
    });

}

   return {
    alertas,
    status: resultado.rows
};

}

module.exports = {
    gerarAlertas
};