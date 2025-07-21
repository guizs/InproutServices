// ==========================================================
// FUNÇÕES GLOBAIS PARA ABRIR MODAIS
// ==========================================================
const modalAprovar = document.getElementById('modalAprovarLancamento') ? new bootstrap.Modal(document.getElementById('modalAprovarLancamento')) : null;
const modalComentar = document.getElementById('modalComentarPrazo') ? new bootstrap.Modal(document.getElementById('modalComentarPrazo')) : null;
const modalEditar = document.getElementById('modalEditarLancamento') ? new bootstrap.Modal(document.getElementById('modalEditarLancamento')) : null;
const modalRecusar = document.getElementById('modalRecusarLancamento') ? new bootstrap.Modal(document.getElementById('modalRecusarLancamento')) : null;
const modalComentarios = document.getElementById('modalComentarios') ? new bootstrap.Modal(document.getElementById('modalComentarios')) : null;
let todosOsLancamentosGlobais = [];
const API_BASE_URL = 'http://localhost:8080';

// Funções para abrir modais (sem alterações)
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
    document.getElementById('formRecusarLancamento').reset(); // Limpa o formulário
    modalRecusar.show();
}

function toggleLoader(ativo = true) {
    const overlay = document.getElementById("overlay-loader");
    if (overlay) {
        if (ativo) {
            overlay.classList.remove("d-none");
        } else {
            overlay.classList.add("d-none");
        }
    }
}

function verComentarios(id) {
    if (!modalComentarios) return;

    const lancamento = todosOsLancamentosGlobais.find(l => l.id == id);
    const modalBody = document.getElementById('modalComentariosBody');

    if (!lancamento || !lancamento.comentarios || lancamento.comentarios.length === 0) {
        modalBody.innerHTML = '<p class="text-center text-muted">Nenhum comentário para este lançamento.</p>';
    } else {
        // Ordena os comentários do mais recente para o mais antigo
        const comentariosOrdenados = [...lancamento.comentarios].sort((a, b) => parseDataBrasileira(b.dataHora) - parseDataBrasileira(a.dataHora));


        modalBody.innerHTML = comentariosOrdenados.map(comentario => `
            <div class="card mb-3">
                <div class="card-header bg-light d-flex justify-content-between align-items-center small">
                    <strong><i class="bi bi-person-circle me-2"></i>${comentario.autor.nome}</strong>
                    <span class="text-muted">${comentario.dataHora ? parseDataBrasileira(comentario.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : ''}</span>
                </div>
                <div class="card-body">
                    <p class="card-text">${comentario.texto}</p>
                </div>
            </div>
        `).join('');
    }

    modalComentarios.show();
}

function parseDataBrasileira(dataString) {
    if (!dataString) return null;
    // Ex: "21/07/2025 15:04:42"
    const [data, hora] = dataString.split(' ');
    const [dia, mes, ano] = data.split('/');
    // O mês em JS é 0-indexado (Janeiro=0), por isso mes-1
    return new Date(`${ano}-${mes}-${dia}T${hora || '00:00:00'}`);
}

function aprovarLancamentoController(id) {
    if (!modalAprovar) return;
    const modalBody = modalAprovar._element.querySelector('.modal-body');

    modalBody.innerHTML = `
        <input type="hidden" id="aprovarLancamentoId" value="${id}">
        <p>Você tem certeza que deseja aprovar este lançamento?</p>
        <p class="text-danger small"><b>Atenção:</b> Esta ação é final e o lançamento será concluído. Nenhuma outra alteração será possível.</p>
    `;

    modalAprovar.show();
}

function recusarLancamentoController(id) {
    // Reutiliza o mesmo modal e função de recusa do coordenador
    recusarLancamento(id);
}

