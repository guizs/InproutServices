$(document).ready(function() {
    // --- CONFIGURAÇÕES INICIAIS ---
    const agora = new Date();
    $('#filtro-mes').val(agora.getMonth() + 1);
    $('#filtro-ano').val(agora.getFullYear());

    let todosLancamentos = [];
    let todosPrestadores = [];
    let filtroSegmentoAtivo = null;

    // --- FUNÇÕES HELPER ---
    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
    };

    const formatarData = (dataString) => {
        if (!dataString) return 'N/A';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    function renderizarCardsResumo(segmentos) {
        const cardsContainer = $('#cards-resumo-container');
        cardsContainer.empty();
        let valorTotalGeral = 0;

        if (segmentos && segmentos.length > 0) {
            segmentos.forEach(seg => {
                const cardHtml = `
                    <div class="segment-card" data-segmento="${seg.segmentoNome}">
                        <i class="bi bi-tag-fill"></i>
                        <div class="segmento-nome">${seg.segmentoNome}</div>
                        <div class="segmento-valor">${formatarMoeda(seg.valorTotal)}</div>
                    </div>
                `;
                const card = $(cardHtml);
                
                // Adiciona evento de clique para filtrar
                card.on('click', function() {
                    const segmentoSelecionado = $(this).data('segmento');
                    $('.segment-card').removeClass('active');
                    
                    if (filtroSegmentoAtivo === segmentoSelecionado) {
                        // Clicou no card ativo, então desativa o filtro
                        filtroSegmentoAtivo = null;
                        $('#filtro-segmento-ativo').text('');
                        $('#btn-limpar-filtro').addClass('d-none');
                    } else {
                        // Ativa novo filtro
                        filtroSegmentoAtivo = segmentoSelecionado;
                        $(this).addClass('active');
                        $('#filtro-segmento-ativo').text(`Filtro: ${filtroSegmentoAtivo}`);
                        $('#btn-limpar-filtro').removeClass('d-none');
                    }
                    renderizarTabelaLancamentos();
                });

                cardsContainer.append(card);
                valorTotalGeral += seg.valorTotal;
            });
        } else {
            cardsContainer.html('<div class="alert alert-light text-center w-100">Nenhum dado de segmento encontrado.</div>');
        }
        $('#total-cps-valor').text(formatarMoeda(valorTotalGeral));
    }

    function renderizarTabelaLancamentos() {
        const tBody = $('#tabela-lancamentos-body');
        tBody.empty();
        
        let lancamentosFiltrados = filtroSegmentoAtivo 
            ? todosLancamentos.filter(l => l.os?.segmento?.nome === filtroSegmentoAtivo)
            : todosLancamentos;

        if (lancamentosFiltrados.length > 0) {
            lancamentosFiltrados.forEach(lanc => {
                tBody.append(`
                    <tr>
                        <td>${lanc.os?.os || 'N/A'}</td>
                        <td>${lanc.os?.segmento?.nome || 'N/A'}</td>
                        <td>${lanc.etapa?.nomeDetalhado || 'N/A'}</td>
                        <td>${lanc.prestador?.nome || 'N/A'}</td>
                        <td>${formatarData(lanc.dataAtividade)}</td>
                        <td class="text-end fw-bold">${formatarMoeda(lanc.valor)}</td>
                    </tr>
                `);
            });
        } else {
            tBody.html('<tr><td colspan="6" class="text-center text-muted p-4">Nenhum lançamento encontrado para os filtros selecionados.</td></tr>');
        }
    }

    function renderizarTabelaPrestadores() {
        const tBody = $('#tabela-prestadores-body');
        tBody.empty();

        if (todosPrestadores.length > 0) {
            todosPrestadores.forEach(prest => {
                tBody.append(`
                    <tr>
                        <td>${prest.nomePrestador}</td>
                        <td class="text-end fw-bold">${formatarMoeda(prest.valorTotal)}</td>
                    </tr>
                `);
            });
        } else {
            tBody.html('<tr><td colspan="2" class="text-center text-muted p-4">Nenhum pagamento a prestador para este período.</td></tr>');
        }
    }

    function mostrarCarregamento() {
        $('#cards-resumo-container').html('<div class="text-center p-5"><div class="spinner-border text-primary"></div></div>');
        $('#tabela-lancamentos-body').html('<tr><td colspan="6" class="text-center p-4"><div class="spinner-border spinner-border-sm"></div> Carregando...</td></tr>');
        $('#tabela-prestadores-body').html('<tr><td colspan="2" class="text-center p-4"><div class="spinner-border spinner-border-sm"></div> Carregando...</td></tr>');
        $('#total-cps-valor').text('Calculando...');
    }

    function mostrarErro() {
        $('#cards-resumo-container').html('<div class="alert alert-danger text-center w-100">Erro ao carregar resumos.</div>');
        $('#tabela-lancamentos-body').html('<tr><td colspan="6" class="text-center text-danger p-4">Erro ao carregar dados.</td></tr>');
        $('#tabela-prestadores-body').html('<tr><td colspan="2" class="text-center text-danger p-4">Erro ao carregar dados.</td></tr>');
        $('#total-cps-valor').text('Erro');
    }

    // --- LÓGICA PRINCIPAL ---

    function buscarDadosCPS() {
        const mes = $('#filtro-mes').val();
        const ano = $('#filtro-ano').val();
        if (!mes || !ano) {
            alert("Por favor, selecione mês e ano.");
            return;
        }

        mostrarCarregamento();
        filtroSegmentoAtivo = null; // Reseta o filtro de segmento
        $('#filtro-segmento-ativo').text('');
        $('#btn-limpar-filtro').addClass('d-none');
        $('.segment-card').removeClass('active');

        const ajaxResumo = $.get(`/api/cps/resumo-segmentos?mes=${mes}&ano=${ano}`);
        const ajaxLancamentos = $.get(`/api/cps/lancamentos?mes=${mes}&ano=${ano}`);
        const ajaxPrestadores = $.get(`/api/cps/prestadores?mes=${mes}&ano=${ano}`);

        $.when(ajaxResumo, ajaxLancamentos, ajaxPrestadores)
            .done(function(respResumo, respLancamentos, respPrestadores) {
                todosLancamentos = respLancamentos[0] || [];
                todosPrestadores = respPrestadores[0] || [];
                
                renderizarCardsResumo(respResumo[0] || []);
                renderizarTabelaLancamentos();
                renderizarTabelaPrestadores();
            })
            .fail(function() {
                mostrarErro();
            });
    }

    function exportarParaExcel() {
        const mes = $('#filtro-mes option:selected').text();
        const ano = $('#filtro-ano').val();
        const nomeArquivo = `CPS_${mes}_${ano}.xlsx`;
        
        const wb = XLSX.utils.book_new();

        // Aba 1: Lançamentos
        const wsLancamentos = XLSX.utils.json_to_sheet(
            todosLancamentos.map(l => ({
                'OS': l.os?.os,
                'Segmento': l.os?.segmento?.nome,
                'Atividade': l.etapa?.nomeDetalhado,
                'Prestador': l.prestador?.nome,
                'Data': formatarData(l.dataAtividade),
                'Valor': l.valor
            }))
        );
        XLSX.utils.book_append_sheet(wb, wsLancamentos, "Lançamentos Aprovados");

        // Aba 2: Prestadores
        const wsPrestadores = XLSX.utils.json_to_sheet(
            todosPrestadores.map(p => ({
                'Nome do Prestador': p.nomePrestador,
                'Valor a Pagar': p.valorTotal
            }))
        );
        XLSX.utils.book_append_sheet(wb, wsPrestadores, "Resumo por Prestador");

        XLSX.writeFile(wb, nomeArquivo);
    }

    // --- EVENTOS ---
    $('#btn-buscar').on('click', buscarDadosCPS);
    $('#btn-exportar').on('click', exportarParaExcel);
    $('#btn-limpar-filtro').on('click', function() {
        filtroSegmentoAtivo = null;
        $('.segment-card').removeClass('active');
        $('#filtro-segmento-ativo').text('');
        $(this).addClass('d-none');
        renderizarTabelaLancamentos();
    });

    // --- EXECUÇÃO INICIAL ---
    buscarDadosCPS();
});
