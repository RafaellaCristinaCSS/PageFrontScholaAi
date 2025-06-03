async function preencherListMateriais() {
    try {
        const materiais = await executarRequisicao("materiais", "", "GET");
        let html = '';

        for (const material of materiais) {
            html += `
                <li>
                    <span class="material-nome">${material.conteudo}</span>
                    <div class="material-actions">
                        <button class="btn edit" onclick="editarMaterial(${material.id}, ${material.conteudo})">
                            <i class="fa fa-edit"></i>
                        </button>
                        <button class="btn delete" onclick="excluirMaterial(${material.id})">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </li>
            `;
        }

        document.getElementById("listMateriais").innerHTML = html;
    } catch (error) {
        console.error("Erro ao carregar materiais:", error);
    }
}

async function excluirMaterial(id) {
    const confirmacao = await swal({
        title: "Tem certeza?",
        text: "Você deseja excluir este material?",
        icon: "warning",
        buttons: ["Cancelar", "Excluir"],
        dangerMode: true,
    });

    if (confirmacao) {
        const response = await executarRequisicao(`materiais/${id}`, {}, 'DELETE');
        if (response) {
            swal("Excluído!", "O material foi removido.", "success");
            preencherListMateriais();
        } else {
            swal("Erro", "Não foi possível excluir o material.", "error");
        }
    }
}
async function editarMaterial(id, conteudo = "") {
    debugger
    try {
        const textarea = document.createElement("textarea");
        textarea.value = conteudo;
        textarea.rows = Math.min(20, Math.max(5, conteudo.split("\n").length));
        textarea.style.width = "100%";

        const { value: novoConteudo } = await swal({
            text: "Edite o conteúdo do material:",
            content: textarea,
            buttons: ["Cancelar", "Salvar"]
        });

        if (!novoConteudo || novoConteudo.trim() === "") {
            swal("Aviso", "O conteúdo não pode estar vazio.", "warning");
            return;
        }

        const dados = { conteudo: novoConteudo.trim() };

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
preencherListMateriais();