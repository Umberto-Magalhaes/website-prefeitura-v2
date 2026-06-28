const express = require("express");
const db = require("../db/connection");

const router = express.Router();

const WEBHOOK_MAKE_PREFEITURAS = "https://hook.us2.make.com/903cplertvaer2vh3v7qn4o7qrwlx8gn";

function gerarProtocolo() {
  const agora = new Date();
  const data = agora.toISOString().slice(0, 10).replace(/-/g, "");
  const hora = agora.toTimeString().slice(0, 8).replace(/:/g, "");
  const aleatorio = Math.floor(100 + Math.random() * 900);
  return `${data}-${hora}-${aleatorio}`;
}

async function enviarParaMake(dados) {
  if (!WEBHOOK_MAKE_PREFEITURAS.includes("hook.us2.make.com")) return;

  try {
    await fetch(WEBHOOK_MAKE_PREFEITURAS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });
  } catch (erro) {
    console.error("Erro ao enviar para o Make:", erro.message);
  }
}

router.post("/registros", async (req, res) => {
  const {
    intencao_identificada_codigo,
    nome_cidadao,
    telefone,
    chat_id,
    descricao_problema
  } = req.body;

  const protocolo = gerarProtocolo();

  db.run(
    `INSERT INTO registros (
      protocolo,
      intencao,
      nome,
      telefone,
      chat_id,
      descricao,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      protocolo,
      intencao_identificada_codigo || "",
      nome_cidadao || "",
      telefone || "",
      chat_id || telefone || "",
      descricao_problema || "",
      "Recebido"
    ],
    async function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({
          message: "Erro ao registrar solicitação."
        });
      }

      const dadosMake = {
        origem: "web",
        protocolo,
        intencao_identificada: intencao_identificada_codigo || "",
        nome_do_cidadao: nome_cidadao || "",
        telefone: telefone || "",
        whatsapp: chat_id || telefone || "",
        descricao_do_problema: descricao_problema || "",
        status_demanda: "Recebido",
        data_registro: new Date().toISOString()
      };

      await enviarParaMake(dadosMake);

      res.status(201).json({
        message: "Solicitação registrada com sucesso.",
        registro: {
          protocolo,
          status_demanda: "Recebido",
          intencao_identificada: intencao_identificada_codigo || "",
          nome_cidadao: nome_cidadao || "",
          descricao_problema: descricao_problema || ""
        }
      });
    }
  );
});

router.get("/registros/protocolo/:protocolo", (req, res) => {
  db.get(
    `SELECT * FROM registros WHERE protocolo = ?`,
    [req.params.protocolo],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          message: "Erro ao consultar protocolo."
        });
      }

      if (!row) {
        return res.status(404).json({
          message: "Protocolo não encontrado."
        });
      }

      res.json({
        protocolo: row.protocolo,
        status_demanda: row.status || "Recebido",
        intencao_identificada: row.intencao,
        nome_cidadao: row.nome,
        descricao_problema: row.descricao
      });
    }
  );
});

module.exports = router;