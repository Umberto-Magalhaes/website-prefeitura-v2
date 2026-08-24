const {
    interpretarPergunta
} = require("../services/interpretadorPerguntas");

const {
    construirResposta
} = require("../services/construtorResposta");

const express = require('express');
const path = require('path');

const router = express.Router();

const db = require('../db/connection');

const inteligenciaService = require('../services/inteligenciaService');

const motorPriorizacao = require('../motores/motorPriorizacao');

const motorAlertas =
    require('../motores/motorAlertas');

router.get('/', (req, res) => {

    res.sendFile(
        path.resolve(__dirname, '../../public/central.html')
    );

});

router.get('/api/resumo', async (req, res) => {

    try {

        const resumo =
            await inteligenciaService.gerarResumoDashboard(db);

        res.json(resumo);

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: 'Erro ao gerar resumo.'
        });

    }

});

router.get('/api/op001', async (req, res) => {

    try {

        const resultado = await motorPriorizacao.executar(db);

        res.json(resultado);

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: 'Erro ao executar o Motor OP-001.'
        });

    }

});

router.get('/api/op003', async (req, res) => {

    try {

        const resultado =
            await motorAlertas.gerarAlertas(db);

        res.json(resultado);

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: 'Erro ao executar o Motor OP-003.'
        });

    }

});

// =====================================================
// INTELIGÊNCIA CONVERSACIONAL
// =====================================================

router.post("/api/pergunta", async (req, res) => {
    try {
        const pergunta = String(req.body?.pergunta || "").trim();

        if (!pergunta) {
            return res.status(400).json({
                sucesso: false,
                erro: "Pergunta não informada."
            });
        }

        const dados = await inteligenciaService.gerarResumoDashboard(db);

        const interpretacao = interpretarPergunta(pergunta);

        const resposta = construirResposta(
            interpretacao,
            dados
        );

        return res.json({
            sucesso: true,
            pergunta,
            interpretacao,
            resposta
        });
    } catch (erro) {
        console.error(
            "Erro na Inteligência Conversacional:",
            erro
        );

        return res.status(500).json({
            sucesso: false,
            erro: "Erro interno da Inteligência Conversacional."
        });
    }
});

module.exports = router;