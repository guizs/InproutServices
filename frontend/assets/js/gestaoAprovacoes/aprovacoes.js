// ==========================================================
// FUNÇÕES GLOBAIS PARA ABRIR MODAIS
// ==========================================================

const modalAprovar = document.getElementById('modalAprovarLancamento') ? new bootstrap.Modal(document.getElementById('modalAprovarLancamento')) : null;
const modalComentar = document.getElementById('modalComentarPrazo') ? new bootstrap.Modal(document.getElementById('modalComentarPrazo')) : null;
const modalEditar = document.getElementById('modalEditarLancamento') ? new bootstrap.Modal(document.getElementById('modalEditarLancamento')) : null;
const API_BASE_URL = 'http://localhost:8080';

function aprovarLancamento(id) {
    if (!modalAprovar) return;
    document.getElementById('aprovarLancamentoId').value = id;
    modalAprovar.show();
}

function comentarLancamento(id) {
    if (!modalComentar) return;
    document.getElementById('comentarLancamentoId').value = id;
    modalComentar.show();
}

function recusarLancamento(id) {
    if (!modalRecusar) return;
    document.getElementById('recusarLancamentoId').value = id;
    modalRecusar.show();
}

function toggleLoader(ativo = true) {
    const overlay = document.getElementById("overlay-loader");
    if (overlay) { // Adicionada verificação para segurança
        if (ativo) {
            overlay.classList.remove("d-none");
        } else {
            overlay.classList.add("d-none");
        }
    }
}


// ==========================================================
// LÓGICA PRINCIPAL DA PÁGINA
// ==========================================================

