function abrirModalCriarMateria() {
    $('#modalCriarMateria').modal('show')
    $("#nomeArquivoSelecionado").text("")
    $("#nomeMateria").val()
}
function fecharModalCriarMateria() {
    $('#modalCriarMateria').modal('hide');
}

function clickInputFile() {
    $("#fileInput").on("click");
}

function clickInputFileImagemMateria() {
    $("#imagemMateria").off().on();
}
function preencherTextoArquivoInserido() {
    $("#nomeArquivoSelecionado").text("Arquivo inserido com sucesso!");
}
function carregarTextoInseridoPorArquivo(event) {
    const file = event.target.files[0];
    if (file) {
        if (!file.name.endsWith(".txt")) {
            swal("Arquivo inválido", "Por favor, selecione um arquivo com extensão .txt", "warning");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            document.getElementById('texto').textContent = text;
        };
        reader.readAsText(file);
    }
}

function criarMaterial() {
    let texto = $("#texto").val();
    let idMateria = $("#materia").val();
    if (texto && idMateria) {
        try {
            const parametros = {
                conteudo: texto,
                idAgente: parseInt(localStorage.idEducador),
                idMateria: idMateria
            };
            const response = executarRequisicao("materiais", parametros, "POST");
            if (response) {
                swal('Material criado com sucesso!', '', 'success');
                let texto = $("#texto").val("");
                let idMateria = $("#materia").val("");
            } else {
                swal('Erro ao criar o material', '', 'error');
            }
        } catch (error) {
            console.error(error);
            swal('Erro ao criar o material', 'Tente novamente mais tarde.', 'error');
        }
    } else {
        swal('Preenchimento obrigatório', 'É necessário preencher o texto e a matéria relacionada.', 'warning');
    }
}

async function criarMateria() {
    let materia = $('#nomeMateria').val();
    let inputImagem = document.getElementById('imagemMateria');
    let arquivoImagem = inputImagem.files[0];

    if (!materia) {
        swal('Campo obrigatório', 'É necessário preencher o nome da matéria.', 'warning');
        return;
    }

    if (!arquivoImagem) {
        swal('Campo obrigatório', 'É necessário selecionar uma imagem.', 'warning');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const imagemBase64 = e.target.result;

        const img = new Image();
        img.onload = async function () {
            const larguraMaxima = 800;
            const alturaMaxima = 800;

            if (img.width > larguraMaxima || img.height > alturaMaxima) {
                swal('Imagem inválida', `A imagem excede o tamanho permitido (${larguraMaxima}x${alturaMaxima}px).`, 'warning');
                return;
            }

            const parametros = {
                nome: materia,
                imagem: imagemBase64
            };

            try {
                await executarRequisicao("materia", parametros, "POST");

                $('#modalCriarMateria').modal('hide');
                swal('Matéria criada com sucesso', '', 'success');
                preencherNomesMaterias();
            } catch (error) {
                console.error(error);
                swal('Erro ao criar matéria', 'Tente novamente mais tarde.', 'error');
            }
        };

        img.src = imagemBase64;
    };

    reader.readAsDataURL(arquivoImagem);
}


