const express = require("express");
const path = require("path");
const pool = require("../db/connection");

const router = express.Router();

router.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../../public/admin.html"));
});

router.get("/dashboard", (req, res) => {
    res.json({
        sucesso: true,
        mensagem: "Painel Administrativo da OUVIA funcionando."
    });
});
router.get("/tempo-medio-atendimento", async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                COUNT(*)::int AS protocolos_concluidos,
                ROUND(
                    AVG(
                        EXTRACT(EPOCH FROM (data_encerramento - data_abertura))
                    ) / 86400,
                    2
                ) AS tempo_medio_em_dias
            FROM protocolos
            WHERE data_encerramento IS NOT NULL
              AND UPPER(status_atual) LIKE 'CONCLU%'
        `);

        res.json({
            sucesso: true,
            dados: resultado.rows[0]
        });

    } catch (erro) {
        console.error("Erro ao calcular tempo médio de atendimento:", erro);

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao calcular tempo médio de atendimento."
        });
    }
});
router.get("/tempo-medio-demandas-abertas", async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                COUNT(*)::int AS demandas_em_aberto,
                ROUND(
                    AVG(
                        EXTRACT(EPOCH FROM (NOW() - data_abertura))
                        / 86400
                    ),
                    2
                ) AS tempo_medio_em_dias
            FROM protocolos
            WHERE data_encerramento IS NULL
        `);

        res.json({
            sucesso: true,
            dados: resultado.rows[0]
        });

    } catch (erro) {
        console.error(
            "Erro ao calcular tempo médio das demandas em aberto:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao calcular tempo médio das demandas em aberto."
        });
    }
});

