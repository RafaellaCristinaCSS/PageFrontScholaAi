function redirecionarCadastroUsuario() {
    window.location.href = `${BaseUrlFront}Cadastro/index.html?Educador=${localStorage.getItem("idAgente")}`;
}
async function getAnotacoesBlocoNotas() {
    const response = await executarRequisicao(`blocoNotas/${parseInt(localStorage.idAgente)}`, "", "GET");
    if (response && response.anotacao) {
        $("#bloco-anotacoes").val(response.anotacao);
        blocoNotas(100 - response.anotacao.length);
    }
    else blocoNotas();
}
function blocoNotas(limiteBloco = 100) {
    const bloco = document.getElementById('bloco-anotacoes');
    const contadorBloco = document.getElementById('contador-anotacoes');
    let debounceTimeout;
    contadorBloco.textContent = `${limiteBloco} caracteres restantes`;

    bloco.addEventListener('input', () => {
        const restante = limiteBloco - bloco.value.length;
        contadorBloco.textContent = `${restante} caracteres restantes`;

        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            let parametros = {
                idAgente: parseInt(localStorage.idAgente),
                anotacao: bloco.value
            }
            executarRequisicao("blocoNotas", parametros, "POST", false);
        }, 800);
    });
}
async function preencherAlunosVinculados() {
    try {
        const alunos = await getAlunos();
        preencherDependentesVinculados(alunos);
        preencherPainelGeralDependentesVinculados(alunos);
        carregarGraficosPorAluno();
    } catch (error) {
        console.error("Erro ao carregar alunos vinculados:", error);
        preencherAlunosVinculados()
    }
}

function preencherDependentesVinculados(alunos) {
    let html = '';
    for (const aluno of alunos) {
        html += `<li><img src="imagens/Avatar1.png" class="rounded-circle" width="30"> ${aluno.nome} </li>`;
    }
    $("#dependentesVinculados").html(html);
}

async function carregarGraficosPorAluno() {
    try {
        const dados = await executarRequisicao(`relatorio/relatorio-desempenho/educador/${parseInt(localStorage.getItem('idEducador'))}`, "", "GET");
        carregarGraficosEducador(dados);
    } catch (error) {
        console.error("Erro ao carregar gráficos de desempenho:", error);
        carregarGraficosPorAluno()
    }
}

async function carregarGraficosEducador(dadosTodos) {
    const container = document.getElementById('graficosContainer');
    container.innerHTML = '';

    if (dadosTodos.length == 0) {
        container.innerHTML = '<h4 style="">Nenhuma Estatística Registrada</h4>';
    } else {
        dadosTodos.forEach((aluno) => {
            const divAluno = document.createElement('div');
            divAluno.className = 'grafico-aluno card p-2';

            const idDesempenho = `graficoDesempenho_${aluno.idAluno}`;
            const idGeral = `graficoGeral_${aluno.idAluno}`;
            let html = `
            <h6 class="btn btn-primary" onclick="carregarEstatistica(${aluno.idAluno}, '${aluno.nomeAluno}')" style="font-size: 0.9rem;">${aluno.nomeAluno}</h6>
            <div style="display: flex; justify-content: center; gap: 0.5rem;">`;

            if (aluno.relatorio && aluno.relatorio != 0) html += `<canvas id="${idDesempenho}" style="max-width: 240px; height: 180px;"></canvas>
                                          <canvas id="${idGeral}" style="max-width: 240px; height: 180px;"></canvas>`;
            else html += `<span>Não há atividades registradas</span>`

            html += `</div>`

            divAluno.innerHTML = html;
            divAluno.style.minWidth = '520px';
            divAluno.style.flex = '0 0 auto';
            container.appendChild(divAluno);

            if (aluno.relatorio && aluno.relatorio != 0) gerarGraficos(aluno.relatorio, idDesempenho, idGeral);
        });
    }
}

function preencherPainelGeralDependentesVinculados(alunos) {
    let html = '';
    for (const aluno of alunos) {
        html += `<div class="text-center">
                    <span class="dot" style="background-color: #4c6ef5;"></span>
                    <p>${aluno.nome}</p>
                </div>`;
    }
    $("#graficoAlunosGeral").html(html);
}

async function gerarGraficos(dados, idCanvasDesempenho = null, idCanvasGeral = null) {
    if (!dados || dados.length === 0) return;

    try {
        $("#informativoSemDadosGerais").remove();
        $("#informativoSemDesempenho").remove();
        const materias = dados.map(m => m.nomeMateria.trim());
        const porcentagens = dados.map(m => ((m.totalPontuacaoObtida / m.totalPontuacaoPossivel) * 100).toFixed(1));

        const ctxDesempenho = document.getElementById(idCanvasDesempenho)?.getContext('2d');
        if (ctxDesempenho) {
            new Chart(ctxDesempenho, {
                type: 'bar',
                data: {
                    labels: materias,
                    datasets: [{
                        label: 'Desempenho (%)',
                        data: porcentagens,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, max: 100 }
                    },
                    responsive: true
                }
            });
        }

        if (idCanvasGeral) {
            const totalObtido = dados.reduce((soma, m) => soma + m.totalPontuacaoObtida, 0);
            const totalPossivel = dados.reduce((soma, m) => soma + m.totalPontuacaoPossivel, 0);

            const ctxGeral = document.getElementById(idCanvasGeral)?.getContext('2d');
            if (ctxGeral) {
                new Chart(ctxGeral, {
                    type: 'doughnut',
                    data: {
                        labels: ['Pontuação Obtida', 'Pontuação Faltante'],
                        datasets: [{
                            data: [totalObtido, totalPossivel - totalObtido],
                            backgroundColor: ['#4CAF50', '#E0E0E0'],
                        }]
                    },
                    options: {
                        responsive: true
                    }
                });
            }
        }
    } catch (error) {
        console.error("Erro ao gerar gráficos:", error);
        gerarGraficos(dados, idCanvasDesempenho, idCanvasGeral)
    }
}
async function preencherCalendario() {
    const calendarEl = document.getElementById('calendar');
    let eventos = [];

    try {
        const response = await fetch('https://date.nager.at/api/v3/PublicHolidays/2025/BR');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        eventos = data.map(feriado => ({
            title: feriado.localName,
            start: feriado.date
        }));
    } catch (error) {
        console.error('Erro ao buscar feriados:', error);
    }

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        events: eventos
    });

    calendar.render();
}
