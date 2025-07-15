package br.com.inproutservices.inproutsystem.dtos.materiais;

import java.math.BigDecimal;

// DTO para receber os dados de criação ou alteração de um Material
public record MaterialRequestDTO(
        String codigo,
        String descricao,
        String unidadeMedida,
        BigDecimal saldoFisicoInicial
) {}