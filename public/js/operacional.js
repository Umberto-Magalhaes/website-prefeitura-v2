document.addEventListener("DOMContentLoaded", () => {
    carregarResumoOperacional();
    carregarDemandas();
    carregarEquipes();
    carregarDesempenhoEquipes();
    carregarDemandasAtuaisEquipes();

        const btnFecharFicha =
        document.getElementById("btnFecharFicha");

    const fichaDemanda =
        document.getElementById("fichaDemanda");

    if (btnFecharFicha && fichaDemanda) {
        btnFecharFicha.addEventListener("click", () => {
            fichaDemanda.style.display = "none";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
});




// ========================================
// RESUMO OPERACIONAL
// ========================================

async function carregarResumoOperacional() {
    try {
        const resposta = await fetch("/operacional/api/resumo");

        if (!resposta.ok) {
            throw new Error(
                `Erro ao carregar resumo operacional: ${resposta.status}`
            );
        }

        const dados = await resposta.json();

        document.getElementById("novas").textContent =
            Number(dados.novas || 0);

        document.getElementById("analise").textContent =
            Number(dados.em_analise || 0);

        document.getElementById("execucao").textContent =
            Number(dados.em_execucao || 0);

        document.getElementById("concluidas").textContent =
            Number(dados.concluidas || 0);

        console.log(
            "Resumo operacional carregado:",
            dados
        );

    } catch (erro) {
        console.error(
            "Erro ao carregar Centro Operacional:",
            erro
        );
    }
}


// ========================================
// DEMANDAS OPERACIONAIS
// ========================================

async function carregarDemandas() {
    try {
        const resposta = await fetch("/operacional/api/demandas");

        if (!resposta.ok) {
            throw new Error(
                `Erro ao carregar demandas: ${resposta.status}`
            );
        }

        const demandas = await resposta.json();

        const tabela =
            document.getElementById("tabelaDemandas");

        tabela.innerHTML = "";

        if (demandas.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="5">
                        Nenhuma demanda encontrada.
                    </td>
                </tr>
            `;
            return;
        }

        demandas.forEach(demanda => {
            tabela.innerHTML += `
                <tr>
                    <td>${demanda.numero_protocolo}</td>
                    <td>${demanda.servico || "Não informado"}</td>
                    <td>${demanda.status_atual}</td>
                    <td>${new Date(demanda.data_abertura).toLocaleDateString("pt-BR")}</td>
                    <td>
                    <button onclick="visualizarDemanda('${demanda.numero_protocolo}')">
                    Visualizar
                 </button>
                    </td>
                </tr>
            `;
        });

        console.log(
            "Demandas operacionais carregadas:",
            demandas
        );

    } catch (erro) {
        console.error(
            "Erro ao carregar demandas operacionais:",
            erro
        );
    }
}


async function visualizarDemanda(numeroProtocolo) {
    try {
        const resposta = await fetch(
            `/operacional/api/demandas/${encodeURIComponent(numeroProtocolo)}`
        );

        if (!resposta.ok) {
            throw new Error(
                `Erro ao consultar demanda: ${resposta.status}`
            );
        }

        const demanda = await resposta.json();

        console.log(
            "Detalhes da demanda:",
            demanda
        );

        document.getElementById("fichaProtocolo").textContent =
            demanda.numero_protocolo || "Não informado";

        document.getElementById("fichaServico").textContent =
            demanda.servico || "Não informado";

        document.getElementById("fichaStatus").textContent =
            demanda.status_atual || "Não informado";

            document.getElementById("fichaEquipe").textContent =
    demanda.equipe_nome || "Não atribuída";

        document.getElementById("fichaDataAbertura").textContent =
            demanda.data_abertura
                ? new Date(demanda.data_abertura).toLocaleString("pt-BR")
                : "Não informada";

        document.getElementById("fichaDataEncerramento").textContent =
    demanda.data_encerramento
        ? new Date(demanda.data_encerramento).toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo"
        })
        : "Não encerrada";

        document.getElementById("fichaCidadao").textContent =
            demanda.nome_cidadao || "Não informado";

        document.getElementById("fichaTelefone").textContent =
            demanda.telefone || "Não informado";

        document.getElementById("fichaEmail").textContent =
            demanda.email || "Não informado";

        document.getElementById("fichaEndereco").textContent =
            demanda.endereco || "Não informado";

        document.getElementById("fichaPontoReferencia").textContent =
            demanda.ponto_referencia || "Não informado";

        document.getElementById("fichaDescricao").textContent =
            demanda.descricao || "Não informada";

            await carregarHistoricoEquipes(numeroProtocolo);

            await carregarHistoricoStatus(numeroProtocolo);

        const ficha = document.getElementById("fichaDemanda");

        ficha.style.display = "block";

        ficha.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (erro) {
        console.error(
            "Erro ao visualizar demanda:",
            erro
        );

        alert(
            "Não foi possível carregar os detalhes da demanda."
        );
    }
}

async function carregarHistoricoEquipes(numeroProtocolo) {
    const tabela = document.getElementById("tabelaHistoricoEquipes");

    try {
        tabela.innerHTML = `
            <tr>
                <td colspan="6">Carregando histórico...</td>
            </tr>
        `;

        const resposta = await fetch(
            `/operacional/api/demandas/${encodeURIComponent(numeroProtocolo)}/historico-equipes`
        );

        if (!resposta.ok) {
            throw new Error(
                `Erro ao consultar histórico de equipes: ${resposta.status}`
            );
        }

        const historico = await resposta.json();

        if (!historico.length) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="6">Nenhum histórico de equipes registrado.</td>
                </tr>
            `;
            return;
        }

        tabela.innerHTML = "";

        historico.forEach(registro => {
            const linha = document.createElement("tr");

            const dataInicio = registro.data_atribuicao
                ? new Date(registro.data_atribuicao).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo"
                })
                : "Não informado";

            const dataFim = registro.data_fim
                ? new Date(registro.data_fim).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo"
                })
                : "ATUAL";

                const inicio = new Date(registro.data_atribuicao);
const fim = registro.data_fim
    ? new Date(registro.data_fim)
    : new Date();

const diferencaMs = fim - inicio;
const totalMinutos = Math.max(0, Math.floor(diferencaMs / 60000));

const dias = Math.floor(totalMinutos / 1440);
const horas = Math.floor((totalMinutos % 1440) / 60);
const minutos = totalMinutos % 60;

let permanencia = "";

if (dias > 0) {
    permanencia = `${dias}d ${horas}h ${minutos}min`;
} else if (horas > 0) {
    permanencia = `${horas}h ${minutos}min`;
} else {
    permanencia = `${minutos}min`;
}

if (!registro.data_fim) {
    permanencia += " — em andamento";
}

            linha.innerHTML = `
                <td>${registro.equipe || "Não informado"}</td>
                <td>${registro.secretaria || "Não informada"}</td>
                <td>${dataInicio}</td>
                <td>${dataFim}</td>
                <td>${permanencia}</td>
                <td>${registro.observacao || "—"}</td>
            `;

            tabela.appendChild(linha);
        });

    } catch (erro) {
        console.error(
            "Erro ao carregar histórico de equipes:",
            erro
        );

        tabela.innerHTML = `
            <tr>
                <td colspan="6">Não foi possível carregar o histórico.</td>
            </tr>
        `;
    }
}

