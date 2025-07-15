document.addEventListener('DOMContentLoaded', () => {

    const toastElement = document.getElementById('toastMensagem');
    const toastBody = document.getElementById('toastTexto');
    const toast = toastElement ? new bootstrap.Toast(toastElement) : null;

    /**
     * Exibe uma notificação do tipo "toast" no canto da tela.
     * @param {string} mensagem A mensagem a ser exibida.
     * @param {string} tipo 'success' para verde, 'error' para vermelho.
     */
    function mostrarToast(mensagem, tipo = 'success') {
        if (!toast || !toastBody) return;

        // Remove classes de cor antigas
        toastElement.classList.remove('text-bg-success', 'text-bg-danger');

        // Adiciona a classe de cor correta com base no tipo
        if (tipo === 'success') {
            toastElement.classList.add('text-bg-success');
        } else if (tipo === 'error') {
            toastElement.classList.add('text-bg-danger');
        }

        // Define o texto e exibe o toast
        toastBody.textContent = mensagem;
        toast.show();
    }

    // ==========================================================
    // SEÇÃO 1: LÓGICA DO PAINEL "VISÃO GERAL" (RECOLHÍVEL)
    // ==========================================================
    const collapseElement = document.getElementById('collapseDashboardCards');
    const collapseIcon = document.querySelector('a[href="#collapseDashboardCards"] i');

    if (collapseElement && collapseIcon) {
        collapseElement.addEventListener('show.bs.collapse', function () {
            collapseIcon.classList.remove('bi-chevron-down');
            collapseIcon.classList.add('bi-chevron-up');
        });

        collapseElement.addEventListener('hide.bs.collapse', function () {
            collapseIcon.classList.remove('bi-chevron-up');
            collapseIcon.classList.add('bi-chevron-down');
        });
    }

    // ==========================================================
    // SEÇÃO 2: LÓGICA DAS TABELAS PRINCIPAIS (LISTAGEM)
    // ==========================================================
    const theadLancamentos = document.querySelector('#lancamentos-pane thead');
    const tbodyLancamentos = document.getElementById('tbody-lancamentos');
    const theadPendentes = document.querySelector('#pendentes-pane thead');
    const tbodyPendentes = document.getElementById('tbody-pendentes');
    const theadHistorico = document.querySelector('#historico-pane thead');
    const tbodyHistorico = document.getElementById('tbody-historico');

    // Colunas para as abas "Pendente Aprovação" e "Histórico"
    const colunasPrincipais = [
        "STATUS APROVAÇÃO", "DATA ATIVIDADE", "OS", "SITE", "SEGMENTO", "PROJETO", "GESTOR TIM", "REGIONAL",
        "EQUIPE", "VISTORIA", "PLANO DE VISTORIA", "DESMOBILIZAÇÃO", "PLANO DE DESMOBILIZAÇÃO",
        "INSTALAÇÃO", "PLANO DE INSTALAÇÃO", "ATIVAÇÃO", "PLANO DE ATIVAÇÃO",
        "DOCUMENTAÇÃO", "PLANO DE DOCUMENTAÇÃO", "ETAPA GERAL", "ETAPA DETALHADA",
        "STATUS", "DETALHE DIÁRIO", "CÓD. PRESTADOR", "PRESTADOR", "VALOR",
        "GESTOR"
    ];

    const colunasLancamentos = colunasPrincipais.filter(coluna => coluna !== "STATUS APROVAÇÃO");

    function renderizarCabecalho(colunas, theadElement) {
        if (!theadElement) return;
        theadElement.innerHTML = '';
        const tr = document.createElement('tr');
        colunas.forEach(textoColuna => {
            const th = document.createElement('th');
            th.textContent = textoColuna;
            tr.appendChild(th);
        });
        theadElement.appendChild(tr);
    }

    function aplicarEstiloStatus(cell, statusText) {
        if (!statusText) return;
        cell.classList.add('status-cell');
        const statusUpper = statusText.toUpperCase();
        if (statusUpper === 'OK') {
            cell.classList.add('status-ok');
        } else if (statusUpper === 'NOK') {
            cell.classList.add('status-nok');
        } else if (statusUpper === 'N/A') {
            cell.classList.add('status-na');
        }
    }

    function renderizarTabela(dados, tbodyElement, colunas) {
        if (!tbodyElement) return;
        tbodyElement.innerHTML = '';

        if (!dados || dados.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = colunas.length; // Usa o tamanho do array de colunas correto
            td.textContent = 'Nenhum lançamento encontrado para esta categoria.';
            td.className = 'text-center text-muted p-4';
            tr.appendChild(td);
            tbodyElement.appendChild(tr);
            return;
        }

        const formatarMoeda = (valor) => valor ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor) : '';

        dados.forEach(lancamento => {
            const tr = document.createElement('tr');
            // O mapa de dados continua completo, com todas as possibilidades
            const mapaDeCelulas = {
                "DATA ATIVIDADE": lancamento.dataAtividade || '', "OS": lancamento.os.os || '',
                "SITE": lancamento.os.site || '', "SEGMENTO": lancamento.os.segmento || '', "PROJETO": lancamento.os.projeto || '',
                "GESTOR TIM": lancamento.os.gestorTim || '', "REGIONAL": lancamento.os.regional || '', "EQUIPE": lancamento.equipe || '',
                "VISTORIA": lancamento.vistoria || '', "PLANO DE VISTORIA": lancamento.planoVistoria || '',
                "DESMOBILIZAÇÃO": lancamento.desmobilizacao || '', "PLANO DE DESMOBILIZAÇÃO": lancamento.planoDesmobilizacao || '',
                "INSTALAÇÃO": lancamento.instalacao || '', "PLANO DE INSTALAÇÃO": lancamento.planoInstalacao || '',
                "ATIVAÇÃO": lancamento.ativacao || '', "PLANO DE ATIVAÇÃO": lancamento.planoAtivacao || '',
                "DOCUMENTAÇÃO": lancamento.documentacao || '', "PLANO DE DOCUMENTAÇÃO": lancamento.planoDocumentacao || '',
                "ETAPA GERAL": lancamento.etapa.nomeGeral || '', "ETAPA DETALHADA": lancamento.etapa.nomeDetalhado || '',
                "STATUS": lancamento.status || '', "DETALHE DIÁRIO": lancamento.detalheDiario || '',
                "CÓD. PRESTADOR": lancamento.prestador.codigo || '', "PRESTADOR": lancamento.prestador.nome || '',
                "VALOR": formatarMoeda(lancamento.valor), "GESTOR": lancamento.manager.nome || '',
                "STATUS APROVAÇÃO": `<span class="badge rounded-pill text-bg-secondary">${lancamento.situacaoAprovacao.replace(/_/g, ' ')}</span>`
            };

            // O loop agora usa o array de colunas específico passado para a função.
            // Ele só vai criar as <td> para as colunas presentes nesse array.
            colunas.forEach(nomeColuna => {
                const td = document.createElement('td');
                td.dataset.label = nomeColuna;
                td.innerHTML = mapaDeCelulas[nomeColuna];
                if (["VISTORIA", "DESMOBILIZAÇÃO", "INSTALAÇÃO", "ATIVAÇÃO", "DOCUMENTAÇÃO"].includes(nomeColuna)) {
                    aplicarEstiloStatus(td, mapaDeCelulas[nomeColuna]);
                }
                tr.appendChild(td);
            });
            tbodyElement.appendChild(tr);
        });
    }

    async function carregarLancamentos() {
        try {
            const response = await fetch('http://localhost:8080/lancamentos');
            if (!response.ok) { throw new Error(`Erro na rede: ${response.statusText}`); }
            const todosLancamentos = await response.json();

            const statusPendentes = ['PENDENTE_COORDENADOR', 'AGUARDANDO_EXTENSAO_PRAZO', 'PENDENTE_CONTROLLER'];
            const rascunhos = todosLancamentos.filter(l => l.situacaoAprovacao === 'RASCUNHO');
            const pendentes = todosLancamentos.filter(l => statusPendentes.includes(l.situacaoAprovacao));
            const historico = todosLancamentos.filter(l => l.situacaoAprovacao !== 'RASCUNHO' && !statusPendentes.includes(l.situacaoAprovacao));

            renderizarTabela(rascunhos, tbodyLancamentos, colunasLancamentos);
            renderizarTabela(pendentes, tbodyPendentes, colunasPrincipais);
            renderizarTabela(historico, tbodyHistorico, colunasPrincipais);

        } catch (error) {
            console.error('Falha ao buscar lançamentos:', error);
            const erroHtml = `<tr><td colspan="${colunas.length}" class="text-center text-danger p-4">Falha ao carregar dados.</td></tr>`;
            tbodyLancamentos.innerHTML = erroHtml;
            tbodyPendentes.innerHTML = erroHtml;
            tbodyHistorico.innerHTML = erroHtml;
        }
    }

    // ==========================================================
    // SEÇÃO 3: LÓGICA DO MODAL "NOVO LANÇAMENTO"
    // ==========================================================
    const modalAdicionarEl = document.getElementById('modalAdicionar');
    if (modalAdicionarEl) {
        const formAdicionar = document.getElementById('formAdicionar');
        const selectOS = document.getElementById('osId');
        const selectPrestador = document.getElementById('prestadorId');
        const selectEtapaGeral = document.getElementById('etapaGeralSelect');
        const selectEtapaDetalhada = document.getElementById('etapaDetalhadaId');
        let todasAsOS = [];
        let todasAsEtapas = [];

        /**
         * FUNÇÃO ATUALIZADA: Agora aceita uma função para formatar o texto
         */
        async function popularSelect(selectElement, url, valueField, textFieldFormatter) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Falha ao carregar dados: ${response.statusText}`);
                const data = await response.json();
                selectElement.innerHTML = `<option value="" selected disabled>Selecione...</option>`;

                data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item[valueField];
                    // Usa a função de formatação para criar o texto da opção
                    option.textContent = textFieldFormatter(item);
                    selectElement.appendChild(option);
                });
                return data;
            } catch (error) {
                console.error(`Erro ao popular o select #${selectElement.id}:`, error);
                selectElement.innerHTML = `<option value="" selected disabled>Erro ao carregar</option>`;
                return [];
            }
        }

        function preencherCamposOS(osId) {
            const osSelecionada = todasAsOS.find(os => os.id == osId);
            if (osSelecionada) {
                document.getElementById('site').value = osSelecionada.site || '';
                document.getElementById('segmento').value = osSelecionada.segmento || '';
                document.getElementById('projeto').value = osSelecionada.projeto || '';
                document.getElementById('contrato').value = osSelecionada.contrato || '';
                document.getElementById('gestorTim').value = osSelecionada.gestorTim || '';
                document.getElementById('regional').value = osSelecionada.regional || '';
            }
        }

        modalAdicionarEl.addEventListener('show.bs.modal', async () => {
            // As chamadas agora passam uma função para formatar o texto
            todasAsOS = await popularSelect(selectOS, 'http://localhost:8080/os', 'id', (item) => item.os);
            await popularSelect(selectPrestador, 'http://localhost:8080/index/prestadores', 'id', (item) => `${item.codigoPrestador} - ${item.prestador}`);

            // CORREÇÃO: Passamos uma função para formatar "código - nome"
            todasAsEtapas = await popularSelect(selectEtapaGeral, 'http://localhost:8080/index/etapas', 'id', (item) => `${item.codigo} - ${item.nome}`);

            selectEtapaDetalhada.innerHTML = '<option value="" selected disabled>Primeiro, selecione a etapa geral</option>';
            selectEtapaDetalhada.disabled = true;
        });

        selectOS.addEventListener('change', (e) => preencherCamposOS(e.target.value));

        // CORREÇÃO: A lógica aqui agora funcionará, pois o 'id' estará disponível
        selectEtapaGeral.addEventListener('change', (e) => {
            const etapaGeralId = e.target.value;
            selectEtapaDetalhada.innerHTML = '<option value="" selected disabled>Selecione...</option>';

            if (etapaGeralId) {
                const etapaSelecionada = todasAsEtapas.find(etapa => etapa.id == etapaGeralId);

                if (etapaSelecionada && etapaSelecionada.etapasDetalhadas.length > 0) {
                    etapaSelecionada.etapasDetalhadas.forEach(detalhe => {
                        const option = document.createElement('option');
                        option.value = detalhe.id;
                        option.textContent = `${detalhe.indice} - ${detalhe.nome}`; // <-- AJUSTADO
                        selectEtapaDetalhada.appendChild(option);
                    });
                    selectEtapaDetalhada.disabled = false;
                } else {
                    selectEtapaDetalhada.innerHTML = '<option value="" selected disabled>Nenhuma etapa detalhada</option>';
                    selectEtapaDetalhada.disabled = true;
                }
            } else {
                selectEtapaDetalhada.innerHTML = '<option value="" selected disabled>Primeiro, selecione a etapa geral</option>';
                selectEtapaDetalhada.disabled = true;
            }
        });

        formAdicionar.addEventListener('submit', async function (e) {
            e.preventDefault();
            const dadosParaEnviar = {
                osId: document.getElementById('osId').value,
                dataAtividade: document.getElementById('dataAtividade').value,
                prestadorId: document.getElementById('prestadorId').value,
                etapaDetalhadaId: document.getElementById('etapaDetalhadaId').value,
                equipe: document.getElementById('equipe').value,
                vistoria: document.getElementById('vistoria').value,
                planoVistoria: document.getElementById('planoVistoria').value || null,
                desmobilizacao: document.getElementById('desmobilizacao').value,
                planoDesmobilizacao: document.getElementById('planoDesmobilizacao').value || null,
                instalacao: document.getElementById('instalacao').value,
                planoInstalacao: document.getElementById('planoInstalacao').value || null,
                ativacao: document.getElementById('ativacao').value,
                planoAtivacao: document.getElementById('planoAtivacao').value || null,
                documentacao: document.getElementById('documentacao').value,
                planoDocumentacao: document.getElementById('planoDocumentacao').value || null,
                status: document.getElementById('status').value,
                detalheDiario: document.getElementById('detalheDiario').value,
                valor: parseFloat(document.getElementById('valor').value.replace(/\./g, '').replace(',', '.')) || 0,
            };

            console.log('JSON a ser enviado:', JSON.stringify(dadosParaEnviar, null, 2));

            try {
                const resposta = await fetch('http://localhost:8080/lancamentos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosParaEnviar)
                });
                if (!resposta.ok) {
                    const erroData = await resposta.json();
                    throw new Error(erroData.message || `Erro ${resposta.status}`);
                }
                mostrarToast('Lançamento adicionado com sucesso!', 'success');
                const modal = bootstrap.Modal.getInstance(modalAdicionarEl);
                modal.hide();
                formAdicionar.reset();
                window.location.reload();
            } catch (erro) {
                console.error('Erro ao salvar lançamento:', erro);
                mostrarToast(`Erro ao salvar: ${erro.message}`, 'error');
            }
        });
    }

    // ==========================================================
    // SEÇÃO 4: EXECUÇÃO INICIAL
    // ==========================================================
    renderizarCabecalho(colunasLancamentos, theadLancamentos);
    renderizarCabecalho(colunasPrincipais, theadPendentes);
    renderizarCabecalho(colunasPrincipais, theadHistorico);
    carregarLancamentos();
});