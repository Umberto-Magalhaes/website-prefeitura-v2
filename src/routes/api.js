const inteligencia = require("../services/inteligenciaService");

const express = require("express");
const db = require("../db/connection");

const router = express.Router();

const WEBHOOK_MAKE_PREFEITURAS = process.env.WEBHOOK_MAKE_PREFEITURAS || "";

function gerarProtocolo() {
    const agora = new Date();
    const data = agora.toISOString().slice(0, 10).replace(/-/g, "");
    const hora = agora.toTimeString().slice(0, 8).replace(/:/g, "");
    const aleatorio = Math.floor(100 + Math.random() * 900);
    return `${data}-${hora}-${aleatorio}`;
}

function normalizarIntencao(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

async function enviarParaMake(dados) {
    if (!WEBHOOK_MAKE_PREFEITURAS) return;

    try {
        await fetch(WEBHOOK_MAKE_PREFEITURAS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
        });
    } catch (error) {
        console.error("Erro ao enviar para o Make:", error.message);
    }
}

router.post("/registros", async (req, res) => {
    try {
        const {
            intencao_identificada_codigo,
            nome_cidadao,
            telefone,
            bairro,
            chat_id,
            descricao_problema,
            endereco_do_servico,
            ponto_de_referencia,
            opiniao_do_cidadao,
        } = req.body;

        console.log("========== DADOS RECEBIDOS ==========");
console.log(req.body);
console.log("INTENÇÃO:", intencao_identificada_codigo);
console.log("=====================================");

        const protocolo = gerarProtocolo();
        const status = "Recebido";

        const valorIntencaoRecebido = normalizarIntencao(
    intencao_identificada_codigo
);

if (!valorIntencaoRecebido) {
    return res.status(400).json({
        sucesso: false,
        mensagem: "A intenção da solicitação não foi informada."
    });
}

const resultadoIntencoes = await db.query(`
    SELECT id, nome
    FROM intencoes
    ORDER BY id
`);

const intencaoEncontrada = resultadoIntencoes.rows.find((item) => {
    return normalizarIntencao(item.nome) === valorIntencaoRecebido;
});

if (!intencaoEncontrada) {
    return res.status(400).json({
        sucesso: false,
        mensagem: `Intenção não cadastrada: ${intencao_identificada_codigo}`
    });
}

console.log(
    "INTENÇÃO LOCALIZADA:",
    intencaoEncontrada.id,
    intencaoEncontrada.nome
);

       const resultadoProtocolo = await db.query(
            `
            INSERT INTO protocolos (
                numero_protocolo,
                prefeitura_id,
                secretaria_id,
                cidadao_id,
                intencao_id,
                descricao,
                endereco,
                bairro,
                telefone,
                ponto_referencia,
                status_atual,
                data_abertura
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
RETURNING id
`,
            [
                protocolo,
                1,
                1,
                1,
                intencaoEncontrada.id,
                descricao_problema || "",
                endereco_do_servico || "",
                bairro || "",
                telefone || "",
                ponto_de_referencia || "",
                status,
            ]
        );

        const protocoloId = resultadoProtocolo.rows[0].id;

await db.query(
  `
    INSERT INTO historico_status (
      protocolo_id,
      status,
      observacao
    )
    VALUES ($1, $2, $3)
  `,
  [
    protocoloId,
    status,
    "Protocolo registrado automaticamente pela OUVIA."
  ]
);

        const dadosMake = {
            origem: "web",
            protocolo,
            intencao_identificada: intencao_identificada_codigo || "",
            nome_do_cidadao: nome_cidadao || "",
            telefone: telefone || chat_id || "",
            whatsapp: chat_id || telefone || "",
            descricao_do_problema: descricao_problema || "",
            status_demanda: status,
            data_registro: new Date().toISOString(),
        };

        
        await enviarParaMake(dadosMake);

        res.status(201).json({
            message: "Solicitação registrada com sucesso.",
            registro: {
                protocolo,
                status_demanda: status,
                intencao_identificada: intencao_identificada_codigo || "",
                nome_cidadao: nome_cidadao || "",
                descricao_problema: descricao_problema || "",
            },
        });
    } catch (error) {
        console.error("Erro ao registrar solicitação:", error.message);
        res.status(500).json({
            message: "Erro ao registrar solicitação.",
            error: error.message,
        });
    }
});

