async function preencherListMateriais() {
    try {
        const materiais = await executarRequisicao("materiais", "", "GET");
        let html = '';

        for (const material of materiais) {
            html += `
        <li class="material-item" onclick="toggleConteudo(this)">
            <div class="material-titulo">${material.nomeMateria}</div>
            <span class="material-educador">Educador criador: ${material.nomeEducador}</span>
            <div class="material-conteudo">
                ${material.conteudo}
            </div>
            <div class="material-actions" onclick="event.stopPropagation();">
                <button class="btn edit" 
                        data-id="${material.id}" 
                        data-conteudo="${encodeURIComponent(material.conteudo)}"
                        onclick="event.stopPropagation(); editarMaterial(this)">
                    <i class="fa fa-edit"></i>
                </button>
                <button class="btn delete" onclick="event.stopPropagation(); excluirMaterial(${material.id})">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
        </li>`;
        }

        document.getElementById("listMateriais").innerHTML = html;
    } catch (error) {
        console.error("Erro ao carregar materiais:", error);
    }
}

function abrirModal(conteudo) {
    const texto = decodeURIComponent(conteudo);
    document.getElementById("modalTexto").innerText = texto;
    document.getElementById("modalConteudo").style.display = "block";
}

function fecharModal() {
    document.getElementById("modalConteudo").style.display = "none";
}


async function excluirMaterial(id) {
    // const confirmacao = await swal({
    //     title: "Tem certeza?",
    //     text: "Você deseja excluir este material?",
    //     icon: "warning",
    //     buttons: ["Cancelar", "Excluir"],
    //     dangerMode: true,
    // });
    let confirmacao = true;
    if (confirmacao) {
        const response = await executarRequisicao(`materiais/${id}`, {}, 'DELETE');
        if (response) {
            swal("Excluído!", "O material foi removido.", "success");
            $("#listMateriais").html("");
            preencherListMateriais();
        } else {
            swal("Erro", "Não foi possível excluir o material.", "error");
        }
    }
}
async function editarMaterial(botao) {
    const id = botao.getAttribute("data-id");
    const conteudoOriginal = decodeURIComponent(botao.getAttribute("data-conteudo"));

    const textarea = document.createElement("textarea");
    textarea.value = conteudoOriginal;
    textarea.rows = Math.min(20, Math.max(5, conteudoOriginal.split("\n").length));
    textarea.style.width = "100%";

    setTimeout(() => textarea.focus(), 200);

    const result = await swal({
        text: "Edite o conteúdo do material:",
        content: textarea,
        buttons: ["Cancelar", "Salvar"]
    });

    if (result) {
        const novoConteudo = textarea.value;

        if (!novoConteudo || novoConteudo.trim() === "") {
            swal("Aviso", "O conteúdo não pode estar vazio.", "warning");
            return;
        }

        const dados = { conteudo: novoConteudo.trim() };

        try {
            const response = await executarRequisicao(`materiais/${id}`, dados, 'PUT');
            if (response) {
                swal("Sucesso", "Material atualizado com sucesso!", "success");
                preencherListMateriais();
            } else {
                const erro = await response.text();
                swal("Erro", `Não foi possível editar o material:\n${erro}`, "error");
            }
        } catch (error) {
            console.error("Erro ao editar material:", error);
            swal("Erro", "Erro inesperado ao editar o material.", "error");
        }
    }
}

function toggleConteudo(elemento) {
    const todosItens = document.querySelectorAll(".material-item.expandido");
    todosItens.forEach(item => {
        if (item !== elemento) {
            item.classList.remove("expandido");
        }
    });
    elemento.classList.toggle("expandido");
}
preencherListMateriais();