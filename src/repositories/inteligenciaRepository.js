// ==========================================================
// OUVIA - REPOSITÓRIO DE INTELIGÊNCIA
// Responsável pelo acesso aos dados usados pelos motores
// ==========================================================

// ----------------------------------------------------------
// PRESSÃO OPERACIONAL POR INTENÇÃO
// ----------------------------------------------------------

async function buscarPressaoPorIntencao(db, prefeituraId = null) {

    const parametros = [];
    let filtroPrefeitura = "";

    if (prefeituraId !== null) {
        parametros.push(prefeituraId);
        filtroPrefeitura = "WHERE p.prefeitura_id = $1";
    }

    const resultado = await db.query(
        `
        SELECT
            i.id AS intencao_id,
            i.nome AS servico,
            COUNT(p.id) AS quantidade
        FROM protocolos p
        INNER JOIN intencoes i
            ON i.id = p.intencao_id
        ${filtroPrefeitura}
        GROUP BY
            i.id,
            i.nome
        ORDER BY
            COUNT(p.id) DESC,
            i.nome ASC
        `,
        parametros
    );

    return resultado.rows.map(item => ({
        intencaoId: Number(item.intencao_id),
        servico: item.servico,
        quantidade: Number(item.quantidade)
    }));
}

// -------------------------------------------------------
// EVOLUÇÃO ADMINISTRATIVA
// Compara os últimos 30 dias com os 30 dias anteriores
// -------------------------------------------------------

async function buscarEvolucaoAdministrativa(db, prefeituraId = null) {
    const parametros = [];
    let filtroPrefeitura = "";

    if (prefeituraId !== null) {
        parametros.push(prefeituraId);
        filtroPrefeitura = "AND p.prefeitura_id = $1";
    }

    const resultado = await db.query(
        `
        SELECT
            COUNT(*) FILTER (
                WHERE p.data_abertura >= CURRENT_DATE - INTERVAL '30 days'
            ) AS protocolos_atual,

            COUNT(*) FILTER (
                WHERE p.data_abertura >= CURRENT_DATE - INTERVAL '60 days'
                  AND p.data_abertura < CURRENT_DATE - INTERVAL '30 days'
            ) AS protocolos_anterior,

            COUNT(*) FILTER (
                WHERE p.data_abertura >= CURRENT_DATE - INTERVAL '30 days'
                  AND UPPER(COALESCE(p.status_atual, '')) NOT LIKE '%CONCLU%'
            ) AS pendentes_atual,

            COUNT(*) FILTER (
                WHERE p.data_abertura >= CURRENT_DATE - INTERVAL '60 days'
                  AND p.data_abertura < CURRENT_DATE - INTERVAL '30 days'
                  AND UPPER(COALESCE(p.status_atual, '')) NOT LIKE '%CONCLU%'
            ) AS pendentes_anterior,

            COUNT(*) FILTER (
                WHERE p.data_encerramento >= CURRENT_DATE - INTERVAL '30 days'
                  AND UPPER(COALESCE(p.status_atual, '')) LIKE '%CONCLU%'
            ) AS concluidos_atual,

            COUNT(*) FILTER (
                WHERE p.data_encerramento >= CURRENT_DATE - INTERVAL '60 days'
                  AND p.data_encerramento < CURRENT_DATE - INTERVAL '30 days'
                  AND UPPER(COALESCE(p.status_atual, '')) LIKE '%CONCLU%'
            ) AS concluidos_anterior,

            AVG(
                EXTRACT(EPOCH FROM (p.data_encerramento - p.data_abertura))
                / 86400
            ) FILTER (
                WHERE p.data_encerramento >= CURRENT_DATE - INTERVAL '30 days'
                  AND p.data_encerramento IS NOT NULL
            ) AS tempo_medio_atual,

            AVG(
                EXTRACT(EPOCH FROM (p.data_encerramento - p.data_abertura))
                / 86400
            ) FILTER (
                WHERE p.data_encerramento >= CURRENT_DATE - INTERVAL '60 days'
                  AND p.data_encerramento < CURRENT_DATE - INTERVAL '30 days'
                  AND p.data_encerramento IS NOT NULL
            ) AS tempo_medio_anterior

        FROM protocolos p
        WHERE 1 = 1
        ${filtroPrefeitura}
        `,
        parametros
    );

    const dados = resultado.rows[0];

    return {
        protocolosAtual: Number(dados.protocolos_atual || 0),
        protocolosAnterior: Number(dados.protocolos_anterior || 0),

        pendentesAtual: Number(dados.pendentes_atual || 0),
        pendentesAnterior: Number(dados.pendentes_anterior || 0),

        concluidosAtual: Number(dados.concluidos_atual || 0),
        concluidosAnterior: Number(dados.concluidos_anterior || 0),

        tempoMedioAtual:
            dados.tempo_medio_atual !== null
                ? Number(dados.tempo_medio_atual)
                : null,

        tempoMedioAnterior:
            dados.tempo_medio_anterior !== null
                ? Number(dados.tempo_medio_anterior)
                : null
    };
}

