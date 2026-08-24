document.addEventListener('DOMContentLoaded', () => {

   const evolucaoTempoPercentual =
    document.getElementById('evolucaoTempoPercentual');

   const evolucaoTempoAnterior =
    document.getElementById('evolucaoTempoAnterior');

   const evolucaoTempoAtual =
    document.getElementById('evolucaoTempoAtual');

   const evolucaoTempoBarra =
    document.getElementById('evolucaoTempoBarra');

    const evolucaoConfiabilidade =
    document.getElementById('evolucaoConfiabilidade');

const evolucaoConfiabilidadeDescricao =
    document.getElementById('evolucaoConfiabilidadeDescricao');
   
    const listaPrioridades =
    document.getElementById('listaPrioridades');

    const listaAlertas =
    document.getElementById('listaAlertas');

    const listaRecomendacoes =
    document.getElementById('listaRecomendacoes');

    const saudacaoGestor =
        document.getElementById('saudacaoGestor');

    const ultimaAtualizacao =
        document.getElementById('ultimaAtualizacao');

    const btnAtualizar =
        document.getElementById('btnAtualizar');

    const formPergunta =
        document.getElementById('formPergunta');

    const inputPergunta =
        document.getElementById('inputPergunta');

    const respostaOuvia =
        document.getElementById('respostaOuvia');

        const protocolosHojeValor =
    document.getElementById('protocolosHojeValor');

    const emExecucaoValor =
    document.getElementById('emExecucaoValor');

const concluidosHojeValor =
    document.getElementById('concluidosHojeValor');

const atencaoImediataValor =
    document.getElementById('atencaoImediataValor');

    const briefingResumo =
    document.getElementById('briefingResumo');

    const principalRecomendacaoDia =
    document.getElementById("principalRecomendacaoDia");

    const diagnosticoExecutivoPerfil =
    document.getElementById("diagnosticoExecutivoPerfil");

const diagnosticoExecutivoTitulo =
    document.getElementById("diagnosticoExecutivoTitulo");

const diagnosticoExecutivoTexto =
    document.getElementById("diagnosticoExecutivoTexto");

const diagnosticoExecutivoRecomendacao =
    document.getElementById("diagnosticoExecutivoRecomendacao");

    const briefingStatus =
    document.getElementById("briefingStatus");

const statusIndicator =
    document.getElementById("statusIndicator");

const statusTitulo =
    document.getElementById("statusTitulo");

const statusDescricao =
    document.getElementById("statusDescricao");

    let resultadoCognitivoAtual = null;

    function definirSaudacao() {

        const horaAtual =
            new Date().getHours();

        let saudacao =
            'Boa noite';

        if (horaAtual >= 5 && horaAtual < 12) {
            saudacao = 'Bom dia';
        }

        if (horaAtual >= 12 && horaAtual < 18) {
            saudacao = 'Boa tarde';
        }

        saudacaoGestor.textContent =
            `${saudacao}, Prefeito.`;
    }

    function atualizarHorario() {

        const agora =
            new Date();

        ultimaAtualizacao.textContent =
            agora.toLocaleString(
                'pt-BR',
                {
                    dateStyle: 'short',
                    timeStyle: 'short'
                }
            );
    }

    async function carregarResumoDashboard() {

    try {

        const resposta =
            await fetch('/central/api/resumo');

        if (!resposta.ok) {
            throw new Error(
                `Falha na API: ${resposta.status}`
            );
        }

        const dados =
            await resposta.json();

            resultadoCognitivoAtual = dados;

            const evolucao =
    dados.resultadoCognitivo?.evolucao ||
    dados.evolucao ||
    null;

    if (evolucaoConfiabilidade && evolucaoConfiabilidadeDescricao) {
    const confiabilidade =
        evolucao?.confiabilidadeComparacao || 'BAIXA';

    evolucaoConfiabilidade.textContent = confiabilidade;

    if (confiabilidade === 'ALTA') {
        evolucaoConfiabilidadeDescricao.textContent =
            'Comparação baseada em quantidade consistente de dados históricos.';
    } else if (confiabilidade === 'MODERADA') {
        evolucaoConfiabilidadeDescricao.textContent =
            'Comparação baseada em quantidade moderada de dados históricos.';
    } else {
        evolucaoConfiabilidadeDescricao.textContent =
            'Comparação baseada em quantidade limitada de dados históricos. Interprete a tendência com cautela.';
    }
}

if (evolucao) {
    const anterior = evolucao.tempoMedioAnterior;
    const atual = evolucao.tempoMedioAtual;

    const temAnterior =
        anterior !== null &&
        anterior !== undefined;

    const temAtual =
        atual !== null &&
        atual !== undefined;

    if (temAtual) {
        evolucaoTempoAtual.textContent =
            `Atual: ${atual.toFixed(1)} dias`;
    } else {
        evolucaoTempoAtual.textContent =
            'Atual: Sem dados';
    }

    if (temAnterior) {
        evolucaoTempoAnterior.textContent =
            `Antes: ${anterior.toFixed(1)} dias`;
    } else {
        evolucaoTempoAnterior.textContent =
            'Antes: Sem dados';
    }

    if (temAnterior && temAtual) {
       evolucaoTempoBarra.classList.remove(
    'evolution-progress-neutral',
    'evolution-progress-positive',
    'evolution-progress-negative'
);
        const percentual =
            anterior > 0
                ? Math.round(
                    ((anterior - atual) / anterior) * 100
                )
                : 0;

       evolucaoTempoPercentual.classList.remove(
    'positive',
    'negative'
);

if (percentual > 0) {
    evolucaoTempoPercentual.classList.add('positive');
    evolucaoTempoBarra.classList.add('evolution-progress-positive');

    evolucaoTempoPercentual.textContent =
        `↓ ${Math.abs(percentual)}%`;

} else if (percentual < 0) {
    evolucaoTempoPercentual.classList.add('negative');
    evolucaoTempoBarra.classList.add('evolution-progress-negative');

    evolucaoTempoPercentual.textContent =
        `↑ ${Math.abs(percentual)}%`;

} else {
    evolucaoTempoBarra.classList.add('evolution-progress-neutral');
    evolucaoTempoPercentual.textContent = 'Estável';
}

        const largura =
            Math.min(
                100,
                Math.max(
                    0,
                    atual > 0
                        ? Math.round((anterior / atual) * 60)
                        : 0
                )
            );

        evolucaoTempoBarra.style.width =
            `${largura}%`;
    } else {
    evolucaoTempoPercentual.textContent = 'Sem comparação';

    evolucaoTempoBarra.style.width =
        temAtual ? '60%' : '0%';

    evolucaoTempoBarra.classList.add(
        'evolution-progress-neutral'
    );
}
}

        resultadoCognitivoAtual =
    dados.resultadoCognitivo || null;

console.log(
    'RESULTADO COGNITIVO CENTRALIZADO:',
    resultadoCognitivoAtual
);

           console.log("OBJETO COMPLETO:");
console.dir(dados);

console.log("CHAVES:");
console.log(Object.keys(dados));

console.log("Resposta Executiva:");
console.log(dados.respostaExecutiva);

         console.dir(dados.diagnostico);

        protocolosHojeValor.textContent =
            dados.protocolosHoje ?? 0;

            emExecucaoValor.textContent =
    dados.emExecucao ?? 0;

concluidosHojeValor.textContent =
    dados.concluidosHoje ?? 0;

atencaoImediataValor.textContent =
    dados.atencaoImediata ?? 0;

    
// AQUI COMEÇA O NOVO BLOCO

const narrativa =
    dados.respostaExecutiva?.narrativa ||
    dados.narrativa ||
    {};

const tituloNarrativa =
    narrativa.titulo || "Análise Executiva";

const textoNarrativa =
    narrativa.texto ||
    dados.diagnostico?.situacaoGeral ||
    "Sem análise disponível.";

const recomendacaoPrincipal =
    Array.isArray(dados.recomendacoes) &&
    dados.recomendacoes.length > 0
        ? dados.recomendacoes[0]
        : null;

        if (principalRecomendacaoDia) {
    principalRecomendacaoDia.textContent =
        recomendacaoPrincipal?.descricao ||
        dados.diagnostico?.recomendacao ||
        "Nenhuma recomendação prioritária foi identificada no momento.";
}

briefingResumo.innerHTML = `

<strong>${tituloNarrativa}</strong><br><br>

${textoNarrativa}<br><br>

<strong>Principal atenção:</strong><br>

${
  dados.respostaExecutiva?.narrativa?.principalAtencao ||
  "Nenhum ponto específico de atenção foi identificado."
}<br><br>

<strong>Recomendação estratégica:</strong><br>
${
    narrativa.recomendacao
        ? narrativa.recomendacao
        : recomendacaoPrincipal
            ? `<strong>${recomendacaoPrincipal.titulo}</strong><br>
               ${recomendacaoPrincipal.descricao}<br>
               <small>Prioridade: ${recomendacaoPrincipal.prioridade}</small>`
            : dados.diagnostico?.recomendacao ||
              "Nenhuma recomendação estratégica foi gerada."
}
  `;

  const perfilAtual =
    narrativa.perfil ||
    dados.respostaExecutiva?.perfil ||
    "EM ANÁLISE";

    if (diagnosticoExecutivoPerfil) {
    diagnosticoExecutivoPerfil.textContent = perfilAtual;
}

if (briefingStatus) {
    briefingStatus.dataset.perfil = perfilAtual;
}

if (statusTitulo) {
    const titulosStatus = {
        ESTAVEL: "Situação geral estável",
        ATENCAO: "Cenário que merece acompanhamento",
        PRESSAO: "Pressão operacional identificada",
        EVOLUCAO: "Evolução positiva da operação"
    };

    statusTitulo.textContent =
        titulosStatus[perfilAtual] || "Análise operacional em andamento";
}

if (statusDescricao) {
    const descricoesStatus = {
        ESTAVEL: "A OUVIA já analisou os dados de hoje.",
        ATENCAO: "Há pontos que merecem acompanhamento preventivo.",
        PRESSAO: "Foram identificados indicadores que exigem atenção gerencial.",
        EVOLUCAO: "Os indicadores demonstram melhora no desempenho municipal."
    };

    statusDescricao.textContent =
        descricoesStatus[perfilAtual] ||
        "O Núcleo Cognitivo está consolidando os indicadores.";
}

if (diagnosticoExecutivoTitulo) {
    diagnosticoExecutivoTitulo.textContent =
        tituloNarrativa;
}

if (diagnosticoExecutivoTexto) {
    diagnosticoExecutivoTexto.textContent =
        textoNarrativa;
}

if (diagnosticoExecutivoRecomendacao) {
    diagnosticoExecutivoRecomendacao.textContent =
        narrativa.recomendacao ||
        recomendacaoPrincipal?.descricao ||
        dados.diagnostico?.recomendacao ||
        "Manter o acompanhamento contínuo dos indicadores operacionais.";
}

// AQUI TERMINA O NOVO BLOCO

atualizarHorario();

console.log(
    'Resumo real da Central carregado:',
    dados
);

    
    } catch (erro) {

        console.error(
            'Erro ao carregar resumo da Central:',
            erro
        );

        protocolosHojeValor.textContent =
            '—';

            emExecucaoValor.textContent =
    '—';

concluidosHojeValor.textContent =
    '—';

atencaoImediataValor.textContent =
    '—';

    }

}

async function carregarPrioridades() {
    try {
        const resposta =
            await fetch('/central/api/resumo');

        if (!resposta.ok) {
            throw new Error(
                'Erro ao carregar prioridades.'
            );
        }

        const dados =
            await resposta.json();

        if (!listaPrioridades) {
            throw new Error(
                'Elemento listaPrioridades não encontrado.'
            );
        }

        /*
         * A Central recebe agora as prioridades
         * diretamente do resultado consolidado
         * pelo Núcleo Cognitivo da OUVIA.
         */
        const rankingCompleto =
            dados.resultadoCognitivo
                ?.priorizacao
                ?.rankingCompleto
            ||
            dados.resultadoCognitivo
                ?.prioridades
            ||
            dados.priorizacao
                ?.rankingCompleto
            ||
            dados.prioridades
            ||
            [];

        if (
            !Array.isArray(rankingCompleto) ||
            rankingCompleto.length === 0
        ) {
            listaPrioridades.innerHTML = `
                <div class="priority-item">
                    <div class="priority-content">
                        <strong>
                            Sem dados para análise
                        </strong>

                        <p>
                            Ainda não existem protocolos suficientes
                            para gerar o ranking operacional.
                        </p>
                    </div>
                </div>
            `;

            return;
        }

        const maiorQuantidade =
            Math.max(
                ...rankingCompleto.map(
                    item =>
                        Number(item.quantidade) || 0
                )
            );

        listaPrioridades.innerHTML =
            rankingCompleto
                .slice(0, 3)
                .map((item, indice) => {
                    const quantidade =
                        Number(item.quantidade) || 0;

                    const percentual =
                        maiorQuantidade > 0
                            ? Math.round(
                                (
                                    quantidade /
                                    maiorQuantidade
                                ) * 100
                            )
                            : 0;

                    const servico =
                        item.servico ||
                        item.nome ||
                        'Serviço não identificado';

                    return `
                        <div class="priority-item">

                            <div class="priority-position">
                                ${indice + 1}
                            </div>

                            <div class="priority-content">

                                <div class="priority-title-row">

                                    <strong>
                                        ${servico}
                                    </strong>

                                    <span class="priority-score">
                                        ${quantidade}
                                        protocolo${quantidade === 1 ? '' : 's'}
                                    </span>

                                </div>

                                <p>
                                    Concentração identificada pelo
                                    Núcleo Cognitivo da OUVIA.
                                </p>

                                <div class="progress-track">
                                    <div
                                        class="progress-bar"
                                        style="width: ${percentual}%;"
                                    ></div>
                                </div>

                            </div>

                        </div>
                    `;
                })
                .join('');

        console.log(
            'Prioridades consolidadas pelo Núcleo Cognitivo:',
            rankingCompleto
        );

    } catch (erro) {
        console.error(
            'Erro ao carregar prioridades:',
            erro
        );

        if (listaPrioridades) {
            listaPrioridades.innerHTML = `
                <div class="priority-item">
                    <div class="priority-content">
                        <strong>
                            Não foi possível carregar as prioridades
                        </strong>

                        <p>
                            Verifique a conexão com a Central
                            de Inteligência da OUVIA.
                        </p>
                    </div>
                </div>
            `;
        }
    }
}

async function carregarAlertas() {
    try {
        const resposta =
            await fetch('/central/api/resumo');

        if (!resposta.ok) {
            throw new Error(
                'Erro ao carregar alertas do Núcleo Cognitivo.'
            );
        }

        const dados =
            await resposta.json();

        const alertas =
            dados.resultadoCognitivo?.alertas ||
            dados.respostaExecutiva?.alertas ||
            [];

        if (!listaAlertas) {
            throw new Error(
                'Elemento listaAlertas não encontrado.'
            );
        }

        if (
            !Array.isArray(alertas) ||
            alertas.length === 0
        ) {
            listaAlertas.innerHTML = `
                <div class="alert-item info-alert">
                    <span class="alert-marker"></span>

                    <div>
                        <strong>
                            Nenhum alerta relevante
                        </strong>

                        <p>
                            O Núcleo Cognitivo da OUVIA não
                            identificou situações críticas
                            para exibição neste momento.
                        </p>

                        <small>
                            SITUAÇÃO NORMAL
                        </small>
                    </div>
                </div>
            `;

            console.log(
                'Alertas consolidados pelo Núcleo Cognitivo:',
                []
            );

            return;
        }

        const classesPorNivel = {
            critico: 'critical-alert',
            crítico: 'critical-alert',
            atencao: 'warning-alert',
            atenção: 'warning-alert',
            informativo: 'info-alert',
            normal: 'info-alert'
        };

        const rotulosPorNivel = {
            critico: 'NÍVEL CRÍTICO',
            crítico: 'NÍVEL CRÍTICO',
            atencao: 'NÍVEL DE ATENÇÃO',
            atenção: 'NÍVEL DE ATENÇÃO',
            informativo: 'NÍVEL INFORMATIVO',
            normal: 'SITUAÇÃO NORMAL'
        };

        listaAlertas.innerHTML =
            alertas
                .map(alerta => {
                    const nivel =
                        String(
                            alerta.nivel ||
                            'informativo'
                        )
                            .toLowerCase()
                            .trim();

                    const classe =
                        classesPorNivel[nivel] ||
                        'info-alert';

                    const rotulo =
                        rotulosPorNivel[nivel] ||
                        'NÍVEL INFORMATIVO';

                    return `
                        <div class="alert-item ${classe}">
                            <span class="alert-marker"></span>

                            <div>
                                <strong>
                                    ${
                                        alerta.titulo ||
                                        'Alerta gerencial'
                                    }
                                </strong>

                                <p>
                                    ${
                                        alerta.descricao ||
                                        'Situação identificada pelo Núcleo Cognitivo da OUVIA.'
                                    }
                                </p>

                                <small>
                                    ${rotulo}
                                </small>
                            </div>
                        </div>
                    `;
                })
                .join('');

        console.log(
            'Alertas consolidados pelo Núcleo Cognitivo:',
            alertas
        );

    } catch (erro) {
        console.error(
            'Erro ao carregar alertas:',
            erro
        );

        if (listaAlertas) {
            listaAlertas.innerHTML = `
                <div class="alert-item info-alert">
                    <span class="alert-marker"></span>

                    <div>
                        <strong>
                            Alertas temporariamente indisponíveis
                        </strong>

                        <p>
                            Não foi possível consultar o Núcleo
                            Cognitivo neste momento.
                        </p>

                        <small>
                            TENTE NOVAMENTE
                        </small>
                    </div>
                </div>
            `;
        }
    }
}

async function carregarRecomendacoes() {
    try {
        const resposta =
            await fetch('/central/api/resumo');

        if (!resposta.ok) {
            throw new Error(
                'Erro ao carregar recomendações.'
            );
        }

        const dados =
            await resposta.json();

        const recomendacoes =
            dados.resultadoCognitivo?.recomendacoes ||
            dados.recomendacoes ||
            [];

        if (!listaRecomendacoes) {
            throw new Error(
                'Elemento listaRecomendacoes não encontrado.'
            );
        }

        if (
            !Array.isArray(recomendacoes) ||
            recomendacoes.length === 0
        ) {
            listaRecomendacoes.innerHTML = `
                <div class="recommendation-item">
                    <span class="recommendation-number">
                        01
                    </span>

                    <div>
                        <strong>
                            Nenhuma recomendação disponível
                        </strong>

                        <p>
                            O Núcleo Cognitivo não identificou
                            ações estratégicas adicionais.
                        </p>
                    </div>
                </div>
            `;

            return;
        }

        listaRecomendacoes.innerHTML =
            recomendacoes
                .slice(0, 3)
                .map((recomendacao, indice) => {
                    const numero =
                        String(indice + 1).padStart(2, '0');

                    return `
                        <div class="recommendation-item">
                            <span class="recommendation-number">
                                ${numero}
                            </span>

                            <div>
                                <strong>
                                    ${recomendacao.titulo}
                                </strong>

                                <p>
                                    ${recomendacao.descricao}
                                </p>

                                <span class="recommendation-deadline">
                                    Prioridade:
                                    ${recomendacao.prioridade}
                                </span>
                            </div>
                        </div>
                    `;
                })
                .join('');

        console.log(
            'Recomendações consolidadas pelo Núcleo Cognitivo:',
            recomendacoes
        );

    } catch (erro) {
        console.error(
            'Erro ao carregar recomendações:',
            erro
        );
    }
}

    function atualizarCentral() {

        const textoOriginal =
            btnAtualizar.textContent;

        btnAtualizar.disabled = true;
        btnAtualizar.textContent =
            'Atualizando...';

        setTimeout(() => {

          carregarResumoDashboard();
          carregarPrioridades();
          carregarAlertas();
          carregarRecomendacoes();

            btnAtualizar.disabled = false;
            btnAtualizar.textContent =
                textoOriginal;

        }, 700);
    }

    

   formPergunta.addEventListener("submit", async event => {
    event.preventDefault();

    const pergunta = inputPergunta.value.trim();

    respostaOuvia.hidden = false;

    if (!pergunta) {
        respostaOuvia.textContent =
            "Digite uma pergunta para que a OUVIA possa analisá-la.";
        return;
    }

    respostaOuvia.innerHTML =
        "<strong>Análise da OUVIA:</strong><br>Processando informações...";

    try {
        const respostaApi = await fetch("/central/api/pergunta", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pergunta
            })
        });

        const dados = await respostaApi.json();

        if (!respostaApi.ok) {
            throw new Error(
                dados.erro || "Não foi possível analisar a pergunta."
            );
        }

        respostaOuvia.innerHTML = `
            <strong>Análise da OUVIA:</strong>
            <br>
            ${dados.resposta}
        `;
    } catch (erro) {
        console.error(
            "Erro ao consultar a Inteligência Conversacional:",
            erro
        );

        respostaOuvia.innerHTML = `
            <strong>Análise da OUVIA:</strong>
            <br>
            Não foi possível concluir a análise neste momento.
        `;
    }
});

    btnAtualizar.addEventListener(
        'click',
        atualizarCentral
    );

    definirSaudacao();
    atualizarHorario();
    carregarResumoDashboard();
    carregarPrioridades(); 
    carregarAlertas();
    carregarRecomendacoes();   

    console.log(
        'Central de Inteligência da OUVIA carregada com sucesso.'
    );

});console.log("Central de Inteligência carregada.");