let BaseUrlFront = 'https://rafaellacristinacss.github.io/PageFrontScholaAi/';
let BaseUrlBack = 'https://scholaai-production.up.railway.app/api/';
document.getElementById("tipoAtividade")?.addEventListener("change", definirTipoAtividade);
document.getElementById("tipoQuestionario")?.addEventListener("change", exibirCamposDeAcordoComTipoQuestionario);
document.getElementById("add-pergunta")?.addEventListener("click", adicionarPergunta);
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("add-alternativa")) {
        adicionarAlternativa(e);
    }
});

document.getElementById("gerarQuestionario")?.addEventListener("click", gerarQuestionario);
document.getElementById("perguntas-container")?.addEventListener("change", function (e) {
    if (e.target.classList.contains("pontuacaoPergunta")) {
        somarPontuacaoAtividade(e);
    }
});

async function buscarEducadores() {
    return educadores = await executarRequisicao("Agente/buscarDadosEducadores", "", "GET");
}
async function executarScriptsEspecificos(nome) {
    switch (nome) {
        case "ListaEducadores":
            await preencherListEducadores();
            break;
        case "Dashboard":
            let aluno = isAluno();
            if (!aluno) {
                await preencherAlunosVinculados();
            }
            await getAnotacoesBlocoNotas();
            break;
        case "InserirMateriais":
            await preencherNomesMaterias();
            break;
        case "Materiais":
            await preencherListMateriais();
            break;
        case "Atividades":
            await preencherAtividadesPorAgente();
            break;
        case "NovaAtividade":
            await preencherCheckboxALunoPorEducador();
            await preencherNomesMaterias();
            exibirNovaAtividadeAluno()
            break;
        case "Estatistica":
            if (isAluno()) await gerarRelatorio(parseInt(localStorage.getItem('idAluno')));
            else await criarSelectAlunos();
            break;
        case "Perfil":
            await getDadosAluno();
            break;
    }
}
async function preencherSelectALunoPorEducador() {
    try {
        const alunos = await executarRequisicao(`Agente/buscarAlunosPorEducador/${localStorage.getItem("idAgente")}`, "", "GET");
        let html = '<option value="">Selecione um Aluno</option>';
        for (const aluno of alunos) {
            html += `<option value="${aluno.idAluno}">${aluno.nome}</option>`;
        }
        $("#aluno").html(html);
    } catch (error) {
        console.error("Erro - preencherSelectALunoPorEducador:", error);
        preencherSelectALunoPorEducador()
    }
}
async function preencherCheckboxALunoPorEducador() {
    try {
        const alunos = await executarRequisicao(`Agente/buscarAlunosPorEducador/${localStorage.getItem("idAgente")}`, "", "GET");
        let html = '';
        for (const aluno of alunos) {
            html += `<label><input type="checkbox" value="${aluno.idAluno}">${aluno.nome}</label>`;
        }
        $("#aluno").html(html);
    } catch (error) {
        console.error("Erro - preencherCheckboxALunoPorEducador:", error);
        preencherCheckboxALunoPorEducador()
    }
}
async function preencherAtividadesPorAgente() {
    try {
        const dados = await executarRequisicao(`atividade/atividadesPorAgente/${localStorage.getItem("idAgente")}`, "", "GET");
        adicionarLoading()
        const lista = document.getElementById('lista-atividades');
        if (lista) {
            lista.innerHTML = "";
            if (dados && dados.atividades.length != 0) {
                await dados.atividades.forEach(atividade => {
                    const li = document.createElement('li');
                    li.className = "card btn editarAtividade";
                    li.setAttribute("data-materia", atividade.materia.nome);
                    li.setAttribute("id", `atividade-${atividade.id}`);

                    const imagemBase64 = atividade.materia.imagem;
                    const imagemSrc = imagemBase64
                        ? `${imagemBase64}`
                        : "caminho/para/imagem-default.png";

                    li.innerHTML = `
                        <div class="d-flex flex-column">
                            <img src="${imagemSrc}" alt="Capa da Matéria" id="imagem-atividade-${atividade.id}">
                            <div class="card-title">${atividade.nome}</div>
                            <small class="text-muted hide">${atividade.materia.nome}</small>
                            <div class="card-description">${atividade.informacaoExtra}</div>
                            <button type="button" class="btn btn-sm btn-outline-danger deletarAtividade d-none">
                                <i class="fa fa-trash"></i>
                            </button>
                        </div>
                    `;

                    lista.appendChild(li);
                });
            }
        } else {
            lista.innerHTML = "<span>Não há aulas registradas</span>"
        }
    } catch (error) {
        console.error("Erro - preencherAtividadesPorAgente:", error);
        preencherAtividadesPorAgente()
    } finally {
        removerLoading()
    }
}