// ---------------------------------------------------------
// SITUAÇÃO OPERACIONAL DAS EQUIPES
// Consolida a carga atual e o tempo de permanência
// das demandas atribuídas às equipes
// ---------------------------------------------------------

async function buscarSituacaoEquipes(db) {
    const resultado = await db.query(`
        SELECT
            COUNT(*) AS demandas_com_equipes,

            COUNT(*) FILTER (
                WHERE EXTRACT(EPOCH FROM (NOW() - ae.data_atribuicao)) / 3600 < 24
            ) AS situacao_normal,

            COUNT(*) FILTER (
                WHERE EXTRACT(EPOCH FROM (NOW() - ae.data_atribuicao)) / 3600 >= 24
                  AND EXTRACT(EPOCH FROM (NOW() - ae.data_atribuicao)) / 3600 < 48
            ) AS em_atencao,

            COUNT(*) FILTER (
                WHERE EXTRACT(EPOCH FROM (NOW() - ae.data_atribuicao)) / 3600 >= 48
            ) AS situacao_critica,

            AVG(
                EXTRACT(EPOCH FROM (NOW() - ae.data_atribuicao)) / 3600
            ) AS tempo_medio_horas

        FROM atribuicoes_equipe ae
        WHERE ae.data_fim IS NULL
    `);

    const dados = resultado.rows[0];

    const resultadoDetalhes = await db.query(`
        SELECT
            ae.id AS atribuicao_id,
            ae.protocolo_id,
            ae.equipe_id,
            e.nome AS equipe_nome,
            ae.data_atribuicao,

            EXTRACT(EPOCH FROM (NOW() - ae.data_atribuicao)) / 3600
                AS horas_atribuida,

            CASE
                WHEN EXTRACT(EPOCH FROM (NOW() - ae.data_atribuicao)) / 3600 >= 48
                    THEN 'CRITICA'

                WHEN EXTRACT(EPOCH FROM (NOW() - ae.data_atribuicao)) / 3600 >= 24
                    THEN 'ATENCAO'

                ELSE 'NORMAL'
            END AS situacao

        FROM atribuicoes_equipe ae

        LEFT JOIN equipes e
            ON e.id = ae.equipe_id

        WHERE ae.data_fim IS NULL

        ORDER BY ae.data_atribuicao ASC
    `);

    const detalhes = resultadoDetalhes.rows.map(item => ({
        atribuicaoId: Number(item.atribuicao_id),
        protocoloId: Number(item.protocolo_id),
        equipeId: Number(item.equipe_id),
        equipe: item.equipe_nome || "Equipe não identificada",
        dataAtribuicao: item.data_atribuicao,
        horas: Number(item.horas_atribuida),
        situacao: item.situacao
    }));

    return {
        demandasComEquipes: Number(dados.demandas_com_equipes || 0),
        situacaoNormal: Number(dados.situacao_normal || 0),
        emAtencao: Number(dados.em_atencao || 0),
        situacaoCritica: Number(dados.situacao_critica || 0),

        tempoMedioHoras:
            dados.tempo_medio_horas !== null
                ? Number(dados.tempo_medio_horas)
                : null,

        equipesNormais:
            detalhes.filter(item => item.situacao === "NORMAL"),

        equipesEmAtencao:
            detalhes.filter(item => item.situacao === "ATENCAO"),

        equipesCriticas:
            detalhes.filter(item => item.situacao === "CRITICA")
    };
}

