async function carregarEstatistica(idAluno, nome) {
    try {
        $("#main").load(`./Estatistica/index.html`, function () {
            $($("#alunoRelatorio").after(`<input id='alunos' class='d-none' val='${idAluno}' />`));
        });
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
    let response = null;

    if (isAluno()) {
        response = await executarRequisicaoFetch(`relatorio/relatorio_completo/${parseInt(localStorage.getItem('idAluno'))}`, "blob");
    } else {
        const idAluno = $("#alunos").val();
        if (idAluno) {
            response = await executarRequisicaoFetch(`relatorio/relatorio_completo/${parseInt(idAluno)}`, "blob");
        } else {
            swal("Por favor, selecione um aluno", "", "info");
            return;
        }
    }

    if (response) {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'RelatorioCompleto.zip';
        a.click();
        window.URL.revokeObjectURL(url);
    } else {
        swal("Erro ao gerar relatório", "Verifique se o aluno tem atividades publicadas", "error");
    }
}


async function gerarRelatorio(idAluno, nome = 'Aluno') {
    $("#graficosRelatorio").html("");
    try {
        const relatorioAluno = await executarRequisicao(`relatorio/relatorio-desempenho/${idAluno}`, "", "GET");
        if (relatorioAluno.length > 0) gerarGraficosRelatorio(relatorioAluno, nome);
        else {
            swal('Nenhuma estatística registrada', '', 'info');
            $("#exportarArtefatos").hide();
        }
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
    $("#exportarArtefatos").show()
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
