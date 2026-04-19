const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../data/atendimento.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err.message);
  } else {
    console.log('Banco SQLite conectado com sucesso!');
  }
});

db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS registros`);

  db.run(`
    CREATE TABLE IF NOT EXISTS registros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      protocolo TEXT,
      intencao TEXT,
      nome TEXT,
      telefone TEXT,
      chat_id TEXT,
      descricao TEXT,
      linha_onibus TEXT,
      numero_ordem_veiculo TEXT,
      nome_empresa TEXT,
      local_ocorrencia TEXT,
      status TEXT,
      data_registro DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;