function aprovarPrazoController(id) {
    if (!modalAprovar) return;
    const modalBody = modalAprovar._element.querySelector('.modal-body');

    // Correção: mantendo o input hidden
    modalBody.innerHTML = `
        <input type="hidden" id="aprovarLancamentoId" value="${id}">
        <p>Aprovar a solicitação de novo prazo feita pelo coordenador?</p>
        <p class="text-muted small">O lançamento voltará para a fila do coordenador com a nova data.</p>
    `;

    modalAprovar.show();
}

function recusarPrazoController(id) {
    // Reutiliza o modal de Comentar/Solicitar Prazo, que já tem os campos necessários
    if (!modalComentar) return;
    document.getElementById('comentarLancamentoId').value = id;
    modalComentar.show();
    // Ajusta os textos para a ação do Controller
    const modalTitle = modalComentar._element.querySelector('.modal-title');
    modalTitle.innerHTML = '<i class="bi bi-calendar-x-fill text-danger me-2"></i>Recusar/Estabelecer Novo Prazo';
    const comentarioLabel = modalComentar._element.querySelector('label[for="comentarioCoordenador"]');
    comentarioLabel.textContent = 'Motivo da Recusa / Comentário (Obrigatório)';
    const dataLabel = modalComentar._element.querySelector('label[for="novaDataProposta"]');
    dataLabel.textContent = 'Definir Novo Prazo (Obrigatório)';
}

