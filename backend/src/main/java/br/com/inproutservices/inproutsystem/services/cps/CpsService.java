package br.com.inproutservices.inproutsystem.services.cps;

import br.com.inproutservices.inproutsystem.dtos.atividades.LancamentoResponseDTO;
import br.com.inproutservices.inproutsystem.dtos.cps.FechamentoCpsPrestadorDTO;
import br.com.inproutservices.inproutsystem.enums.atividades.SituacaoAprovacao;
import br.com.inproutservices.inproutsystem.repositories.atividades.LancamentoRepository;
import br.com.inproutservices.inproutsystem.repositories.cps.FechamentoCpsPrestadorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CpsService {

    private final LancamentoRepository lancamentoRepository;
    private final FechamentoCpsPrestadorRepository fechamentoRepository;

    public CpsService(LancamentoRepository lancamentoRepository, FechamentoCpsPrestadorRepository fechamentoRepository) {
        this.lancamentoRepository = lancamentoRepository;
        this.fechamentoRepository = fechamentoRepository;
    }

    @Transactional(readOnly = true)
    public List<LancamentoResponseDTO> findLancamentosAprovados(int mes, int ano) {
        // Esta é uma query JPQL que precisa ser adicionada ao LancamentoRepository
        return lancamentoRepository.findAprovadosByMesAndAno(mes, ano)
                .stream()
                .map(LancamentoResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FechamentoCpsPrestadorDTO> findResumoCpsPrestador(int mes, int ano) {
        return fechamentoRepository.findByMesAndAno(mes, ano)
                .stream()
                .map(FechamentoCpsPrestadorDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getResumoPorSegmento(int mes, int ano) {
        return lancamentoRepository.sumValorBySegmentoAndData(SituacaoAprovacao.APROVADO, mes, ano);
    }
}