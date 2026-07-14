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

    
module.exports = router;