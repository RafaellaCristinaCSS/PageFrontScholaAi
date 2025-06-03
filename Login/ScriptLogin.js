$(document).ready(() => {
    $("#idTipoAgente").change(() => {
        verificarTipoAgente();
    });

    $("#btnLogin").click(function () {
        debugger
        const login = $("#login").val();
        const senha = $("#senha").val();

        if (!login || !senha) {
            swal("Campos obrigatórios", "Preencha o login e a senha.", "warning");
            return;
        }

        const loginData = {
            Login: login,
            Senha: senha
        };

        $.ajax({
            url: `${BaseUrlBack}agente/login`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(loginData),
            xhrFields: {
                withCredentials: true
            },
            beforeSend: () => {
                $("#btnLogin").prop("disabled", true).text("Entrando...");
            },
            success: function (response) {
                const token = response.token;
                const decoded = jwt_decode(token);

                localStorage.setItem("token", token);
                localStorage.setItem("tipo", decoded.Tipo);
                localStorage.setItem("nivel", decoded.Nivel);
                localStorage.setItem("idAgente", decoded.Id);
                localStorage.setItem("idEducador", response.idEducador);
                localStorage.setItem("idAluno", response.idAluno);
                localStorage.setItem("login", decoded.unique_name);
                window.location.href = `${BaseUrlFront}`;
            },
            error: function (xhr) {
                let mensagem = "Erro ao realizar login.";
                if (xhr.status === 401 || xhr.status === 400) {
                    mensagem = xhr.responseText || "Credenciais inválidas.";
                }
                swal("Erro", mensagem, "error");
            },
            complete: () => {
                $("#btnLogin").prop("disabled", false).text("Entrar");
            }
        });
    });

    $("#novaConta").click(function () {
        window.location.href = `${BaseUrlFront}Cadastro/index.html`;
    });
});
