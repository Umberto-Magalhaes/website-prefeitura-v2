const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.resolve(__dirname, '../../data');
const dbPath = path.join(dataDir, 'atendimento.db');

// Garante que a pasta exista antes de abrir o banco
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err.message);
  } else {
    console.log('Banco SQLite conectado com sucesso!');
  }
});

db.serialize(() => {
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