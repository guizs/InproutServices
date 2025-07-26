$(document).ready(function() {
    // Define mês e ano atuais como padrão nos filtros
    const agora = new Date();
    $('#filtro-mes').val(agora.getMonth() + 1);
    $('#filtro-ano').val(agora.getFullYear());

    const formatarMoeda = (valor) => {
        if (typeof valor !== 'number') return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    const formatarData = (dataString) => {
        if (!dataString) return '';
        const partes = dataString.split('-');
        return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dataString;
    };

    function buscarDadosCPS() {
        const mes = $('#filtro-mes').val();
        const ano = $('#filtro-ano').val();

        // Feedback visual de carregamento
        $('#cards-resumo-container').html('<div class="text-center p-5"><div class="spinner-border text-primary"></div></div>');
        $('#tabela-lancamentos-body').html('<tr><td colspan="6" class="text-center">Carregando...</td></tr>');
        $('#tabela-prestadores-body').html('<tr><td colspan="2" class="text-center">Carregando...</td></tr>');
        $('#total-cps-valor').text('Calculando...');

        // Chamadas AJAX para os 3 endpoints necessários
        const ajaxResumo = $.get(`/api/cps/resumo-segmentos?mes=${mes}&ano=${ano}`);
        const ajaxLancamentos = $.get(`/api/cps/lancamentos?mes=${mes}&ano=${ano}`);
        const ajaxPrestadores = $.get(`/api/cps/prestadores?mes=${mes}&ano=${ano}`);

        // Executa todas em paralelo para otimizar o tempo de carregamento
        $.when(ajaxResumo, ajaxLancamentos, ajaxPrestadores).done(function(respResumo, respLancamentos, respPrestadores) {
            
            // --- 1. Processa e renderiza os CARDS DE RESUMO ---
            const segmentos = respResumo[0];
            const cardsContainer = $('#cards-resumo-container');
            cardsContainer.empty();
            let valorTotalGeral = 0;

            if (segmentos && segmentos.length > 0) {
                segmentos.forEach(seg => {
                    cardsContainer.append(`
                        <div class="segment-card">
                            <i class="bi bi-tag-fill"></i>
                            <div class="segmento-nome">${seg.segmentoNome}</div>
                            <div class="segmento-valor">${formatarMoeda(seg.valorTotal)}</div>
                        </div>
                    `);
                    valorTotalGeral += seg.valorTotal;
                });
            } else {
                cardsContainer.html('<div class="alert alert-light text-center w-100">Nenhum dado de segmento encontrado para este período.</div>');
            }
            $('#total-cps-valor').text(formatarMoeda(valorTotalGeral));

            // --- 2. Processa a TABELA DE LANÇAMENTOS ---
            const lancamentos = respLancamentos[0];
            const tBodyLancamentos = $('#tabela-lancamentos-body');
            tBodyLancamentos.empty();

            if (lancamentos && lancamentos.length > 0) {
                lancamentos.forEach(lanc => {
                    tBodyLancamentos.append(`
                        <tr>
                            <td data-label="OS">${lanc.os?.os || 'N/A'}</td>
                            <td data-label="Segmento">${lanc.os?.segmento?.nome || 'N/A'}</td>
                            <td data-label="Atividade">${lanc.etapa?.nomeDetalhado || 'N/A'}</td>
                            <td data-label="Prestador">${lanc.prestador?.nome || 'N/A'}</td>
                            <td data-label="Data Atividade">${formatarData(lanc.dataAtividade)}</td>
                            <td data-label="Valor" class="text-end">${formatarMoeda(lanc.valor)}</td>
                        </tr>
                    `);
                });
            } else {
                tBodyLancamentos.html('<tr><td colspan="6" class="text-center text-muted">Nenhum lançamento aprovado para este período.</td></tr>');
            }

            // --- 3. Processa a TABELA DE PRESTADORES ---
            const prestadores = respPrestadores[0];
            const tBodyPrestadores = $('#tabela-prestadores-body');
            tBodyPrestadores.empty();

            if (prestadores && prestadores.length > 0) {
                prestadores.forEach(prest => {
                    tBodyPrestadores.append(`
                        <tr>
                            <td data-label="Prestador">${prest.nomePrestador}</td>
                            <td data-label="Valor a Pagar" class="text-end fw-bold">${formatarMoeda(prest.valorTotal)}</td>
                        </tr>
                    `);
                });
            } else {
                tBodyPrestadores.html('<tr><td colspan="2" class="text-center text-muted">Nenhum pagamento a prestador para este período.</td></tr>');
            }

        }).fail(function() {
            // Trata erros de qualquer uma das chamadas
            $('#cards-resumo-container').html('<div class="alert alert-danger text-center w-100">Erro ao carregar resumos.</div>');
            $('#tabela-lancamentos-body').html('<tr><td colspan="6" class="text-center text-danger">Erro ao carregar dados.</td></tr>');
            $('#tabela-prestadores-body').html('<tr><td colspan="2" class="text-center text-danger">Erro ao carregar dados.</td></tr>');
            $('#total-cps-valor').text('Erro');
        });
    }

    // Event listener para o botão de busca
    $('#btn-buscar').on('click', buscarDadosCPS);

    // Carregar dados iniciais ao carregar a página
    buscarDadosCPS();
});