const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const app = express();
app.get('/teste-admin', (req, res) => {
    res.send('ROTA TESTE ADMIN FUNCIONANDO');
});
console.log("🚀 APP.JS DA WEBSITE-PREFEITURA-V2 FOI CARREGADO");
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, '../public')));
app.use('/api', apiRoutes);
// app.use('/admin', adminRoutes);
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
});
app.get('/painel', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/admin.html'));
});
module.exports = app;