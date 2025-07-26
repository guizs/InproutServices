package br.com.inproutservices.inproutsystem.dtos.cps;

import br.com.inproutservices.inproutsystem.entities.cps.FechamentoCpsPrestador;
import java.math.BigDecimal;

public record FechamentoCpsPrestadorDTO(
        Long prestadorId,
        String nomePrestador,
        int mes,
        int ano,
        BigDecimal valorTotal
) {
    public FechamentoCpsPrestadorDTO(FechamentoCpsPrestador fechamento) {
        this(
                fechamento.getPrestador().getId(),
                fechamento.getPrestador().getPrestador(),
                fechamento.getMes(),
                fechamento.getAno(),
                fechamento.getValorTotal()
        );
    }
}