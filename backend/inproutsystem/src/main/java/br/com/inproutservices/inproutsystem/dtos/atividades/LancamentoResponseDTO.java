package br.com.inproutservices.inproutsystem.dtos.atividades;

import br.com.inproutservices.inproutsystem.entities.atividades.Lancamento;
import br.com.inproutservices.inproutsystem.enums.atividades.SituacaoAprovacao;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO para formatar a resposta de um Lançamento para o frontend.
 */
public record LancamentoResponseDTO(
        Long id,
        SituacaoAprovacao situacaoAprovacao,
        ManagerDTO manager,
        OsSimpleDTO os,
        LocalDateTime dataCriacao,
        LocalDateTime dataSubmissao,
        LocalDate dataPrazo,
        String detalheDiario,
        BigDecimal valor,
        List<ComentarioDTO> comentarios
) {
    // Construtor que converte a Entidade em DTO
    public LancamentoResponseDTO(Lancamento lancamento) {
        this(
                lancamento.getId(),
                lancamento.getSituacaoAprovacao(),
                new ManagerDTO(lancamento.getManager().getId(), lancamento.getManager().getNome()),
                new OsSimpleDTO(lancamento.getOs().getId(), lancamento.getOs().getOs()), // Assumindo que o campo é getOs() na entidade OS
                lancamento.getDataCriacao(),
                lancamento.getDataSubmissao(),
                lancamento.getDataPrazo(),
                lancamento.getDetalheDiario(),
                lancamento.getValor(),
                lancamento.getComentarios().stream().map(ComentarioDTO::new).collect(Collectors.toList())
        );
    }

    // DTOs aninhados para não expor as entidades inteiras
    public record ManagerDTO(Long id, String nome) {}
    public record OsSimpleDTO(Long id, String numeroOs) {}
    public record ComentarioDTO(Long id, String texto, ManagerDTO autor, @JsonFormat(pattern="dd/MM/yyyy HH:mm") LocalDateTime dataHora) {
        public ComentarioDTO(br.com.inproutservices.inproutsystem.entities.atividades.Comentario comentario) {
            this(
                    comentario.getId(),
                    comentario.getTexto(),
                    new ManagerDTO(comentario.getAutor().getId(), comentario.getAutor().getNome()),
                    comentario.getDataHora()
            );
        }
    }
}