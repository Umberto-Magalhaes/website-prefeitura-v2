const {
    determinarPrioridadeBase,
    compararPrioridades,
    classificarNivelEvidencia,
    construirEvidenciaGerencial,
    classificarPadraoCriticidade,
    calcularLimiteInferiorWilson

} = require("./motores/motorPriorizacaoGerencial");

const cenarios = [
    {
        nome: "Saúde boa, tendência crescente, amostra pequena",
        classificacaoSaude: "BOA",
        tendencia: "CRESCENTE",
        totalAbertas: 1,
        critico: 0
    },
    {
        nome: "Saúde crítica, tendência estável, amostra pequena",
        classificacaoSaude: "CRITICA",
        tendencia: "ESTAVEL",
        totalAbertas: 3,
        critico: 2
    },
    {
        nome: "Saúde crítica, tendência crescente, amostra moderada",
        classificacaoSaude: "CRITICA",
        tendencia: "CRESCENTE",
        totalAbertas: 20,
        critico: 12
    },
    {
        nome: "Saúde satisfatória, tendência decrescente, amostra alta",
        classificacaoSaude: "SATISFATORIA",
        tendencia: "DECRESCENTE",
        totalAbertas: 60,
        critico: 3
    }
];

for (const cenario of cenarios) {

    const prioridadeBase =
        determinarPrioridadeBase(
            cenario.classificacaoSaude,
            cenario.tendencia
        );

    const nivelEvidencia =
        classificarNivelEvidencia(
            cenario.totalAbertas
        );

    const evidencia =
        construirEvidenciaGerencial({
            classificacaoSaude: cenario.classificacaoSaude,
            tendencia: cenario.tendencia,
            totalAbertas: cenario.totalAbertas,
            critico: cenario.critico
        });

    console.log("\n========================================");
    console.log(cenario.nome);
    console.log("========================================");

    console.log({
        classificacaoSaude: cenario.classificacaoSaude,
        tendencia: cenario.tendencia,
        totalAbertas: cenario.totalAbertas,
        critico: cenario.critico,
        prioridadeBase,
        nivelEvidencia,
        evidencia
    });
}

console.log("\n=== TESTE DE COMPARAÇÃO COM OBJETOS PLANOS ===");

const servicosPlanos = [
    {
        servico: "Serviço B",
        classificacaoSaude: "BOA",
        tendencia: "DECRESCENTE",
        totalAbertas: 60,
        critico: 0
    },
    {
        servico: "Serviço A",
        classificacaoSaude: "CRITICA",
        tendencia: "CRESCENTE",
        totalAbertas: 20,
        critico: 12
    }
];

console.log(
    "Comparação B x A:",
    compararPrioridades(servicosPlanos[0], servicosPlanos[1])
);

console.log(
    "Comparação A x B:",
    compararPrioridades(servicosPlanos[1], servicosPlanos[0])
);

servicosPlanos.sort(compararPrioridades);

console.log(servicosPlanos);

console.log("\n=== TESTE DE FRONTEIRA: TAXA CRÍTICA X EVIDÊNCIA ===");

const servicosFronteira = [
    {
        servico: "Serviço Pequeno",
        classificacaoSaude: "CRITICA",
        tendencia: "ESTAVEL",
        totalAbertas: 1,
        critico: 1
    },
    {
        servico: "Serviço Grande",
        classificacaoSaude: "CRITICA",
        tendencia: "ESTAVEL",
        totalAbertas: 100,
        critico: 70
    }
];

console.log(
    "Pequeno x Grande:",
    compararPrioridades(
        servicosFronteira[0],
        servicosFronteira[1]
    )
);

console.log(
    "Grande x Pequeno:",
    compararPrioridades(
        servicosFronteira[1],
        servicosFronteira[0]
    )
);

servicosFronteira.sort(compararPrioridades);

console.log(servicosFronteira);

console.log("\n=== TESTE DE FRONTEIRA: GRAVIDADE X VOLUME X EVIDÊNCIA ===");

const cenariosFronteira = [
    {
        servico: "Caso A - crítico isolado",
        classificacaoSaude: "CRITICA",
        tendencia: "ESTAVEL",
        totalAbertas: 1,
        critico: 1
    },
    {
        servico: "Caso B - criticidade pequena",
        classificacaoSaude: "CRITICA",
        tendencia: "ESTAVEL",
        totalAbertas: 10,
        critico: 3
    },
    {
        servico: "Caso C - criticidade relevante",
        classificacaoSaude: "CRITICA",
        tendencia: "ESTAVEL",
        totalAbertas: 30,
        critico: 15
    },
    {
        servico: "Caso D - criticidade sistêmica",
        classificacaoSaude: "CRITICA",
        tendencia: "ESTAVEL",
        totalAbertas: 100,
        critico: 70
    }
];

for (const caso of cenariosFronteira) {

    const evidencia =
        construirEvidenciaGerencial({
            classificacaoSaude: caso.classificacaoSaude,
            tendencia: caso.tendencia,
            totalAbertas: caso.totalAbertas,
            critico: caso.critico
        });

    console.log({
        servico: caso.servico,
        totalAbertas: caso.totalAbertas,
        critico: caso.critico,
        taxaCritica: evidencia.taxaCritica,
        nivelEvidencia: evidencia.nivelEvidencia
    });
}

