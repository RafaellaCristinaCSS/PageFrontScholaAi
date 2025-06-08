async function alterarNivelEducador(idEducador, nivelVisibilidade) {
    const novoNivel = nivelVisibilidade;
    const textoNivel = `Nível ${novoNivel}`;

    const confirmacao = await swal({
        title: 'Tem certeza?',
        text: `Você deseja mover este educador para ${textoNivel}?`,
        icon: 'warning',
        buttons: ['Cancelar', 'Confirmar'],
        dangerMode: true
    });

    if (confirmacao) {
        const parametros = {
            nivelVisibilidade: novoNivel
        };

        try {
            let resposta = await executarRequisicao(`Agente/educador/${idEducador}/editarNivelVisibilidade`, parametros, "PUT");
            console.log(resposta);
            await preencherListEducadores();
            swal('Nível alterado com sucesso', '', 'success');
        } catch (error) {
            console.error(error);
            swal('Erro ao alterar nível', 'Tente novamente mais tarde.', 'error');
        }
    }
}

async function preencherListEducadores() {
    try {
        const educadores = await buscarEducadores();
        let html = '';

        for (const educador of educadores) {
            const proximoNivel = educador.nivelVisibilidade === 1 ? 2 : 1;

            html += `
                <li>
                    <div class="educador-info">
                        <img src="./imagens/Avatar1.png" alt="${educador.nomeEducador}" class="educador-icon">
                        <span>${educador.nomeEducador}</span>
                    </div>
                    <div class="nivel-container">
                        <span class="nivel">Nível ${educador.nivelVisibilidade}</span>
                        <button class="edit"><i class="fa fa-edit"></i></button>
                        <button class="mover alterarNivelEducador" onclick='alterarNivelEducador(${educador.idEducador}, ${proximoNivel})'>
                            Mover para Nível ${proximoNivel}
                        </button>
                    </div>
                </li>
            `;
        }

        $("#listEducadores").html(html);

    } catch (error) {
        console.error("Erro ao carregar educadores:", error);
        preencherListEducadores()
    }
}
