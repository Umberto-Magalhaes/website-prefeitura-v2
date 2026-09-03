const {
    determinarPrioridadeBase,
    compararPrioridades,
    classificarNivelEvidencia,
    construirEvidenciaGerencial
} = require("./motores/motorPriorizacaoGerencial");

const testes = [
    ["CRITICA", "CRESCENTE"],
    ["CRITICA", "ESTAVEL"],
    ["CRITICA", "DECRESCENTE"],
    ["ATENCAO", "CRESCENTE"],
    ["ATENCAO", "ESTAVEL"],
    ["ATENCAO", "DECRESCENTE"],
    ["SATISFATORIA", "CRESCENTE"],
    ["SATISFATORIA", "ESTAVEL"],
    ["BOA", "CRESCENTE"],
    ["BOA", "ESTAVEL"],
    ["CRITICA", "SEM_DADOS"],
    ["", "CRESCENTE"]
];

for (const [saude, tendencia] of testes) {
    const prioridade =
        determinarPrioridadeBase(
            saude,
            tendencia
        );

    console.log(
        `${saude || "SEM SAUDE"} + ${tendencia} => ${prioridade}`
    );
}

console.log("\n--- TESTE DE DESEMPATE ---");

const servicos = [
    {
        servico: "Iluminação Pública",
        saude: {
            classificacao: "ATENCAO"
        },
        tendencia: {
            classificacao: "CRESCENTE"
        }
    },
    {
        servico: "Poda de Árvore",
        saude: {
            classificacao: "CRITICA"
        },
        tendencia: {
            classificacao: "DECRESCENTE"
        }
    },
    {
        servico: "Coleta de Lixo",
        saude: {
            classificacao: "CRITICA"
        },
        tendencia: {
            classificacao: "CRESCENTE"
        }
    }
];

servicos.sort(compararPrioridades);

for (const item of servicos) {
    console.log(
        `${item.servico} => ${item.saude.classificacao} + ${item.tendencia.classificacao}`
    );
}

console.log("\n--- TESTE DA TAXA CRITICA ---");

const servicosTaxaCritica = [
    {
        servico: "Serviço A",
        saude: {
            classificacao: "CRITICA",
            totalAbertas: 20,
            critico: 10
        },
        tendencia: {
            classificacao: "CRESCENTE"
        }
    },
    {
        servico: "Serviço B",
        saude: {
            classificacao: "CRITICA",
            totalAbertas: 100,
            critico: 15
        },
        tendencia: {
            classificacao: "CRESCENTE"
        }
    }
];

servicosTaxaCritica.sort(compararPrioridades);

for (const item of servicosTaxaCritica) {
    const taxa =
        (item.saude.critico / item.saude.totalAbertas) * 100;

    console.log(
        `${item.servico} => ${item.saude.critico}/${item.saude.totalAbertas} = ${taxa.toFixed(1)}%`
    );
}

console.log("\n--- TESTE DO NÍVEL DE EVIDÊNCIA ---");

const quantidadesEvidencia = [
    0,
    1,
    4,
    5,
    9,
    10,
    29,
    30,
    99,
    100
];

for (const quantidade of quantidadesEvidencia) {
    console.log(
        `${quantidade} demandas => ${classificarNivelEvidencia(quantidade)}`
    );
}

console.log("\n--- TESTE DA EVIDÊNCIA GERENCIAL ---");

const testesEvidenciaGerencial = [
    {
        servico: "Serviço A",
        saude: "CRITICA",
        tendencia: "CRESCENTE",
        totalAbertas: 20,
        critico: 10
    },
    {
        servico: "Serviço B",
        saude: "CRITICA",
        tendencia: "CRESCENTE",
        totalAbertas: 100,
        critico: 15
    },
    {
        servico: "Serviço C",
        saude: "ATENCAO",
        tendencia: "ESTAVEL",
        totalAbertas: 4,
        critico: 1
    }
];

for (const item of testesEvidenciaGerencial) {
    
    const resultado = construirEvidenciaGerencial({
    classificacaoSaude: item.saude,
    tendencia: item.tendencia,
    totalAbertas: item.totalAbertas,
    critico: item.critico
});

    console.log(item.servico, "=>", resultado);
}