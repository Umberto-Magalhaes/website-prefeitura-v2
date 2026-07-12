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

module.exports = router;