router.get("/tempo-medio-atendimento-por-servico", async (req, res) => {
    try {
        const periodo = req.query.periodo || "todos";

        let filtroPeriodo = "";

        if (periodo === "hoje") {
            filtroPeriodo = `
                AND p.data_abertura >= CURRENT_DATE
                AND p.data_abertura < CURRENT_DATE + INTERVAL '1 day'
            `;
        } else if (periodo === "7dias") {
            filtroPeriodo = `
                AND p.data_abertura >= CURRENT_DATE - INTERVAL '6 days'
                AND p.data_abertura < CURRENT_DATE + INTERVAL '1 day'
            `;
        } else if (periodo === "30dias") {
            filtroPeriodo = `
                AND p.data_abertura >= CURRENT_DATE - INTERVAL '29 days'
                AND p.data_abertura < CURRENT_DATE + INTERVAL '1 day'
            `;
        }

        const resultado = await pool.query(`
            SELECT
                i.nome AS servico,
                COUNT(*) AS protocolos_concluidos,
                ROUND(
                    AVG(
                        EXTRACT(EPOCH FROM (p.data_encerramento - p.data_abertura))
                        / 86400
                    ),
                    2
                ) AS tempo_medio_em_dias
            FROM protocolos p
            JOIN intencoes i
                ON i.id = p.intencao_id
            WHERE p.data_encerramento IS NOT NULL
                AND UPPER(p.status_atual) LIKE 'CONCLU%'
                ${filtroPeriodo}
            GROUP BY i.id, i.nome
            ORDER BY tempo_medio_em_dias DESC
        `);

        res.json({
            sucesso: true,
            dados: resultado.rows
        });

    } catch (erro) {
        console.error(
            "Erro ao calcular tempo médio de atendimento por serviço:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao calcular tempo médio de atendimento por serviço."
        });
    }
});

  router.get("/demandas-pendentes-por-tempo", async (req, res) => {
    try {
        const periodo = req.query.periodo || "todos";

        let filtroPeriodo = "";

        if (periodo === "hoje") {
            filtroPeriodo = `
                AND data_abertura >= CURRENT_DATE
                AND data_abertura < CURRENT_DATE + INTERVAL '1 day'
            `;
        } else if (periodo === "7dias") {
            filtroPeriodo = `
                AND data_abertura >= CURRENT_DATE - INTERVAL '6 days'
                AND data_abertura < CURRENT_DATE + INTERVAL '1 day'
            `;
        } else if (periodo === "30dias") {
            filtroPeriodo = `
                AND data_abertura >= CURRENT_DATE - INTERVAL '29 days'
                AND data_abertura < CURRENT_DATE + INTERVAL '1 day'
            `;
        }

        const resultado = await pool.query(`
            SELECT
                COUNT(*) FILTER (
                    WHERE NOW() - data_abertura < INTERVAL '8 days'
                )::int AS ate_7_dias,

                COUNT(*) FILTER (
                    WHERE NOW() - data_abertura >= INTERVAL '8 days'
                      AND NOW() - data_abertura < INTERVAL '16 days'
                )::int AS de_8_a_15_dias,

                COUNT(*) FILTER (
                    WHERE NOW() - data_abertura >= INTERVAL '16 days'
                      AND NOW() - data_abertura < INTERVAL '31 days'
                )::int AS de_16_a_30_dias,

                COUNT(*) FILTER (
                    WHERE NOW() - data_abertura >= INTERVAL '31 days'
                )::int AS acima_de_30_dias

            FROM protocolos
            WHERE data_encerramento IS NULL
                AND UPPER(status_atual) NOT LIKE 'CONCLU%'
                ${filtroPeriodo}
        `);

        res.json({
            sucesso: true,
            dados: resultado.rows[0]
        });

    } catch (erro) {
        console.error(
            "Erro ao calcular demandas pendentes por tempo:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao calcular demandas pendentes por tempo."
        });
    }
});  
router.get("/demandas-atrasadas-por-servico", async (req, res) => {
    try {
        const periodo = req.query.periodo || "todos";

        let filtroPeriodo = "";

        if (periodo === "hoje") {
            filtroPeriodo = `
                AND p.data_abertura >= CURRENT_DATE
                AND p.data_abertura < CURRENT_DATE + INTERVAL '1 day'
            `;
        } else if (periodo === "7dias") {
            filtroPeriodo = `
                AND p.data_abertura >= CURRENT_DATE - INTERVAL '6 days'
                AND p.data_abertura < CURRENT_DATE + INTERVAL '1 day'
            `;
        } else if (periodo === "30dias") {
            filtroPeriodo = `
                AND p.data_abertura >= CURRENT_DATE - INTERVAL '29 days'
                AND p.data_abertura < CURRENT_DATE + INTERVAL '1 day'
            `;
        }

        const resultado = await pool.query(`
            SELECT
                i.nome AS servico,
                COUNT(*)::int AS total_demandas_atrasadas,
                ROUND(
                    AVG(
                        EXTRACT(
                            EPOCH FROM (NOW() - p.data_abertura)
                        ) / 86400
                    )::numeric,
                    2
                ) AS tempo_medio_em_dias
            FROM protocolos p
            INNER JOIN intencoes i
                ON i.id = p.intencao_id
            WHERE p.data_encerramento IS NULL
              AND UPPER(p.status_atual) NOT LIKE 'CONCLU%'
              AND NOW() - p.data_abertura >= INTERVAL '8 days'
              ${filtroPeriodo}
            GROUP BY i.id, i.nome
            ORDER BY
                total_demandas_atrasadas DESC,
                tempo_medio_em_dias DESC
        `);

        res.json({
            sucesso: true,
            dados: resultado.rows
        });

    } catch (erro) {
        console.error(
            "Erro ao calcular demandas atrasadas por serviço:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao calcular demandas atrasadas por serviço."
        });
    }
});

router.get("/demandas-por-servico", async (req, res) => {
    try {
        const servico = req.query.servico;

        if (!servico) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "O serviço deve ser informado."
            });
        }

        const resultado = await pool.query(
            `
            SELECT
                p.id,
                p.numero_protocolo,
                p.data_abertura,
                c.nome AS nome_cidadao,
                i.nome AS servico,
                p.endereco,
                p.bairro,
                p.descricao,
                p.telefone,
                p.status_atual
            FROM protocolos p
            LEFT JOIN cidadaos c
                ON c.id = p.cidadao_id
            LEFT JOIN intencoes i
                ON i.id = p.intencao_id
            WHERE i.nome = $1
            ORDER BY p.data_abertura ASC
            `,
            [servico]
        );

        res.json({
            sucesso: true,
            servico: servico,
            total: resultado.rows.length,
            dados: resultado.rows
        });

    } catch (erro) {
        console.error(
            "Erro ao buscar demandas por serviço:",
            erro
        );

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar demandas por serviço."
        });
    }
});

module.exports = router;