package br.com.inproutservices.inproutsystem.dtos.atividades;

import br.com.inproutservices.inproutsystem.entities.atividades.Lancamento;
import br.com.inproutservices.inproutsystem.enums.atividades.SituacaoAprovacao;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO para formatar a resposta de um Lançamento para o frontend.
 * A anotação @JsonInclude faz com que campos nulos não apareçam no JSON.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record LancamentoResponseDTO(
        Long id,
        SituacaoAprovacao situacaoAprovacao,
        ManagerDTO manager,
        OsSimpleDTO os,

        // --- CAMPOS REFATORADOS ---
        PrestadorSimpleDTO prestador,
        EtapaSimpleDTO etapa,

        // --- DEMAIS CAMPOS ---
        LocalDateTime dataCriacao,
        LocalDateTime dataSubmissao,
        LocalDate dataPrazo,
        LocalDate dataPrazoProposta,
        LocalDate dataAtividade,
        String equipe,
        String vistoria,
        @JsonFormat(pattern = "dd/MM/yyyy") LocalDate planoVistoria,
        String desmobilizacao,
        @JsonFormat(pattern = "dd/MM/yyyy") LocalDate planoDesmobilizacao,
        String instalacao,
        @JsonFormat(pattern = "dd/MM/yyyy") LocalDate planoInstalacao,
        String ativacao,
        @JsonFormat(pattern = "dd/MM/yyyy") LocalDate planoAtivacao,
        String documentacao,
        @JsonFormat(pattern = "dd/MM/yyyy") LocalDate planoDocumentacao,
        String status,
        String detalheDiario,
        BigDecimal valor,
        LocalDateTime ultUpdate,
        List<ComentarioDTO> comentarios
) {

    /**
     * Construtor principal que transforma a Entidade Lancamento neste DTO.
     */
    public LancamentoResponseDTO(Lancamento lancamento) {
        this(
                lancamento.getId(),
                lancamento.getSituacaoAprovacao(),
                (lancamento.getManager() != null) ? new ManagerDTO(lancamento.getManager().getId(), lancamento.getManager().getNome()) : null,
                (lancamento.getOs() != null) ? new OsSimpleDTO(lancamento.getOs().getId(), lancamento.getOs().getOs()) : null,

                // Mapeamento correto para as entidades relacionadas
                (lancamento.getPrestador() != null) ? new PrestadorSimpleDTO(lancamento.getPrestador().getId(), lancamento.getPrestador().getCodigoPrestador(), lancamento.getPrestador().getPrestador()) : null,
                (lancamento.getEtapaDetalhada() != null) ? new EtapaSimpleDTO(lancamento.getEtapaDetalhada().getId(), lancamento.getEtapaDetalhada().getNome(), lancamento.getEtapaDetalhada().getEtapa().getDescricao()) : null,

                // Mapeamento dos outros campos
                lancamento.getDataCriacao(),
                lancamento.getDataSubmissao(),
                lancamento.getDataPrazo(),
                lancamento.getDataPrazoProposta(),
                lancamento.getDataAtividade(),
                lancamento.getEquipe(),
                lancamento.getVistoria(),
                lancamento.getPlanoVistoria(),
                lancamento.getDesmobilizacao(),
                lancamento.getPlanoDesmobilizacao(),
                lancamento.getInstalacao(),
                lancamento.getPlanoInstalacao(),
                lancamento.getAtivacao(),
                lancamento.getPlanoAtivacao(),
                lancamento.getDocumentacao(),
                lancamento.getPlanoDocumentacao(),
                lancamento.getStatus(),
                lancamento.getDetalheDiario(),
                lancamento.getValor(),
                lancamento.getUltUpdate(),
                (lancamento.getComentarios() != null) ? lancamento.getComentarios().stream().map(ComentarioDTO::new).collect(Collectors.toList()) : null
        );
    }

    // --- DTOs aninhados para representar os relacionamentos de forma limpa ---

    public record ManagerDTO(Long id, String nome) {}
    public record OsSimpleDTO(Long id, String numeroOs) {}
    public record PrestadorSimpleDTO(Long id, String codigo, String nome) {}
    public record EtapaSimpleDTO(Long id, String nomeDetalhado, String nomeGeral) {}

    public record ComentarioDTO(Long id, String texto, ManagerDTO autor, @JsonFormat(pattern="dd/MM/yyyy HH:mm") LocalDateTime dataHora) {
        public ComentarioDTO(br.com.inproutservices.inproutsystem.entities.atividades.Comentario comentario) {
            this(
                    comentario.getId(),
                    comentario.getTexto(),
                    (comentario.getAutor() != null) ? new ManagerDTO(comentario.getAutor().getId(), comentario.getAutor().getNome()) : null,
                    comentario.getDataHora()
            );
        }
    }
}