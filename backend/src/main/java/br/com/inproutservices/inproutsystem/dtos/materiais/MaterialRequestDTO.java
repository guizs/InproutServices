package br.com.inproutservices.inproutsystem.dtos.materiais;

import br.com.inproutservices.inproutsystem.enums.materiais.Empresa;

import java.math.BigDecimal;

public record MaterialRequestDTO(
        Empresa empresa,
        String codigo,
        String descricao,
        String unidadeMedida,
        BigDecimal saldoFisicoInicial,
        BigDecimal custoUnitarioInicial, // NOVO
        String observacoes // NOVO
) {}