// ==========================================================
// LÓGICA PRINCIPAL DA PÁGINA
// ==========================================================
document.addEventListener('DOMContentLoaded', function () {

    // --- SELETORES E INICIALIZAÇÕES ---
    const theadPendentes = document.getElementById('thead-pendentes'); // ID Genérico
    const tbodyPendentes = document.getElementById('tbody-pendentes'); // ID Genérico
    const toastElement = document.getElementById('toastMensagem');
    const toastBody = document.getElementById('toastTexto');
    const toast = toastElement ? new bootstrap.Toast(toastElement) : null;
    const userRole = (localStorage.getItem("role") || "").trim().toUpperCase(); // Pega o perfil do usuário
    const userId = localStorage.getItem('usuarioId');
    const theadHistorico = document.getElementById('thead-historico');
    const tbodyHistorico = document.getElementById('tbody-historico');

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

    // --- RENDERIZAÇÃO DA TABELA (VERSÃO COMPLETA) ---
    const colunas = [
        "AÇÕES", "PRAZO AÇÃO", "STATUS APROVAÇÃO", "DATA ATIVIDADE", "OS", "SITE", "CONTRATO", "SEGMENTO", "PROJETO",
        "GESTOR TIM", "REGIONAL", "LOTE", "BOQ", "PO", "ITEM", "OBJETO CONTRATADO", "UNIDADE", "QUANTIDADE", "VALOR TOTAL",
        "OBSERVAÇÕES", "DATA PO", "LPU", "EQUIPE", "VISTORIA", "PLANO DE VISTORIA", "DESMOBILIZAÇÃO", "PLANO DE DESMOBILIZAÇÃO",
        "INSTALAÇÃO", "PLANO DE INSTALAÇÃO", "ATIVAÇÃO", "PLANO DE ATIVAÇÃO", "DOCUMENTAÇÃO", "PLANO DE DOCUMENTAÇÃO",
        "ETAPA GERAL", "ETAPA DETALHADA", "STATUS", "SITUAÇÃO", "DETALHE DIÁRIO", "CÓD. PRESTADOR", "PRESTADOR", "VALOR", "GESTOR"
    ];

    function renderizarCabecalho() {
        if (!theadPendentes) return;
        theadPendentes.innerHTML = '';
        const tr = document.createElement('tr');
        colunas.forEach(textoColuna => {
            // Não renderiza a coluna de prazo para o Controller
            if (textoColuna === 'PRAZO AÇÃO' && userRole === 'CONTROLLER') {
                return;
            }
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
            td.textContent = 'Nenhuma pendência encontrada para seu perfil.';
            td.className = 'text-center text-muted p-4';
            tr.appendChild(td);
            tbodyPendentes.appendChild(tr);
            return;
        }

        const formatarMoeda = (valor) => valor ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor) : '';
        const formatarData = (data) => data ? data.split('-').reverse().join('/') : '';

        dados.forEach(lancamento => {
            const tr = document.createElement('tr');

            // Define as ações com base no perfil do usuário
            let acoesHtml = '';
            if (userRole === 'COORDINATOR') {
                acoesHtml = `
                    <div class="d-flex justify-content-center gap-1">
                        <button class="btn btn-sm btn-outline-success" title="Aprovar" onclick="aprovarLancamento(${lancamento.id})"><i class="bi bi-check-lg"></i></button>
                        <button class="btn btn-sm btn-outline-danger" title="Recusar" onclick="recusarLancamento(${lancamento.id})"><i class="bi bi-x-lg"></i></button>
                        <button class="btn btn-sm btn-outline-warning" title="Comentar/Solicitar Prazo" onclick="comentarLancamento(${lancamento.id})"><i class="bi bi-chat-left-text"></i></button>
                        <button class="btn btn-sm btn-outline-secondary" title="Ver Comentários" onclick="verComentarios(${lancamento.id})" ${!lancamento.comentarios || lancamento.comentarios.length === 0 ? 'disabled' : ''}><i class="bi bi-eye"></i></button>
                    </div>`;
            } else if (userRole === 'CONTROLLER') {
                switch (lancamento.situacaoAprovacao) {
                    case 'PENDENTE_CONTROLLER':
                        acoesHtml = `
                <div class="d-flex justify-content-center gap-1">
                    <button class="btn btn-sm btn-outline-success" title="Aprovar Lançamento" onclick="aprovarLancamentoController(${lancamento.id})"><i class="bi bi-check-lg"></i></button>
                    <button class="btn btn-sm btn-outline-danger" title="Recusar Lançamento" onclick="recusarLancamentoController(${lancamento.id})"><i class="bi bi-x-lg"></i></button>
                    <button class="btn btn-sm btn-outline-secondary" title="Ver Comentários" onclick="verComentarios(${lancamento.id})" ${!lancamento.comentarios || lancamento.comentarios.length === 0 ? 'disabled' : ''}><i class="bi bi-eye"></i></button>
                </div>`;
                        break;
                    case 'AGUARDANDO_EXTENSAO_PRAZO':
                        acoesHtml = `
                <div class="d-flex justify-content-center gap-1">
                    <button class="btn btn-sm btn-outline-success" title="Aprovar Novo Prazo" onclick="aprovarPrazoController(${lancamento.id})"><i class="bi bi-calendar-check"></i></button>
                    <button class="btn btn-sm btn-outline-danger" title="Recusar Novo Prazo" onclick="recusarPrazoController(${lancamento.id})"><i class="bi bi-calendar-x"></i></button>
                </div>`;
                        break;
                    case 'PRAZO_VENCIDO':
                        acoesHtml = `
                <div class="d-flex justify-content-center gap-1">
                     <button class="btn btn-sm btn-outline-warning" title="Estabelecer Novo Prazo" onclick="recusarPrazoController(${lancamento.id})"><i class="bi bi-calendar-plus"></i></button>
                </div>`;
                        break;
                    default:
                        acoesHtml = ''; // Nenhum botão para outros status
                }
            }

            const mapaDeCelulas = {
                "AÇÕES": acoesHtml,
                "PRAZO AÇÃO": userRole === 'COORDINATOR' ? `<span class="badge bg-danger">${formatarData(lancamento.dataPrazo)}</span>` : '',
                "STATUS APROVAÇÃO": `<span class="badge rounded-pill text-bg-warning">${(lancamento.situacaoAprovacao || '').replace(/_/g, ' ')}</span>`,
                "DATA ATIVIDADE": formatarData(lancamento.dataAtividade) || '',
                // Dados da OS
                "OS": (lancamento.os || {}).os || '',
                "SITE": (lancamento.os || {}).site || '',
                "CONTRATO": (lancamento.os || {}).contrato || '',
                "SEGMENTO": (lancamento.os || {}).segmento || '',
                "PROJETO": (lancamento.os || {}).projeto || '',
                "GESTOR TIM": (lancamento.os || {}).gestorTim || '',
                "REGIONAL": (lancamento.os || {}).regional || '',
                "LOTE": (lancamento.os || {}).lote || '',
                "BOQ": (lancamento.os || {}).boq || '',
                "PO": (lancamento.os || {}).po || '',
                "ITEM": (lancamento.os || {}).item || '',
                "OBJETO CONTRATADO": (lancamento.os || {}).objetoContratado || '',
                "UNIDADE": (lancamento.os || {}).unidade || '',
                "QUANTIDADE": (lancamento.os || {}).quantidade || '',
                "VALOR TOTAL": formatarMoeda((lancamento.os || {}).valorTotal),
                "OBSERVAÇÕES": (lancamento.os || {}).observacoes || '',
                "DATA PO": (lancamento.os || {}).dataPo || '',
                // Dados do Lançamento
                "LPU": (lancamento.lpu) ? `${lancamento.lpu.codigo} - ${lancamento.lpu.nome}` : '',
                "EQUIPE": lancamento.equipe || '',
                "VISTORIA": lancamento.vistoria || '',
                "PLANO DE VISTORIA": formatarData(lancamento.planoVistoria) || '',
                "DESMOBILIZAÇÃO": lancamento.desmobilizacao || '',
                "PLANO DE DESMOBILIZAÇÃO": formatarData(lancamento.planoDesmobilizacao) || '',
                "INSTALAÇÃO": lancamento.instalacao || '',
                "PLANO DE INSTALAÇÃO": formatarData(lancamento.planoInstalacao) || '',
                "ATIVAÇÃO": lancamento.ativacao || '',
                "PLANO DE ATIVAÇÃO": formatarData(lancamento.planoAtivacao) || '',
                "DOCUMENTAÇÃO": lancamento.documentacao || '',
                "PLANO DE DOCUMENTAÇÃO": formatarData(lancamento.planoDocumentacao) || '',
                "ETAPA GERAL": (lancamento.etapa || {}).nomeGeral || '',
                "ETAPA DETALHADA": (lancamento.etapa || {}).nomeDetalhado || '',
                "STATUS": lancamento.status || '',
                "SITUAÇÃO": lancamento.situacao || '',
                "DETALHE DIÁRIO": lancamento.detalheDiario || '',
                "CÓD. PRESTADOR": (lancamento.prestador || {}).codigo || '',
                "PRESTADOR": (lancamento.prestador || {}).nome || '',
                "VALOR": formatarMoeda(lancamento.valor),
                "GESTOR": (lancamento.manager || {}).nome || '',
            };

            colunas.forEach(nomeColuna => {
                if (nomeColuna === 'PRAZO AÇÃO' && userRole === 'CONTROLLER') {
                    return;
                }
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
        const dashboardContainer = document.getElementById('dashboard-container');
        if (!dashboardContainer) return;

        const hojeString = new Date().toLocaleDateString('pt-BR');
        let cardsHtml = '';

        if (userRole === 'COORDINATOR') {
            const minhasPendencias = todosLancamentos.filter(l => l.situacaoAprovacao === 'PENDENTE_COORDENADOR').length;
            const aguardandoController = todosLancamentos.filter(l => l.situacaoAprovacao === 'PENDENTE_CONTROLLER').length;
            const prazosSolicitados = todosLancamentos.filter(l => l.situacaoAprovacao === 'AGUARDANDO_EXTENSAO_PRAZO').length;
            const aprovadosHoje = todosLancamentos.filter(l => {
                // Verifica se foi aprovado e se a última atualização foi hoje
                const dataAcao = new Date(parseDataBrasileira(l.ultUpdate)).toLocaleDateString('pt-BR');
                return l.situacaoAprovacao === 'PENDENTE_CONTROLLER' && dataAcao === hojeString;
            }).length;

            cardsHtml = `
            <div class="card card-stat card-perigo">
                <div class="card-body"><h5>Minhas Pendências</h5><p>${minhasPendencias}</p></div>
            </div>
            <div class="card card-stat card-info">
                <div class="card-body"><h5>Aguardando Controller</h5><p>${aguardandoController}</p></div>
            </div>
            <div class="card card-stat card-alerta">
                <div class="card-body"><h5>Prazos Solicitados</h5><p>${prazosSolicitados}</p></div>
            </div>
            <div class="card card-stat card-sucesso">
                <div class="card-body"><h5>Aprovados Hoje</h5><p>${aprovadosHoje}</p></div>
            </div>
        `;

        } else if (userRole === 'CONTROLLER') {
            const pendenciasGerais = todosLancamentos.filter(l => l.situacaoAprovacao === 'PENDENTE_CONTROLLER').length;
            const solicitacoesPrazo = todosLancamentos.filter(l => l.situacaoAprovacao === 'AGUARDANDO_EXTENSAO_PRAZO').length;
            const prazosVencidos = todosLancamentos.filter(l => l.situacaoAprovacao === 'PRAZO_VENCIDO').length;
            const aprovadosHoje = todosLancamentos.filter(l => {
                const dataAcao = new Date(parseDataBrasileira(l.ultUpdate)).toLocaleDateString('pt-BR');
                return l.situacaoAprovacao === 'APROVADO' && dataAcao === hojeString;
            }).length;

            cardsHtml = `
                <div class="card card-stat card-info">
                    <div class="card-body"><h5>Pendências para Ação</h5><p>${pendenciasGerais}</p></div>
                </div>
                <div class="card card-stat card-alerta">
                    <div class="card-body"><h5>Solicitações de Prazo</h5><p>${solicitacoesPrazo}</p></div>
                </div>
                <div class="card card-stat card-perigo">
                    <div class="card-body"><h5>Prazos Vencidos</h5><p>${prazosVencidos}</p></div>
                </div>
                <div class="card card-stat card-sucesso">
                    <div class="card-body"><h5>Aprovados hoje</h5><p>${aprovadosHoje}</p></div>
                </div>
            `;
        }

        dashboardContainer.innerHTML = cardsHtml;
    }


    async function carregarDados() {
        toggleLoader(true);
        try {
            const response = await fetch(`${API_BASE_URL}/lancamentos`);
            if (!response.ok) throw new Error(`Erro na rede: ${response.statusText}`);

            const todosLancamentos = await response.json();
            todosOsLancamentosGlobais = todosLancamentos;

            // Renderiza os cards com os dados totais, mas adaptados ao perfil
            renderizarCardsDashboard(todosLancamentos);

            // Filtra os lançamentos para a tabela com base no perfil
            let pendenciasParaExibir = [];
            if (userRole === 'COORDINATOR') {
                pendenciasParaExibir = todosLancamentos.filter(l => l.situacaoAprovacao === 'PENDENTE_COORDENADOR');
                document.getElementById('titulo-tabela').innerHTML = '<i class="bi bi-clock-history me-2"></i> Pendências do Coordenador';

            } else if (userRole === 'CONTROLLER') {
                const statusController = ['PENDENTE_CONTROLLER', 'AGUARDANDO_EXTENSAO_PRAZO', 'PRAZO_VENCIDO'];
                pendenciasParaExibir = todosLancamentos.filter(l => statusController.includes(l.situacaoAprovacao));
                document.getElementById('titulo-tabela').innerHTML = '<i class="bi bi-shield-check me-2"></i> Pendências do Controller';
            }

            renderizarTabela(pendenciasParaExibir);
            const historicoParaExibir = todosLancamentos.filter(l => l.situacaoAprovacao !== 'RASCUNHO');
            renderizarTabelaHistorico(historicoParaExibir);

        } catch (error) {
            console.error('Falha ao buscar dados:', error);
            mostrarToast('Falha ao carregar os dados da página.', 'error');
            tbodyPendentes.innerHTML = `<tr><td colspan="${colunas.length}" class="text-center text-danger p-4">Falha ao carregar dados. Verifique a conexão com o servidor.</td></tr>`;
        } finally {
            toggleLoader(false);
        }
    }

    function renderizarTabelaHistorico(dados) {
        if (!tbodyHistorico) return;
        tbodyHistorico.innerHTML = '';

        // Adiciona a nova coluna "COMENTÁRIOS"
        const colunasHistorico = ["COMENTÁRIOS", ...colunas.filter(c => c !== "AÇÕES" && c !== "PRAZO AÇÃO")];

        if (theadHistorico) {
            theadHistorico.innerHTML = `<tr>${colunasHistorico.map(c => `<th>${c}</th>`).join('')}</tr>`;
        }

        if (!dados || dados.length === 0) {
            tbodyHistorico.innerHTML = `<tr><td colspan="${colunasHistorico.length}" class="text-center text-muted p-4">Nenhum lançamento no histórico.</td></tr>`;
            return;
        }

        const formatarMoeda = (valor) => valor ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor) : '';
        const formatarData = (dataStr) => {
            if (!dataStr) return '';
            if (dataStr.includes('/')) return dataStr;
            const [year, month, day] = dataStr.split('-');
            return `${day}/${month}/${year}`;
        };

        dados.sort((a, b) => parseDataBrasileira(b.ultUpdate) - parseDataBrasileira(a.ultUpdate));

        dados.forEach(lancamento => {
            const tr = document.createElement('tr');

            let statusBadge = '';
            if (lancamento.situacaoAprovacao.includes('RECUSADO')) {
                statusBadge = `<span class="badge rounded-pill text-bg-danger">${lancamento.situacaoAprovacao.replace(/_/g, ' ')}</span>`;
            } else if (lancamento.situacaoAprovacao === 'APROVADO') {
                statusBadge = `<span class="badge rounded-pill text-bg-success">${lancamento.situacaoAprovacao}</span>`;
            } else {
                statusBadge = `<span class="badge rounded-pill text-bg-info">${lancamento.situacaoAprovacao.replace(/_/g, ' ')}</span>`;
            }

            const mapaDeCelulas = {
                // Célula do botão de comentários
                "COMENTÁRIOS": `
                <button class="btn btn-sm btn-outline-secondary" onclick="verComentarios(${lancamento.id})" ${!lancamento.comentarios || lancamento.comentarios.length === 0 ? 'disabled' : ''}>
                    <i class="bi bi-eye"></i>
                </button>
            `,
                "STATUS APROVAÇÃO": statusBadge,
                "DATA ATIVIDADE": formatarData(lancamento.dataAtividade) || '',
                // (O resto do mapa de células continua exatamente igual)
                "OS": (lancamento.os || {}).os || '', "SITE": (lancamento.os || {}).site || '', "CONTRATO": (lancamento.os || {}).contrato || '', "SEGMENTO": (lancamento.os || {}).segmento || '', "PROJETO": (lancamento.os || {}).projeto || '',
                "GESTOR TIM": (lancamento.os || {}).gestorTim || '', "REGIONAL": (lancamento.os || {}).regional || '', "LOTE": (lancamento.os || {}).lote || '', "BOQ": (lancamento.os || {}).boq || '', "PO": (lancamento.os || {}).po || '', "ITEM": (lancamento.os || {}).item || '', "OBJETO CONTRATADO": (lancamento.os || {}).objetoContratado || '', "UNIDADE": (lancamento.os || {}).unidade || '', "QUANTIDADE": (lancamento.os || {}).quantidade || '', "VALOR TOTAL": formatarMoeda((lancamento.os || {}).valorTotal),
                "OBSERVAÇÕES": (lancamento.os || {}).observacoes || '', "DATA PO": (lancamento.os || {}).dataPo || '',
                "LPU": (lancamento.lpu) ? `${lancamento.lpu.codigo} - ${lancamento.lpu.nome}` : '', "EQUIPE": lancamento.equipe || '', "VISTORIA": lancamento.vistoria || '', "PLANO DE VISTORIA": formatarData(lancamento.planoVistoria) || '', "DESMOBILIZAÇÃO": lancamento.desmobilizacao || '', "PLANO DE DESMOBILIZAÇÃO": formatarData(lancamento.planoDesmobilizacao) || '',
                "INSTALAÇÃO": lancamento.instalacao || '', "PLANO DE INSTALAÇÃO": formatarData(lancamento.planoInstalacao) || '', "ATIVAÇÃO": lancamento.ativacao || '', "PLANO DE ATIVAÇÃO": formatarData(lancamento.planoAtivacao) || '', "DOCUMENTAÇÃO": lancamento.documentacao || '', "PLANO DE DOCUMENTAÇÃO": formatarData(lancamento.planoDocumentacao) || '',
                "ETAPA GERAL": (lancamento.etapa || {}).nomeGeral || '', "ETAPA DETALHADA": (lancamento.etapa || {}).nomeDetalhado || '', "STATUS": lancamento.status || '', "SITUAÇÃO": lancamento.situacao || '', "DETALHE DIÁRIO": lancamento.detalheDiario || '',
                "CÓD. PRESTADOR": (lancamento.prestador || {}).codigo || '', "PRESTADOR": (lancamento.prestador || {}).nome || '', "VALOR": formatarMoeda(lancamento.valor), "GESTOR": (lancamento.manager || {}).nome || '',
            };

            colunasHistorico.forEach(nomeColuna => {
                const td = document.createElement('td');
                td.dataset.label = nomeColuna;
                td.innerHTML = mapaDeCelulas[nomeColuna] !== undefined ? mapaDeCelulas[nomeColuna] : '';
                if (["VISTORIA", "INSTALAÇÃO", "ATIVAÇÃO", "DOCUMENTAÇÃO"].includes(nomeColuna)) {
                    aplicarEstiloStatus(td, mapaDeCelulas[nomeColuna]);
                }
                tr.appendChild(td);
            });
            tbodyHistorico.appendChild(tr);
        });
    }

    // --- LÓGICA DE EVENTOS (VERSÃO CORRETA E UNIFICADA) ---
    const collapseElement = document.getElementById('collapseAprovacoesCards');
    const collapseIcon = document.querySelector('a[href="#collapseAprovacoesCards"] i.bi');
    if (collapseElement && collapseIcon) {
        collapseElement.addEventListener('show.bs.collapse', () => collapseIcon.classList.replace('bi-chevron-down', 'bi-chevron-up'));
        collapseElement.addEventListener('hide.bs.collapse', () => collapseIcon.classList.replace('bi-chevron-up', 'bi-chevron-down'));
    }

    // Listener para APROVAR (Lançamento ou Prazo)
    document.getElementById('btnConfirmarAprovacao')?.addEventListener('click', async function () {
        const lancamentoId = document.getElementById('aprovarLancamentoId').value;
        setButtonLoading(this, true);

        try {
            const userId = localStorage.getItem('usuarioId');
            let endpoint = '';
            let payload = {};
            const lancamento = todosOsLancamentosGlobais.find(l => l.id == lancamentoId);

            if (userRole === 'CONTROLLER' && lancamento.situacaoAprovacao === 'AGUARDANDO_EXTENSAO_PRAZO') {
                endpoint = `${API_BASE_URL}/lancamentos/${lancamentoId}/prazo/aprovar`;
                payload = { controllerId: userId };
            } else if (userRole === 'CONTROLLER' && lancamento.situacaoAprovacao === 'PENDENTE_CONTROLLER') {
                endpoint = `${API_BASE_URL}/lancamentos/${lancamentoId}/controller-aprovar`;
                payload = { controllerId: userId };
            } else if (userRole === 'COORDINATOR') {
                endpoint = `${API_BASE_URL}/lancamentos/${lancamentoId}/coordenador-aprovar`;
                payload = { coordenadorId: userId };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error((await response.json()).message || 'Falha ao processar aprovação.');

            mostrarToast(`Ação de aprovação realizada com sucesso!`, 'success');
            modalAprovar.hide();
            await carregarDados();

        } catch (error) {
            mostrarToast(`Erro: ${error.message}`, 'error');
        } finally {
            setButtonLoading(this, false);
        }
    });

    // Listener para RECUSAR (Lançamento)
    document.getElementById('formRecusarLancamento')?.addEventListener('submit', async function (event) {
        event.preventDefault();
        const btn = document.getElementById('btnConfirmarRecusa');
        setButtonLoading(btn, true);

        const lancamentoId = document.getElementById('recusarLancamentoId').value;
        const comentario = document.getElementById('motivoRecusa').value;

        let payload = {};
        let endpoint = '';

        if (userRole === 'COORDINATOR') {
            payload = { coordenadorId: userId, comentario };
            endpoint = `${API_BASE_URL}/lancamentos/${lancamentoId}/coordenador-rejeitar`;
        } else if (userRole === 'CONTROLLER') {
            payload = { controllerId: userId, motivoRejeicao: comentario };
            endpoint = `${API_BASE_URL}/lancamentos/${lancamentoId}/controller-rejeitar`;
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error((await response.json()).message || 'Falha ao recusar.');

            mostrarToast('Lançamento recusado com sucesso!', 'success');
            modalRecusar.hide();
            await carregarDados();
        } catch (error) {
            mostrarToast(`Erro ao recusar: ${error.message}`, 'error');
        } finally {
            setButtonLoading(btn, false);
        }
    });

    // Listener para COMENTAR (Solicitar Prazo do Coordenador ou Recusar/Definir Prazo do Controller)
    document.getElementById('formComentarPrazo')?.addEventListener('submit', async function (event) {
        event.preventDefault();
        const btn = document.getElementById('btnEnviarComentario');
        setButtonLoading(btn, true);

        const lancamentoId = document.getElementById('comentarLancamentoId').value;

        let payload = {};
        let endpoint = '';

        if (userRole === 'COORDINATOR') {
            payload = {
                coordenadorId: userId,
                comentario: document.getElementById('comentarioCoordenador').value,
                novaDataSugerida: document.getElementById('novaDataProposta').value
            };
            if (!payload.comentario || !payload.novaDataSugerida) {
                mostrarToast('É necessário preencher o comentário e sugerir uma nova data.', 'error');
                setButtonLoading(btn, false);
                return;
            }
            endpoint = `${API_BASE_URL}/lancamentos/${lancamentoId}/coordenador-solicitar-prazo`;

        } else if (userRole === 'CONTROLLER') {
            payload = {
                controllerId: userId,
                motivoRejeicao: document.getElementById('comentarioCoordenador').value,
                novaDataPrazo: document.getElementById('novaDataProposta').value
            };
            if (!payload.motivoRejeicao || !payload.novaDataPrazo) {
                mostrarToast('É necessário preencher o motivo e definir um novo prazo.', 'error');
                setButtonLoading(btn, false);
                return;
            }
            endpoint = `${API_BASE_URL}/lancamentos/${lancamentoId}/prazo/rejeitar`;
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error((await response.json()).message || 'Falha ao enviar dados.');

            mostrarToast(`Ação realizada com sucesso!`, 'success');
            modalComentar.hide();
            await carregarDados();
        } catch (error) {
            mostrarToast(`Erro: ${error.message}`, 'error');
        } finally {
            setButtonLoading(btn, false);
        }
    });


    // --- INICIALIZAÇÃO ---
    renderizarCabecalho();
    carregarDados();
});