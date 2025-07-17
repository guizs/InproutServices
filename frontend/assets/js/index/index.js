document.addEventListener('DOMContentLoaded', () => {

    const toastElement = document.getElementById('toastMensagem');
    const toastBody = document.getElementById('toastTexto');
    const toast = toastElement ? new bootstrap.Toast(toastElement) : null;

    function mostrarToast(mensagem, tipo = 'success') {
        if (!toast || !toastBody) return;
        toastElement.classList.remove('text-bg-success', 'text-bg-danger');
        if (tipo === 'success') {
            toastElement.classList.add('text-bg-success');
        } else if (tipo === 'error') {
            toastElement.classList.add('text-bg-danger');
        }
        toastBody.textContent = mensagem;
        toast.show();
    }

    // ==========================================================
    // SEÇÃO 1: LÓGICA DO PAINEL "VISÃO GERAL" (RECOLHÍVEL)
    // ==========================================================
    const collapseElement = document.getElementById('collapseDashboardCards');
    const collapseIcon = document.querySelector('a[href="#collapseDashboardCards"] i');
    if (collapseElement && collapseIcon) {
        collapseElement.addEventListener('show.bs.collapse', () => collapseIcon.classList.replace('bi-chevron-down', 'bi-chevron-up'));
        collapseElement.addEventListener('hide.bs.collapse', () => collapseIcon.classList.replace('bi-chevron-up', 'bi-chevron-down'));
    }

    // ==========================================================
    // SEÇÃO 2: LÓGICA DAS TABELAS PRINCIPAIS (LISTAGEM)
    // ==========================================================
    const tbodyLancamentos = document.getElementById('tbody-lancamentos');
    const tbodyPendentes = document.getElementById('tbody-pendentes');
    const tbodyHistorico = document.getElementById('tbody-historico');
    const tbodyMinhasPendencias = document.getElementById('tbody-minhas-pendencias');
    const tbodyParalisados = document.getElementById('tbody-paralisados');
    const notificacaoPendencias = document.getElementById('notificacao-pendencias');
    let filtrosAtivos = { periodo: null, status: null, osId: null };
    let todosLancamentos = []; // Armazena todos os lançamentos para fácil acesso

    const colunasPrincipais = ["STATUS APROVAÇÃO", "DATA ATIVIDADE", "OS", "SITE", "SEGMENTO", "PROJETO", "LPU", "GESTOR TIM", "REGIONAL", "EQUIPE", "VISTORIA", "PLANO DE VISTORIA", "DESMOBILIZAÇÃO", "PLANO DE DESMOBILIZAÇÃO", "INSTALAÇÃO", "PLANO DE INSTALAÇÃO", "ATIVAÇÃO", "PLANO DE ATIVAÇÃO", "DOCUMENTAÇÃO", "PLANO DE DOCUMENTAÇÃO", "ETAPA GERAL", "ETAPA DETALHADA", "STATUS", "SITUAÇÃO", "DETALHE DIÁRIO", "CÓD. PRESTADOR", "PRESTADOR", "VALOR", "GESTOR"];
    const colunasLancamentos = [...colunasPrincipais.filter(c => c !== "STATUS APROVAÇÃO"), "AÇÃO"];
    const colunasMinhasPendencias = [...colunasLancamentos, "AÇÃO"];

    function renderizarCabecalho(colunas, theadElement) {
        if (!theadElement) return;
        const tr = document.createElement('tr');
        colunas.forEach(textoColuna => {
            const th = document.createElement('th');
            th.textContent = textoColuna;
            tr.appendChild(th);
        });
        theadElement.innerHTML = '';
        theadElement.appendChild(tr);
    }

    function aplicarEstiloStatus(cell, statusText) {
        if (!statusText) return;
        cell.classList.add('status-cell');
        const statusUpper = statusText.toUpperCase();
        if (statusUpper === 'OK') cell.classList.add('status-ok');
        else if (statusUpper === 'NOK') cell.classList.add('status-nok');
        else if (statusUpper === 'N/A') cell.classList.add('status-na');
    }

    function renderizarTabela(dados, tbodyElement, colunas) {
        if (!tbodyElement) return;
        tbodyElement.innerHTML = '';

        if (!dados || dados.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = colunas.length;
            td.textContent = 'Nenhum lançamento encontrado para esta categoria.';
            td.className = 'text-center text-muted p-4';
            tr.appendChild(td);
            tbodyElement.appendChild(tr);
            return;
        }

        const formatarMoeda = (valor) => valor ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor) : '';

        dados.forEach(lancamento => {
            const tr = document.createElement('tr');
            const mapaDeCelulas = {
                "DATA ATIVIDADE": lancamento.dataAtividade || '', "OS": lancamento.os.os || '', "SITE": lancamento.os.site || '', "SEGMENTO": lancamento.os.segmento || '', "PROJETO": lancamento.os.projeto || '', "LPU": (lancamento.os.lpu) ? `${lancamento.os.lpu.codigo} - ${lancamento.os.lpu.nome}` : '', "GESTOR TIM": lancamento.os.gestorTim || '', "REGIONAL": lancamento.os.regional || '', "EQUIPE": lancamento.equipe || '', "VISTORIA": lancamento.vistoria || '', "PLANO DE VISTORIA": lancamento.planoVistoria || '', "DESMOBILIZAÇÃO": lancamento.desmobilizacao || '', "PLANO DE DESMOBILIZAÇÃO": lancamento.planoDesmobilizacao || '', "INSTALAÇÃO": lancamento.instalacao || '', "PLANO DE INSTALAÇÃO": lancamento.planoInstalacao || '', "ATIVAÇÃO": lancamento.ativacao || '', "PLANO DE ATIVAÇÃO": lancamento.planoAtivacao || '', "DOCUMENTAÇÃO": lancamento.documentacao || '', "PLANO DE DOCUMENTAÇÃO": lancamento.planoDocumentacao || '', "ETAPA GERAL": lancamento.etapa ? lancamento.etapa.nomeGeral : '', "ETAPA DETALHADA": lancamento.etapa ? lancamento.etapa.nomeDetalhado : '', "STATUS": lancamento.status || '', "SITUAÇÃO": lancamento.situacao || '', "DETALHE DIÁRIO": lancamento.detalheDiario || '', "CÓD. PRESTADOR": lancamento.prestador ? lancamento.prestador.codigo : '', "PRESTADOR": lancamento.prestador ? lancamento.prestador.nome : '', "VALOR": formatarMoeda(lancamento.valor), "GESTOR": lancamento.manager ? lancamento.manager.nome : '', "STATUS APROVAÇÃO": `<span class="badge rounded-pill text-bg-secondary">${lancamento.situacaoAprovacao.replace(/_/g, ' ')}</span>`
            };

            colunas.forEach(nomeColuna => {
                const td = document.createElement('td');
                td.dataset.label = nomeColuna;

                if (nomeColuna === 'AÇÃO') {

                    let buttonsHtml = '';
                    if (tbodyElement.id === 'tbody-minhas-pendencias') {
                        buttonsHtml = `
                            <button class="btn btn-sm btn-info btn-ver-comentarios" data-id="${lancamento.id}" title="Ver Comentários" data-bs-toggle="modal" data-bs-target="#modalComentarios"><i class="bi bi-chat-left-text"></i></button>
                            <button class="btn btn-sm btn-success btn-reenviar" data-id="${lancamento.id}" title="Corrigir e Reenviar"><i class="bi bi-pencil-square"></i></button>
                        `;
                    } else if (tbodyElement.id === 'tbody-lancamentos') {
                        buttonsHtml = `
                            <button class="btn btn-sm btn-primary btn-submeter-agora" data-id="${lancamento.id}" title="Enviar para Aprovação"><i class="bi bi-send-plus"></i></button>
                            <button class="btn btn-sm btn-secondary btn-editar-rascunho" data-id="${lancamento.id}" title="Editar Rascunho"><i class="bi bi-pencil"></i></button>
                        `;
                    } else if (tbodyElement.id === 'tbody-paralisados') {
                        buttonsHtml = `
                            <button class="btn btn-sm btn-info btn-ver-comentarios" data-id="${lancamento.id}" title="Ver Comentários" data-bs-toggle="modal" data-bs-target="#modalComentarios"><i class="bi bi-chat-left-text"></i></button>
                            <button class="btn btn-sm btn-warning btn-retomar" data-id="${lancamento.id}" title="Retomar Lançamento"><i class="bi bi-play-circle"></i></button>
                        `;
                    }
                    td.innerHTML = `<div class="btn-group" role="group">${buttonsHtml}</div>`;
                } else {
                    td.innerHTML = mapaDeCelulas[nomeColuna];
                }

                if (["VISTORIA", "DESMOBILIZAÇÃO", "INSTALAÇÃO", "ATIVAÇÃO", "DOCUMENTAÇÃO"].includes(nomeColuna)) {
                    aplicarEstiloStatus(td, mapaDeCelulas[nomeColuna]);
                }
                tr.appendChild(td);
            });
            tbodyElement.appendChild(tr);
        });
    }

    function getDadosFiltrados() {
        let dadosFiltrados = [...todosLancamentos];

        // 1. Filtro por PERÍODO
        if (filtrosAtivos.periodo) {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            dadosFiltrados = dadosFiltrados.filter(l => {
                const dataAtividade = new Date(l.dataAtividade.split('/').reverse().join('-')); // Converte DD/MM/YYYY para YYYY-MM-DD

                if (filtrosAtivos.periodo.start && filtrosAtivos.periodo.end) {
                    return dataAtividade >= filtrosAtivos.periodo.start && dataAtividade <= filtrosAtivos.periodo.end;
                }

                switch (filtrosAtivos.periodo) {
                    case 'hoje':
                        return dataAtividade.getTime() === hoje.getTime();
                    case 'ontem':
                        const ontem = new Date(hoje);
                        ontem.setDate(hoje.getDate() - 1);
                        return dataAtividade.getTime() === ontem.getTime();
                    case 'semana':
                        const umaSemanaAtras = new Date(hoje);
                        umaSemanaAtras.setDate(hoje.getDate() - 6);
                        return dataAtividade >= umaSemanaAtras;
                    case 'mes':
                        const umMesAtras = new Date(hoje);
                        umMesAtras.setMonth(hoje.getMonth() - 1);
                        return dataAtividade >= umMesAtras;
                    default:
                        return true
                }
            });
        }

        // 2. Filtro por STATUS DE APROVAÇÃO
        if (filtrosAtivos.status) {
            dadosFiltrados = dadosFiltrados.filter(l => l.situacaoAprovacao === filtrosAtivos.status);
        }

        // 3. Filtro por OS
        if (filtrosAtivos.osId) {
            dadosFiltrados = dadosFiltrados.filter(l => l.os.id == filtrosAtivos.osId);
        }

        return dadosFiltrados;
    }

    async function carregarLancamentos() {
        try {
            const response = await fetch('http://localhost:8080/lancamentos');
            if (!response.ok) throw new Error(`Erro na rede: ${response.statusText}`);

            todosLancamentos = await response.json();
            // Após buscar os dados com sucesso, chama a função para renderizar tudo
            popularFiltroOS();
            renderizarTodasAsTabelas();
        } catch (error) {
            console.error('Falha ao buscar lançamentos:', error);
            mostrarToast('Falha ao carregar dados do servidor.', 'error');
        }
    }

    filtrosAtivos = { periodo: null, status: null, osId: null };

    function getDadosFiltrados() {
        let dadosFiltrados = [...todosLancamentos];

        // 1. Filtro por PERÍODO
        if (filtrosAtivos.periodo) {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            dadosFiltrados = dadosFiltrados.filter(l => {
                // --- INÍCIO DA CORREÇÃO ---
                // Transforma a string "DD/MM/YYYY" em uma data na timezone local, não em UTC.
                const partesData = l.dataAtividade.split('/'); // -> ["15", "07", "2025"]
                // O mês é -1 porque em JavaScript os meses vão de 0 (Janeiro) a 11 (Dezembro).
                const dataAtividade = new Date(partesData[2], partesData[1] - 1, partesData[0]);
                // --- FIM DA CORREÇÃO ---

                if (filtrosAtivos.periodo.start && filtrosAtivos.periodo.end) {
                    return dataAtividade >= filtrosAtivos.periodo.start && dataAtividade <= filtrosAtivos.periodo.end;
                }

                switch (filtrosAtivos.periodo) {
                    case 'hoje':
                        return dataAtividade.getTime() === hoje.getTime();
                    case 'ontem':
                        const ontem = new Date(hoje);
                        ontem.setDate(hoje.getDate() - 1);
                        return dataAtividade.getTime() === ontem.getTime();
                    case 'semana':
                        const umaSemanaAtras = new Date(hoje);
                        umaSemanaAtras.setDate(hoje.getDate() - 6);
                        return dataAtividade >= umaSemanaAtras;
                    case 'mes':
                        const umMesAtras = new Date(hoje);
                        umMesAtras.setMonth(hoje.getMonth() - 1);
                        return dataAtividade >= umMesAtras;
                    default:
                        return true;
                }
            });
        }

        // 2. Filtro por STATUS DE APROVAÇÃO
        if (filtrosAtivos.status) {
            dadosFiltrados = dadosFiltrados.filter(l => l.situacaoAprovacao === filtrosAtivos.status);
        }

        // 3. Filtro por OS
        if (filtrosAtivos.osId) {
            dadosFiltrados = dadosFiltrados.filter(l => l.os.id == filtrosAtivos.osId);
        }

        return dadosFiltrados;
    }

    function renderizarTodasAsTabelas() {
        const dadosParaExibir = getDadosFiltrados();

        const statusPendentes = ['PENDENTE_COORDENADOR', 'AGUARDANDO_EXTENSAO_PRAZO', 'PENDENTE_CONTROLLER'];
        const statusRejeitados = ['RECUSADO_COORDENADOR', 'RECUSADO_CONTROLLER'];

        // Filtra os dados para cada aba
        const rascunhos = dadosParaExibir.filter(l => l.situacaoAprovacao === 'RASCUNHO');
        const pendentesAprovacao = dadosParaExibir.filter(l => statusPendentes.includes(l.situacaoAprovacao));
        const minhasPendencias = dadosParaExibir.filter(l => statusRejeitados.includes(l.situacaoAprovacao));
        const historico = dadosParaExibir.filter(l => !['RASCUNHO', ...statusPendentes, ...statusRejeitados].includes(l.situacaoAprovacao));
        const paralisados = getProjetosParalisados();

        // Renderiza cada tabela
        renderizarTabela(rascunhos, tbodyLancamentos, colunasLancamentos);
        renderizarTabela(pendentesAprovacao, tbodyPendentes, colunasPrincipais);
        renderizarTabela(minhasPendencias, tbodyMinhasPendencias, colunasMinhasPendencias);
        renderizarTabela(historico, tbodyHistorico, colunasPrincipais);
        renderizarTabela(paralisados, tbodyParalisados, colunasMinhasPendencias);

        // Atualiza a notificação
        if (notificacaoPendencias) {
            notificacaoPendencias.textContent = minhasPendencias.length;
            notificacaoPendencias.style.display = minhasPendencias.length > 0 ? '' : 'none';
        }
    }

    // ==========================================================
    // SEÇÃO 3: LÓGICA DO MODAL
    // ==========================================================
    const modalAdicionarEl = document.getElementById('modalAdicionar');
    const modalAdicionar = modalAdicionarEl ? new bootstrap.Modal(modalAdicionarEl) : null;

    if (modalAdicionarEl) {
        const formAdicionar = document.getElementById('formAdicionar');
        const modalTitle = document.getElementById('modalAdicionarLabel');
        const submitButton = document.getElementById('btnSubmitAdicionar');


        const selectOS = document.getElementById('osId');
        const selectPrestador = document.getElementById('prestadorId');
        const selectEtapaGeral = document.getElementById('etapaGeralSelect');
        const selectEtapaDetalhada = document.getElementById('etapaDetalhadaId');
        const selectStatus = document.getElementById('status');
        let todasAsOS = [];
        let todasAsEtapas = [];

        async function popularSelect(selectElement, url, valueField, textFieldFormatter) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Falha ao carregar dados: ${response.statusText}`);
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

        async function popularDropdownsDependentes(etapaGeralId, etapaDetalhadaId) {
            // Lógica para popular a Etapa Detalhada (continua igual)
            const etapaSelecionada = todasAsEtapas.find(etapa => etapa.id == etapaGeralId);
            selectEtapaDetalhada.innerHTML = '<option value="" selected disabled>Selecione...</option>';
            selectEtapaDetalhada.disabled = true;

            if (etapaSelecionada && etapaSelecionada.etapasDetalhadas.length > 0) {
                etapaSelecionada.etapasDetalhadas.forEach(detalhe => {
                    selectEtapaDetalhada.add(new Option(`${detalhe.indice} - ${detalhe.nome}`, detalhe.id));
                });
                selectEtapaDetalhada.disabled = false;
                // Se um ID já veio pré-selecionado (modo edição), seleciona ele
                if (etapaDetalhadaId) {
                    selectEtapaDetalhada.value = etapaDetalhadaId;
                }
            }

            // --- INÍCIO DA CORREÇÃO ---
            // Lógica para popular o Status, agora de forma mais segura

            selectStatus.innerHTML = '<option value="" selected disabled>Selecione...</option>';
            selectStatus.disabled = true;

            if (etapaDetalhadaId) {
                let statusDaEtapa = [];
                // Procura em todas as etapas gerais pela etapa detalhada com o ID correto
                for (const etapaGeral of todasAsEtapas) {
                    const etapaEncontrada = etapaGeral.etapasDetalhadas.find(detalhe => detalhe.id == etapaDetalhadaId);
                    if (etapaEncontrada) {
                        statusDaEtapa = etapaEncontrada.status || [];
                        break; // Para a busca quando encontrar
                    }
                }

                // Se encontrou uma lista de status, popula o select
                if (statusDaEtapa.length > 0) {
                    statusDaEtapa.forEach(status => {
                        selectStatus.add(new Option(status, status));
                    });
                    selectStatus.disabled = false;
                }
            }
            // --- FIM DA CORREÇÃO ---
        }

        async function carregarDadosParaModal() {
            // O 'if' garante que a busca na API só aconteça uma vez, para otimizar.
            if (todasAsOS.length === 0) {
                todasAsOS = await popularSelect(selectOS, 'http://localhost:8080/os', 'id', (item) => item.os);
            }
            if (selectPrestador.options.length <= 1) {
                await popularSelect(selectPrestador, 'http://localhost:8080/index/prestadores', 'id', (item) => `${item.codigoPrestador} - ${item.prestador}`);
            }
            if (todasAsEtapas.length === 0) {
                todasAsEtapas = await popularSelect(selectEtapaGeral, 'http://localhost:8080/index/etapas', 'id', (item) => `${item.codigo} - ${item.nome}`);
            }
        }

        async function abrirModalParaEdicao(lancamento, editingId) {
            // Passo 1: Garante que os dados para todos os selects estejam carregados antes de continuar.
            await carregarDadosParaModal();

            // Passo 2: Prepara o formulário e os botões
            formAdicionar.dataset.editingId = editingId;

            // --- INÍCIO DA LÓGICA DE CONTROLE DE BOTÕES E TÍTULO ---
            const btnSubmitPadrao = document.getElementById('btnSubmitAdicionar');
            const btnSalvarRascunho = document.getElementById('btnSalvarRascunho');
            const btnSalvarEEnviar = document.getElementById('btnSalvarEEnviar');

            // Esconde todos os botões de ação por padrão
            btnSubmitPadrao.style.display = 'none';
            btnSalvarRascunho.style.display = 'none';
            btnSalvarEEnviar.style.display = 'none';

            if (lancamento.situacaoAprovacao === 'RASCUNHO') {
                // Se for um RASCUNHO, mostra as opções de Salvar ou Salvar e Enviar
                modalTitle.innerHTML = `<i class="bi bi-pencil"></i> Editar Rascunho #${lancamento.id}`;
                btnSalvarRascunho.style.display = 'inline-block';
                btnSalvarEEnviar.style.display = 'inline-block';
            } else {
                // Se for REJEITADO ou para RETOMAR, mostra o botão de ação padrão
                btnSubmitPadrao.style.display = 'inline-block';
                if (editingId) {
                    modalTitle.innerHTML = `<i class="bi bi-pencil-square"></i> Editar Lançamento #${editingId}`;
                    btnSubmitPadrao.innerHTML = `<i class="bi bi-send-check"></i> Salvar e Reenviar`;
                } else {
                    modalTitle.innerHTML = `<i class="bi bi-play-circle"></i> Retomar Lançamento (Novo)`;
                    btnSubmitPadrao.innerHTML = `<i class="bi bi-check-circle"></i> Criar Lançamento`;
                }
            }
            // --- FIM DA LÓGICA DE CONTROLE DE BOTÕES E TÍTULO ---

            // Trava campos que não podem ser alterados na edição
            document.getElementById('osId').disabled = true;
            document.getElementById('dataAtividade').disabled = true;

            // Passo 3: Preenche todos os campos do formulário com os dados do lançamento
            document.getElementById('dataAtividade').value = lancamento.dataAtividade || '';
            document.getElementById('equipe').value = lancamento.equipe || '';
            document.getElementById('detalheDiario').value = lancamento.detalheDiario || '';
            document.getElementById('valor').value = (lancamento.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            ['vistoria', 'desmobilizacao', 'instalacao', 'ativacao', 'documentacao'].forEach(k => document.getElementById(k).value = lancamento[k] || 'N/A');
            ['planoVistoria', 'planoDesmobilizacao', 'planoInstalacao', 'planoAtivacao', 'planoDocumentacao'].forEach(k => document.getElementById(k).value = lancamento[k] || '');

            if (lancamento.os) {
                selectOS.value = lancamento.os.id;
                preencherCamposOS(lancamento.os.id);
            }
            if (lancamento.prestador) {
                selectPrestador.value = lancamento.prestador.id;
            }

            if (lancamento.etapa && lancamento.etapa.id) {
                const etapaGeralPai = todasAsEtapas.find(eg => eg.etapasDetalhadas.some(ed => ed.id === lancamento.etapa.id));
                if (etapaGeralPai) {
                    selectEtapaGeral.value = etapaGeralPai.id;
                    await popularDropdownsDependentes(etapaGeralPai.id, lancamento.etapa.id);
                    selectEtapaDetalhada.value = lancamento.etapa.id;
                }
            } else {
                selectEtapaGeral.value = '';
                await popularDropdownsDependentes('', null);
            }

            const selectStatus = document.getElementById('status');
            if (lancamento.status && !selectStatus.querySelector(`option[value="${lancamento.status}"]`)) {
                selectStatus.add(new Option(lancamento.status, lancamento.status, true, true));
            } else {
                selectStatus.value = lancamento.status || '';
            }

            const selectSituacao = document.getElementById('situacao');
            if (lancamento.situacao && !selectSituacao.querySelector(`option[value="${lancamento.situacao}"]`)) {
                selectSituacao.add(new Option(lancamento.situacao, lancamento.situacao, true, true));
            } else {
                selectSituacao.value = lancamento.situacao || 'Não iniciado';
            }

            // Passo 4: Finalmente, mostra o modal
            const modalEl = document.getElementById('modalAdicionar');
            const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modalInstance.show();
        }

        modalAdicionarEl.addEventListener('show.bs.modal', async () => {
            // Se o modal não foi acionado por um botão de edição (ou seja, se é um NOVO lançamento)
            await carregarDadosParaModal();

            if (!formAdicionar.dataset.editingId) {
                modalTitle.innerHTML = '<i class="bi bi-plus-circle"></i> Adicionar Nova Atividade';
                submitButton.innerHTML = '<i class="bi bi-check-circle"></i> Salvar Lançamento';
                document.getElementById('osId').disabled = false;
                document.getElementById('dataAtividade').disabled = false;
            }
        });

        modalAdicionarEl.addEventListener('hidden.bs.modal', () => {
            formAdicionar.reset();
            delete formAdicionar.dataset.editingId;
            selectEtapaDetalhada.innerHTML = '<option value="" selected disabled>Primeiro, selecione a etapa geral</option>';
            selectEtapaDetalhada.disabled = true;
            selectStatus.innerHTML = '<option value="" selected disabled>Primeiro, selecione a etapa detalhada</option>';
            selectStatus.disabled = true;
            document.getElementById('osId').disabled = false;
        });

        document.body.addEventListener('click', async (e) => {
            const reenviarBtn = e.target.closest('.btn-reenviar, .btn-editar-rascunho, .btn-retomar');
            const comentariosBtn = e.target.closest('.btn-ver-comentarios');
            const submeterBtn = e.target.closest('.btn-submeter-agora');

            if (reenviarBtn) { // Botões que abrem o modal de edição/criação
                const originalContent = reenviarBtn.innerHTML;
                try {
                    reenviarBtn.disabled = true;
                    reenviarBtn.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

                    const lancamentoId = reenviarBtn.dataset.id;
                    const lancamento = todosLancamentos.find(l => l.id == lancamentoId);

                    if (lancamento) {
                        // --- INÍCIO DA CORREÇÃO ---
                        // Verifica se o botão é de 'retomar'. Se for, não há ID de edição (será um novo lançamento).
                        // Caso contrário, passamos o ID do lançamento que será editado.
                        const isRetomar = reenviarBtn.classList.contains('btn-retomar');
                        await abrirModalParaEdicao(lancamento, isRetomar ? null : lancamento.id);
                        // --- FIM DA CORREÇÃO ---
                    } else {
                        throw new Error('Lançamento não encontrado.');
                    }
                } catch (error) {
                    console.error("Erro ao preparar modal:", error);
                    mostrarToast(error.message, 'error');
                } finally {
                    reenviarBtn.disabled = false;
                    reenviarBtn.innerHTML = originalContent;
                }
            } else if (comentariosBtn) {
                const lancamento = todosLancamentos.find(l => l.id == comentariosBtn.dataset.id);
                if (lancamento) exibirComentarios(lancamento);
                else mostrarToast('Lançamento não encontrado.', 'error');

            } else if (submeterBtn) {
                const lancamentoId = submeterBtn.dataset.id;

                // Pega o botão de confirmação do novo modal
                const btnConfirmar = document.getElementById('btnConfirmarSubmissao');

                // Guarda o ID do lançamento no botão de confirmação para usá-lo depois
                btnConfirmar.dataset.lancamentoId = lancamentoId;

                // Abre o modal de confirmação
                const modalConfirmacao = new bootstrap.Modal(document.getElementById('modalConfirmarSubmissao'));
                modalConfirmacao.show();
            }
        });

        function getProjetosParalisados() {
            const ultimosLancamentos = new Map();
            // Primeiro, agrupa todos os lançamentos por projeto (OS+LPU)
            todosLancamentos.forEach(l => {
                const chaveProjeto = `${l.os.id}-${l.os.lpu.id}`;
                // Guarda apenas o lançamento mais recente de cada projeto
                if (!ultimosLancamentos.has(chaveProjeto) || l.id > ultimosLancamentos.get(chaveProjeto).id) {
                    ultimosLancamentos.set(chaveProjeto, l);
                }
            });
            // Agora, filtra apenas os projetos cujo último lançamento está "Paralisado"
            return Array.from(ultimosLancamentos.values()).filter(l => l.situacao === 'Paralisado');
        }

        // Listener para o botão de confirmação final de submissão
        document.getElementById('btnConfirmarSubmissao').addEventListener('click', async function (e) {
            const confirmButton = e.currentTarget;
            const id = confirmButton.dataset.lancamentoId;

            if (!id) return;

            const originalContent = confirmButton.innerHTML;
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('modalConfirmarSubmissao'));

            try {
                // Lógica de "carregando..."
                confirmButton.disabled = true;
                confirmButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Enviando...`;

                const resposta = await fetch(`http://localhost:8080/lancamentos/${id}/submeter`, { method: 'POST' });
                if (!resposta.ok) {
                    const erroData = await resposta.json();
                    throw new Error(erroData.message || 'Erro ao submeter.');
                }

                mostrarToast('Lançamento submetido com sucesso!', 'success');

                // Recarrega os dados para atualizar as tabelas
                await carregarLancamentos();
                renderizarTodasAsTabelas();

            } catch (error) {
                mostrarToast(error.message, 'error');
            } finally {
                // Restaura o botão e esconde o modal
                confirmButton.disabled = false;
                confirmButton.innerHTML = originalContent;
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        });

        // Função central para lidar com o envio do formulário, chamada por diferentes botões
        async function handleFormSubmit(acao, submitButton) {
            const editingId = formAdicionar.dataset.editingId;

            // Lógica de "carregando..." no botão que foi clicado
            const originalContent = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Carregando...`;

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
                situacao: document.getElementById('situacao').value,
                detalheDiario: document.getElementById('detalheDiario').value,
                valor: parseFloat(document.getElementById('valor').value.replace(/\./g, '').replace(',', '.')) || 0,
            };

            // Define o status de aprovação e o método HTTP com base na ação
            let method = 'POST';
            let url = 'http://localhost:8080/lancamentos';

            if (acao === 'salvar') { // Salvar alterações de um Rascunho
                dadosParaEnviar.situacaoAprovacao = 'RASCUNHO';
                method = 'PUT';
                url = `http://localhost:8080/lancamentos/${editingId}`;
            } else if (acao === 'enviar') { // Salvar e Enviar um Rascunho
                dadosParaEnviar.situacaoAprovacao = 'PENDENTE_COORDENADOR';
                method = 'PUT';
                url = `http://localhost:8080/lancamentos/${editingId}`;
            } else if (acao === 'reenviar') { // Reenviar um item Rejeitado
                dadosParaEnviar.situacaoAprovacao = 'PENDENTE_COORDENADOR';
                method = 'PUT';
                url = `http://localhost:8080/lancamentos/${editingId}`;
            }
            // Se a acao for 'criar' (Retomar ou Novo), o método e URL padrão são usados

            try {
                const resposta = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosParaEnviar)
                });
                if (!resposta.ok) throw new Error((await resposta.json()).message || 'Erro ao salvar.');

                mostrarToast('Ação realizada com sucesso!', 'success');
                modalAdicionar.hide();
                await carregarLancamentos();
                renderizarTodasAsTabelas();

            } catch (erro) {
                mostrarToast(erro.message, 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalContent;
            }
        }

        // Listener para o botão 'Salvar e Enviar' (de um rascunho)
        document.getElementById('btnSalvarEEnviar').addEventListener('click', function (e) {
            handleFormSubmit('enviar', e.currentTarget);
        });

        // Listener para o botão 'Salvar Alterações' (só salva como rascunho)
        document.getElementById('btnSalvarRascunho').addEventListener('click', function (e) {
            handleFormSubmit('salvar', e.currentTarget);
        });

        // Listener para o botão de submit padrão (usado para Criar Novo e para Reenviar Rejeitado)
        document.getElementById('btnSubmitAdicionar').addEventListener('click', function (e) {
            const editingId = formAdicionar.dataset.editingId;
            // Se tem um ID, a ação é 'reenviar'. Se não, é 'criar'.
            handleFormSubmit(editingId ? 'reenviar' : 'criar', e.currentTarget);
        });



        selectOS.addEventListener('change', (e) => preencherCamposOS(e.target.value));
        selectEtapaGeral.addEventListener('change', (e) => popularDropdownsDependentes(e.target.value, null, null));
        selectEtapaDetalhada.addEventListener('change', (e) => {
            const etapaGeralId = selectEtapaGeral.value;
            popularDropdownsDependentes(etapaGeralId, e.target.value, null);
        });
    }

    function exibirComentarios(lancamento) {
        const modalBody = document.getElementById('modalComentariosBody');
        const modalTitle = document.getElementById('modalComentariosLabel');

        modalTitle.textContent = `Comentários do Lançamento`;
        modalBody.innerHTML = ''; // Limpa o conteúdo anterior

        if (!lancamento.comentarios || lancamento.comentarios.length === 0) {
            modalBody.innerHTML = '<p class="text-muted text-center">Nenhum comentário para este lançamento.</p>';
            return;
        }

        // Ordena os comentários do mais recente para o mais antigo (opcional, mas bom para UX)
        const comentariosOrdenados = [...lancamento.comentarios].sort((a, b) => {
            // Função de ordenação robusta que também lida com o parse da data
            const parseDate = (str) => {
                const [date, time] = str.split(' ');
                const [day, month, year] = date.split('/');
                const [hour, minute] = time.split(':');
                return new Date(year, month - 1, day, hour, minute);
            };
            return parseDate(b.dataHora) - parseDate(a.dataHora);
        });

        comentariosOrdenados.forEach(comentario => {
            const comentarioCard = document.createElement('div');
            comentarioCard.className = 'card mb-3';

            // --- INÍCIO DA CORREÇÃO ---
            // Desmonta a string 'DD/MM/YYYY HH:mm' para criar uma data válida
            const partes = comentario.dataHora.split(' ');         // -> ["15/07/2025", "20:39"]
            const dataPartes = partes[0].split('/');             // -> ["15", "07", "2025"]
            const tempoPartes = partes[1].split(':');            // -> ["20", "39"]

            // Formato para o construtor: new Date(ano, mês - 1, dia, hora, minuto)
            // O mês é -1 porque em JavaScript os meses vão de 0 (Janeiro) a 11 (Dezembro)
            const dataValida = new Date(dataPartes[2], dataPartes[1] - 1, dataPartes[0], tempoPartes[0], tempoPartes[1]);

            // Formata a data válida para o padrão brasileiro
            const dataFormatada = dataValida.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
            // --- FIM DA CORREÇÃO ---

            comentarioCard.innerHTML = `
                <div class="card-header bg-light d-flex justify-content-between align-items-center small">
                    <strong><i class="bi bi-person-circle me-2"></i>${comentario.autor.nome}</strong>
                    <span class="text-muted">${dataFormatada}</span>
                </div>
                <div class="card-body">
                    <p class="card-text">${comentario.texto}</p>
                </div>
            `;
            modalBody.appendChild(comentarioCard);
        });
    }

    // --- LÓGICA DOS FILTROS ---
    const filtroDataCustomEl = document.getElementById('filtroDataCustom');
    const filtroStatusEl = document.getElementById('filtroStatusAprovacao');
    const filtroOsEl = document.getElementById('filtroOS');
    const btnLimparFiltros = document.getElementById('limparFiltros');

    const calendario = flatpickr(filtroDataCustomEl, {
        mode: "range", dateFormat: "d/m/Y", locale: "pt",
        onClose: function (selectedDates) {
            if (selectedDates.length === 2) {
                filtrosAtivos.periodo = { start: selectedDates[0], end: selectedDates[1] };
                renderizarTodasAsTabelas();
            }
        }
    });

    function popularFiltroOS() {
        const osUnicas = [...new Map(todosLancamentos.map(l => [l.os.id, l.os])).values()]
            .sort((a, b) => a.os.localeCompare(b.os));
        osUnicas.forEach(os => filtroOsEl.add(new Option(os.os, os.id)));
    }

    document.querySelector('.dropdown-menu.p-3').addEventListener('click', (e) => {
        if (e.target.matches('[data-filter="periodo"]')) {
            filtrosAtivos.periodo = e.target.dataset.value;
            calendario.clear();
            renderizarTodasAsTabelas();
        }
    });

    filtroStatusEl.addEventListener('change', (e) => {
        filtrosAtivos.status = e.target.value;
        renderizarTodasAsTabelas();
    });

    filtroOsEl.addEventListener('change', (e) => {
        filtrosAtivos.osId = e.target.value;
        renderizarTodasAsTabelas();
    });

    btnLimparFiltros.addEventListener('click', () => {
        filtrosAtivos = { periodo: null, status: null, osId: null };
        calendario.clear();
        filtroStatusEl.value = "";
        filtroOsEl.value = "";
        renderizarTodasAsTabelas();
    });

    // ==========================================================
    // SEÇÃO 4: EXECUÇÃO INICIAL
    // ==========================================================
    function inicializarCabecalhos() {
        renderizarCabecalho(colunasLancamentos, document.querySelector('#lancamentos-pane thead'));
        renderizarCabecalho(colunasPrincipais, document.querySelector('#pendentes-pane thead'));
        renderizarCabecalho(colunasPrincipais, document.querySelector('#historico-pane thead'));
        renderizarCabecalho(colunasMinhasPendencias, document.querySelector('#minhasPendencias-pane thead'));
    }

    inicializarCabecalhos();
    carregarLancamentos();
});