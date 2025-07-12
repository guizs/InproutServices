package br.com.inproutservices.inproutsystem.dtos.materiais;

import br.com.inproutservices.inproutsystem.entities.materiais.Material;

import java.math.BigDecimal;

// DTO para exibir informações de um Material
public record MaterialResponseDTO(
        Long id,
        String codigo,
        String descricao,
        String unidadeMedida,
        BigDecimal saldoFisico
) {
    // Construtor que converte uma entidade Material para este DTO
    public MaterialResponseDTO(Material entity) {
        this(entity.getId(), entity.getCodigo(), entity.getDescricao(), entity.getUnidadeMedida(), entity.getSaldoFisico());
    }
}