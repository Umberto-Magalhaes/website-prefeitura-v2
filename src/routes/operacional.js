const express = require("express");
const path = require("path");
const db = require("../db/connection");

const router = express.Router();

router.get("/", (req, res) => {
    res.sendFile(
        path.resolve(__dirname, "../../public/operacional.html")
    );
});

router.get("/api/resumo", async (req, res) => {
    try {
        const resultado = await db.query(`
            SELECT
                COUNT(*) FILTER (
                    WHERE UPPER(status_atual) LIKE '%RECEB%'
                ) AS novas,

                COUNT(*) FILTER (
                    WHERE UPPER(status_atual) LIKE '%ANÁL%'
                ) AS em_analise,

                COUNT(*) FILTER (
                    WHERE UPPER(status_atual) LIKE '%EXEC%'
                ) AS em_execucao,

                COUNT(*) FILTER (
                    WHERE UPPER(status_atual) LIKE '%CONCLU%'
                ) AS concluidas

            FROM protocolos
        `);

        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao consultar painel operacional."
        });
    }
});

router.get("/api/demandas", async (req, res) => {

    try {

        const resultado = await db.query(`

          SELECT
    p.numero_protocolo,
    p.intencao_id,
    i.nome AS servico,
    p.status_atual,
    p.data_abertura
FROM protocolos p

LEFT JOIN intencoes i
    ON i.id = p.intencao_id

ORDER BY p.data_abertura DESC

LIMIT 20

        `);

        res.json(resultado.rows);

    }

    catch (erro) {

        console.error(erro);

        res.status(500).json({

            erro: "Erro ao consultar demandas."

        });

    }

});

router.get("/api/demandas/:protocolo", async (req, res) => {

    try {

        const resultado = await db.query(`
            SELECT
                p.numero_protocolo,
                i.nome AS servico,
                p.status_atual,
                p.data_abertura,
                p.data_encerramento,
                p.descricao,
                p.endereco,
                p.ponto_referencia,
                c.nome AS nome_cidadao,
                COALESCE(c.telefone, p.telefone) AS telefone,
                c.email,
e.id AS equipe_id,
e.nome AS equipe_nome,
ae.data_atribuicao AS equipe_data_atribuicao
                

            FROM protocolos p
            LEFT JOIN intencoes i
    ON i.id = p.intencao_id

LEFT JOIN cidadaos c
    ON c.id = p.cidadao_id

LEFT JOIN atribuicoes_equipe ae
    ON ae.protocolo_id = p.id
    AND ae.data_fim IS NULL

LEFT JOIN equipes e
    ON e.id = ae.equipe_id

WHERE p.numero_protocolo = $1
LIMIT 1
           
        `, [req.params.protocolo]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Demanda não encontrada."
            });
        }

        res.json(resultado.rows[0]);

    } catch (erro) {

        console.error("Erro ao consultar demanda:", erro);

        res.status(500).json({
            erro: "Erro ao consultar demanda."
        });

    }

});

router.get("/api/teste-horario", async (req, res) => {
    try {
        const resultado = await db.query(`
            SELECT
                CURRENT_TIMESTAMP AS agora_com_timezone,
                LOCALTIMESTAMP AS agora_local,
                NOW() AS agora_now,
                CURRENT_SETTING('TimeZone') AS timezone_atual
        `);

        res.json(resultado.rows[0]);
    } catch (erro) {
        console.error("Erro no teste de horário:", erro);

        res.status(500).json({
            erro: "Erro ao consultar horário."
        });
    }
});

router.get("/api/equipes", async (req, res) => {
    try {
        const resultado = await db.query(`
            SELECT
                e.id,
                e.nome,
                e.descricao,
                e.secretaria_id,
                s.nome AS secretaria
            FROM equipes e
            LEFT JOIN secretarias s
                ON s.id = e.secretaria_id
            WHERE e.ativa = TRUE
            ORDER BY e.nome
        `);

        res.json(resultado.rows);

    } catch (erro) {
        console.error("Erro ao consultar equipes:", erro);

        res.status(500).json({
            erro: "Erro ao consultar equipes."
        });
    }
});

