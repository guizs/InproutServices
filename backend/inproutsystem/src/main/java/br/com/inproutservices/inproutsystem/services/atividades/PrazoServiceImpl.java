package br.com.inproutservices.inproutsystem.services.atividades;

import br.com.inproutservices.inproutsystem.repositories.atividades.FeriadoRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;

@Service
public class PrazoServiceImpl implements br.com.inproutservices.inproutsystem.services.config.PrazoService {

    private final FeriadoRepository feriadoRepository;

    public PrazoServiceImpl(FeriadoRepository feriadoRepository) {
        this.feriadoRepository = feriadoRepository;
    }

    @Override
    public LocalDate calcularPrazoEmDiasUteis(LocalDate dataInicial, int diasUteis) {
        LocalDate dataResultado = dataInicial;
        int diasAdicionados = 0;
        while (diasAdicionados < diasUteis) {
            dataResultado = dataResultado.plusDays(1);
            DayOfWeek diaDaSemana = dataResultado.getDayOfWeek();

            // Verifica se não é sábado, domingo ou um feriado
            if (diaDaSemana != DayOfWeek.SATURDAY &&
                    diaDaSemana != DayOfWeek.SUNDAY &&
                    !feriadoRepository.existsByData(dataResultado)) {
                diasAdicionados++;
            }
        }
        return dataResultado;
    }
}