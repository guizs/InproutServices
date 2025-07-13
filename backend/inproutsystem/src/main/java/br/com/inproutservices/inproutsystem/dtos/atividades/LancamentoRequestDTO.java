package br.com.inproutservices.inproutsystem.dtos.atividades;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO para receber os dados de criação de um novo Lançamento.
 * A estrutura deste record deve corresponder ao JSON enviado pelo frontend.
 */
public record LancamentoRequestDTO(

        Long osId,

        LocalDate dataAtividade,

        Long prestadorId,
        Long etapaDetalhadaId,

        String equipe,
        String vistoria,
        LocalDate planoVistoria,
        String desmobilizacao,
        LocalDate planoDesmobilizacao,
        String instalacao,
        LocalDate planoInstalacao,
        String ativacao,
        LocalDate planoAtivacao,
        String documentacao,
        LocalDate planoDocumentacao,
        String status, // O status da execução (OK, NOK), não o da aprovação
        String detalheDiario,
        BigDecimal valor
) {
}