const express = require('express');
const router = express.Router();
const db = require('../db/connection');

function gerarProtocolo() {
  return Date.now().toString();
}

router.post('/registrar', (req, res) => {
  const {
    intencao,
    nome,
    telefone,
    chatId,
    endereco,
    pontoReferencia,
    descricao,
    opiniao
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
      linha_onibus,
      numero_ordem_veiculo,
      nome_empresa,
      local_ocorrencia,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      protocolo,
      intencao,
      nome,
      telefone,
      chatId || '',
      descricao,
      '',
      '',
      '',
      `${endereco || ''} | Ponto de referência: ${pontoReferencia || ''} | Observação: ${opiniao || ''}`,
      'Recebido'
    ],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ erro: 'Erro ao registrar solicitação' });
      }

      res.json({
        mensagem: 'Solicitação registrada com sucesso!',
        protocolo: protocolo
      });
    }
  );
});

router.get('/consultar/:protocolo', (req, res) => {
  const protocolo = req.params.protocolo;

  db.get(
    `SELECT * FROM registros WHERE protocolo = ?`,
    [protocolo],
    (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ erro: 'Erro na consulta' });
      }

      if (!row) {
        return res.status(404).json({ erro: 'Protocolo não encontrado' });
      }

      res.json({
        protocolo: row.protocolo,
        status: row.status,
        intencao: row.intencao,
        descricao: row.descricao,
        local_ocorrencia: row.local_ocorrencia
      });
    }
  );
});

module.exports = router;