router.get("/registros/protocolo/:protocolo", async (req, res) => {
    try {
        const resultado = await db.query(
            `
           SELECT
    p.numero_protocolo AS protocolo,
    c.nome,
    i.nome AS servico,
    p.telefone,
    p.endereco,
    p.bairro,
    p.ponto_referencia,
    p.descricao,
    p.status_atual
FROM protocolos p
INNER JOIN cidadaos c
    ON p.cidadao_id = c.id
LEFT JOIN intencoes i
    ON p.intencao_id = i.id
WHERE p.numero_protocolo = $1
LIMIT 1
            `,
            [req.params.protocolo]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                message: "Protocolo não encontrado.",
            });
        }
        
        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Erro ao consultar protocolo:", error.message);
        res.status(500).json({
            message: "Erro ao consultar protocolo.",
            error: error.message,
        });
    }
});

router.get("/protocolos", async (req, res) => {
    try {
        const resultado = await db.query(
            `
           SELECT
    p.numero_protocolo AS protocolo,
    c.nome,
    i.nome AS servico,
    p.telefone,
    p.bairro,
    p.endereco,
    p.ponto_referencia,
    p.descricao,
    p.status_atual
FROM protocolos p
INNER JOIN cidadaos c
    ON p.cidadao_id = c.id
LEFT JOIN intencoes i
    ON p.intencao_id = i.id
ORDER BY p.id DESC
LIMIT 20
            `
        );

        res.json(resultado.rows);
    } catch (error) {
        console.error("Erro ao listar protocolos:", error.message);
        res.status(500).json({
            message: "Erro ao listar protocolos.",
            error: error.message,
        });
    }
});
router.get("/dashboard/resumo", async (req, res) => {
    try {
        const diagnostico = await db.query(`
    SELECT
        current_database() AS banco,
        current_user AS usuario,
        current_schema() AS schema_atual,
        current_setting('search_path') AS search_path,
        inet_server_addr() AS servidor,
        inet_server_port() AS porta,
        to_regclass('public.protocolos') AS tabela_protocolos
`);

console.log("DIAGNOSTICO BANCO:", diagnostico.rows[0]);
        const periodo = req.query.periodo || "todos";

        let filtroData = "";

        if (periodo === "hoje") {
            filtroData = "WHERE DATE(data_abertura) = CURRENT_DATE";
        } else if (periodo === "7dias") {
            filtroData = "WHERE data_abertura >= CURRENT_DATE - INTERVAL '6 days'";
        } else if (periodo === "30dias") {
            filtroData = "WHERE data_abertura >= CURRENT_DATE - INTERVAL '29 days'";
        }

        const resultado = await db.query(`
            SELECT
                COUNT(*) AS total_protocolos,
                COUNT(*) FILTER (
                    WHERE DATE(data_abertura) = CURRENT_DATE
                ) AS protocolos_hoje,
                COUNT(*) FILTER (
                    WHERE UPPER(status_atual) LIKE '%ANÁLISE%'
                ) AS em_analise,
                COUNT(*) FILTER (
                    WHERE UPPER(status_atual) LIKE '%EXECUÇÃO%'
                ) AS em_execucao,
                COUNT(*) FILTER (
                    WHERE UPPER(status_atual) LIKE '%CONCLU%'
                ) AS concluidos
            FROM protocolos
            ${filtroData}
        `);

        res.json(resultado.rows[0]);

    } catch (error) {
        console.error("Erro ao carregar resumo do dashboard:", error);

        res.status(500).json({
            message: "Erro ao carregar resumo do dashboard.",
            error: error.message
        });
    }
});

    
router.get("/relatorios/servicos-mais-solicitados", async (req, res) => {
    try {
        const periodo = req.query.periodo || "todos";

        let filtroData = "";

        if (periodo === "hoje") {
            filtroData = "WHERE DATE(p.data_abertura) = CURRENT_DATE";
        } else if (periodo === "7dias") {
            filtroData = "WHERE p.data_abertura >= CURRENT_DATE - INTERVAL '6 days'";
        } else if (periodo === "30dias") {
            filtroData = "WHERE p.data_abertura >= CURRENT_DATE - INTERVAL '29 days'";
        }

        const resultado = await db.query(`
            SELECT
                i.nome AS servico,
                COUNT(*) AS total
            FROM protocolos p
            LEFT JOIN intencoes i
                ON p.intencao_id = i.id
            ${filtroData}
            GROUP BY i.nome
            ORDER BY total DESC
            LIMIT 1
        `);

        res.json(resultado.rows[0] || {
            servico: "Nenhum serviço registrado",
            total: "0"
        });

    } catch (error) {
        console.error("Erro ao carregar serviço mais solicitado:", error.message);

        res.status(500).json({
            message: "Erro ao carregar serviço mais solicitado.",
            error: error.message
        });
    }
});

