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
    const notificacaoPendencias = document.getElementById('notificacao-pendencias');
    let todosLancamentos = []; // Armazena todos os lançamentos para fácil acesso

    const colunasPrincipais = ["STATUS APROVAÇÃO", "DATA ATIVIDADE", "OS", "SITE", "SEGMENTO", "PROJETO", "LPU", "GESTOR TIM", "REGIONAL", "EQUIPE", "VISTORIA", "PLANO DE VISTORIA", "DESMOBILIZAÇÃO", "PLANO DE DESMOBILIZAÇÃO", "INSTALAÇÃO", "PLANO DE INSTALAÇÃO", "ATIVAÇÃO", "PLANO DE ATIVAÇÃO", "DOCUMENTAÇÃO", "PLANO DE DOCUMENTAÇÃO", "ETAPA GERAL", "ETAPA DETALHADA", "STATUS", "SITUAÇÃO", "DETALHE DIÁRIO", "CÓD. PRESTADOR", "PRESTADOR", "VALOR", "GESTOR"];
    const colunasLancamentos = colunasPrincipais.filter(coluna => coluna !== "STATUS APROVAÇÃO");
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
                    td.innerHTML = `
                        <div class="btn-group" role="group" aria-label="Ações do Lançamento">
                            <button class="btn btn-sm btn-info btn-ver-comentarios" data-id="${lancamento.id}" title="Ver Comentários" data-bs-toggle="modal" data-bs-target="#modalComentarios">
                                <i class="bi bi-chat-left-text"></i>
                            </button>
                            <button class="btn btn-sm btn-success btn-reenviar" data-id="${lancamento.id}" title="Corrigir e Reenviar para Aprovação">
                                <i class="bi bi-pencil-square"></i> Editar e Reenviar
                            </button>
                        </div>
                    `;
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

    async function carregarLancamentos() {
        try {
            const response = await fetch('http://localhost:8080/lancamentos');
            if (!response.ok) throw new Error(`Erro na rede: ${response.statusText}`);
            todosLancamentos = await response.json();

            const statusPendentesAprovacao = ['PENDENTE_COORDENADOR', 'AGUARDANDO_EXTENSAO_PRAZO', 'PENDENTE_CONTROLLER'];
            const statusRejeitados = ['RECUSADO_COORDENADOR', 'RECUSADO_CONTROLLER'];

            const rascunhos = todosLancamentos.filter(l => l.situacaoAprovacao === 'RASCUNHO');
            const pendentesAprovacao = todosLancamentos.filter(l => statusPendentesAprovacao.includes(l.situacaoAprovacao));
            const minhasPendencias = todosLancamentos.filter(l => statusRejeitados.includes(l.situacaoAprovacao));
            const historico = todosLancamentos.filter(l => !['RASCUNHO', ...statusPendentesAprovacao, ...statusRejeitados].includes(l.situacaoAprovacao));

            renderizarTabela(rascunhos, tbodyLancamentos, colunasLancamentos);
            renderizarTabela(pendentesAprovacao, tbodyPendentes, colunasPrincipais);
            renderizarTabela(historico, tbodyHistorico, colunasPrincipais);
            renderizarTabela(minhasPendencias, tbodyMinhasPendencias, colunasMinhasPendencias);

            if (notificacaoPendencias) {
                if (minhasPendencias.length > 0) {
                    notificacaoPendencias.textContent = minhasPendencias.length;
                    notificacaoPendencias.style.display = '';
                } else {
                    notificacaoPendencias.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Falha ao buscar lançamentos:', error);
            mostrarToast('Falha ao carregar dados do servidor.', 'error');
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

        async function popularDropdownsDependentes(etapaGeralId, etapaDetalhadaId, statusValor) {
            const etapaSelecionada = todasAsEtapas.find(etapa => etapa.id == etapaGeralId);
            selectEtapaDetalhada.innerHTML = '<option value="" selected disabled>Selecione...</option>';
            if (etapaSelecionada && etapaSelecionada.etapasDetalhadas.length > 0) {
                etapaSelecionada.etapasDetalhadas.forEach(detalhe => {
                    const option = document.createElement('option');
                    option.value = detalhe.id;
                    option.textContent = `${detalhe.indice} - ${detalhe.nome}`;
                    selectEtapaDetalhada.appendChild(option);
                });
                selectEtapaDetalhada.disabled = false;
                if (etapaDetalhadaId) selectEtapaDetalhada.value = etapaDetalhadaId;
            } else {
                selectEtapaDetalhada.disabled = true;
            }

            selectStatus.innerHTML = '<option value="" selected disabled>Selecione...</option>';
            if (etapaDetalhadaId) {
                let statusDaEtapa = [];
                for (const etapaGeral of todasAsEtapas) {
                    const etapaEncontrada = etapaGeral.etapasDetalhadas.find(detalhe => detalhe.id == etapaDetalhadaId);
                    if (etapaEncontrada) {
                        statusDaEtapa = etapaEncontrada.status || [];
                        break;
                    }
                }
                if (statusDaEtapa.length > 0) {
                    statusDaEtapa.forEach(status => {
                        const option = document.createElement('option');
                        option.value = status;
                        option.textContent = status;
                        selectStatus.appendChild(option);
                    });
                }

                // --- INÍCIO DA LÓGICA CORRIGIDA E À PROVA DE FALHAS ---
                // Este bloco substitui o antigo 'if (statusValor) selectStatus.value = statusValor;'
                if (statusValor) {
                    // Verifica se a opção com o valor desejado já existe no select
                    const optionExists = selectStatus.querySelector(`option[value="${statusValor}"]`);

                    if (!optionExists) {
                        // Se não existir, cria uma nova opção, adiciona ao select e já a deixa selecionada.
                        // Isso garante que o valor do lançamento (mesmo que "inválido" para a etapa) seja exibido.
                        selectStatus.add(new Option(statusValor, statusValor, true, true));
                    } else {
                        // Se a opção já existe, apenas a seleciona.
                        selectStatus.value = statusValor;
                    }
                }
                // --- FIM DA LÓGICA CORRIGIDA ---
            }
        }

        async function abrirModalParaEdicao(lancamento) {
            // --- INÍCIO DA CORREÇÃO ---
            // Garante que os dados para os selects sejam carregados ANTES de continuar.
            // O 'if' garante que isso só aconteça uma vez (na primeira vez que for necessário).
            if (todasAsOS.length === 0) {
                todasAsOS = await popularSelect(selectOS, 'http://localhost:8080/os', 'id', (item) => item.os);
            }
            if (selectPrestador.options.length <= 1) { // <= 1 para contar a opção "Selecione..."
                await popularSelect(selectPrestador, 'http://localhost:8080/index/prestadores', 'id', (item) => `${item.codigoPrestador} - ${item.prestador}`);
            }
            if (todasAsEtapas.length === 0) {
                todasAsEtapas = await popularSelect(selectEtapaGeral, 'http://localhost:8080/index/etapas', 'id', (item) => `${item.codigo} - ${item.nome}`);
            }
            // --- FIM DA CORREÇÃO ---


            // Prepara o formulário para o modo de edição
            formAdicionar.dataset.editingId = lancamento.id;
            modalTitle.innerHTML = `<i class="bi bi-pencil-square"></i> Editar e Reenviar Lançamento #${lancamento.id}`;
            submitButton.innerHTML = `<i class="bi bi-send-check"></i> Enviar para Aprovação`;

            // Trava campos não editáveis
            document.getElementById('osId').disabled = true;
            document.getElementById('dataAtividade').disabled = true;

            // Preenche campos de texto e data
            document.getElementById('dataAtividade').value = lancamento.dataAtividade || '';
            document.getElementById('equipe').value = lancamento.equipe || '';
            document.getElementById('detalheDiario').value = lancamento.detalheDiario || '';
            document.getElementById('valor').value = (lancamento.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            ['vistoria', 'desmobilizacao', 'instalacao', 'ativacao', 'documentacao'].forEach(k => document.getElementById(k).value = lancamento[k] || 'N/A');
            ['planoVistoria', 'planoDesmobilizacao', 'planoInstalacao', 'planoAtivacao', 'planoDocumentacao'].forEach(k => document.getElementById(k).value = lancamento[k] || '');

            // Popula campos de relacionamento (com verificações)
            if (lancamento.os) {
                selectOS.value = lancamento.os.id;
                preencherCamposOS(lancamento.os.id);
            }
            if (lancamento.prestador) {
                selectPrestador.value = lancamento.prestador.id;
            }

            // Lógica para popular e selecionar Etapas e Status
            if (lancamento.etapa && lancamento.etapa.id) {
                const etapaGeralPai = todasAsEtapas.find(eg => eg.etapasDetalhadas.some(ed => ed.id === lancamento.etapa.id));
                if (etapaGeralPai) {
                    selectEtapaGeral.value = etapaGeralPai.id;
                    // Passa o valor do status para a função auxiliar
                    await popularDropdownsDependentes(etapaGeralPai.id, lancamento.etapa.id, lancamento.status);
                }
            } else {
                selectEtapaGeral.value = '';
                await popularDropdownsDependentes('', null, null);
            }

            // Lógica "à prova de falhas" para o select de Situação
            const selectSituacao = document.getElementById('situacao');
            if (lancamento.situacao && !selectSituacao.querySelector(`option[value="${lancamento.situacao}"]`)) {
                selectSituacao.add(new Option(lancamento.situacao, lancamento.situacao, true, true));
            } else {
                selectSituacao.value = lancamento.situacao || 'Não iniciado';
            }

            // Finalmente, mostra o modal
            const modalEl = document.getElementById('modalAdicionar');
            const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modalInstance.show();
        }

        modalAdicionarEl.addEventListener('show.bs.modal', async () => {
            // Se o modal não foi acionado por um botão de edição (ou seja, se é um NOVO lançamento)
            if (!formAdicionar.dataset.editingId) {
                modalTitle.innerHTML = '<i class="bi bi-plus-circle"></i> Adicionar Nova Atividade';
                submitButton.innerHTML = '<i class="bi bi-check-circle"></i> Salvar Lançamento';
                document.getElementById('osId').disabled = false;
                document.getElementById('dataAtividade').disabled = false; // Garante que está habilitado para novos
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

        document.body.addEventListener('click', async function (e) {
            const reenviarButton = e.target.closest('.btn-reenviar');
            const comentariosButton = e.target.closest('.btn-ver-comentarios');

            // --- LÓGICA PARA O BOTÃO "EDITAR E REENVIAR" ---
            if (reenviarButton) {
                // Guarda o conteúdo original do botão para restaurá-lo depois
                const originalContent = reenviarButton.innerHTML;

                try {
                    // --- INÍCIO: LÓGICA DO ESTADO DE CARREGAMENTO ---
                    reenviarButton.disabled = true;
                    reenviarButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Carregando...`;
                    // --- FIM: LÓGICA DO ESTADO DE CARREGAMENTO ---

                    const lancamentoId = reenviarButton.dataset.id;
                    const lancamentoParaEditar = todosLancamentos.find(l => l.id == lancamentoId);

                    if (lancamentoParaEditar) {
                        // O 'await' é crucial. Ele faz o código esperar a função terminar
                        // (incluindo as buscas na API) antes de ir para o 'finally'.
                        await abrirModalParaEdicao(lancamentoParaEditar);
                    } else {
                        throw new Error('Lançamento não encontrado para edição.');
                    }
                } catch (error) {
                    // Em caso de erro, exibe uma mensagem
                    console.error("Erro ao preparar modal de edição:", error);
                    mostrarToast(error.message, 'error');
                } finally {
                    // --- INÍCIO: REVERTE O BOTÃO AO ESTADO ORIGINAL ---
                    // Este bloco é executado sempre, após o try (ou o catch) terminar.
                    reenviarButton.disabled = false;
                    reenviarButton.innerHTML = originalContent;
                    // --- FIM: REVERTE O BOTÃO AO ESTADO ORIGINAL ---
                }
            }
            // --- LÓGICA PARA O BOTÃO "VER COMENTÁRIOS" ---
            else if (comentariosButton) {
                const lancamentoId = comentariosButton.dataset.id;
                const lancamentoParaVer = todosLancamentos.find(l => l.id == lancamentoId);
                if (lancamentoParaVer) {
                    exibirComentarios(lancamentoParaVer);
                } else {
                    mostrarToast('Lançamento não encontrado para ver os comentários.', 'error');
                }
            }
        });



        formAdicionar.addEventListener('submit', async function (e) {
            e.preventDefault();
            const editingId = formAdicionar.dataset.editingId;

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

            const url = editingId ? `http://localhost:8080/lancamentos/${editingId}` : 'http://localhost:8080/lancamentos';
            const method = editingId ? 'PUT' : 'POST';

            try {
                const resposta = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosParaEnviar)
                });
                if (!resposta.ok) {
                    const erroData = await resposta.json();
                    throw new Error(erroData.message || `Erro ${resposta.status}`);
                }
                const successMessage = editingId ? 'Lançamento atualizado e reenviado com sucesso!' : 'Lançamento adicionado com sucesso!';
                mostrarToast(successMessage, 'success');
                modalAdicionar.hide();
                carregarLancamentos();
            } catch (erro) {
                console.error(`Erro ao salvar (${method}) lançamento:`, erro);
                mostrarToast(`Erro ao salvar: ${erro.message}`, 'error');
            }
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