async function preencherNomesMaterias() {
    try {
        const materias = await executarRequisicao(`materia`, "", "GET");

        let html = '<option value="">Selecione uma Materia</option>';
        for (const materia of materias) {
            html += `<option value="${materia.id}">${materia.nome}</option>`;
        }
        $("#materia").html(html);

    } catch (error) {
        console.error("Erro - preencherNomesMaterias:", error);
        preencherNomesMaterias()
    }
}
async function executarRequisicaoFetch(rota, retorno = "json", exibirLoading = true) {
    try {
        if (exibirLoading) adicionarLoading();
        const options = {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.token,
                "Content-Type": "application/json"
            },
            crossDomain: true,
            credentials: "include",
        };
        const response = await fetch(BaseUrlBack + rota, options);

        if (!response.ok) console.error(`Erro HTTP ${response.status}`);
        else {
            if (retorno === "json") {
                return await response.json();
            } else if (retorno === "blob") {
                return await response.blob();
            } else if (retorno === "text") {
                return await response.text();
            } else {
                return response;
            }
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    } finally {
        removerLoading();
    }
}
async function executarRequisicao(rota, parametros, tipo, exibirLoading = true) {
    try {
        if (exibirLoading) {
            adicionarLoading()
        }

        const response = await $.ajax({
            type: tipo,
            url: BaseUrlBack + rota,
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            data: JSON.stringify(parametros),
            contentType: "application/json; charset=utf-8"
        });
        console.log("Resposta da API:", response);
        return response;
    } catch (error) {
        console.error("Erro na requisição:", error);
        throw error;
    } finally {
        removerLoading();
    }
}

async function getAlunos() {
    return await executarRequisicao(`Agente/buscarAlunosPorEducador/${localStorage.getItem("idAgente")}`, "", "GET");
}

function redirecionarLogin() {
    window.location.href = `${BaseUrlFront}Login/index.html`;
}
function definirMenu(response) {
    const payload = jwt_decode(response);

    $(".user-name").html(payload.unique_name);
    $(".user-tipo").html(payload.Nivel);

    const tipoUsuario = localStorage.getItem('tipo');
    if (tipoUsuario === "1") {
        $("#perfilAlunoContainer").html(
            '<button class="profile" type="button" onclick="exibirPerfilAluno()">Perfil</button>'
        );
    }

    if (payload.Nivel !== "admin") {
        $("#menuEducadores").hide();
    }

    if (payload.Nivel !== "contribuidor" && payload.Nivel !== "admin") {
        $("#menuMateriais, #menuInserirMateriais").hide();
    }
}
function adicionarLoading() {
    if (document.getElementById("loading-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "loading-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "9999";

    const img = document.createElement("img");
    img.src = "./imagens/loading.gif";
    img.alt = "Carregando...";
    img.style.width = "100px";

    overlay.appendChild(img);
    document.body.appendChild(overlay);
}

function removerLoading() {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
        overlay.remove();
    }
}
function isAluno() {
    return localStorage.getItem("tipo") == "1";
}