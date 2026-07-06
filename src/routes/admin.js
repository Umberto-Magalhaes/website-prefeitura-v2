const express = require("express");
const path = require("path");

const router = express.Router();

router.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../../public/admin.html"));
});

router.get("/dashboard", (req, res) => {
    res.json({
        sucesso: true,
        mensagem: "Painel Administrativo da OUVIA funcionando."
    });
});

module.exports = router;