router.get("/relatorios/status-demandas", async (req, res) => {
    try {
        const periodo = req.query.periodo || "todos";

        let filtroData = "";

        if (periodo === "hoje") {
            filtroData = "WHERE DATE(data_abertura) = CURRENT_DATE";
        } else if (periodo === "7dias") {
            filtroData = "WHERE data_abertura >= CURRENT_DATE - INTERVAL '6 days'";
        } else if (periodo === "30dias") {
            filtroData = "WHERE data_abertura >= CURRENT_DATE - INTERVAL '29 days'";
        }

        const resultado = await db.query(`
            SELECT
                status_atual AS status,
                COUNT(*) AS total
            FROM protocolos
            ${filtroData}
            GROUP BY status_atual
            ORDER BY total DESC
            LIMIT 1
        `);

        res.json(resultado.rows[0] || {
            status: "Nenhum status registrado",
            total: "0"
        });

    } catch (error) {
        console.error("Erro ao carregar status das demandas:", error.message);

        res.status(500).json({
            message: "Erro ao carregar status das demandas.",
            error: error.message
        });
    }
});

router.get("/relatorios/demandas-em-aberto", async (req, res) => {
    try {
        const periodo = req.query.periodo || "todos";

        let filtroData = "";

        if (periodo === "hoje") {
            filtroData = "AND DATE(data_abertura) = CURRENT_DATE";
        } else if (periodo === "7dias") {
            filtroData = "AND data_abertura >= CURRENT_DATE - INTERVAL '6 days'";
        } else if (periodo === "30dias") {
            filtroData = "AND data_abertura >= CURRENT_DATE - INTERVAL '29 days'";
        }

        const resultado = await db.query(`
            SELECT
                COUNT(*) AS total
            FROM protocolos
            WHERE UPPER(status_atual) NOT LIKE '%CONCLUÍDO%'
            ${filtroData}
        `);

        res.json(resultado.rows[0] || {
            total: "0"
        });

    } catch (error) {
        console.error("Erro ao carregar demandas em aberto:", error.message);

        res.status(500).json({
            message: "Erro ao carregar demandas em aberto.",
            error: error.message
        });
    }
});
router.get("/relatorios/taxa-resolucao", async (req, res) => {
  try {
    const periodo = req.query.periodo || "todos";

    let filtroData = "";

    if (periodo === "hoje") {
      filtroData = "WHERE DATE(data_abertura) = CURRENT_DATE";
    } else if (periodo === "7dias") {
      filtroData =
        "WHERE data_abertura >= CURRENT_DATE - INTERVAL '6 days'";
    } else if (periodo === "30dias") {
      filtroData =
        "WHERE data_abertura >= CURRENT_DATE - INTERVAL '29 days'";
    }

    const resultado = await db.query(`
      SELECT
        COUNT(*) AS total_protocolos,
        COUNT(*) FILTER (
          WHERE UPPER(status_atual) LIKE '%CONCLUÍDO%'
        ) AS concluidos
      FROM protocolos
      ${filtroData}
    `);

    const total = Number(resultado.rows[0].total_protocolos || 0);
    const concluidos = Number(resultado.rows[0].concluidos || 0);

    const taxa = total > 0
      ? Math.round((concluidos / total) * 100)
      : 0;

    res.json({
      taxa_resolucao: taxa
    });

  } catch (error) {
    console.error("Erro ao calcular taxa de resolução:", error.message);

    res.status(500).json({
      message: "Erro ao calcular taxa de resolução.",
      error: error.message
    });
  }
});
router.put("/protocolos/:protocolo/status", async (req, res) => {
    try {
        const { protocolo } = req.params;
        const { status_atual } = req.body;

        if (!status_atual) {
            return res.status(400).json({
                message: "O novo status é obrigatório."
            });
        }

       const resultado = await db.query(
    `
    UPDATE protocolos
    SET
        status_atual = $1::text,
        data_encerramento = CASE
            WHEN UPPER($1::text) LIKE '%CONCLUÍDO%' THEN CURRENT_TIMESTAMP
            ELSE NULL
        END
    WHERE numero_protocolo = $2
    RETURNING
        numero_protocolo AS protocolo,
        status_atual,
        data_encerramento
    `,
    [status_atual, protocolo]
);

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                message: "Protocolo não encontrado."
            });
        }

        await db.query(
    `
    INSERT INTO historico_status (
        protocolo_id,
        status,
        observacao
    )
    SELECT
        id,
        $1,
        $2
    FROM protocolos
    WHERE numero_protocolo = $3
    `,
    [
        status_atual,
        "Status atualizado pelo Centro Operacional da OUVIA.",
        protocolo
    ]
);

