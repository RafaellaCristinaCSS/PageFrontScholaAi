async function carregarEstatistica(idAluno, nome) {
    try {
        $("#main").load(`./Estatistica/index.html`);
        $(".sidebar li").removeClass("active");
        $("#menuEstatisticas").addClass("active");
        gerarRelatorio(idAluno, nome);
    } catch (error) {
        console.error("Erro ao carregar estatística:", error);
        carregarEstatistica(idAluno, nome)
    }
}

async function criarSelectAlunos() {
    try {
        const alunos = await getAlunos();
        let optionAlunos = `<option value="0">Selecione</option>`;
        for (const aluno of alunos) {
            optionAlunos += `<option value="${aluno.idAluno}">${aluno.nome}</option>`;
        }

        let selectAlunos = `
          <div class="divSelecaoAluno">
            <label for="alunos">Selecione um Aluno</label>
              <select class="form-control form-select" onchange="gerarRelatorio(this.value, this.options[this.selectedIndex].text)" name="alunos" id="alunos">
                ${optionAlunos}
              </select>
          </div>
        `;
        $($("#alunoRelatorio").after(selectAlunos));
    } catch (error) {
        console.error("Erro ao criar select de alunos:", error);
        criarSelectAlunos();
    }
}
async function exportarArtefatos() {
    debugger
    if (isAluno()) var pdf = await executarRequisicao(`relatorio/relatorio_completo/${parseInt(localStorage.getItem('idAluno'))}`, "", "GET");
    else {
        const idAluno = $("#alunos").val() != "";
        if (idAluno) var pdf = await executarRequisicao(`relatorio/relatorio_completo/${parseInt(idAluno)}`, "", "GET");
        else swal("Por favor, selecione um aluno", "", "info")
    }
    if (pdf) {
        window.location.href = pdf;
    }
}
async function gerarRelatorio(idAluno, nome = 'Aluno') {
    try {
        const relatorioAluno = await executarRequisicao(`relatorio/relatorio-desempenho/${idAluno}`, "", "GET");
        if (relatorioAluno.length > 0) gerarGraficosRelatorio(relatorioAluno, nome);
        else swal('Nenhuma estatística registrada', '', 'info');
    } catch (error) {
        console.error("Erro ao gerar relatório:", error);
        gerarRelatorio(idAluno, nome);
    }
}

function gerarGraficosRelatorio(relatorio, nome) {
    const container = document.getElementById('graficosRelatorio');
    const alunoRelatorio = document.getElementById('alunoRelatorio');
    container.innerHTML = '';
    alunoRelatorio.innerHTML = 'Relatório ' + nome;

    relatorio.forEach((materia, index) => {
        const idCanvas = `graficoMateria_${index}`;

        const div = document.createElement('div');
        div.className = 'card col-5 p-3 m-2';
        div.innerHTML = `
          <h5>${materia.nomeMateria} (${materia.totalPontuacaoObtida}/${materia.totalPontuacaoPossivel})</h5>
          <canvas id="${idCanvas}" height="300"></canvas>
        `;
        container.appendChild(div);

        const labels = materia.atividades.map(a => a.nomeAtividade);
        const dados = materia.atividades.map(a => a.pontuacaoObtida);

        new Chart(document.getElementById(idCanvas), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pontuação Obtida',
                    data: dados,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    });
}
