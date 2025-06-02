function exibirPerfilAluno() {
    $("#main").load(`./Perfil/index.html`, async () => {
        executarScriptsEspecificos("Perfil");
        await getDadosAluno();
    });
}

async function getDadosAluno() {
    try {
        const idAluno = parseInt(localStorage.getItem("idAluno"));
        if (!idAluno) throw new Error("ID do aluno não encontrado no localStorage.");

        const resposta = await executarRequisicao(`Agente/aluno/${idAluno}`, "", "GET");
        if (!resposta) {
            throw new Error("Aluno não encontrado");
        }

        $("#estiloAprendizagem").val(resposta.estiloAprendizagem ?? "");
        $("#dataNascimento").val(resposta.dataNascimento ?? "");
        $("#generoLiterarioFavorito").val(resposta.generoLiterarioFavorito ?? "");
        $("#modeloEnsino").val(resposta.modeloEnsino ?? "");
        $("#horasEstudo").val(resposta.horasEstudo ?? "");
        $("#hobbies").val(resposta.hobbies ?? "");
        $("#informacaoAdicional").val(resposta.informacaoAdicional ?? "");

        swal('Dados carregados com sucesso', "", 'success');
    } catch (error) {
        console.error("Erro ao obter dados do aluno:", error);
        swal("Erro", "Não foi possível carregar os dados do perfil.", "error");
    }
}

async function enviarInformacoesAluno() {
    try {
        const dados = {
            idAgente: parseInt(localStorage.getItem("idAgente")),
            estiloAprendizagem: $("#estiloAprendizagem").val(),
            generoLiterarioFavorito: $("#generoLiterarioFavorito").val(),
            modeloEnsino: $("#modeloEnsino").val(),
            horasEstudo: $("#horasEstudo").val(),
            hobbies: $("#hobbies").val(),
            informacaoAdicional: $("#informacaoAdicional").val()
        };

        if (!dados.idAgente) {
            swal("Erro", "Usuário não autenticado.", "error");
            return;
        }

        const resposta = await executarRequisicao(`Agente/complementar-informacoes`, dados, "POST");

        if (resposta) {
            swal('Perfil salvo com sucesso', "", 'success');
        } else {
            swal("Erro", "Falha ao salvar as informações.", "error");
        }
    } catch (error) {
        console.error("Erro ao enviar informações do aluno:", error);
        swal("Erro", "Não foi possível salvar as informações.", "error");
    }
}