// -------------------------------------------------------
// IMPEDIMENTOS ATIVOS DAS DEMANDAS
// Busca impedimentos administrativos ainda não resolvidos
// -------------------------------------------------------

async function buscarImpedimentosAtivos(db) {
    const resultado = await db.query(`
        SELECT
            i.id AS impedimento_id,
            i.protocolo_id,
            i.tipo_impedimento,
            i.justificativa,
            i.previsao_solucao,
            i.data_inicio,
            i.status,
            p.numero_protocolo,
            p.intencao_id
        FROM impedimentos_demanda i
        INNER JOIN protocolos p
            ON p.id = i.protocolo_id
        WHERE i.status = 'ATIVO'
        ORDER BY i.data_inicio ASC
    `);

    return resultado.rows.map(item => ({
        impedimentoId: Number(item.impedimento_id),
        protocoloId: Number(item.protocolo_id),
        numeroProtocolo: item.numero_protocolo,
        intencaoId: Number(item.intencao_id),
        tipoImpedimento: item.tipo_impedimento,
        justificativa: item.justificativa,
        previsaoSolucao: item.previsao_solucao,
        dataInicio: item.data_inicio,
        status: item.status
    }));
}

// --------------------------------------------------
// DADOS PARA SAÚDE OPERACIONAL
// Consolida indicadores reais do banco de dados
// --------------------------------------------------

async function buscarDadosSaudeOperacional(db) {
    const resultado = await db.query(`
        SELECT
            COUNT(*) FILTER (
                WHERE data_encerramento IS NULL
                AND UPPER(COALESCE(status_atual, '')) NOT LIKE '%CONCLU%'
            )::int AS abertas,

            COUNT(*) FILTER (
                WHERE data_encerramento IS NULL
                AND UPPER(COALESCE(status_atual, '')) NOT LIKE '%CONCLU%'
                AND NOW() - data_abertura >= INTERVAL '8 days'
            )::int AS atrasadas,

            COUNT(*) FILTER (
                WHERE data_encerramento >= CURRENT_DATE - INTERVAL '30 days'
                AND UPPER(COALESCE(status_atual, '')) LIKE '%CONCLU%'
            )::int AS concluidas_30_dias,

            ROUND(
                AVG(
                    EXTRACT(EPOCH FROM (NOW() - data_abertura)) / 86400
                ) FILTER (
                    WHERE data_encerramento IS NULL
                    AND UPPER(COALESCE(status_atual, '')) NOT LIKE '%CONCLU%'
                )::numeric,
                2
            ) AS tempo_medio_abertas

        FROM protocolos
    `);

    const dados = resultado.rows[0];

    return {
        abertas: Number(dados.abertas || 0),
        atrasadas: Number(dados.atrasadas || 0),
        concluidas30Dias: Number(dados.concluidas_30_dias || 0),
        tempoMedioAbertas:
            dados.tempo_medio_abertas !== null
                ? Number(dados.tempo_medio_abertas)
                : 0
    };
}

// ---------------------------------------------------------
// REFERÊNCIAS OPERACIONAIS DOS SERVIÇOS
// Busca os parâmetros gerenciais ativos de cada serviço
// ---------------------------------------------------------

