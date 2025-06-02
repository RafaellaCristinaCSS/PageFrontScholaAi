$(document).ready(() => {
    verificarTipoAgente();
    preencherLoginsEducadores();

    $("#idTipoAgente").change(() => {
        verificarTipoAgente();
    });

    $("#cadastrar").click(() => {
        realizarCadastro()
    })
})
function setarValores() {
    let urlParams = new URLSearchParams(window.location.search);
    let idEducador = urlParams.get("Educador");
    if (idEducador) {
        $("#idTipoAgente").val(1)
        $("#idEducador").val(idEducador)
    }
}
function verificarTipoAgente() {
    if ($("#idTipoAgente").val() == "1") {
        $("#dataNascimento").closest("div").show();
        $("#idEducador").closest("div").show();
    } else {
        $("#dataNascimento").closest("div").hide();
        $("#idEducador").closest("div").hide();
    }
}
function converterData(data) {
    if (data) {
        return `${data}T00:00:00`;
    } else {
        return null;
    }
}

function setarValores() {
    let urlParams = new URLSearchParams(window.location.search);
    let idEducador = urlParams.get("Educador");
    if (idEducador) {
        $("#idTipoAgente").val("1");
        $("#idEducador").val(idEducador);
    }
}

async function preencherLoginsEducadores() {
    try {
        const educadores = await executarRequisicao("api/Agente/buscarLoginEducadores", "", "GET");
        let html = '<option value="">Selecione um educador</option>';
        for (const educador of educadores) {
            html += `<option value="${educador.id}">${educador.login}</option>`;
        }
        $("#idEducador").html(html);
        setarValores();
    } catch (error) {
        console.error("Erro ao carregar educadores:", error);
        swal('Erro ao carregar educadores', '', 'error');
    }
}

async function realizarCadastro() {
    const nome = $("#nome").val().trim();
    const tipoAgente = $("#idTipoAgente").val();
    const idEducador = $("#idEducador").val();
    const dataNascimento = $("#dataNascimento").val();
    const login = $("#login").val().trim();
    const email = $("#email").val().trim();
    const senha = $("#senha").val();
    const confirmarSenha = $("#confirmarSenha").val();

    let erro = false;

    if (!nome || !tipoAgente || !login || !email || !senha || !confirmarSenha) {
        swal('Por favor, preencha todos os campos.', '', 'warning');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        $("#erroEmail").show();
        erro = true;
    } else {
        $("#erroEmail").hide();
    }

    if (senha !== confirmarSenha) {
        $("#erroSenha").show();
        erro = true;
    } else {
        $("#erroSenha").hide();
    }

    if (tipoAgente === "1") {
        if (!idEducador || !dataNascimento) {
            swal('Alunos devem preencher o campo Educador e Data de Nascimento.', '', 'warning');
            return;
        }
    }

    if (erro) return;

    const parametros = {
        "nome": nome,
        "login": login,
        "senha": senha,
        "email": email,
        "idTipoAgente": parseInt(tipoAgente),
        "idEducador": tipoAgente === "1" ? parseInt(idEducador) : null,
        "dataNascimento": tipoAgente === "1" ? converterData(dataNascimento) : null
    };

    try {
        await executarRequisicao("api/Agente", parametros, "POST");
        swal('Cadastro realizado com sucesso', '', 'success');
        setTimeout(() => {
            window.location.href = `${BaseUrlFront}`;
        }, 1500);
    } catch (e) {
        console.error(e);
        swal('Erro ao cadastrar. Verifique os dados e tente novamente.', '', 'error');
    }
}
