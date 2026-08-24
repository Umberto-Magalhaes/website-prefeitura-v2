/**
 * ==========================================================
 * INTERPRETADOR DE PERGUNTAS - OUVIA
 * ==========================================================
 * Responsabilidade:
 * Compreender a intenção da pergunta do gestor.
 *
 * NÃO gera respostas.
 * NÃO consulta banco.
 * NÃO monta textos.
 *
 * Apenas identifica o que o gestor deseja saber.
 * ==========================================================
 */

const INTENCOES = {
    CONSULTA_GERAL: "CONSULTA_GERAL",
    CONSULTA_PRIORIDADE: "CONSULTA_PRIORIDADE",
    CONSULTA_ALERTAS: "CONSULTA_ALERTAS",
    CONSULTA_EVOLUCAO: "CONSULTA_EVOLUCAO",
    CONSULTA_RECOMENDACOES: "CONSULTA_RECOMENDACOES",
    CONSULTA_SERVICO: "CONSULTA_SERVICO",
    CONSULTA_TEMPO_MEDIO: "CONSULTA_TEMPO_MEDIO",
    DESCONHECIDA: "DESCONHECIDA"
};

function normalizarPergunta(pergunta = "") {
    return pergunta
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function contemAlgum(texto, termos = []) {
    return termos.some(termo =>
        texto.includes(termo)
    );
}

function interpretarPergunta(pergunta) {

    const texto = normalizarPergunta(pergunta);

    // =====================================================
    // 1. SERVIÇOS ESPECÍFICOS
    // Deve vir antes de "como está"
    // =====================================================

    const gruposServicos = [
        {
            termos: ["coleta", "lixo"],
            servico: "coleta"
        },
        {
            termos: ["iluminacao", "poste", "lampada"],
            servico: "iluminacao"
        },
        {
            termos: ["poda", "arvore"],
            servico: "poda"
        },
        {
            termos: ["tapa-buraco", "buraco"],
            servico: "buraco"
        },
        {
            termos: ["escola", "educacao"],
            servico: "escola"
        },
        {
            termos: ["saude", "posto de saude"],
            servico: "saude"
        },
        {
            termos: ["transporte", "onibus"],
            servico: "transporte"
        }
    ];

    const grupoServico = gruposServicos.find(
        grupo => contemAlgum(texto, grupo.termos)
    );

    if (grupoServico) {
        return {
            intencao: INTENCOES.CONSULTA_SERVICO,
            servico: grupoServico.servico
        };
    }

    // =====================================================
    // 2. PRIORIDADES / PRINCIPAL PROBLEMA
    // =====================================================

    if (
        contemAlgum(texto, [
            "principal problema",
            "maior problema",
            "problema",
            "prioridade",
            "prioritario",
            "merece atencao",
            "precisa de atencao",
            "principal atencao",
            "gargalo",
            "maior demanda"
        ])
    ) {
        return {
            intencao: INTENCOES.CONSULTA_PRIORIDADE
        };
    }

    // =====================================================
    // 3. ALERTAS / RISCOS
    // =====================================================

    if (
        contemAlgum(texto, [
            "alerta",
            "alertas",
            "risco",
            "riscos",
            "critico",
            "critica",
            "urgente",
            "preocupante"
        ])
    ) {
        return {
            intencao: INTENCOES.CONSULTA_ALERTAS
        };
    }

    // =====================================================
    // 4. EVOLUÇÃO / COMPARAÇÃO
    // =====================================================

    if (
        contemAlgum(texto, [
            "melhorou",
            "melhorando",
            "melhora",
            "piorou",
            "piorando",
            "evolucao",
            "evoluiu",
            "comparacao",
            "comparar",
            "periodo anterior",
            "em relacao ao periodo anterior"
        ])
    ) {
        return {
            intencao: INTENCOES.CONSULTA_EVOLUCAO
        };
    }

    // =====================================================
    // 5. RECOMENDAÇÕES / O QUE FAZER
    // =====================================================

    if (
        contemAlgum(texto, [
            "recomendacao",
            "recomendacoes",
            "recomenda",
            "recomendar",
            "sugestao",
            "sugere",
            "o que fazer",
            "o que devemos fazer",
            "como devemos agir",
            "que acao",
            "qual acao"
        ])
    ) {
        return {
            intencao: INTENCOES.CONSULTA_RECOMENDACOES
        };
    }

    // =====================================================
    // 6. TEMPO MÉDIO
    // =====================================================

    if (
        contemAlgum(texto, [
            "tempo medio",
            "tempo de atendimento",
            "quanto tempo",
            "demora",
            "demorando",
            "prazo medio"
        ])
    ) {
        return {
            intencao: INTENCOES.CONSULTA_TEMPO_MEDIO
        };
    }

    // =====================================================
    // 7. SITUAÇÃO GERAL
    // Deve vir DEPOIS das intenções específicas
    // =====================================================

    if (
        contemAlgum(texto, [
            "situacao geral",
            "situacao do municipio",
            "situacao da cidade",
            "como esta o municipio",
            "como esta a cidade",
            "cenario geral",
            "panorama",
            "diagnostico",
            "resumo geral"
        ])
    ) {
        return {
            intencao: INTENCOES.CONSULTA_GERAL
        };
    }

    // =====================================================
    // INTENÇÃO NÃO IDENTIFICADA
    // =====================================================

    return {
        intencao: INTENCOES.DESCONHECIDA
    };
}

module.exports = {
    interpretarPergunta,
    INTENCOES
};