async function buscarReferenciasOperacionais(db) {

    const resultado = await db.query(`
        SELECT
            r.intencao_id,
            i.nome AS servico,
            r.prazo_referencia_dias,
            r.prazo_atencao_dias,
            r.prazo_critico_dias,
            r.ativo,
            r.observacao
        FROM referencias_operacionais_servicos r
        INNER JOIN intencoes i
            ON i.id = r.intencao_id
        WHERE r.ativo = TRUE
        ORDER BY r.intencao_id
    `);

    return resultado.rows.map(item => ({
        intencaoId: Number(item.intencao_id),
        servico: item.servico,

        prazoReferenciaDias:
            Number(item.prazo_referencia_dias),

        prazoAtencaoDias:
            item.prazo_atencao_dias !== null
                ? Number(item.prazo_atencao_dias)
                : null,

        prazoCriticoDias:
            item.prazo_critico_dias !== null
                ? Number(item.prazo_critico_dias)
                : null,

        ativo: item.ativo,
        observacao: item.observacao
    }));
}

// --------------------------------------------------
// CLASSIFICAÇÃO TEMPORAL DAS DEMANDAS ABERTAS
// Compara o tempo em aberto com os parâmetros
// operacionais específicos de cada serviço
// --------------------------------------------------

async function buscarClassificacaoTemporalDemandas(db) {
    const resultado = await db.query(`
        SELECT
            p.id AS protocolo_id,
            p.numero_protocolo,
            p.intencao_id,
            i.nome AS servico,
            p.status_atual,
            p.data_abertura,

            ROUND(
                EXTRACT(EPOCH FROM (NOW() - p.data_abertura)) / 86400,
                2
            ) AS dias_em_aberto,

            r.prazo_referencia_dias,
            r.prazo_atencao_dias,
            r.prazo_critico_dias

        FROM protocolos p

        INNER JOIN intencoes i
            ON i.id = p.intencao_id

        INNER JOIN referencias_operacionais_servicos r
            ON r.intencao_id = p.intencao_id
           AND r.ativo = TRUE

        WHERE p.data_encerramento IS NULL
          AND UPPER(COALESCE(p.status_atual, '')) NOT LIKE '%CONCLU%'

        ORDER BY p.id
    `);

    return resultado.rows.map((item) => {
        const diasEmAberto = Number(item.dias_em_aberto);
        const prazoReferenciaDias = Number(item.prazo_referencia_dias);

        const prazoAtencaoDias =
            item.prazo_atencao_dias !== null
                ? Number(item.prazo_atencao_dias)
                : null;

        const prazoCriticoDias =
            item.prazo_critico_dias !== null
                ? Number(item.prazo_critico_dias)
                : null;

        let classificacaoTemporal = "NORMAL";

        if (
            prazoCriticoDias !== null &&
            diasEmAberto >= prazoCriticoDias
        ) {
            classificacaoTemporal = "CRITICO";
        } else if (
            prazoAtencaoDias !== null &&
            diasEmAberto >= prazoAtencaoDias
        ) {
            classificacaoTemporal = "ATENCAO";
        } else if (diasEmAberto >= prazoReferenciaDias) {
            classificacaoTemporal = "REFERENCIA_EXCEDIDA";
        }

        return {
            protocoloId: Number(item.protocolo_id),
            numeroProtocolo: item.numero_protocolo,
            intencaoId: Number(item.intencao_id),
            servico: item.servico,
            statusAtual: item.status_atual,
            dataAbertura: item.data_abertura,
            diasEmAberto,
            prazoReferenciaDias,
            prazoAtencaoDias,
            prazoCriticoDias,
            classificacaoTemporal
        };
    });
}

module.exports = {
    buscarPressaoPorIntencao,
    buscarEvolucaoAdministrativa,
    buscarSituacaoEquipes,
    buscarImpedimentosAtivos,
    buscarDadosSaudeOperacional,
    buscarReferenciasOperacionais,
    buscarClassificacaoTemporalDemandas
};