document.addEventListener('DOMContentLoaded', function () {

    // --- SELETORES E INICIALIZAÇÕES ---
    const theadPendentes = document.getElementById('thead-pendentes-coordenador');
    const tbodyPendentes = document.getElementById('tbody-pendentes-coordenador');
    const toastElement = document.getElementById('toastMensagem');
    const toastBody = document.getElementById('toastTexto');
    const toast = toastElement ? new bootstrap.Toast(toastElement) : null;

    const campoNovaData = document.getElementById('novaDataProposta');
    if (campoNovaData) {
        flatpickr(campoNovaData, { locale: "pt", dateFormat: "Y-m-d", altInput: true, altFormat: "d/m/Y", allowInput: false });
    }

    // --- FUNÇÕES AUXILIARES ---
    function mostrarToast(mensagem, tipo = 'success') {
        if (!toast || !toastBody) return;
        toastElement.classList.remove('text-bg-success', 'text-bg-danger');
        toastElement.classList.add(tipo === 'success' ? 'text-bg-success' : 'text-bg-danger');
        toastBody.textContent = mensagem;
        toast.show();
    }

    function setButtonLoading(button, isLoading) {
        if (!button) return;
        const spinner = button.querySelector('.spinner-border');
        button.disabled = isLoading;
        spinner?.classList.toggle('d-none', !isLoading);
    }

    // --- RENDERIZAÇÃO DO PAINEL E DA TABELA ---
    const colunas = [
        "AÇÕES", "STATUS APROVAÇÃO", "DATA ATIVIDADE", "OS", "SITE", "SEGMENTO", "PROJETO", "GESTOR TIM", "REGIONAL",
        "EQUIPE", "VISTORIA", "INSTALAÇÃO", "ATIVAÇÃO", "DOCUMENTAÇÃO", "ETAPA GERAL", "ETAPA DETALHADA",
        "STATUS", "DETALHE DIÁRIO", "PRESTADOR", "VALOR", "GESTOR"
    ];

    function renderizarCabecalho() {
        if (!theadPendentes) return;
        theadPendentes.innerHTML = '';
        const tr = document.createElement('tr');
        colunas.forEach(textoColuna => {
            const th = document.createElement('th');
            th.textContent = textoColuna;
            if (textoColuna === 'AÇÕES') th.classList.add('text-center');
            tr.appendChild(th);
        });
        theadPendentes.appendChild(tr);
    }

    function aplicarEstiloStatus(cell, statusText) {
        if (!statusText) return;
        cell.classList.add('status-cell');
        const statusUpper = statusText.toUpperCase();
        if (statusUpper === 'OK') cell.classList.add('status-ok');
        else if (statusUpper === 'NOK') cell.classList.add('status-nok');
        else if (statusUpper === 'N/A') cell.classList.add('status-na');
    }

    function renderizarTabela(dados) {
        if (!tbodyPendentes) return;
        tbodyPendentes.innerHTML = '';

        if (!dados || dados.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = colunas.length;
            td.textContent = 'Nenhuma pendência encontrada para esta categoria.';
            td.className = 'text-center text-muted p-4';
            tr.appendChild(td);
            tbodyPendentes.appendChild(tr);
            return;
        }

        const formatarMoeda = (valor) => valor ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor) : '';

        dados.forEach(lancamento => {
            const tr = document.createElement('tr');
            const acoesHtml = `
                <div class="d-flex justify-content-center gap-1">
                    <button class="btn btn-sm btn-outline-primary btn-editar-lancamento" title="Editar/Corrigir" data-id="${lancamento.id}"><i class="bi bi-pencil-fill"></i></button>
                    <button class="btn btn-sm btn-outline-warning" title="Comentar/Solicitar Prazo" onclick="comentarLancamento(${lancamento.id})"><i class="bi bi-chat-left-text"></i></button>
                    <button class="btn btn-sm btn-outline-success" title="Aprovar" onclick="aprovarLancamento(${lancamento.id})"><i class="bi bi-check-lg"></i></button>
                </div>
            `;

            const mapaDeCelulas = {
                "AÇÕES": acoesHtml,
                "STATUS APROVAÇÃO": `<span class="badge rounded-pill text-bg-warning">${(lancamento.situacaoAprovacao || '').replace(/_/g, ' ')}</span>`,
                "DATA ATIVIDADE": lancamento.dataAtividade || '', "OS": (lancamento.os || {}).os || '',
                "SITE": (lancamento.os || {}).site || '', "SEGMENTO": (lancamento.os || {}).segmento || '',
                "PROJETO": (lancamento.os || {}).projeto || '', "GESTOR TIM": (lancamento.os || {}).gestorTim || '',
                "REGIONAL": (lancamento.os || {}).regional || '', "EQUIPE": lancamento.equipe || '',
                "VISTORIA": lancamento.vistoria || '', "INSTALAÇÃO": lancamento.instalacao || '',
                "ATIVAÇÃO": lancamento.ativacao || '', "DOCUMENTAÇÃO": lancamento.documentacao || '',
                "ETAPA GERAL": (lancamento.etapa || {}).nomeGeral || '', "ETAPA DETALHADA": (lancamento.etapa || {}).nomeDetalhado || '',
                "STATUS": lancamento.status || '', "DETALHE DIÁRIO": lancamento.detalheDiario || '',
                "PRESTADOR": (lancamento.prestador || {}).nome || '', "VALOR": formatarMoeda(lancamento.valor),
                "GESTOR": (lancamento.manager || {}).nome || '',
            };

            colunas.forEach(nomeColuna => {
                const td = document.createElement('td');
                td.dataset.label = nomeColuna;
                td.innerHTML = mapaDeCelulas[nomeColuna] !== undefined ? mapaDeCelulas[nomeColuna] : '';
                if (["VISTORIA", "INSTALAÇÃO", "ATIVAÇÃO", "DOCUMENTAÇÃO"].includes(nomeColuna)) {
                    aplicarEstiloStatus(td, mapaDeCelulas[nomeColuna]);
                }
                tr.appendChild(td);
            });
            tbodyPendentes.appendChild(tr);
        });
    }

    function renderizarCardsDashboard(todosLancamentos) {
        const minhasPendencias = todosLancamentos.filter(l => l.situacaoAprovacao === 'PENDENTE_COORDENADOR').length;
        const aguardandoPrazo = todosLancamentos.filter(l => l.situacaoAprovacao === 'AGUARDANDO_EXTENSAO_PRAZO').length;
        const aceitas = todosLancamentos.filter(l => l.situacaoAprovacao === 'APROVADO').length;
        const rejeitadas = todosLancamentos.filter(l => l.situacaoAprovacao === 'RECUSADO').length;

        document.getElementById('card-pendentes').textContent = minhasPendencias;
        document.getElementById('card-controller').textContent = aguardandoPrazo;
        document.getElementById('card-aceitas').textContent = aceitas;
        document.getElementById('card-rejeitadas').textContent = rejeitadas;
        document.getElementById('card-comentadas').textContent = aguardandoPrazo;
        document.getElementById('card-prazo').textContent = aguardandoPrazo;
    }

    async function carregarDados() {
        toggleLoader(true);
        try {
            const response = await fetch('http://localhost:8080/lancamentos');
            if (!response.ok) {
                throw new Error(`Erro na rede: ${response.statusText}`);
            }
            const todosLancamentos = await response.json();

            renderizarCardsDashboard(todosLancamentos);

            const pendentesCoordenador = todosLancamentos.filter(l => l.situacaoAprovacao === 'PENDENTE_COORDENADOR');
            renderizarTabela(pendentesCoordenador);

        } catch (error) {
            console.error('Falha ao buscar dados:', error);
            mostrarToast('Falha ao carregar os dados da página.', 'error');
            tbodyPendentes.innerHTML = `<tr><td colspan="${colunas.length}" class="text-center text-danger p-4">Falha ao carregar dados. Verifique a conexão com o servidor.</td></tr>`;
        } finally {
            toggleLoader(false);
        }
    }

    // --- LÓGICA DE EVENTOS ---
    const collapseElement = document.getElementById('collapseAprovacoesCards');
    const collapseIcon = document.querySelector('a[href="#collapseAprovacoesCards"] i.bi');
    if (collapseElement && collapseIcon) {
        collapseElement.addEventListener('show.bs.collapse', () => {
            collapseIcon.classList.replace('bi-chevron-down', 'bi-chevron-up');
        });
        collapseElement.addEventListener('hide.bs.collapse', () => {
            collapseIcon.classList.replace('bi-chevron-up', 'bi-chevron-down');
        });
    }

    document.getElementById('formRecusarLancamento')?.addEventListener('submit', async function (event) {
        event.preventDefault();
        const btn = document.getElementById('btnConfirmarRecusa');
        setButtonLoading(btn, true);
        try {
            // LÓGICA REAL: Enviar dados do formulário para a API
            await new Promise(resolve => setTimeout(resolve, 1000));
            mostrarToast(`Lançamento recusado com sucesso.`, 'success');
            modalRecusar.hide();
            this.reset();
            carregarDados();
        } catch (error) {
            mostrarToast(`Erro ao recusar: ${error.message}`, 'error');
        } finally {
            setButtonLoading(btn, false);
        }
    });

    document.getElementById('btnConfirmarAprovacao')?.addEventListener('click', async function () {
        const lancamentoId = document.getElementById('aprovarLancamentoId').value;
        const btn = this; // Referência ao botão
        setButtonLoading(btn, true);

        const coordenadorId = 2;

        const payload = {
            coordenadorId: coordenadorId
        };

        try {
            const response = await fetch(`${API_BASE_URL}/lancamentos/${lancamentoId}/coordenador-aprovar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const erroData = await response.json();
                throw new Error(erroData.message || 'Falha ao aprovar o lançamento.');
            }

            mostrarToast(`Lançamento aprovado com sucesso!`, 'success');
            modalAprovar.hide();
            await carregarDados();

        } catch (error) {
            mostrarToast(`Erro ao aprovar: ${error.message}`, 'error');
        } finally {
            setButtonLoading(btn, false);
        }
    });

    document.getElementById('formComentarPrazo')?.addEventListener('submit', async function (event) {
        event.preventDefault();
        const btn = document.getElementById('btnEnviarComentario');
        setButtonLoading(btn, true);

        const lancamentoId = document.getElementById('comentarLancamentoId').value;
        const comentario = document.getElementById('comentarioCoordenador').value;
        const novaDataSugerida = document.getElementById('novaDataProposta').value;

        const coordenadorId = 2;

        if (!comentario || !novaDataSugerida) {
            mostrarToast('É necessário preencher o comentário e sugerir uma nova data.', 'error');
            setButtonLoading(btn, false);
            return;
        }

        const payload = {
            coordenadorId,
            comentario,
            novaDataSugerida
        };

        try {
            const response = await fetch(`${API_BASE_URL}/lancamentos/${lancamentoId}/coordenador-solicitar-prazo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const erroData = await response.json();
                throw new Error(erroData.message || 'Falha ao enviar a solicitação.');
            }

            mostrarToast(`Solicitação do lançamento enviada com sucesso!`, 'success');
            modalComentar.hide();
            this.reset();
            await carregarDados();

        } catch (error) {
            mostrarToast(`Erro ao enviar solicitação: ${error.message}`, 'error');
        } finally {
            setButtonLoading(btn, false);
        }
    });

    async function editarLancamento(id) {
        if (!modalEditar) return;

        toggleLoader(true); // <--- MOSTRAR o loader

        const form = document.getElementById('formEditarLancamento');
        form.reset();

        try {
            // 1. Busca os dados completos do lançamento específico
            const response = await fetch(`http://localhost:8080/lancamentos/${id}`);
            if (!response.ok) throw new Error('Não foi possível carregar os dados para edição.');
            const lancamento = await response.json();

            // 2. Popula os selects de Prestadores e Etapas (LÓGICA CORRIGIDA)
            // Primeiro, populamos os prestadores
            await popularSelect(document.getElementById('prestadorId_editar'), 'http://localhost:8080/index/prestadores', 'id', item => `${item.codigoPrestador} - ${item.prestador}`);

            // DEPOIS, buscamos as etapas e passamos para a função correta.
            // A linha abaixo havia sido removida incorretamente e foi restaurada.
            const todasEtapas = await fetch('http://localhost:8080/index/etapas').then(res => res.json());
            await popularSelectEtapasDetalhadas(document.getElementById('etapaDetalhadaId_editar'), todasEtapas);


            // 3. Popula os campos do formulário com os dados recebidos
            document.getElementById('idLancamentoEditar').value = lancamento.id;
            document.getElementById('osDisplay_editar').value = `${lancamento.os.os} - ${lancamento.os.site}`;
            document.getElementById('dataAtividade_editar').value = lancamento.dataAtividade;
            document.getElementById('equipe_editar').value = lancamento.equipe || '';
            document.getElementById('prestadorId_editar').value = lancamento.prestador.id;
            document.getElementById('etapaDetalhadaId_editar').value = lancamento.etapa.id;
            document.getElementById('status_editar').value = lancamento.status || 'Não iniciado';
            document.getElementById('detalheDiario_editar').value = lancamento.detalheDiario || '';

            const campoValor = document.getElementById('valor_editar');
            campoValor.value = lancamento.valor ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(lancamento.valor) : '0,00';

            // 4. Mostra o modal
            modalEditar.show();

        } catch (error) {
            console.error("Erro detalhado ao editar lançamento:", error); // Adicionado para facilitar a depuração
            mostrarToast(error.message, 'error');
        } finally {
            toggleLoader(false); // <--- ESCONDER o loader
        }
    }

    async function popularSelect(selectElement, url, valueField, textFieldFormatter) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Falha ao carregar dados de ${url}`);
            const data = await response.json();
            selectElement.innerHTML = `<option value="" selected disabled>Selecione...</option>`;
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueField];
                option.textContent = textFieldFormatter(item);
                selectElement.appendChild(option);
            });
            return data;
        } catch (error) {
            console.error(`Erro ao popular o select #${selectElement.id}:`, error);
            selectElement.innerHTML = `<option value="" selected disabled>Erro ao carregar</option>`;
        }
    }

    async function popularSelectEtapasDetalhadas(selectElement, todasEtapas) {
        selectElement.innerHTML = `<option value="" selected disabled>Selecione...</option>`;
        todasEtapas.forEach(etapaGeral => {
            if (etapaGeral.etapasDetalhadas && etapaGeral.etapasDetalhadas.length > 0) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = etapaGeral.nome;
                etapaGeral.etapasDetalhadas.forEach(detalhe => {
                    const option = document.createElement('option');
                    option.value = detalhe.id;
                    option.textContent = `${detalhe.indice} - ${detalhe.nome}`;
                    optgroup.appendChild(option);
                });
                selectElement.appendChild(optgroup);
            }
        });
    }

    tbodyPendentes?.addEventListener('click', function (event) {
        // Procura pelo botão de edição mais próximo do elemento que foi clicado
        const editButton = event.target.closest('.btn-editar-lancamento');

        if (editButton) {
            event.preventDefault(); // Previne qualquer comportamento padrão do botão
            const lancamentoId = editButton.dataset.id; // Pega o ID do atributo data-id
            editarLancamento(lancamentoId); // Chama a sua função de edição
        }
    });

    renderizarCabecalho();
    carregarDados();
});