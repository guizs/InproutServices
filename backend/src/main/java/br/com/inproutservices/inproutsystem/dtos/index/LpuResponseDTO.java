package br.com.inproutservices.inproutsystem.dtos.index;

import java.math.BigDecimal;

public record LpuResponseDTO(
        Long id,
        String codigoLpu,
        String nomeLpu,
        String unidade,
        BigDecimal valorSemImposto,
        BigDecimal valorComImposto,
        boolean ativo,
        ContratoResponseDTO contrato // Aqui está o objeto do contrato!
) {}