async function carregarHistoricoStatus(numeroProtocolo) {
    const tabela = document.getElementById("tabelaHistoricoStatus");

    try {
        tabela.innerHTML = `
            <tr>
                <td colspan="3">Carregando histórico...</td>
            </tr>
        `;

        const resposta = await fetch(
            `/api/protocolos/${encodeURIComponent(numeroProtocolo)}/historico-status`
        );

        if (!resposta.ok) {
            throw new Error(
                `Erro ao consultar histórico de status: ${resposta.status}`
            );
        }

        const historico = await resposta.json();

        if (!historico.length) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="3">Nenhum histórico de andamento registrado.</td>
                </tr>
            `;
            return;
        }

        tabela.innerHTML = "";

        historico.forEach((registro) => {
            const linha = document.createElement("tr");

            const dataHora = registro.data_registro
                ? new Date(registro.data_registro).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo"
                })
                : "Não informado";

            linha.innerHTML = `
                <td>${registro.status || "Não informado"}</td>
                <td>${dataHora}</td>
                <td>${registro.observacao || "—"}</td>
            `;

            tabela.appendChild(linha);
        });

    } catch (erro) {
        console.error(
            "Erro ao carregar histórico de status:",
            erro
        );

        tabela.innerHTML = `
            <tr>
                <td colspan="3">Não foi possível carregar o histórico.</td>
            </tr>
        `;
    }
}

// ========================================
// ATUALIZAÇÃO DO STATUS DA DEMANDA
// ========================================

document.getElementById("btnAtualizarStatus")
    .addEventListener("click", atualizarStatusDemanda);

async function atualizarStatusDemanda() {
    try {
        const protocolo =
            document.getElementById("fichaProtocolo").textContent.trim();

        const novoStatus =
            document.getElementById("novoStatus").value;

        if (!protocolo || protocolo === "—") {
            alert("Nenhuma demanda selecionada.");
            return;
        }

        if (!novoStatus) {
            alert("Selecione o novo status da demanda.");
            return;
        }

        const resposta = await fetch(
            `/api/protocolos/${encodeURIComponent(protocolo)}/status`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status_atual: novoStatus
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.message || "Erro ao atualizar status."
            );
        }

        alert("Status atualizado com sucesso.");

        document.getElementById("fichaStatus").textContent =
            dados.protocolo.status_atual;

        document.getElementById("novoStatus").value = "";

        await carregarResumoOperacional();
        await carregarDemandas();

    } catch (erro) {
        console.error(
            "Erro ao atualizar status da demanda:",
            erro
        );

        alert(
            "Não foi possível atualizar o status da demanda."
        );
    }
}

// ========================================
// CARREGAR EQUIPES
// ========================================

async function carregarEquipes() {
    try {
        const resposta = await fetch("/operacional/api/equipes");

        if (!resposta.ok) {
            throw new Error(
                `Erro ao carregar equipes: ${resposta.status}`
            );
        }

        const equipes = await resposta.json();

        const selectEquipe =
            document.getElementById("novaEquipe");

        selectEquipe.innerHTML =
            '<option value="">Selecionar equipe...</option>';

        equipes.forEach(equipe => {
            const option = document.createElement("option");

            option.value = equipe.id;
            option.textContent = equipe.nome;

            selectEquipe.appendChild(option);
        });

        console.log(
            "Equipes carregadas:",
            equipes
        );

    } catch (erro) {
        console.error(
            "Erro ao carregar equipes:",
            erro
        );
    }
}

// ======================================
// ATRIBUIR EQUIPE À DEMANDA
// ======================================

document
    .getElementById("btnAtribuirEquipe")
    .addEventListener("click", atribuirEquipeDemanda);

async function atribuirEquipeDemanda() {
    try {
        const protocolo =
            document.getElementById("fichaProtocolo").textContent.trim();

        const equipeId =
            document.getElementById("novaEquipe").value;

            const observacao =
    document.getElementById("observacaoAtribuicao").value.trim();

        if (!protocolo || protocolo === "Não informado") {
            alert("Nenhuma demanda selecionada.");
            return;
        }

        if (!equipeId) {
            alert("Selecione uma equipe.");
            return;
        }

        const resposta = await fetch(
            `/operacional/api/demandas/${encodeURIComponent(protocolo)}/atribuir-equipe`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },

               body: JSON.stringify({
    equipe_id: Number(equipeId),
    observacao: observacao
})
            }
        );

        const dados = await resposta.json();

       if (!resposta.ok) {
    alert(
        dados.erro || "Erro ao atribuir equipe."
    );
    return;
}

        alert("Equipe atribuída com sucesso.");

        await visualizarDemanda(protocolo);
        await carregarDemandas();

        document.getElementById("novaEquipe").value = "";

    } catch (erro) {
        console.error(
            "Erro ao atribuir equipe à demanda:",
            erro
        );

        alert(
            "Não foi possível atribuir a equipe à demanda."
        );
    }
}


// ============================================
// DESEMPENHO OPERACIONAL DAS EQUIPES
// ============================================

async function carregarDesempenhoEquipes() {

    const tabela = document.getElementById("tabelaDesempenhoEquipes");

    if (!tabela) {
        return;
    }

    try {

        const resposta = await fetch(
            "/operacional/api/equipes/desempenho"
        );

        if (!resposta.ok) {
            throw new Error(
                `Erro ao carregar desempenho das equipes: ${resposta.status}`
            );
        }

        const equipes = await resposta.json();

        tabela.innerHTML = "";

        if (!Array.isArray(equipes) || equipes.length === 0) {

            tabela.innerHTML = `
                <tr>
                    <td colspan="5">
                        Nenhum dado de desempenho disponível.
                    </td>
                </tr>
            `;

            return;
        }

        equipes.forEach((equipe) => {

            const linha = document.createElement("tr");

            const tempoMedio =
                equipe.tempo_medio_permanencia_horas !== null &&
                equipe.tempo_medio_permanencia_horas !== undefined
                    ? `${Number(equipe.tempo_medio_permanencia_horas).toFixed(2)} h`
                    : "—";

            linha.innerHTML = `
                <td>${equipe.equipe || "—"}</td>
                <td>${equipe.total_atribuicoes ?? 0}</td>
                <td>${equipe.demandas_distintas ?? 0}</td>
                <td>${equipe.demandas_em_andamento ?? 0}</td>
                <td>${equipe.atribuicoes_encerradas ?? 0}</td>
                <td>${tempoMedio}</td>
            `;

            tabela.appendChild(linha);
        });

    } catch (erro) {

        console.error(
            "Erro ao carregar desempenho das equipes:",
            erro
        );

        tabela.innerHTML = `
            <tr>
                <td colspan="6">
                    Não foi possível carregar o desempenho das equipes.
                </td>
            </tr>
        `;
    }
}

// ============================================
// DEMANDAS ATUAIS POR EQUIPE
// ============================================

async function carregarDemandasAtuaisEquipes() {

    const tabela = document.getElementById("tabelaDemandasAtuaisEquipes");

    if (!tabela) {
        return;
    }

    try {

        tabela.innerHTML = `
            <tr>
                <td colspan="8">
                    Carregando demandas atuais...
                </td>
            </tr>
        `;

        const resposta = await fetch(
            "/operacional/api/equipes/demandas-atuais"
        );

        if (!resposta.ok) {
            throw new Error(
                `Erro ao carregar demandas atuais: ${resposta.status}`
            );
        }

        const demandas = await resposta.json();

        if (!Array.isArray(demandas) || demandas.length === 0) {

            tabela.innerHTML = `
                <tr>
                    <td colspan="8">
                        Nenhuma demanda atualmente atribuída às equipes.
                    </td>
                </tr>
            `;

            document.getElementById("demandasComEquipes").textContent = "0";
document.getElementById("situacaoNormal").textContent = "0";
document.getElementById("situacaoAtencao").textContent = "0";
document.getElementById("situacaoCritica").textContent = "0";
document.getElementById("tempoMedioEquipes").textContent = "0 h";
            
            return;
        }

        // ==============================================
// INDICADORES OPERACIONAIS DAS EQUIPES
// ==============================================

let totalNormal = 0;
let totalAtencao = 0;
let totalCritica = 0;
let somaHoras = 0;

demandas.forEach((demanda) => {

    const horas =
        demanda.data_atribuicao
            ? Math.max(
                0,
                (new Date() - new Date(demanda.data_atribuicao)) / 3600000
            )
            : 0;

    somaHoras += horas;

    if (horas > 48) {
        totalCritica++;
    } else if (horas > 24) {
        totalAtencao++;
    } else {
        totalNormal++;
    }
});

const tempoMedio =
    demandas.length > 0
        ? somaHoras / demandas.length
        : 0;

document.getElementById("demandasComEquipes").textContent =
    demandas.length;

document.getElementById("situacaoNormal").textContent =
    totalNormal;

document.getElementById("situacaoAtencao").textContent =
    totalAtencao;

document.getElementById("situacaoCritica").textContent =
    totalCritica;

document.getElementById("tempoMedioEquipes").textContent =
    `${tempoMedio.toFixed(1)} h`;

    const cardNormal =
    document.getElementById("situacaoNormal").closest(".card-equipe");

const cardAtencao =
    document.getElementById("situacaoAtencao").closest(".card-equipe");

const cardCritica =
    document.getElementById("situacaoCritica").closest(".card-equipe");

cardNormal.classList.toggle("card-normal", totalNormal > 0);
cardAtencao.classList.toggle("card-atencao", totalAtencao > 0);
cardCritica.classList.toggle("card-critica", totalCritica > 0);
        

        tabela.innerHTML = "";

        demandas.forEach((demanda) => {

            const linha = document.createElement("tr");

            const dataAtribuicao = demanda.data_atribuicao
                ? new Date(demanda.data_atribuicao).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo"
                })
                : "Não informada";

                const tempoComEquipe = demanda.data_atribuicao
    ? (() => {
        const inicio = new Date(demanda.data_atribuicao);
        const agora = new Date();

        const diferencaMs = agora - inicio;
        const totalMinutos = Math.max(0, Math.floor(diferencaMs / 60000));

        const dias = Math.floor(totalMinutos / 1440);
        const horas = Math.floor((totalMinutos % 1440) / 60);
        const minutos = totalMinutos % 60;

        if (dias > 0) {
            return `${dias}d ${horas}h ${minutos}min`;
        }

        return `${horas}h ${minutos}min`;
      })()
    : "-";

    const horasComEquipe = demanda.data_atribuicao
    ? Math.max(
        0,
        (new Date() - new Date(demanda.data_atribuicao)) / 3600000
      )
    : 0;

let situacaoPermanencia = "Normal";

if (horasComEquipe > 48) {
    situacaoPermanencia = "Crítica";
} else if (horasComEquipe > 24) {
    situacaoPermanencia = "Atenção";
}

const classeSituacao =
    situacaoPermanencia === "Normal"
        ? "normal"
        : situacaoPermanencia === "Atenção"
        ? "atencao"
        : "critica";

            linha.innerHTML = `
    <td>${demanda.equipe || "-"}</td>
    <td>${demanda.numero_protocolo || "-"}</td>
    <td>${demanda.status_atual || "-"}</td>
    <td>${dataAtribuicao}</td>
    <td>${tempoComEquipe}</td>
    <td>
    <span class="situacao-badge situacao-${classeSituacao}">
        ${situacaoPermanencia}
    </span>
</td>
    <td>${demanda.observacao || "-"}</td>
    
    <td>
        <button onclick="visualizarDemanda('${demanda.numero_protocolo}')">
            Visualizar
        </button>
    </td>
`;

            tabela.appendChild(linha);
        });

    } catch (erro) {

        console.error(
            "Erro ao carregar demandas atuais por equipe:",
            erro
        );

        tabela.innerHTML = `
            <tr>
                <td colspan="8">
                    Não foi possível carregar as demandas atuais.
                </td>
            </tr>
        `;
    }
}