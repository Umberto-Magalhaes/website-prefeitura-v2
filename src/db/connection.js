const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
});

pool.on("connect", async (client) => {
    try {
        await client.query("SET TIME ZONE 'America/Fortaleza'");
        console.log("Timezone PostgreSQL configurado: America/Fortaleza");
    } catch (error) {
        console.error("Erro ao configurar timezone PostgreSQL:", error);
    }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};