router.get("/api/demandas/:protocolo/historico-equipes", async (req, res) => {
    try {
        const { protocolo } = req.params;

        const resultado = await db.query(
            `
            SELECT
                ae.id,
                ae.data_atribuicao,
                ae.data_fim,
                ae.observacao,
                e.id AS equipe_id,
                e.nome AS equipe,
                s.id AS secretaria_id,
                s.nome AS secretaria
            FROM atribuicoes_equipe ae
            INNER JOIN protocolos p
                ON p.id = ae.protocolo_id
            INNER JOIN equipes e
                ON e.id = ae.equipe_id
            LEFT JOIN secretarias s
                ON s.id = e.secretaria_id
            WHERE p.numero_protocolo = $1
            ORDER BY ae.data_atribuicao ASC
            `,
            [protocolo]
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error("Erro ao consultar histórico de equipes:", erro);

        res.status(500).json({
            erro: "Erro ao consultar histórico de equipes."
        });
    }
});

router.post("/api/demandas/:protocolo/atribuir-equipe", async (req, res) => {
    try {
        const { protocolo } = req.params;
        const { equipe_id, observacao } = req.body;

        if (!equipe_id) {
            return res.status(400).json({
                erro: "A equipe é obrigatória."
            });
        }

        const protocoloResultado = await db.query(
            `
            SELECT id
            FROM protocolos
            WHERE numero_protocolo = $1
            LIMIT 1
            `,
            [protocolo]
        );

        if (protocoloResultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Demanda não encontrada."
            });
        }

        const protocoloId = protocoloResultado.rows[0].id;

            const atribuicaoAtual = await db.query(
      `
        SELECT equipe_id
        FROM atribuicoes_equipe
        WHERE protocolo_id = $1
          AND data_fim IS NULL
        ORDER BY data_atribuicao DESC
        LIMIT 1
      `,
      [protocoloId]
    );

    if (
      atribuicaoAtual.rows.length > 0 &&
      Number(atribuicaoAtual.rows[0].equipe_id) === Number(equipe_id)
    ) {
      return res.status(409).json({
        erro: "Esta equipe já é a responsável atual por esta demanda."
      });
    }

        await db.query(
            `
            UPDATE atribuicoes_equipe
            SET data_fim = CURRENT_TIMESTAMP
            WHERE protocolo_id = $1
              AND data_fim IS NULL
            `,
            [protocoloId]
        );

        const novaAtribuicao = await db.query(
            `
           INSERT INTO atribuicoes_equipe (
    protocolo_id,
    equipe_id,
    observacao
)
VALUES ($1, $2, $3)
            RETURNING
                id,
                protocolo_id,
                equipe_id,
                data_atribuicao,
                data_fim
            `,
            [protocoloId, equipe_id, observacao || null]
        );

        res.json({
            mensagem: "Equipe atribuída com sucesso.",
            atribuicao: novaAtribuicao.rows[0]
        });

    } catch (erro) {
        console.error("Erro ao atribuir equipe:", erro);

        res.status(500).json({
            erro: "Erro ao atribuir equipe."
        });
    }
});

// ======================================================
// DESEMPENHO OPERACIONAL DAS EQUIPES
// ======================================================

router.get("/api/equipes/desempenho", async (req, res) => {
  try {
    const resultado = await db.query(`
      SELECT
        e.id AS equipe_id,
        e.nome AS equipe,
        COUNT(ae.id)::int AS total_atribuicoes,
        COUNT(DISTINCT ae.protocolo_id)::int AS demandas_distintas,

        COUNT(ae.id) FILTER (
          WHERE ae.data_fim IS NULL
        )::int AS demandas_em_andamento,

        COUNT(ae.id) FILTER (
          WHERE ae.data_fim IS NOT NULL
        )::int AS atribuicoes_encerradas,

        ROUND(
          AVG(
            EXTRACT(EPOCH FROM (
              COALESCE(ae.data_fim, CURRENT_TIMESTAMP)
              - ae.data_atribuicao
            )) / 3600
          )::numeric,
          2
        ) AS tempo_medio_permanencia_horas

      FROM equipes e

      LEFT JOIN atribuicoes_equipe ae
        ON ae.equipe_id = e.id

      GROUP BY
        e.id,
        e.nome

      ORDER BY
        total_atribuicoes DESC,
        e.nome ASC;
    `);

    res.json(resultado.rows);

  } catch (erro) {
    console.error(
      "Erro ao calcular desempenho das equipes:",
      erro
    );

    res.status(500).json({
      erro: "Erro ao calcular desempenho das equipes."
    });
  }
});

// ============================================
// DEMANDAS ATUAIS POR EQUIPE
// ============================================

router.get("/api/equipes/demandas-atuais", async (req, res) => {

    try {

        const resultado = await db.query(`
            SELECT
                e.id AS equipe_id,
                e.nome AS equipe,
                p.id AS protocolo_id,
                p.numero_protocolo,
                p.status_atual,
                p.data_abertura,
                p.descricao,
                ae.data_atribuicao,
                ae.observacao
            FROM atribuicoes_equipe ae
            INNER JOIN equipes e
                ON e.id = ae.equipe_id
            INNER JOIN protocolos p
                ON p.id = ae.protocolo_id
            WHERE ae.data_fim IS NULL
            ORDER BY
                e.nome ASC,
                ae.data_atribuicao ASC
        `);

        res.json(resultado.rows);

    } catch (error) {

        console.error(
            "Erro ao carregar demandas atuais por equipe:",
            error
        );

        res.status(500).json({
            erro: "Erro ao carregar demandas atuais por equipe."
        });
    }

});

module.exports = router;