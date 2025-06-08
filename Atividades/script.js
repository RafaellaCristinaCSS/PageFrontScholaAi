async function buscarAtividade(id) {
    let tipoAgente = localStorage.tipo;
    if (tipoAgente == 2) {
        $("#main").load(`./Atividades/novaAtividade.html`);
        executarScriptsEspecificos('NovaAtividade')
        let dados = await executarRequisicao(`atividade/buscarAtividade/${id}`, "", "GET");
        preencherAtividade(dados.atividade);
    } else {
        $("#main").load(`./Atividades/preencherAtividade.html`);
        let dados = await executarRequisicao(`atividade/buscarAtividade/${id}`, "", "GET");
        exibirAtividadeParaAluno(dados.atividade);
    }
}
function somarPontuacaoAtividade() {
    let pontucoesDasQuestoes = $(".pontuacaoPergunta");
    let pontuacaoAtividade = 0;
    for (const pontuacao of pontucoesDasQuestoes) pontuacaoAtividade += parseInt($(pontuacao).val());

    $("#pontucaoAtividade").val(pontuacaoAtividade)
}
function definirTipoAtividade() {
    debugger
    $(".cardAtividade").addClass("hide")
    $(".divTipoQuestionario").addClass("d-none")
    switch ($("#tipoAtividade").val()) {
        case '1':
            $(".cardQuestionario").removeClass("hide")
            $(".divTipoQuestionario").removeClass("d-none")
            exibirCamposDeAcordoComTipoQuestionario()
            break;
        case '2':
            $(".cardAtividade").removeClass("hide")
            $("#pontucaoAtividade").val("0")
            break;
        case '3':
            $(".cardAtividade").removeClass("hide")
            if (!isAluno()) $("#pontucaoAtividade").prop("disabled", false)
            break;
    }
}
function exibirCamposDeAcordoComTipoQuestionario() {
    const tipoQuestionario = $("#tipoQuestionario");
    $(tipoQuestionario).change(() => {
        debugger
        switch (tipoQuestionario.val()) {
            case "1":
                $(".selecaoAlunos").show()
                $("#selectAluno").html("")
                $("#gerarQuestionario").addClass("d-none")
                preencherCheckboxALunoPorEducador()
                break;
            case "2":
                $(".selecaoAlunos").hide()
                $("#selectAluno").html(`<select class="form-control form-select" id="aluno"></select>`)
                $("#gerarQuestionario").removeClass("d-none")
                preencherSelectALunoPorEducador();
                monitorarAlunoSelecionado();
                break;
        }
    })
}
function monitorarAlunoSelecionado() {
    $("#aluno").change(() => {
        $("#alunosSelecionados").val($("#aluno").val());
    })
}
function adicionarPergunta() {
    perguntaCount++;
    let perguntaHtml = `
    <div class="pergunta-container row" data-pergunta-id="${perguntaCount}">
    <div class="col-12 col-md-10 mb-2">
        <input type="text" name="pergunta_${perguntaCount}" placeholder="Digite a pergunta" class="pergunta form-control"/>
    </div> 
    <div class="col-12 col-md-2 mb-2">
        <input type="text" ${(isAluno() ? 'disabled val="0" class="d-none"' : "")} name="pontuacao_${perguntaCount}" placeholder="Valor da pergunta" class="pontuacaoPergunta form-control"/>
    </div>
    
    <div class='row'>
    <div class="alternativas-container"></div>
    <button type="button" class="add-alternativa btn btn-secondary">+ Nova Alternativa</button>
    </div>
    </div >
        `;
    $('#perguntas-container').append(perguntaHtml);
}
function adicionarAlternativa() {
    const container = $(this).siblings('.alternativas-container');
    const alternativaHtml = `
        < div class="alternativa d-flex align-items-center mb-2" >
        <input type="checkbox" class="me-2" />
        <input type="text" placeholder="Texto da alternativa" class="form-control" />
        </div >
        `;
    container.append(alternativaHtml);
}
function preencherAtividade(atividade) {
    if (!atividade || !atividade.nome) return;

    const publicada = atividade.publicada === true;
    const desabilitar = publicada ? 'disabled' : '';

    $('#idAtividade').val(atividade.id);
    $('#nomeAtividade').val(atividade.nome.trim()).prop('disabled', publicada);
    $('#pontucaoAtividade').val(atividade.pontuacao)
    $('#materia').val(atividade.idMateria).prop('disabled', publicada);
    $('#tipoAtividade').val(atividade.idTipoAtividade).prop('disabled', publicada);

    if (publicada) {
        $('#salvarRascunho').hide();
        $('#publicar').hide();
        $('.adicionarAlunos').hide();
        $('.removerAlunos').hide();
        $("#arquivoPdf").closest("div").addClass("hide")
    } else {
        $('#salvarRascunho').show();
        $('#publicar').show();
        $('.adicionarAlunos').show();
        $('.removerAlunos').show();
        $("#arquivoPdf").closest("div").removeClass("hide")
    }

    let idsAlunos = [];
    atividade.alunos.forEach(aluno => {
        idsAlunos.push(aluno.id);
        $(`#aluno input[type = checkbox][value = '${aluno.id}']`).prop("checked", true).prop("disabled", publicada);
    });
    $(`#aluno input[type = checkbox]`).prop("disabled", publicada);
    $(".adicionarAlunos").trigger("click");

    $('#perguntas-container').empty();
    $('#textoLeitura').val('').hide();
    $('#arquivoLeitura').hide();
    $('#linkArquivoLeitura').hide();

    const tipo = atividade.idTipoAtividade;

    if (tipo === 1 && atividade.questoes) {

        atividade.questoes.forEach((questao, index) => {
            const perguntaHtml = `
        < div class="pergunta-container row mb-3" data - pergunta - id="${index + 1}" >
                    <div class="col-12 col-md-10 mb-2">
                        <input type="text" name="pergunta_${index + 1}" value="${questao.texto}" placeholder="Digite a pergunta" class="pergunta form-control" ${desabilitar}/>
                    </div>
                    <div class="col-12 col-md-2 mb-2">
                        <input type="text" name="pontuacao_${index + 1}" placeholder="Valor da pergunta" class="pontuacaoPergunta form-control" value="${questao.pontuacao || ''}" ${desabilitar}/>
                    </div>
                    <div class='row'>
                        <div class="alternativas-container">
                            ${questao.alternativas.map(alt => `
                                <div class="alternativa d-flex align-items-center mb-2">
                                    <input type="checkbox" class="me-2" ${alt.correta ? 'checked' : ''} ${desabilitar}/>
                                    <input type="text" placeholder="Texto da alternativa" class="form-control" value="${alt.texto}" ${desabilitar}/>
                                </div>
                            `).join('')}
                        </div>
                        ${!publicada ? `<button class="add-alternativa btn btn-secondary">+ Nova Alternativa</button>` : ''}
                    </div>
                </div >
        `;
            $('#perguntas-container').append(perguntaHtml);
        });
    } else if (tipo === 2 || tipo === 3) {
        if (atividade.textoLeitura) {
            $('#textoLeitura').val(atividade.textoLeitura).show().prop('disabled', publicada);
        }

        if (atividade.nomeArquivo && atividade.arquivoBase64) {
            const imagemBase64 = `${atividade.arquivoBase64} `;
            const imagemSrc = imagemBase64
                ? `${imagemBase64} `
                : "caminho/para/imagem-default.png";
            $("#exibirArquivo").prop("src", imagemBase64)
            $("#exibirArquivo").closest("div").removeClass("hide")
            $(".cardAtividade").removeClass("hide")
        }

        $('#arquivoLeitura').show();
    }
}
function exibirAtividadeParaAluno(atividade) {
    if (!atividade || !atividade.nome || !atividade.questoes) return;

    $("#atividadeTitulo").text(atividade.nome);
    $("#questoes-container").empty();
    $("#agenteId").val(localStorage.getItem("idAgente"));
    $("#idAtividade").val(atividade.id);
    $("#idMateria").val(atividade.idMateria);
    $("#atividade-aluno").data("atividade-id", atividade.id);

    atividade.questoes.forEach((questao, index) => {
        const questaoId = questao.id;
        const grupoNome = `questao_${questaoId} `;

        const alternativasHtml = questao.alternativas.map((alt, i) => `

        <label class="option" for= "${grupoNome}_alt_${alt.id}">
            <input type="radio" name="${grupoNome}" id="${grupoNome}_alt_${alt.id}" value="${alt.id}">
                ${alt.texto}
            </label>

        `).join('');

        const questaoHtml = `
        <div class= "question" data - questao - id="${questaoId}">
            <p>${index + 1}. ${questao.texto}</p>
                ${alternativasHtml}
            </div >
        `;

        $("#questoes-container").append(questaoHtml);
    });
}
function moverCheckboxes(origemId, destinoId) {
    const origem = document.getElementById(origemId);
    const destino = document.getElementById(destinoId);
    const checkboxes = origem.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
        const label = cb.parentElement;
        cb.checked = false;
        destino.appendChild(label);
    });

    let alunosSelecionados = $("#alunosSelecionados");
    let listaAlunosSelecionados = alunosSelecionados.val();
    let listaSelecionados = $("#listaSelecionados").find("input");

    for (const aluno of listaSelecionados) {
        if (listaAlunosSelecionados) listaAlunosSelecionados += "," + $(aluno).val();
        else listaAlunosSelecionados = $(aluno).val();
    }
    alunosSelecionados.val(listaAlunosSelecionados)
}
async function salvarAtividade(publicar) {
    let nomeAtividade = $("#nomeAtividade").val();
    let materia = $("#materia").val();
    let tipoAtividade = $("#tipoAtividade").val();
    let aluno = $("#alunosSelecionados").val();
    let pontuacao = $("#pontucaoAtividade").val();

    if (!nomeAtividade || !materia || !tipoAtividade || !aluno) {
        Swal.fire({
            title: 'Preencha todos os campos obrigatórios.',
            icon: 'warning',
            timer: 3000,
            showConfirmButton: false
        });;
        return;
    }

    const atividadeBase = {
        nome: nomeAtividade,
        idMateria: parseInt(materia),
        publicada: publicar,
        pontuacao: parseInt(pontuacao) || 0,
        idAgente: parseInt(localStorage.idAgente),
        idTipoAtividade: parseInt(tipoAtividade),
        listaIdAlunos: aluno.split(",").map(s => s.trim())
    };

    switch (tipoAtividade) {
        case "1":
            const questoes = montarAtividadeQuestionario();
            if (!questoes) return;
            atividadeBase.questoes = questoes;
            break;


        case "2":
            const { base64: base64_2, nome: nome_2, texto: texto_2 } = await montarAtividadeLeitura();
            atividadeBase.textoLeitura = texto_2;
            atividadeBase.arquivoBase64 = base64_2;
            atividadeBase.nomeArquivo = nome_2;
            break;

        case "3":
            const { base64: base64_3, nome: nome_3, texto: texto_3 } = await montarAtividadeExternaOuImpressao();
            atividadeBase.textoLeitura = texto_3;
            atividadeBase.arquivoBase64 = base64_3;
            atividadeBase.nomeArquivo = nome_3;
            break;
    }

    try {
        const idAtividade = $('#idAtividade').val();
        if (idAtividade) {
            await executarRequisicao(`atividade/${parseInt(idAtividade)} `, atividadeBase, 'PUT');
        } else {
            await executarRequisicao('atividade', atividadeBase, 'POST');
        }

        swal('Realizado com sucesso', "", 'success')
        $("#main").load(`./ Atividades / index.html`);
        executarScriptsEspecificos('Atividades');
    } catch (ex) {
        alert("Erro ao salvar atividade: " + ex);
    }
}
function montarAtividadeQuestionario() {
    const questoes = [];
    const perguntas = $('.pergunta-container');
    let erro = "";

    if (perguntas.length === 0) {
        erro = 'Adicione pelo menos uma pergunta.';
        alert(erro);
        return null;
    }

    perguntas.each(function (index) {
        const texto = $(this).find('.pergunta').val().trim();
        const pontuacao = parseInt($(this).find('.pontuacaoPergunta').val().trim());

        if (!texto || isNaN(pontuacao)) {
            erro = `Pergunta ${index + 1} inválida.`;
            return false;
        }

        const alternativas = [];
        $(this).find('.alternativa').each(function () {
            const textoAlt = $(this).find('input[type="text"]').val().trim();
            const correta = $(this).find('input[type="checkbox"]').is(':checked');
            if (textoAlt) alternativas.push({ texto: textoAlt, correta: correta });
        });

        if (alternativas.length < 2 || !alternativas.some(a => a.correta)) {
            erro = `Pergunta ${index + 1} inválida.`;
            return false;
        }

        questoes.push({ texto: texto, pontuacao: pontuacao, alternativas: alternativas });
    });

    if (erro) {
        alert(erro);
        return null;
    }

    return questoes;
}
function montarAtividadeLeitura() {
    return $("#textoLeitura").val().trim();
}
async function montarAtividadeExternaOuImpressao() {
    const arquivoInput = document.getElementById("arquivoPdf");
    if (arquivoInput.files.length === 0) return { base64: "", nome: "" };

    const file = arquivoInput.files[0];
    const nome = file.name;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function () {
            resolve({ base64: reader.result, nome });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
async function gerarQuestionario() {
    let nomeAtividade = $("#nomeAtividade").val();
    let materia = $("#materia").val();
    let tipoAtividade = 4;
    let aluno = $("#alunosSelecionados").val();
    let pontuacao = $("#pontucaoAtividade").val();

    if (!nomeAtividade || !materia || !tipoAtividade || !aluno) {
        Swal.fire({
            title: 'Preencha todos os campos obrigatórios.',
            icon: 'warning',
            timer: 3000,
            showConfirmButton: false
        });;
        return;
    }

    const atividadeBase = {
        nome: nomeAtividade,
        idMateria: parseInt(materia),
        publicada: false,
        pontuacao: parseInt(pontuacao) || 0,
        idAgente: parseInt(localStorage.idAgente),
        idTipoAtividade: parseInt(tipoAtividade),
        listaIdAlunos: aluno.split(",").map(s => s.trim())
    };

    try {
        const idAtividade = $('#idAtividade').val();
        if (idAtividade) {
            await executarRequisicao(`atividade/${parseInt(idAtividade)} `, atividadeBase, 'PUT');
        } else {
            await executarRequisicao('atividade', atividadeBase, 'POST');
        }

        swal('Realizado com sucesso', "", 'success')
        $("#main").load(`./ Atividades / index.html`);
        executarScriptsEspecificos('Atividades');
    } catch (ex) {
        alert("Erro ao salvar atividade: " + ex);
    }
}