cenariosFronteira.sort(compararPrioridades);

console.log("\n=== ORDEM PRODUZIDA PELO COMPARADOR ATUAL ===");

console.log(cenariosFronteira);

console.log("\n=== TESTE DE FRONTEIRA: INFLUÊNCIA DA TENDÊNCIA ===");

const cenariosTendencia = [
    {
        servico: "Tendência crescente",
        classificacaoSaude: "CRITICA",
        tendencia: "CRESCENTE",
        totalAbertas: 30,
        critico: 15
    },
    {
        servico: "Tendência estável",
        classificacaoSaude: "CRITICA",
        tendencia: "ESTAVEL",
        totalAbertas: 30,
        critico: 15
    },
    {
        servico: "Tendência decrescente",
        classificacaoSaude: "CRITICA",
        tendencia: "DECRESCENTE",
        totalAbertas: 30,
        critico: 15
    }
];

cenariosTendencia.sort(compararPrioridades);

console.log(cenariosTendencia);

console.log("\n=== TESTE DE FRONTEIRA: CRITICIDADE ISOLADA X PADRÃO SISTÊMICO ===");

const cenariosCriticidade = [
    {
        servico: "Caso A - crítico isolado 1/1",
        classificacaoSaude: "CRITICA",
        tendencia: "ESTAVEL",
        totalAbertas: 1,
        critico: 1
    },
    {
        servico: "Caso B - criticidade pequena 3/3",
        classificacaoSaude: "CRITICA",
        tendencia: "ESTAVEL",
        totalAbertas: 3,
        critico: 3
    },
    {
        servico: "Caso C - criticidade sistêmica 70/100",
        classificacaoSaude: "CRITICA",
        tendencia: "ESTAVEL",
        totalAbertas: 100,
        critico: 70
    }
];

for (const caso of cenariosCriticidade) {

    const evidencia =
        construirEvidenciaGerencial({
            classificacaoSaude: caso.classificacaoSaude,
            tendencia: caso.tendencia,
            totalAbertas: caso.totalAbertas,
            critico: caso.critico
        });

    console.log({
        servico: caso.servico,
        totalAbertas: caso.totalAbertas,
        critico: caso.critico,
        taxaCritica: evidencia.taxaCritica,
        nivelEvidencia: evidencia.nivelEvidencia
    });
}

cenariosCriticidade.sort(compararPrioridades);

console.log("\n=== ORDEM DA CRITICIDADE PRODUZIDA PELO COMPARADOR ===");

console.log(cenariosCriticidade);

console.log("\n=== TESTE DA CLASSIFICAÇÃO DO PADRÃO DE CRITICIDADE ===");

const testesPadraoCriticidade = [
    {
        nome: "Sem criticidade",
        totalAbertas: 10,
        critico: 0,
        taxaCritica: 0,
        nivelEvidencia: "MODERADA"
    },
    {
        nome: "Crítico isolado",
        totalAbertas: 1,
        critico: 1,
        taxaCritica: 100,
        nivelEvidencia: "MUITO_BAIXA"
    },
    {
        nome: "Indício de criticidade",
        totalAbertas: 10,
        critico: 3,
        taxaCritica: 30,
        nivelEvidencia: "MODERADA"
    },
    {
        nome: "Criticidade relevante",
        totalAbertas: 30,
        critico: 15,
        taxaCritica: 50,
        nivelEvidencia: "ALTA"
    },
    {
        nome: "Padrão crítico sistêmico",
        totalAbertas: 100,
        critico: 70,
        taxaCritica: 70,
        nivelEvidencia: "MUITO_ALTA"
    }
];

for (const teste of testesPadraoCriticidade) {

    const classificacao =
        classificarPadraoCriticidade({
            totalAbertas: teste.totalAbertas,
            critico: teste.critico,
            taxaCritica: teste.taxaCritica,
            nivelEvidencia: teste.nivelEvidencia
        });

    console.log({
        nome: teste.nome,
        totalAbertas: teste.totalAbertas,
        critico: teste.critico,
        taxaCritica: teste.taxaCritica,
        nivelEvidencia: teste.nivelEvidencia,
        classificacao
    });
}

console.log("\n=== TESTE DO LIMITE INFERIOR DE WILSON ===");

const testesWilson = [
    { nome: "Crítico isolado", critico: 1, total: 1 },
    { nome: "Indício de criticidade", critico: 3, total: 10 },
    { nome: "Fronteira 50%", critico: 15, total: 30 },
    { nome: "Padrão sistêmico", critico: 70, total: 100 }
];

for (const teste of testesWilson) {

    const limiteInferior =
        calcularLimiteInferiorWilson(
            teste.critico,
            teste.total
        );

    console.log({
        nome: teste.nome,
        critico: teste.critico,
        total: teste.total,
        taxaObservada:
            Number(
                ((teste.critico / teste.total) * 100).toFixed(2)
            ),
        limiteInferiorWilson: limiteInferior
    });
}