// Se a demanda foi concluída, encerra a equipe atualmente responsável
if (status_atual.toUpperCase().includes("CONCLUÍDO")) {
    await db.query(
        `
        UPDATE atribuicoes_equipe
        SET data_fim = CURRENT_TIMESTAMP
        WHERE protocolo_id = (
            SELECT id
            FROM protocolos
            WHERE numero_protocolo = $1
        )
        AND data_fim IS NULL
        `,
        [protocolo]
    );
}

        res.json({
            message: "Status atualizado com sucesso.",
            protocolo: resultado.rows[0]
        });

    } catch (error) {
        console.error("Erro ao atualizar status:", error.message);

        res.status(500).json({
            message: "Erro ao atualizar status.",
            error: error.message
        });
    }
});

// ========================================
// HISTÓRICO DE ANDAMENTO DA DEMANDA
// ========================================

router.get("/protocolos/:protocolo/historico-status", async (req, res) => {
    try {
        const { protocolo } = req.params;

        const resultado = await db.query(
            `
            SELECT
                hs.id,
                hs.status,
                hs.observacao,
                hs.data_registro
            FROM historico_status hs
            INNER JOIN protocolos p
                ON p.id = hs.protocolo_id
            WHERE p.numero_protocolo = $1
            ORDER BY hs.data_registro ASC
            `,
            [protocolo]
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error(
            "Erro ao carregar histórico de status:",
            error.message
        );

        res.status(500).json({
            message: "Erro ao carregar histórico de status.",
            error: error.message
        });
    }
});

router.get("/relatorios/distribuicao-status", async (req, res) => {
    try {
        const periodo = req.query.periodo || "todos";

        let filtroData = "";

        if (periodo === "hoje") {
            filtroData = "WHERE DATE(data_abertura) = CURRENT_DATE";
        } else if (periodo === "7dias") {
            filtroData = "WHERE data_abertura >= CURRENT_DATE - INTERVAL '6 days'";
        } else if (periodo === "30dias") {
            filtroData = "WHERE data_abertura >= CURRENT_DATE - INTERVAL '29 days'";
        }

        const resultado = await db.query(`
            SELECT
                status_atual AS status,
                COUNT(*) AS total
            FROM protocolos
            ${filtroData}
            GROUP BY status_atual
            ORDER BY total DESC
        `);

        res.json(resultado.rows);

    } catch (error) {
        console.error("Erro ao carregar distribuição por status:", error.message);

        res.status(500).json({
            message: "Erro ao carregar distribuição por status.",
            error: error.message
        });
    }
});
    
   
 // ========================================
// SAÚDE OPERACIONAL
// ========================================

router.get("/admin/saude-operacional", async (req, res) => {

       
    try {
        const resultado =
            await inteligencia.calcularSaudeOperacional(db);

        res.json(resultado);
    } catch (error) {
        console.error(
            "Erro ao calcular saúde operacional:",
            error.message
        );

        res.status(500).json({
            message: "Erro ao calcular saúde operacional.",
            error: error.message
        });
    }
});

// =========================================================
// DIAGNÓSTICO EXECUTIVO
// =========================================================

router.get("/admin/diagnostico-executivo", async (req, res) => {

    try {

        const resultado =
            await inteligencia.gerarDiagnosticoExecutivo(db);

        res.json(resultado);

    } catch (error) {

        console.error(
            "Erro ao gerar diagnóstico executivo:",
            error.message
        );

        res.status(500).json({
            message: "Erro ao gerar diagnóstico executivo.",
            error: error.message
        });

    }

});


module.exports = router;