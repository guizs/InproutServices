// ==========================================================
// FUNÇÕES GLOBAIS PARA ABRIR MODAIS
// ==========================================================

const modalAprovar = document.getElementById('modalAprovarLancamento') ? new bootstrap.Modal(document.getElementById('modalAprovarLancamento')) : null;
const modalComentar = document.getElementById('modalComentarPrazo') ? new bootstrap.Modal(document.getElementById('modalComentarPrazo')) : null;
const modalRecusar = document.getElementById('modalRecusarLancamento') ? new bootstrap.Modal(document.getElementById('modalRecusarLancamento')) : null;

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
                    <button class="btn btn-sm btn-outline-danger" title="Recusar" onclick="recusarLancamento(${lancamento.id})"><i class="bi bi-x-lg"></i></button>
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
        try {
            // VERSÃO FINAL: Usando a chamada de API real para o seu servidor.
            const response = await fetch('http://localhost:8080/lancamentos');
            if (!response.ok) {
                throw new Error(`Erro na rede: ${response.statusText}`);
            }
            const todosLancamentos = await response.json();
            
            // Renderiza os cards do painel
            renderizarCardsDashboard(todosLancamentos);

            // Filtra e renderiza a tabela de pendências do coordenador
            const pendentesCoordenador = todosLancamentos.filter(l => l.situacaoAprovacao === 'PENDENTE_COORDENADOR');
            renderizarTabela(pendentesCoordenador);

        } catch (error) {
            console.error('Falha ao buscar dados:', error);
            mostrarToast('Falha ao carregar os dados da página.', 'error');
            tbodyPendentes.innerHTML = `<tr><td colspan="${colunas.length}" class="text-center text-danger p-4">Falha ao carregar dados. Verifique a conexão com o servidor.</td></tr>`;
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

    // Eventos para os botões de ação dos modais
    document.getElementById('btnConfirmarAprovacao')?.addEventListener('click', async function() {
        const lancamentoId = document.getElementById('aprovarLancamentoId').value;
        setButtonLoading(this, true);
        try {
            // LÓGICA REAL: Enviar o ID para a sua API de aprovação
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simula tempo da API
            mostrarToast(`Lançamento ${lancamentoId} aprovado com sucesso!`, 'success');
            modalAprovar.hide();
            carregarDados();
        } catch (error) {
            mostrarToast(`Erro ao aprovar: ${error.message}`, 'error');
        } finally {
            setButtonLoading(this, false);
        }
    });
    
    document.getElementById('formComentarPrazo')?.addEventListener('submit', async function(event) {
        event.preventDefault();
        const btn = document.getElementById('btnEnviarComentario');
        setButtonLoading(btn, true);
        try {
            // LÓGICA REAL: Enviar dados do formulário para a API
            await new Promise(resolve => setTimeout(resolve, 1000));
            mostrarToast(`Solicitação enviada com sucesso!`, 'success');
            modalComentar.hide();
            this.reset();
            carregarDados();
        } catch (error) {
            mostrarToast(`Erro ao enviar solicitação: ${error.message}`, 'error');
        } finally {
            setButtonLoading(btn, false);
        }
    });

    document.getElementById('formRecusarLancamento')?.addEventListener('submit', async function(event) {
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

    // --- EXECUÇÃO INICIAL ---
    renderizarCabecalho();
    carregarDados();
});