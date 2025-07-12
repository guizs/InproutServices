document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores de Elementos (sem alterações) ---
    const tbodyMateriais = document.getElementById('tbody-cms');
    const btnNovoMaterial = document.getElementById('btnNovoMaterial');
    const modalMaterialEl = document.getElementById('modalMaterial');
    const modalMaterial = new bootstrap.Modal(modalMaterialEl);
    const modalMaterialLabel = document.getElementById('modalMaterialLabel');
    const formMaterial = document.getElementById('formMaterial');
    const materialIdInput = document.getElementById('materialId');
    const materialCodigoInput = document.getElementById('materialCodigo');
    const materialDescricaoInput = document.getElementById('materialDescricao');
    const materialUnidadeInput = document.getElementById('materialUnidade');
    const materialSaldoInput = document.getElementById('materialSaldo');
    const modalFooter = modalMaterialEl.querySelector('.modal-footer');
    const modalExcluirEl = document.getElementById('modalExcluir');
    const modalExcluir = new bootstrap.Modal(modalExcluirEl);
    const nomeMaterialExcluirSpan = document.getElementById('nomeMaterialExcluir');
    const btnConfirmarExclusao = document.getElementById('btnConfirmarExclusao');
    const inputBuscaMaterial = document.getElementById('inputBuscaMaterial');
    const selectCondicaoFiltro = document.getElementById('materiais_selectCondicaoFiltro');
    const inputValorFiltro = document.getElementById('materiais_inputValorFiltro');
    const btnAplicarFiltro = document.getElementById('materiais_btnAplicarFiltro');
    const btnLimparFiltro = document.getElementById('materiais_btnLimparFiltro');
    const checkUnitPC = document.getElementById('materiais_checkUnitPC');
    const checkUnitMT = document.getElementById('materiais_checkUnitMT');
    const modalRecusarEl = document.getElementById('modalRecusarSolicitacao');
    const modalRecusar = new bootstrap.Modal(modalRecusarEl);
    const formRecusarSolicitacao = document.getElementById('formRecusarSolicitacao');
    const descricaoMaterialRecusarSpan = document.getElementById('descricaoMaterialRecusar');
    const motivoRecusaTextarea = document.getElementById('motivoRecusaTextarea');
    const modalAprovarEl = document.getElementById('modalAprovarSolicitacao');
    const modalAprovar = new bootstrap.Modal(modalAprovarEl);
    const itemAprovarInfoSpan = document.getElementById('itemAprovarInfo');
    const btnConfirmarAprovacao = document.getElementById('btnConfirmarAprovacao')
    const modalHistoricoEl = document.getElementById('modalHistoricoDetalhes');
    const modalHistorico = new bootstrap.Modal(modalHistoricoEl);
    const modalHistoricoLabel = document.getElementById('modalHistoricoLabel');
    const historicoDetalhesContent = document.getElementById('historicoDetalhesContent');
    const filtroMaterialSelect = document.getElementById('filtroMaterial');
    const filtroSolicitanteSelect = document.getElementById('filtroSolicitante');
    const inputDataDe = document.getElementById('inputDataDe');
    const inputDataAte = document.getElementById('inputDataAte');
    const btnAplicarFiltroHistorico = document.getElementById('btnAplicarFiltroHistorico');
    const btnLimparFiltroHistorico = document.getElementById('btnLimparFiltroHistorico');

    if (inputDataDe && inputDataAte) {
        flatpickr(inputDataDe, { dateFormat: "d/m/Y", locale: "pt" });
        flatpickr(inputDataAte, { dateFormat: "d/m/Y", locale: "pt" });
    }

    let todosOsMateriais = [];
    let historicoDeSolicitacoes = [];

    const API_BASE_URL = 'http://localhost:8080';

    // --- As funções carregarMateriais e renderizarTabelaMateriais continuam as mesmas ---
    async function carregarMateriais() {
        if (typeof toggleLoader === 'function') toggleLoader(true);
        try {
            const response = await fetch(`${API_BASE_URL}/materiais`);
            if (!response.ok) throw new Error('Erro ao carregar materiais');

            // 1. Guarda a lista completa na nossa variável de cache
            todosOsMateriais = await response.json();

            // 2. Chama a nova função central para renderizar a tabela com os filtros atuais (nenhum, no início)
            aplicarFiltrosErenderizar();

        } catch (error) {
            mostrarToast(error.message, 'error');
            tbodyMateriais.innerHTML = `<tr><td colspan="3" class="text-center text-danger">Falha ao carregar materiais.</td></tr>`;
        } finally {
            if (typeof toggleLoader === 'function') toggleLoader(false);
        }
    }

    // --- NOVA FUNÇÃO: O coração da nova funcionalidade ---
    function aplicarFiltrosErenderizar() {
        let materiaisFiltrados = [...todosOsMateriais];

        // 1. Filtro de BUSCA (sem alteração)
        const termoBusca = inputBuscaMaterial.value.toLowerCase().trim();
        if (termoBusca) {
            materiaisFiltrados = materiaisFiltrados.filter(material =>
                material.codigo.toLowerCase().includes(termoBusca) ||
                material.descricao.toLowerCase().includes(termoBusca)
            );
        }

        // 2. Filtro de QUANTIDADE (sem alteração)
        const condicao = selectCondicaoFiltro.value;
        const valor = parseFloat(inputValorFiltro.value);
        if (!isNaN(valor)) {
            materiaisFiltrados = materiaisFiltrados.filter(material => {
                const saldo = material.saldoFisico;
                if (condicao === 'maior') return saldo > valor;
                if (condicao === 'menor') return saldo < valor;
                if (condicao === 'igual') return saldo === valor;
                return true;
            });
        }

        // 3. Filtro de UNIDADE (ajustado para os novos seletores)
        const unidadesSelecionadas = [];
        if (checkUnitPC.checked) { // <-- MUDOU AQUI
            unidadesSelecionadas.push('PÇ');
        }
        if (checkUnitMT.checked) { // <-- MUDOU AQUI
            unidadesSelecionadas.push('MT');
        }
        if (unidadesSelecionadas.length > 0) {
            materiaisFiltrados = materiaisFiltrados.filter(material =>
                unidadesSelecionadas.includes(material.unidadeMedida)
            );
        }

        // 4. Renderiza a tabela (sem alteração)
        renderizarTabelaMateriais(materiaisFiltrados);
    }

    async function carregarSolicitacoes() {
        try {
            const [pendentesResponse, historicoResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/solicitacoes/pendentes`),
                fetch(`${API_BASE_URL}/solicitacoes/historico`)
            ]);

            if (!pendentesResponse.ok || !historicoResponse.ok) {
                throw new Error('Falha ao carregar dados das solicitações.');
            }

            const pendentes = await pendentesResponse.json();
            const historico = await historicoResponse.json();

            // 1. Ordena os dados como antes
            pendentes.sort((a, b) => new Date(b.dataSolicitacao) - new Date(a.dataSolicitacao));
            historico.sort((a, b) => new Date(b.dataAprovacao) - new Date(a.dataAprovacao));

            // 2. Renderiza a tabela de pendentes (isso não mudou)
            renderizarTabelaPendentes(pendentes);

            // 3. Armazena a lista completa de histórico na variável "cache"
            historicoDeSolicitacoes = historico;

            // 4. Popula os filtros com base na lista completa (só precisa fazer isso uma vez)
            popularFiltrosDoHistorico();

            // 5. Chama a função de filtro, que por sua vez renderizará a tabela com os dados corretos (inicialmente, todos)
            aplicarFiltrosErenderizarHistorico();

        } catch (error) {
            console.error("Erro ao carregar solicitações:", error);
            mostrarToast(error.message, 'error');
            // Adicionar feedback visual de erro nas tabelas, se desejar
            document.getElementById('tbody-solicitacoes-pendentes').innerHTML = `<tr><td colspan="7" class="text-center text-danger">Falha ao carregar solicitações.</td></tr>`;
            document.getElementById('tbody-solicitacoes-historico').innerHTML = `<tr><td colspan="6" class="text-center text-danger">Falha ao carregar histórico.</td></tr>`;
        }
    }

    btnAplicarFiltroHistorico.addEventListener('click', () => {
        aplicarFiltrosErenderizarHistorico();
    });

    btnLimparFiltroHistorico.addEventListener('click', () => {
        filtroMaterialSelect.selectedIndex = 0;
        filtroSolicitanteSelect.selectedIndex = 0;
        // Limpa os campos do flatpickr usando a API dele
        flatpickr(inputDataDe).clear();
        flatpickr(inputDataAte).clear();
        aplicarFiltrosErenderizarHistorico();
    });

    /**
 * Renderiza a tabela de solicitações pendentes.
 * --- VERSÃO CORRIGIDA: Inclui o saldo atual em estoque ---
 * @param {Array} solicitacoes - A lista de solicitações com status PENDENTE.
 */
    function renderizarTabelaPendentes(solicitacoes) {
        const tbody = document.getElementById('tbody-solicitacoes-pendentes');
        const thead = tbody.previousElementSibling;
        tbody.innerHTML = '';

        thead.innerHTML = `
        <tr>
            <th>Material Solicitado</th>
            <th class="text-center">Qtd. Solicitada</th>
            <th class="text-center">Saldo em Estoque</th>
            <th>Solicitante</th>
            <th class="text-center">Data/Hora</th> <th class="text-center">Status</th>
            <th class="text-center">Ações</th>
        </tr>
    `;

        if (solicitacoes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center">Nenhuma solicitação pendente.</td></tr>`;
            return;
        }

        solicitacoes.forEach(solicitacao => {
            solicitacao.itens.forEach(item => {
                const tr = document.createElement('tr');

                if (parseFloat(item.quantidadeSolicitada) > parseFloat(item.material.saldoFisico)) {
                    tr.classList.add('estoque-insuficiente');
                }

                tr.innerHTML = `
    <td data-label="Material">${item.material.descricao}</td>
    <td data-label="Qtd. Solicitada" class="text-center stock-cell">
        <strong class="stock-quantity">${new Intl.NumberFormat('pt-BR').format(item.quantidadeSolicitada)}</strong>
        <small class="stock-unit">${item.material.unidadeMedida}</small>
    </td>
    <td data-label="Saldo em Estoque" class="text-center stock-cell">
        <strong class="stock-quantity">${new Intl.NumberFormat('pt-BR').format(item.material.saldoFisico)}</strong>
        <small class="stock-unit">${item.material.unidadeMedida}</small>
    </td>
    <td data-label="Solicitante">Usuário ID ${solicitacao.idSolicitante}</td>
    <td data-label="Data" class="text-center">${new Date(solicitacao.dataSolicitacao).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td> <td data-label="Status" class="text-center"><span class="badge bg-warning text-dark">Pendente</span></td> <td data-label="Ações" class="text-center">
        <button class="btn btn-success btn-sm btn-aprovar" data-id="${solicitacao.id}" title="Aprovar"><i class="bi bi-check-lg"></i></button>
        <button class="btn btn-danger btn-sm btn-recusar" data-id="${solicitacao.id}" title="Recusar"><i class="bi bi-x-lg"></i></button>
    </td>
`;
                tbody.appendChild(tr);
            });
        });
    }

    /**
 * Renderiza a tabela com o histórico de solicitações.
 * --- VERSÃO ATUALIZADA: Novas colunas e linhas clicáveis ---
 */
    function renderizarTabelaHistorico(solicitacoes) {
        const tbody = document.getElementById('tbody-solicitacoes-historico');
        const thead = tbody.previousElementSibling;
        tbody.innerHTML = '';

        thead.innerHTML = `
        <tr>
            <th>Material Solicitado </th>
            <th class="text-center">Qtd. Solicitada</th>
            <th class="text-center">Saldo Pós-Ação</th>
            <th>Solicitante</th>
            <th class="text-center">Status</th>
            <th class="text-center">Data da Ação</th>
        </tr>
    `;

        if (solicitacoes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">Nenhum histórico de solicitações.</td></tr>`;
            return;
        }

        solicitacoes.forEach(solicitacao => {
            const statusBadge = solicitacao.status === 'APROVADA'
                ? '<span class="badge bg-success">Aprovado</span>'
                : '<span class="badge bg-danger">Recusado</span>';

            const itemPrincipal = solicitacao.itens[0];
            const nomeItem = `${itemPrincipal.material.descricao} ${solicitacao.itens.length > 1 ? `(+${solicitacao.itens.length - 1} outros)` : ''}`;

            const tr = document.createElement('tr');
            tr.className = 'historico-row';
            tr.dataset.id = solicitacao.id;
            tr.style.cursor = 'pointer';

            // --- MUDANÇA: Lógica para formatar o saldo final ---
            // Ele só terá valor se a solicitação foi APROVADA. Se foi recusada, exibimos um traço.
            let saldoFinalHtml = '—';
            if (itemPrincipal.saldoNoMomentoDaAprovacao !== null) {
                saldoFinalHtml = `
                <strong class="stock-quantity">${new Intl.NumberFormat('pt-BR').format(itemPrincipal.saldoNoMomentoDaAprovacao)}</strong>
                <small class="stock-unit">${itemPrincipal.material.unidadeMedida}</small>
            `;
            }

            // --- MUDANÇA: Aplicando o estilo especial nas duas colunas ---
            tr.innerHTML = `
            <td data-label="Material">${nomeItem}</td>
            <td data-label="Qtd. Solicitada" class="text-center stock-cell">
                <strong class="stock-quantity">${new Intl.NumberFormat('pt-BR').format(itemPrincipal.quantidadeSolicitada)}</strong>
                <small class="stock-unit">${itemPrincipal.material.unidadeMedida}</small>
            </td>
            <td data-label="Saldo Pós-Ação" class="text-center stock-cell">
                ${saldoFinalHtml}
            </td>
            <td data-label="Solicitante">Usuário ID ${solicitacao.idSolicitante}</td>
            <td data-label="Status" class="text-center">${statusBadge}</td>
            <td data-label="Data da Ação" class="text-center">${new Date(solicitacao.dataAprovacao).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
        `;
            tbody.appendChild(tr);
        });
    }

    async function abrirModalConsulta(id) {
        if (typeof toggleLoader === 'function') toggleLoader(true);
        try {
            const response = await fetch(`${API_BASE_URL}/materiais/${id}`);
            if (!response.ok) throw new Error('Material não encontrado');
            const material = await response.json();

            formMaterial.reset();
            modalMaterialLabel.textContent = 'Detalhes do Material';

            materialIdInput.value = material.id;
            materialCodigoInput.value = material.codigo;
            materialDescricaoInput.value = material.descricao;
            materialUnidadeInput.value = material.unidadeMedida;
            materialSaldoInput.value = material.saldoFisico;

            formMaterial.querySelectorAll('input').forEach(input => input.disabled = true);

            modalFooter.innerHTML = `
                <button type="button" class="btn btn-danger me-auto btn-excluir-modal" data-id="${material.id}" data-descricao="${material.descricao}">Excluir</button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                <button type="button" class="btn btn-primary btn-editar-modal">Editar Saldo</button>
            `;

            modalMaterial.show();
        } catch (error) {
            mostrarToast(error.message, 'error');
        } finally {
            if (typeof toggleLoader === 'function') toggleLoader(false);
        }
    }

    tbodyMateriais.addEventListener('click', (event) => {
        const linhaClicada = event.target.closest('.material-row');
        if (linhaClicada) {
            abrirModalConsulta(linhaClicada.dataset.id);
        }
    });

    modalMaterialEl.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-editar-modal')) {
            modalMaterialLabel.textContent = 'Editar Saldo do Material';
            formMaterial.querySelectorAll('input').forEach(input => input.disabled = true);
            materialSaldoInput.disabled = false;
            modalFooter.innerHTML = `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn btn-primary" form="formMaterial">Salvar Alterações</button>
            `;
            materialSaldoInput.focus();
            materialSaldoInput.select();
        }
        if (event.target.classList.contains('btn-excluir-modal')) {
            const id = event.target.dataset.id;
            const descricao = event.target.dataset.descricao;
            modalMaterial.hide();
            nomeMaterialExcluirSpan.textContent = `"${descricao}"`;
            btnConfirmarExclusao.dataset.id = id;
            modalExcluir.show();
        }
    });

    // Listener de SUBMIT do formulário (agora trata CRIAÇÃO e EDIÇÃO corretamente)
    formMaterial.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Seleciona o botão que acionou o submit a partir do elemento do modal
        const btnSubmit = modalMaterialEl.querySelector('button[type="submit"]');
        if (!btnSubmit) return;

        const textoBotaoOriginal = btnSubmit.innerHTML;
        const id = materialIdInput.value;
        const isEditing = !!id;

        // Desabilita o botão e mostra um spinner para UX
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...`;

        if (typeof toggleLoader === 'function') toggleLoader(true);

        const materialData = {
            codigo: materialCodigoInput.value,
            descricao: materialDescricaoInput.value,
            unidadeMedida: materialUnidadeInput.value,
            saldoFisicoInicial: materialSaldoInput.value,
        };

        const url = isEditing ? `${API_BASE_URL}/materiais/${id}` : `${API_BASE_URL}/materiais`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(materialData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} material.`);
            }

            mostrarToast(`Material ${isEditing ? 'atualizado' : 'criado'} com sucesso!`, 'success');
            modalMaterial.hide();
            await carregarMateriais();
        } catch (error) {
            mostrarToast(error.message, 'error');
        } finally {
            // Restaura o estado original do botão
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoBotaoOriginal;
            if (typeof toggleLoader === 'function') toggleLoader(false);
        }
    });

    // Listener do botão "Novo Material" (continua o mesmo)
    btnNovoMaterial.addEventListener('click', () => {
        formMaterial.reset();
        materialIdInput.value = '';
        modalMaterialLabel.textContent = 'Novo Material';
        formMaterial.querySelectorAll('input').forEach(input => input.disabled = false);
        modalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-primary" form="formMaterial">Salvar</button>
        `;
        modalMaterial.show();
    });

    // Listener do botão de confirmação de exclusão
    btnConfirmarExclusao.addEventListener('click', async () => {
        const id = btnConfirmarExclusao.dataset.id;
        if (!id) return;

        const textoBotaoOriginal = btnConfirmarExclusao.innerHTML;
        btnConfirmarExclusao.disabled = true;
        btnConfirmarExclusao.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Excluindo...`;
        if (typeof toggleLoader === 'function') toggleLoader(true);

        try {
            const response = await fetch(`${API_BASE_URL}/materiais/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                // Se o backend retornar um erro (ex: material em uso), ele virá como JSON
                if (response.headers.get("content-type")?.includes("application/json")) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Erro ao excluir.');
                }
                throw new Error('Não foi possível excluir o material.');
            }

            mostrarToast('Material excluído com sucesso!', 'success');
            modalExcluir.hide();
            carregarMateriais(); // Recarrega a tabela para remover a linha
        } catch (error) {
            mostrarToast(error.message, 'error');
            modalExcluir.hide();
        } finally {
            btnConfirmarExclusao.disabled = false;
            btnConfirmarExclusao.innerHTML = textoBotaoOriginal;
            if (typeof toggleLoader === 'function') toggleLoader(false);
        }
    });

    // --- NOVOS Event Listeners para os filtros ---
    // Busca em tempo real (a cada tecla digitada)
    inputBuscaMaterial.addEventListener('input', () => {
        aplicarFiltrosErenderizar();
    });

    // Filtro por quantidade ao clicar em "Aplicar"
    btnAplicarFiltro.addEventListener('click', () => {
        aplicarFiltrosErenderizar();
    });

    // Limpa o filtro de quantidade e re-renderiza a tabela
    btnLimparFiltro.addEventListener('click', () => {
        selectCondicaoFiltro.selectedIndex = 0;
        inputValorFiltro.value = '';

        // Ajustado para os novos seletores
        checkUnitPC.checked = false;
        checkUnitMT.checked = false;

        aplicarFiltrosErenderizar();
    });

    // Listener CORRETO para as ações na tabela de solicitações pendentes
    document.getElementById('tbody-solicitacoes-pendentes').addEventListener('click', async (event) => {
        // Procura qual botão foi clicado na linha
        const btnAprovar = event.target.closest('.btn-aprovar');
        const btnRecusar = event.target.closest('.btn-recusar');

        // Se não foi um dos botões de ação, não faz nada
        if (!btnAprovar && !btnRecusar) {
            return;
        }

        if (typeof toggleLoader === 'function') toggleLoader(true);
        let acaoRealizada = false; // Flag para saber se devemos recarregar os dados

        try {
            if (btnAprovar) {
                const id = btnAprovar.dataset.id;
                const linha = btnAprovar.closest('tr');
                const descricaoMaterial = linha.querySelector('[data-label="Material"]').textContent;
                const qtdSolicitada = linha.querySelector('[data-label="Qtd. Solicitada"]').textContent;

                // Prepara e abre o modal de confirmação de aprovação
                itemAprovarInfoSpan.textContent = `${qtdSolicitada.trim()} de "${descricaoMaterial.trim()}"`;
                btnConfirmarAprovacao.dataset.id = id; // Armazena o ID no botão de confirmação
                modalAprovar.show();

                // Impede que o código continue e recarregue a página
                acaoRealizada = false;
            }

            if (btnRecusar) {
                const id = btnRecusar.dataset.id;
                const linha = btnRecusar.closest('tr');
                const descricaoMaterial = linha.querySelector('[data-label="Material"]').textContent;

                // Prepara e abre o modal de recusa
                formRecusarSolicitacao.dataset.id = id; // Armazena o ID no formulário
                descricaoMaterialRecusarSpan.textContent = `"${descricaoMaterial}"`;
                motivoRecusaTextarea.value = ''; // Limpa o campo de texto
                modalRecusar.show();

                // Impedimos a continuação do código aqui, pois a ação será tratada pelo submit do modal
                acaoRealizada = false;
            }

            // Se uma aprovação ou recusa foi feita com sucesso, recarrega os dados de ambas as abas
            if (acaoRealizada) {
                await carregarSolicitacoes();
                await carregarMateriais(); // Importante para atualizar o saldo na outra aba
            }
        } catch (error) {
            mostrarToast(error.message, 'error');
        } finally {
            if (typeof toggleLoader === 'function') toggleLoader(false);
        }
    });

    // --- NOVO Listener para o submit do formulário de recusa ---
    formRecusarSolicitacao.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = formRecusarSolicitacao.dataset.id;
        const motivo = motivoRecusaTextarea.value;
        const btnSubmit = document.getElementById('btnConfirmarRecusa');

        if (!motivo || motivo.trim() === '') {
            mostrarToast('O motivo da recusa é obrigatório.', 'error');
            return;
        }

        const textoBotaoOriginal = btnSubmit.innerHTML;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Recusando...`;
        if (typeof toggleLoader === 'function') toggleLoader(true);

        try {
            const response = await fetch(`${API_BASE_URL}/solicitacoes/${id}/rejeitar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aprovadorId: 1, observacao: motivo })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao recusar solicitação.');
            }

            modalRecusar.hide();
            mostrarToast('Solicitação recusada com sucesso.', 'success');

            // Recarrega os dados das duas abas
            await carregarSolicitacoes();
            await carregarMateriais();

        } catch (error) {
            mostrarToast(error.message, 'error');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = textoBotaoOriginal;
            if (typeof toggleLoader === 'function') toggleLoader(false);
        }
    });

    // --- NOVO Listener para o botão de confirmação de aprovação ---
    btnConfirmarAprovacao.addEventListener('click', async () => {
        const id = btnConfirmarAprovacao.dataset.id;
        if (!id) return;

        const textoBotaoOriginal = btnConfirmarAprovacao.innerHTML;
        btnConfirmarAprovacao.disabled = true;
        btnConfirmarAprovacao.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Aprovando...`;
        if (typeof toggleLoader === 'function') toggleLoader(true);

        try {
            const response = await fetch(`${API_BASE_URL}/solicitacoes/${id}/aprovar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aprovadorId: 1 })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao aprovar solicitação.');
            }

            modalAprovar.hide();
            mostrarToast('Solicitação aprovada com sucesso!', 'success');

            // Recarrega os dados de ambas as abas
            await carregarSolicitacoes();
            await carregarMateriais();

        } catch (error) {
            mostrarToast(error.message, 'error');
        } finally {
            btnConfirmarAprovacao.disabled = false;
            btnConfirmarAprovacao.innerHTML = textoBotaoOriginal;
            if (typeof toggleLoader === 'function') toggleLoader(false);
        }
    });

    // --- NOVO Listener para o clique nas linhas da tabela de histórico ---
    document.getElementById('tbody-solicitacoes-historico').addEventListener('click', (event) => {
        const linhaClicada = event.target.closest('.historico-row');
        if (linhaClicada) {
            const id = linhaClicada.dataset.id;

            // Encontra a solicitação completa no nosso "cache"
            const solicitacao = historicoDeSolicitacoes.find(s => s.id == id);
            if (solicitacao) {
                abrirModalHistorico(solicitacao);
            }
        }
    });

    function abrirModalHistorico(solicitacao) {
        modalHistoricoLabel.textContent = `Detalhes da Solicitação #${solicitacao.id}`;

        const statusBadge = solicitacao.status === 'APROVADA'
            ? '<span class="badge bg-success">Aprovado</span>'
            : '<span class="badge bg-danger">Recusado</span>';

        let itensHtml = solicitacao.itens.map(item => `
        <li class="list-group-item item-solicitado-detalhe">
            <div class="item-quantity-display">
                <div class="valor">${new Intl.NumberFormat('pt-BR').format(item.quantidadeSolicitada)}</div>
                <div class="unidade">${item.material.unidadeMedida}</div>
            </div>
            <div class="item-description-display">
                <div class="nome">${item.material.descricao}</div>
                <div class="codigo">Código: ${item.material.codigo}</div>
            </div>
        </li>
    `).join('');

        // --- MUDANÇA PRINCIPAL: Monta o HTML usando um grid de blocos de informação ---
        historicoDetalhesContent.innerHTML = `
        <div class="detalhes-secao">
            <div class="row">
                <div class="col-md-6">
                    <div class="info-block">
                        <span class="info-label">Status</span>
                        <span class="info-value">${statusBadge}</span>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="info-block">
                        <span class="info-label">Solicitante</span>
                        <span class="info-value">Usuário ID ${solicitacao.idSolicitante}</span>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="info-block">
                        <span class="info-label">Data da Solicitação</span>
                        <span class="info-value">${new Date(solicitacao.dataSolicitacao).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="info-block">
                        <span class="info-label">Aprovador/Reprovador</span>
                        <span class="info-value">Usuário ID ${solicitacao.idAprovador}</span>
                    </div>
                </div>
                 <div class="col-md-12">
                    <div class="info-block">
                        <span class="info-label">Data da Ação</span>
                        <span class="info-value">${new Date(solicitacao.dataAprovacao).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="detalhes-secao">
            <h6 class="detalhes-titulo-secao">Itens Solicitados</h6>
            <ul class="list-group list-group-flush">${itensHtml}</ul>
        </div>
    `;

        if (solicitacao.obsAprovador) {
            historicoDetalhesContent.innerHTML += `
            <div class="detalhes-secao">
                <h6 class="detalhes-titulo-secao">Observação da Recusa</h6>
                <p class="alert alert-danger mb-0">${solicitacao.obsAprovador}</p>
            </div>
        `;
        }

        modalHistorico.show();
    }

    function popularFiltrosDoHistorico() {
        // Pega todos os materiais e solicitantes únicos da lista de histórico
        const materiaisUnicos = new Set();
        const solicitantesUnicos = new Set();

        historicoDeSolicitacoes.forEach(solicitacao => {
            solicitantesUnicos.add(solicitacao.idSolicitante);
            solicitacao.itens.forEach(item => {
                materiaisUnicos.add(item.material.descricao);
            });
        });

        // Popula o select de materiais
        filtroMaterialSelect.innerHTML = '<option value="">Todos os Materiais</option>';
        materiaisUnicos.forEach(descricao => {
            filtroMaterialSelect.innerHTML += `<option value="${descricao}">${descricao}</option>`;
        });

        // Popula o select de solicitantes
        filtroSolicitanteSelect.innerHTML = '<option value="">Todos os Solicitantes</option>';
        solicitantesUnicos.forEach(id => {
            filtroSolicitanteSelect.innerHTML += `<option value="${id}">Usuário ID ${id}</option>`;
        });
    }

    function aplicarFiltrosErenderizarHistorico() {
        let historicoFiltrado = [...historicoDeSolicitacoes];

        const materialSelecionado = filtroMaterialSelect.value;
        const solicitanteSelecionado = filtroSolicitanteSelect.value;
        const dataDe = inputDataDe.value ? flatpickr.parseDate(inputDataDe.value, "d/m/Y") : null;
        const dataAte = inputDataAte.value ? flatpickr.parseDate(inputDataAte.value, "d/m/Y") : null;

        // 1. Filtro por Material
        if (materialSelecionado) {
            historicoFiltrado = historicoFiltrado.filter(solicitacao =>
                solicitacao.itens.some(item => item.material.descricao === materialSelecionado)
            );
        }

        // 2. Filtro por Solicitante
        if (solicitanteSelecionado) {
            historicoFiltrado = historicoFiltrado.filter(solicitacao =>
                solicitacao.idSolicitante == solicitanteSelecionado
            );
        }

        // 3. Filtro por Período
        if (dataDe) {
            historicoFiltrado = historicoFiltrado.filter(s => new Date(s.dataAprovacao) >= dataDe);
        }
        if (dataAte) {
            dataAte.setHours(23, 59, 59); // Garante que o filtro inclua o dia inteiro
            historicoFiltrado = historicoFiltrado.filter(s => new Date(s.dataAprovacao) <= dataAte);
        }

        renderizarTabelaHistorico(historicoFiltrado);
    }

    /**
 * Renderiza a tabela de materiais na aba de "Controle de Materiais".
 * @param {Array} materiais - A lista de materiais a ser exibida.
 */
    function renderizarTabelaMateriais(materiais) {
        // CORREÇÃO 1: Usando a constante 'tbodyMateriais' que já foi declarada no topo do arquivo.
        const tbody = tbodyMateriais;

        // CORREÇÃO 2: Pegando o 'thead' de forma segura, como nas outras funções.
        const thead = tbody.previousElementSibling;

        // 1. Limpa o conteúdo anterior
        thead.innerHTML = '';
        tbody.innerHTML = '';

        // 2. Cria o cabeçalho da tabela
        thead.innerHTML = `
    <tr>
        <th>Código</th>
        <th>Descrição</th>
        <th class="text-center">Saldo em Estoque</th> 
    </tr>
`;

        // 3. Verifica se há materiais para exibir
        if (materiais.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center">Nenhum material encontrado.</td></tr>`;
            return;
        }

        // 4. Popula o corpo da tabela com os materiais
        materiais.forEach(material => {
            const tr = document.createElement('tr');
            tr.className = 'material-row';
            tr.dataset.id = material.id;
            tr.style.cursor = 'pointer';

            const saldoFormatado = new Intl.NumberFormat('pt-BR').format(material.saldoFisico);

            tr.innerHTML = `
        <td>${material.codigo}</td>
        <td>${material.descricao}</td>
        <td class="text-center stock-cell"> <strong class="stock-quantity">${saldoFormatado}</strong> <small class="stock-unit">${material.unidadeMedida}</small> </td>
    `;
            tbody.appendChild(tr);
        });
    }

    // --- Inicialização ---
    carregarMateriais();
    carregarSolicitacoes();
});