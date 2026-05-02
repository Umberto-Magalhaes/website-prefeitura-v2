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

const WEBHOOK_MAKE_PREFEITURAS = "https://hook.us2.make.com/903cplertvaer2vh3v7qn4o7qrwlx8gn";

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

async function enviarRegistroParaMake(registro, bodyOriginal, intencao) {
  if (!WEBHOOK_MAKE_PREFEITURAS || WEBHOOK_MAKE_PREFEITURAS.includes("COLE_AQUI")) {
    console.log("Webhook do Make não configurado. Registro salvo apenas no sistema web.");
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
        intencao_identificada: intencao.codigo || intencao.nome_exibicao,
        nome_cidadao: bodyOriginal.nome_cidadao || "",
        telefone: bodyOriginal.telefone || "",
        chat_id: bodyOriginal.chat_id || "",
        descricao_problema: bodyOriginal.descricao_problema || "",
        linha_onibus: bodyOriginal.linha_onibus || "",
        numero_ordem: bodyOriginal.numero_ordem || "",
        nome_da_empresa: bodyOriginal.nome_da_empresa || "",
        local_ocorrencia: bodyOriginal.local_ocorrencia || "",
        data_horario_ocorrencia: bodyOriginal.data_horario_ocorrencia || "",
        sentido_viagem: bodyOriginal.sentido_viagem || "",
        endereco: bodyOriginal.endereco || "",
        ponto_referencia: bodyOriginal.ponto_referencia || "",
        opiniao_do_cidadao: bodyOriginal.opiniao_do_cidadao || "",
        status_demanda: registro.status_demanda || "Recebido",
        data_registro: registro.data_hora_registro || new Date().toISOString()
      })
    });
  } catch (error) {
    console.error("Erro ao enviar registro para o Make:", error.message);
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
        message: "Não foi possível registrar a ocorrência.",
        errors
      });
      return;
    }

    let intencao = null;

    if (!isBlank(request.body.intencao_identificada_id)) {
      intencao = await getIntencaoAtivaById(Number(request.body.intencao_identificada_id));

      if (!intencao) {
        response.status(400).json({
          message: "A intenção identificada selecionada é inválida."
        });
        return;
      }
    } else {
      intencao = await getIntencaoAtivaByCodigo(codigoIntencao);

      if (!intencao) {
        response.status(400).json({
          message: `Não foi encontrada uma intenção ativa para o código "${codigoIntencao}".`
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
      message: `Ocorrência registrada com sucesso. Seu protocolo é ${registro.protocolo}.`,
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
        message: "Nenhuma ocorrência foi encontrada para esse protocolo."
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