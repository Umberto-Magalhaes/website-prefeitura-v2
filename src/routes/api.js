const express = require("express");
const { STATUS_DEMANDA } = require("../config/constants");
const {
  getIntencaoAtivaByCodigo,
  getIntencaoAtivaById,
  listIntencoesAtivas
} = require("../db/init");
const {
  createRegistro,
  getRegistroByProtocol,
  listRegistros,
  updateStatus
} = require("../services/registroService");
const {
  validateRegistroPayload,
  validateStatus
} = require("../services/validationService");

const router = express.Router();

const WEBHOOK_MAKE_PREFEITURAS = "COLE_AQUI_A_URL_DO_WEBHOOK_PREFEITURAS";

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

async function enviarRegistroParaMake(registro, bodyOriginal, intencao) {
  if (!WEBHOOK_MAKE_PREFEITURAS || WEBHOOK_MAKE_PREFEITURAS.includes("COLE_AQUI")) {
    console.log("Webhook do Make Prefeituras não configurado.");
    return;
  }

  try {
    await fetch(WEBHOOK_MAKE_PREFEITURAS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        origem: "web",
        protocolo: registro.protocolo,
        data_registro: registro.data_registro || new Date().toISOString(),

        intencao_identificada: intencao.codigo || intencao.nome_exibicao || "",
        servico_solicitado: intencao.nome_exibicao || intencao.codigo || "",

        nome_do_cidadao: bodyOriginal.nome_cidadao || "",
        telefone: bodyOriginal.telefone || "",
        whatsapp: bodyOriginal.chat_id || bodyOriginal.telefone || "",

        endereco_do_servico: bodyOriginal.endereco_servico || bodyOriginal.endereco || "",
        ponto_de_referencia: bodyOriginal.ponto_referencia || "",
        descricao_do_problema: bodyOriginal.descricao_problema || "",
        observacao_do_cidadao: bodyOriginal.observacao_cidadao || bodyOriginal.opiniao_do_cidadao || "",

        status_demanda: registro.status_demanda || "Recebido"
      })
    });
  } catch (error) {
    console.error("Erro ao enviar registro para o Make Prefeituras:", error.message);
  }
}

router.get("/intencoes", async (request, response, next) => {
  try {
    response.json(await listIntencoesAtivas());
  } catch (error) {
    next(error);
  }
});

router.get("/status", (request, response) => {
  response.json(STATUS_DEMANDA);
});

router.post("/registros", async (request, response, next) => {
  try {
    const codigoIntencao = isBlank(request.body.intencao_identificada_codigo)
      ? ""
      : String(request.body.intencao_identificada_codigo).trim();

    const payloadValidacao =
      isBlank(request.body.intencao_identificada_id) && codigoIntencao
        ? { ...request.body, intencao_identificada_id: "__codigo_informado__" }
        : request.body;

    const errors = validateRegistroPayload(payloadValidacao);

    if (errors.length > 0) {
      response.status(400).json({
        message: "Não foi possível registrar a solicitação.",
        errors
      });
      return;
    }

    let intencao = null;

    if (!isBlank(request.body.intencao_identificada_id)) {
      intencao = await getIntencaoAtivaById(Number(request.body.intencao_identificada_id));

      if (!intencao) {
        response.status(400).json({
          message: "A solicitação selecionada é inválida."
        });
        return;
      }
    } else {
      intencao = await getIntencaoAtivaByCodigo(codigoIntencao);

      if (!intencao) {
        response.status(400).json({
          message: `Não foi encontrada uma solicitação ativa para o código "${codigoIntencao}".`
        });
        return;
      }
    }

    const registro = await createRegistro({
      ...request.body,
      intencao_identificada_id: intencao.id
    });

    await enviarRegistroParaMake(registro, request.body, intencao);

    response.status(201).json({
      message: `Solicitação registrada com sucesso. Seu protocolo é ${registro.protocolo}.`,
      registro
    });
  } catch (error) {
    next(error);
  }
});

router.get("/registros/protocolo/:protocolo", async (request, response, next) => {
  try {
    const registro = await getRegistroByProtocol(request.params.protocolo);

    if (!registro) {
      response.status(404).json({
        message: "Nenhuma solicitação foi encontrada para esse protocolo."
      });
      return;
    }

    response.json(registro);
  } catch (error) {
    next(error);
  }
});

router.get("/admin/registros", async (request, response, next) => {
  try {
    response.json(
      await listRegistros({
        protocolo: request.query.protocolo,
        status_demanda: request.query.status_demanda
      })
    );
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/registros/:id/status", async (request, response, next) => {
  try {
    const { status_demanda } = request.body;

    if (!validateStatus(status_demanda)) {
      response.status(400).json({
        message: "O status informado é inválido."
      });
      return;
    }

    const registro = await updateStatus(request.params.id, status_demanda);

    if (!registro) {
      response.status(404).json({
        message: "O registro informado não foi localizado."
      });
      return;
    }

    response.json({
      message: "Status atualizado com sucesso.",
      registro
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;