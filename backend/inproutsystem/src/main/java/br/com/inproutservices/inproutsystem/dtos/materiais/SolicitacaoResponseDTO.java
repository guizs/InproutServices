package br.com.inproutservices.inproutsystem.dtos.materiais;

import br.com.inproutservices.inproutsystem.entities.materiais.Solicitacao;
import br.com.inproutservices.inproutsystem.enums.materiais.StatusSolicitacao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

// DTO completo para exibir uma Solicitação
public record SolicitacaoResponseDTO(
        Long id,
        Long idSolicitante,
        LocalDateTime dataSolicitacao,
        String justificativa,
        StatusSolicitacao status,
        Long idAprovador,
        LocalDateTime dataAprovacao,
        String obsAprovador,
        List<ItemSolicitacaoResponseDTO> itens
) {
    // Construtor que converte a entidade completa para este DTO
    public SolicitacaoResponseDTO(Solicitacao entity) {
        this(
                entity.getId(),
                entity.getIdSolicitante(),
                entity.getDataSolicitacao(),
                entity.getJustificativa(),
                entity.getStatus(),
                entity.getIdAprovador(),
                entity.getDataAprovacao(),
                entity.getObsAprovador(),
                entity.getItens().stream().map(ItemSolicitacaoResponseDTO::new).collect(Collectors.toList())
        );
    }
}