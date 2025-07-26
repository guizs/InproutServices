package br.com.inproutservices.inproutsystem.dtos.materiais;

import br.com.inproutservices.inproutsystem.entities.materiais.Material;
import br.com.inproutservices.inproutsystem.enums.materiais.Empresa;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

public record MaterialResponseDTO(
        Long id,

        // A anotação @JsonFormat garante que o Enum seja convertido para texto no JSON
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        Empresa empresa,

        String codigo,
        String descricao,
        String unidadeMedida,
        BigDecimal saldoFisico,
        BigDecimal custoMedioPonderado,
        BigDecimal custoTotal,
        String observacoes,
        List<EntradaMaterialResponseDTO> entradas
) {
    public MaterialResponseDTO(Material entity) {
        this(
                entity.getId(),
                entity.getEmpresa(), // Garante que o valor da entidade seja passado para o DTO
                entity.getCodigo(),
                entity.getDescricao(),
                entity.getUnidadeMedida(),
                entity.getSaldoFisico(),
                entity.getCustoMedioPonderado(),
                (entity.getSaldoFisico() != null && entity.getCustoMedioPonderado() != null)
                        ? entity.getSaldoFisico().multiply(entity.getCustoMedioPonderado()).setScale(2, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO,
                entity.getObservacoes(),
                entity.getEntradas() != null ?
                        entity.getEntradas().stream()
                                .map(EntradaMaterialResponseDTO::new)
                                .collect(Collectors.toList()) : List.of()
        );
    }
}